/**
 * =============================================================================
 * CONTA COMIGO PRO — relatorios.js
 * Lógica da visão Relatórios & Gráficos
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';
import { formatCurrency, formatDate } from '../../utils.js';

let currentReportHTML = '';
let currentReportTitle = '';

export function initView() {
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-relatorios')?.classList.contains('active')) {
            renderView();
        }
    });

    const reportType = document.getElementById('report-type');
    const btnGenerate = document.getElementById('btn-generate-report');
    const btnPrint = document.getElementById('btn-print-report');
    const btnExport = document.getElementById('btn-export-csv');

    if (reportType) reportType.addEventListener('change', handleReportTypeChange);
    if (btnGenerate) btnGenerate.addEventListener('click', generateReport);
    if (btnPrint) btnPrint.addEventListener('click', printReport);
    if (btnExport) btnExport.addEventListener('click', exportReportCSV);

    const reportMonth = document.getElementById('report-month');
    if (reportMonth && !reportMonth.value) {
        reportMonth.value = new Date().toISOString().slice(0, 7);
    }
}

export function renderView() {
    populateReportBankSelect();
    handleReportTypeChange();
}

function populateReportBankSelect() {
    const reportBank = document.getElementById('report-bank');
    if (!reportBank) return;

    let opts = '<option value="" disabled selected>Selecione um banco</option>';
    state.banksList.forEach(b => {
        opts += `<option value="${b.id}">🏦 ${b.name}</option>`;
    });
    reportBank.innerHTML = opts;
}

function handleReportTypeChange() {
    const reportType = document.getElementById('report-type')?.value;
    const bankContainer = document.getElementById('report-bank-container');
    const monthContainer = document.getElementById('report-period-container');

    if (bankContainer && monthContainer) {
        if (reportType === 'bank-statement') {
            bankContainer.style.display = 'block';
            monthContainer.style.display = 'block';
        } else {
            bankContainer.style.display = 'none';
            monthContainer.style.display = 'block';
        }
    }
}

export function generateReport() {
    const reportType = document.getElementById('report-type')?.value;
    const reportMonth = document.getElementById('report-month')?.value;
    const previewContent = document.getElementById('report-preview-content');
    const btnPrint = document.getElementById('btn-print-report');
    const btnExport = document.getElementById('btn-export-csv');

    if (!reportMonth) {
        alert('Por favor, selecione um mês de referência.');
        return;
    }

    let html = '';
    let title = '';

    switch (reportType) {
        case 'monthly-summary':
            html = generateMonthlySummary(reportMonth);
            title = 'Resumo Mensal (DRE)';
            break;
        case 'category-expenses':
            html = generateCategoryReport(reportMonth);
            title = 'Gastos por Categoria';
            break;
        case 'bank-statement':
            const bankId = document.getElementById('report-bank')?.value;
            if (!bankId) {
                alert('Por favor, selecione uma conta bancária.');
                return;
            }
            html = generateBankStatement(reportMonth, bankId);
            title = 'Extrato Bancário';
            break;
        case 'credit-card':
            html = generateCreditCardReport(reportMonth);
            title = 'Relatório de Cartões';
            break;
        default:
            html = '<p style="color: var(--text-muted);">Tipo de relatório não suportado.</p>';
    }

    if (previewContent) previewContent.innerHTML = html;
    if (btnPrint) btnPrint.disabled = false;
    if (btnExport) btnExport.disabled = false;

    currentReportHTML = html;
    currentReportTitle = title;
}

function generateMonthlySummary(month) {
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

    const monthTransactions = state.transactions.filter(t => t.date >= startDate && t.date <= endDate);
    const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;

    return `
        <div style="width: 100%; max-width: 700px; margin: 0 auto; color: var(--text-main);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 16px;">
                <h2 style="margin: 0;">Demonstrativo do Resultado Mensal (DRE)</h2>
                <p style="color: var(--text-muted); margin-top: 4px;">Período: <strong>${monthNum}/${year}</strong></p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                    <span style="font-size: 0.85rem; color: var(--text-muted); display: block;">Total Receitas</span>
                    <strong style="font-size: 1.2rem; color: var(--success);">${formatCurrency(income)}</strong>
                </div>
                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                    <span style="font-size: 0.85rem; color: var(--text-muted); display: block;">Total Despesas</span>
                    <strong style="font-size: 1.2rem; color: var(--danger);">${formatCurrency(expenses)}</strong>
                </div>
                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                    <span style="font-size: 0.85rem; color: var(--text-muted); display: block;">Resultado do Mês</span>
                    <strong style="font-size: 1.2rem; color: ${balance >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(balance)}</strong>
                </div>
            </div>
        </div>
    `;
}

function generateCategoryReport(month) {
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

    const monthTransactions = state.transactions.filter(t => t.date >= startDate && t.date <= endDate && t.type === 'expense');
    const categoryTotals = {};
    monthTransactions.forEach(t => {
        const cat = t.category || 'Outros';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    let rows = Object.keys(categoryTotals).map(cat => {
        const amt = categoryTotals[cat];
        const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : 0;
        return `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid var(--border);">${cat}</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border); text-align: right;">${formatCurrency(amt)}</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border); text-align: right;">${pct}%</td>
            </tr>
        `;
    }).join('');

    return `
        <div style="width: 100%; max-width: 700px; margin: 0 auto; color: var(--text-main);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 16px;">
                <h2 style="margin: 0;">Relatório de Despesas por Categoria</h2>
                <p style="color: var(--text-muted); margin-top: 4px;">Período: <strong>${monthNum}/${year}</strong></p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-body); text-align: left;">
                        <th style="padding: 10px; border-bottom: 2px solid var(--border);">Categoria</th>
                        <th style="padding: 10px; border-bottom: 2px solid var(--border); text-align: right;">Valor Total</th>
                        <th style="padding: 10px; border-bottom: 2px solid var(--border); text-align: right;">% do Total</th>
                    </tr>
                </thead>
                <tbody>${rows || '<tr><td colspan="3" style="text-align:center; padding: 16px; color: var(--text-muted);">Nenhum gasto registrado.</td></tr>'}</tbody>
            </table>
        </div>
    `;
}

function generateBankStatement(month, bankId) {
    const bank = state.banksList.find(b => b.id === bankId);
    if (!bank) return '<p>Banco não encontrado.</p>';

    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

    const txs = state.transactions.filter(t => t.paymentMethod === bankId && t.date >= startDate && t.date <= endDate);
    txs.sort((a, b) => a.date.localeCompare(b.date));

    let rows = txs.map(t => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid var(--border);">${formatDate(t.date)}</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--border);">${t.description}</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--border);">${t.category || 'Geral'}</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--border); text-align: right; color: ${t.type === 'income' ? 'var(--success)' : 'var(--danger)'};">
                ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
            </td>
        </tr>
    `).join('');

    return `
        <div style="width: 100%; max-width: 700px; margin: 0 auto; color: var(--text-main);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 16px;">
                <h2 style="margin: 0;">Extrato Bancário — ${bank.name}</h2>
                <p style="color: var(--text-muted); margin-top: 4px;">Mês: <strong>${monthNum}/${year}</strong></p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-body); text-align: left;">
                        <th style="padding: 8px; border-bottom: 2px solid var(--border);">Data</th>
                        <th style="padding: 8px; border-bottom: 2px solid var(--border);">Descrição</th>
                        <th style="padding: 8px; border-bottom: 2px solid var(--border);">Categoria</th>
                        <th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: right;">Valor</th>
                    </tr>
                </thead>
                <tbody>${rows || '<tr><td colspan="4" style="text-align:center; padding: 16px; color: var(--text-muted);">Nenhuma movimentação no período.</td></tr>'}</tbody>
            </table>
        </div>
    `;
}

function generateCreditCardReport(month) {
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

    let rows = state.cardsList.map(c => {
        const spent = state.transactions
            .filter(t => t.paymentMethod === c.id && t.date >= startDate && t.date <= endDate && t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        return `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid var(--border);">${c.nickname} (${c.bank})</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border); text-align: right;">${formatCurrency(c.limit)}</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border); text-align: right; color: var(--danger); font-weight: 600;">${formatCurrency(spent)}</td>
            </tr>
        `;
    }).join('');

    return `
        <div style="width: 100%; max-width: 700px; margin: 0 auto; color: var(--text-main);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 16px;">
                <h2 style="margin: 0;">Relatório Geral de Cartões de Crédito</h2>
                <p style="color: var(--text-muted); margin-top: 4px;">Referência: <strong>${monthNum}/${year}</strong></p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-body); text-align: left;">
                        <th style="padding: 10px; border-bottom: 2px solid var(--border);">Cartão</th>
                        <th style="padding: 10px; border-bottom: 2px solid var(--border); text-align: right;">Limite Total</th>
                        <th style="padding: 10px; border-bottom: 2px solid var(--border); text-align: right;">Fatura Estimada</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

export function printReport() {
    if (!currentReportHTML) return alert('Nenhum relatório gerado para imprimir.');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>${currentReportTitle}</title>
            <style>
                body { font-family: sans-serif; padding: 20px; color: #1e293b; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                th { background-color: #f1f5f9; }
            </style>
        </head>
        <body>
            ${currentReportHTML}
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

export function exportReportCSV() {
    if (!currentReportHTML) return alert('Nenhum relatório gerado para exportar.');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentReportHTML;
    const table = tempDiv.querySelector('table');
    if (!table) return alert('Não há tabela de dados neste relatório.');

    let csv = [];
    table.querySelectorAll('tr').forEach(row => {
        let cols = [];
        row.querySelectorAll('th, td').forEach(col => {
            cols.push('"' + col.innerText.replace(/"/g, '""').trim() + '"');
        });
        csv.push(cols.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentReportTitle.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
