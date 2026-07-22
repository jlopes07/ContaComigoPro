/**
 * =============================================================================
 * CONTA COMIGO PRO — investimentos.js
 * Lógica da visão Meus Investimentos
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';
import { formatCurrency, formatDate } from '../../utils.js';

let marketRates = { selic: 10.5, cdi: 10.4 };

export function initView() {
    fetchMarketRates();
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-investimentos')?.classList.contains('active')) {
            renderView();
        }
    });
}

export function renderView() {
    const listGrid = document.getElementById('investments-list');
    if (!listGrid) return;

    listGrid.innerHTML = '';
    let totalInvested = 0;

    if (state.investmentsList.length === 0) {
        listGrid.innerHTML = `<div class="empty-state w-100"><i class="fa-solid fa-chart-line"></i><p>Nenhum investimento cadastrado.</p></div>`;
        const invEl = document.getElementById('total-investments');
        const yieldEl = document.getElementById('total-investments-yield');
        if (invEl) invEl.textContent = 'R$ 0,00';
        if (yieldEl) yieldEl.textContent = 'R$ 0,00';
        return;
    }

    state.investmentsList.forEach(inv => {
        totalInvested += inv.amount;

        const hasManualValue = inv.manualCurrentValue !== undefined && inv.manualCurrentValue !== null && inv.manualCurrentValue !== '';
        let yieldData = calculateInvestmentYield(inv, new Date());
        let yieldHtml = '';

        if (inv.type === 'fixed' || hasManualValue) {
            const currentYield = yieldData;
            const isProfit = currentYield.gross >= inv.amount;

            let projHtml = '';
            if (inv.type === 'fixed' && inv.dueDate) {
                const targetDate = new Date(inv.dueDate + 'T00:00:00');
                if (targetDate > new Date()) {
                    const projYield = calculateInvestmentYield(inv, targetDate, true);
                    projHtml = `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                            <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Projeção no Vencimento</span>
                            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                                <span>Bruto Estimado:</span>
                                <strong style="color: var(--text-main)">${formatCurrency(projYield.gross)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                                <span>Imposto (IR):</span>
                                <span>- ${formatCurrency(projYield.tax)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                <span>Líquido Projetado:</span>
                                <span>${formatCurrency(projYield.net)}</span>
                            </div>
                        </div>
                    `;
                }
            }

            yieldHtml = `
                <div style="background: var(--bg-body); padding: 8px; border-radius: 6px; margin-top: 12px; font-size: 0.9rem;">
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Posição Atual ${hasManualValue ? '(Manual)' : ''}</span>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>Valor Bruto:</span>
                        <strong style="color: ${isProfit ? 'var(--success)' : 'var(--danger)'}">${formatCurrency(currentYield.gross)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                        <span>Rendimento:</span>
                        <span style="color: ${isProfit ? 'var(--success)' : 'var(--danger)'}">${isProfit ? '+' : ''}${formatCurrency(currentYield.gross - inv.amount)}</span>
                    </div>
                    ${projHtml}
                </div>
            `;
        }

        const typeLabels = { fixed: 'Renda Fixa', variable: 'Ações / FIIs', crypto: 'Criptomoedas', fund: 'Fundos' };

        listGrid.innerHTML += `
            <div class="card" style="padding: 16px; position: relative;">
                <div style="position: absolute; right: 8px; top: 8px; display: flex; gap: 4px;">
                    <button class="btn-icon" onclick="window.editInvestment('${inv.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteInvestment('${inv.id}')" title="Excluir"><i class="fa-solid fa-trash" style="color: var(--danger);"></i></button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <h4 style="margin: 0; font-size: 1.1rem;">${inv.name}</h4>
                        <span style="font-size: 0.8rem; background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; color: var(--text-muted);">${typeLabels[inv.type] || inv.type}</span>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; margin-top: 12px; font-size: 0.85rem;">
                    <div>
                        <span style="color: var(--text-muted); display: block;">Aporte Inicial</span>
                        <strong>${formatCurrency(inv.amount)}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block;">Data de Início</span>
                        <span>${formatDate(inv.date)}</span>
                    </div>
                </div>
                ${yieldHtml}
            </div>
        `;
    });

    const invEl = document.getElementById('total-investments');
    if (invEl) invEl.textContent = formatCurrency(totalInvested);
}

function calculateInvestmentYield(inv, targetDate = new Date(), ignoreManual = false) {
    let grossValue = inv.amount;
    let taxAmount = 0;

    const hasManualValue = inv.manualCurrentValue !== undefined && inv.manualCurrentValue !== null && inv.manualCurrentValue !== '';

    if (!ignoreManual && hasManualValue) {
        grossValue = parseFloat(inv.manualCurrentValue);
    } else if (inv.type === 'fixed') {
        const startDate = new Date(inv.date + 'T00:00:00');
        const daysElapsed = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));

        if (daysElapsed > 0) {
            let annualRate = 0;
            if (inv.rateType === 'cdi') {
                annualRate = marketRates.cdi * (inv.rateValue / 100);
            } else if (inv.rateType === 'selic') {
                annualRate = marketRates.selic * (inv.rateValue / 100);
            } else {
                annualRate = inv.rateValue;
            }

            const dailyRate = Math.pow(1 + (annualRate / 100), 1 / 365) - 1;
            grossValue = inv.amount * Math.pow(1 + dailyRate, daysElapsed);
        }
    }

    const profit = grossValue - inv.amount;

    if (profit > 0 && inv.type === 'fixed') {
        const startDate = new Date(inv.date + 'T00:00:00');
        const daysElapsed = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));

        let taxRate = 0;
        if (daysElapsed <= 180) taxRate = 0.225;
        else if (daysElapsed <= 360) taxRate = 0.20;
        else if (daysElapsed <= 720) taxRate = 0.175;
        else taxRate = 0.15;

        taxAmount = profit * taxRate;
    }

    return { gross: grossValue, tax: taxAmount, net: grossValue - taxAmount };
}

async function fetchMarketRates() {
    try {
        const res = await fetch('https://brasilapi.com.br/api/taxas/v1');
        const data = await res.json();
        const selicObj = data.find(i => i.nome.toLowerCase() === 'selic');
        const cdiObj = data.find(i => i.nome.toLowerCase() === 'cdi');
        if (selicObj) marketRates.selic = selicObj.valor;
        if (cdiObj) marketRates.cdi = cdiObj.valor;

        const displayEl = document.getElementById('market-rates-display');
        if (displayEl) {
            displayEl.innerHTML = `
                <span style="margin-right: 16px;">Selic: <strong>${marketRates.selic.toFixed(2)}%</strong></span>
                <span>CDI: <strong>${marketRates.cdi.toFixed(2)}%</strong></span>
            `;
        }
    } catch (e) {
        console.error("Erro ao buscar taxas da API:", e);
        const displayEl = document.getElementById('market-rates-display');
        if (displayEl) {
            displayEl.textContent = `Selic: ${marketRates.selic}% | CDI: ${marketRates.cdi}% (Offline)`;
        }
    }
}
