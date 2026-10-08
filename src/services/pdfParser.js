/**
 * =============================================================================
 * CONTA COMIGO PRO — services/pdfParser.js
 * Extração de texto de PDFs (PDF.js) e parser heurístico de extratos/faturas
 * =============================================================================
 *
 * Suporta:
 *  - Datas na própria linha: "05/09", "05/09/2025", "05 SET", "05 de set. 2025"
 *  - Datas como cabeçalho de grupo (ex.: Banco Inter, Nubank):
 *      "1 de Setembro de 2025 Saldo do dia: R$ 100,00"
 *      Pix enviado: "Cp :18236120-MERCADO X" -R$ 30,00 R$ 70,00
 *  - Sinais: "-R$ 10,00", "- R$ 10,00", "R$ -10,00", "+ R$ 10,00", "10,00 D", "10,00 C"
 */

const MONTHS = {
    jan: 1, janeiro: 1,
    fev: 2, fevereiro: 2,
    mar: 3, marco: 3,
    abr: 4, abril: 4,
    mai: 5, maio: 5,
    jun: 6, junho: 6,
    jul: 7, julho: 7,
    ago: 8, agosto: 8,
    set: 9, setembro: 9,
    out: 10, outubro: 10,
    nov: 11, novembro: 11,
    dez: 12, dezembro: 12
};

const NUMERIC_DATE_RE = /(?<![\d,.])(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?![\d])/;
const WRITTEN_DATE_RE = /(?<![\d,.])(\d{1,2})\s*(?:de\s+)?([a-zà-ü]{3,9})\.?(?![a-zà-ü])(?:\s*(?:de\s+)?(\d{4}))?/i;
const VALUE_RE = /([-+−]\s*)?(R\$\s*)?([-+−]\s*)?(?<![\d.,])(\d{1,3}(?:\.\d{3})+,\d{2}|\d+,\d{2})(?![\d])(?:\s*([CD])(?![a-zà-ü]))?/gi;

// Linhas informativas que contêm valores mas não são transações
const SKIP_KEYWORDS = [
    'saldo', 'total', 'limite', 'valor da fatura', 'pagamento minimo',
    'periodo', 'vencimento', 'fechamento', 'juros', 'cet ', 'iof previsto'
];

const INCOME_KEYWORDS = [
    'recebid', 'deposito', 'credito em conta', 'salario', 'estorno',
    'rendimento', 'resgate', 'reembolso', 'cashback', 'transferencia recebida',
    'pix recebido', 'ted recebida', 'doc recebido'
];

function normalize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function pad(n) {
    return String(n).padStart(2, '0');
}

function findDate(line) {
    const num = line.match(NUMERIC_DATE_RE);
    if (num) {
        const day = parseInt(num[1], 10);
        const month = parseInt(num[2], 10);
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
            let year = num[3] ? parseInt(num[3], 10) : null;
            if (year !== null && year < 100) year += 2000;
            return { day, month, year, text: num[0] };
        }
    }

    const wr = line.match(WRITTEN_DATE_RE);
    if (wr) {
        const month = MONTHS[normalize(wr[2])];
        const day = parseInt(wr[1], 10);
        if (month && day >= 1 && day <= 31) {
            const year = wr[3] ? parseInt(wr[3], 10) : null;
            return { day, month, year, text: wr[0] };
        }
    }
    return null;
}

function findValues(line) {
    const values = [];
    VALUE_RE.lastIndex = 0;
    let m;
    while ((m = VALUE_RE.exec(line)) !== null) {
        const amount = parseFloat(m[4].replace(/\./g, '').replace(',', '.'));
        if (isNaN(amount)) continue;
        const signs = `${m[1] || ''}${m[3] || ''}`.replace(/\s/g, '');
        let sign = null;
        if (/[-−]/.test(signs) || (m[5] && m[5].toUpperCase() === 'D')) sign = 'expense';
        else if (signs.includes('+') || (m[5] && m[5].toUpperCase() === 'C')) sign = 'income';
        values.push({ amount, sign, text: m[0] });
    }
    return values;
}

function cleanDescription(desc) {
    return desc
        .replace(/"?\s*Cp\s*:\s*\d+\s*-\s*/gi, ' ')   // Inter: "Cp :18236120-NOME"
        .replace(/["“”]/g, ' ')
        .replace(/\s*:\s+/g, ' - ')
        .replace(/\s+/g, ' ')
        .replace(/^[\s\-|,.:]+/, '')
        .replace(/[\s\-|,.:]+$/, '')
        .trim();
}

function guessCategory(desc) {
    const d = normalize(desc);
    if (/mercado|supermercado|atacad|hortifruti|acougue/.test(d)) return 'Alimentação';
    if (/restaurante|ifood|padaria|cafe|lanchonete|burger|pizza/.test(d)) return 'Alimentação';
    if (/posto|combustivel|uber|99app|99 |estacionamento|pedagio/.test(d)) return 'Transporte';
    if (/farmacia|drogaria|medico|hospital|clinica|laboratorio/.test(d)) return 'Saúde';
    if (/aluguel|condominio|energia|\bluz\b|agua|\bgas\b|internet/.test(d)) return 'Moradia';
    return 'Outros';
}

/**
 * Converte o texto extraído de um PDF em uma lista de transações.
 * @param {string} text
 * @param {number} [fallbackYear] ano usado quando a data não informa o ano
 */
export function parsePDFTextHeuristic(text, fallbackYear = new Date().getFullYear()) {
    const lines = text.split('\n');
    const transactions = [];
    let currentDate = null; // { day, month, year }
    let lastYear = null;

    for (let rawLine of lines) {
        const line = rawLine.replace(/\s+/g, ' ').trim();
        if (!line) continue;

        const norm = normalize(line);
        const date = findDate(line);
        if (date) {
            if (date.year) lastYear = date.year;
            else date.year = lastYear || fallbackYear;
        }

        const values = findValues(line);
        const isInfoLine = SKIP_KEYWORDS.some(k => norm.includes(k));

        // Cabeçalho de data (sem valor ou com "Saldo do dia")
        if (date && (values.length === 0 || isInfoLine)) {
            currentDate = date;
            continue;
        }
        if (isInfoLine || values.length === 0) continue;

        const txDate = date || currentDate;
        if (!txDate) continue;

        // Primeiro valor = transação; os demais costumam ser o saldo corrente
        const main = values[0];
        if (main.amount === 0) continue;

        let desc = line;
        if (date) desc = desc.replace(date.text, ' ');
        values.forEach(v => { desc = desc.replace(v.text, ' '); });
        desc = cleanDescription(desc) || 'Transação Extrato';

        let type = main.sign;
        if (!type) {
            type = INCOME_KEYWORDS.some(k => norm.includes(k)) ? 'income' : 'expense';
        }

        transactions.push({
            date: `${txDate.year}-${pad(txDate.month)}-${pad(txDate.day)}`,
            description: desc,
            amount: Math.abs(main.amount),
            type,
            category: guessCategory(desc)
        });
    }

    return transactions;
}

/**
 * Extrai o texto de um PDF agrupando os itens por linha visual (coordenada Y)
 * e ordenando por coluna (coordenada X), o que preserva o layout de tabelas.
 */
export async function extractTextFromPDF(file) {
    if (typeof window.pdfjsLib === 'undefined') {
        throw new Error("Biblioteca PDF.js não foi carregada. Verifique sua conexão à internet.");
    }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const rows = [];

        for (const item of textContent.items) {
            if (!item.str || !item.str.trim()) continue;
            const x = item.transform[4];
            const y = item.transform[5];
            let row = rows.find(r => Math.abs(r.y - y) < 3);
            if (!row) {
                row = { y, items: [] };
                rows.push(row);
            }
            row.items.push({ x, str: item.str });
        }

        rows.sort((a, b) => b.y - a.y);
        fullText += rows
            .map(r => r.items.sort((a, b) => a.x - b.x).map(it => it.str).join(' '))
            .join('\n') + '\n';
    }

    return fullText;
}
