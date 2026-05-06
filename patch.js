const fs = require('fs');
let appStr = fs.readFileSync('app.js', 'utf8');

// 1. parseCurrencyInput & parseFloat
if (!appStr.includes('function parseCurrencyInput')) {
    appStr = appStr.replace(/parseFloat\(document\.getElementById\('([^']+)'\)\.value\)/g, 'parseCurrencyInput(document.getElementById(\'$1\').value)');
    appStr = appStr.replace('const investmentsCollection = db.collection(\'investments\');',
        'const investmentsCollection = db.collection(\'investments\');\n\n' +
        'function parseCurrencyInput(value) {\n' +
        '    if (!value) return 0;\n' +
        '    let str = value.toString().trim();\n' +
        '    if (str.includes(\',\')) {\n' +
        '        str = str.replace(/\\./g, \'\');\n' +
        '        str = str.replace(\',\', \'.\');\n' +
        '    }\n' +
        '    const parsed = parseFloat(str);\n' +
        '    return isNaN(parsed) ? 0 : parsed;\n' +
        '}');
}

// 2. runBankMigration fix
if (appStr.includes('const defaultBankRef = await banksCollection.add({')) {
    const oldBankMig = `        const defaultBankRef = await banksCollection.add({
            userId: currentUser.uid,
            name: "Conta Corrente Principal",
            balance: 0,
            color: "#0ea5e9",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });`;
    const newBankMig = `        let defaultBankRef = null;
        const existingBanks = await banksCollection.where("userId", "==", currentUser.uid).where("name", "==", "Conta Corrente Principal").get();
        if (!existingBanks.empty) {
            defaultBankRef = existingBanks.docs[0].ref;
        } else {
            defaultBankRef = await banksCollection.add({
                userId: currentUser.uid,
                name: "Conta Corrente Principal",
                balance: 0,
                color: "#0ea5e9",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }`;
    appStr = appStr.replace(oldBankMig, newBankMig);
}

// 3. fixedPaymentMethod
if (!appStr.includes('fixedPaymentMethod')) {
    appStr = appStr.replace('const paymentMethod = document.getElementById(\'payment-method\');', 'const paymentMethod = document.getElementById(\'payment-method\');\nconst fixedPaymentMethod = document.getElementById(\'fixed-payment-method\');');
    appStr = appStr.replace('paymentMethod.innerHTML = opts;', 'paymentMethod.innerHTML = opts;\n    if (fixedPaymentMethod) fixedPaymentMethod.innerHTML = opts;');
    appStr = appStr.replace(/category: document\.getElementById\('fixed-category'\)\.value, (isAutomatic: isAuto)/g, 'category: document.getElementById(\'fixed-category\').value, paymentMethod: fixedPaymentMethod.value, $1');
    appStr = appStr.replace(/document\.getElementById\('fixed-category'\)\.value = t\.category;/g, 'document.getElementById(\'fixed-category\').value = t.category;\n    if (fixedPaymentMethod) fixedPaymentMethod.value = t.paymentMethod || \'\';');
    // For automatic fixed
    appStr = appStr.replace(/category: ft\.category,(?!\\s*paymentMethod:)/g, 'category: ft.category,\n            paymentMethod: ft.paymentMethod || \'\',');
    // For manual fixed
    appStr = appStr.replace(/document\.getElementById\('category'\)\.value = ft\.category;/g, 'document.getElementById(\'category\').value = ft.category;\n    if (paymentMethod) paymentMethod.value = ft.paymentMethod || \'\';');
}

// 4. cardPayment elements
if (!appStr.includes('cardPaymentModal')) {
    appStr = appStr.replace('const formCard = document.getElementById(\'form-card\');',
        'const formCard = document.getElementById(\'form-card\');\n' +
        'const cardPaymentModal = document.getElementById(\'card-payment-modal\');\n' +
        'const formCardPayment = document.getElementById(\'form-card-payment\');\n' +
        'const closeCardPaymentModal = document.getElementById(\'close-card-payment-modal\');\n' +
        'const btnCancelCardPayment = document.getElementById(\'btn-cancel-card-payment\');\n\n' +
        'closeCardPaymentModal.addEventListener(\'click\', () => cardPaymentModal.classList.remove(\'active\'));\n' +
        'btnCancelCardPayment.addEventListener(\'click\', () => cardPaymentModal.classList.remove(\'active\'));');
        
    appStr = appStr.replace('if (fixedPaymentMethod) fixedPaymentMethod.innerHTML = opts;',
        'if (fixedPaymentMethod) fixedPaymentMethod.innerHTML = opts;\n' +
        '    const cardPaymentBankSelect = document.getElementById(\'card-payment-source-bank\');\n' +
        '    if (cardPaymentBankSelect) {\n' +
        '        let bankOpts = \'<option value=\"\" disabled selected>Selecione</option>\';\n' +
        '        banksList.forEach(b => bankOpts += `<option value="${b.id}">🏦 ${b.name}</option>`);\n' +
        '        cardPaymentBankSelect.innerHTML = bankOpts;\n' +
        '    }');
}

// 5. launchCardFatura & form submit
const oldLaunchCardRegex = /window\\.launchCardFatura = async \\(cardId, amountStr\\) => \\{[\\s\\S]*?transactionModal\\.classList\\.add\\('active'\\);\\n\\};/g;
const newLaunchCard = `window.launchCardFatura = async (cardId, amountStr) => {
    const c = cardsList.find(x => x.id === cardId);
    if (!c) return;

    launchingCardId = c.id;
    document.getElementById('card-payment-title').textContent = \`Pagar Fatura: \${c.nickname}\`;
    document.getElementById('card-payment-total-display').textContent = formatCurrency(parseFloat(amountStr));
    
    let valToPay = parseFloat(amountStr) > 0 ? parseFloat(amountStr).toFixed(2) : '0.00';
    document.getElementById('card-payment-amount').value = valToPay.replace('.', ',');
    document.getElementById('card-payment-interest').value = '';
    
    cardPaymentModal.classList.add('active');
};

formCardPayment.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amountStr = document.getElementById('card-payment-amount').value;
    const interestStr = document.getElementById('card-payment-interest').value;
    
    const amount = parseCurrencyInput(amountStr);
    const interest = parseCurrencyInput(interestStr);
    const sourceBankId = document.getElementById('card-payment-source-bank').value;

    if (isNaN(amount) || amount <= 0 || !sourceBankId) return showMessage('Campos inválidos!', true);

    const c = cardsList.find(x => x.id === launchingCardId);
    if (!c) return;

    try {
        const batch = db.batch();
        const now = new Date().toISOString().slice(0, 10);
        
        const expenseRef = transactionsCollection.doc();
        batch.set(expenseRef, {
            userId: currentUser.uid,
            type: 'expense',
            description: \`Pagamento Fatura: \${c.nickname}\`,
            amount: amount + interest,
            category: 'Cartão de Crédito',
            date: now,
            paymentMethod: sourceBankId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        const incomeRef = transactionsCollection.doc();
        batch.set(incomeRef, {
            userId: currentUser.uid,
            type: 'income',
            description: \`Pagamento Recebido\`,
            amount: amount,
            category: 'Cartão de Crédito',
            date: now,
            paymentMethod: c.id,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();
        
        cardPaymentModal.classList.remove('active');
        formCardPayment.reset();
        launchingCardId = null;
        showMessage('Pagamento de fatura efetuado com sucesso!');
    } catch (error) {
        showMessage('Erro ao pagar fatura: ' + error.message, true);
    }
};`;

appStr = appStr.replace(oldLaunchCardRegex, newLaunchCard);

fs.writeFileSync('app.js', appStr);
console.log('Done!');
