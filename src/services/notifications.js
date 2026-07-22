/**
 * =============================================================================
 * CONTA COMIGO PRO — notifications.js
 * Sistema de Notificações, Alertas de Vencimentos e Push Notifications
 * =============================================================================
 */

import { state, subscribeState } from '../state.js';
import { formatCurrency, formatDate } from '../utils.js';

export function initNotifications() {
    setupNotificationEvents();

    // Re-calcula alertas ao atualizar estado
    subscribeState((reason) => {
        checkAlertsAndNotify();
    });

    // Verificação inicial
    setTimeout(checkAlertsAndNotify, 1000);
}

export function setupNotificationEvents() {
    const bellBtn = document.getElementById('notif-bell-btn');
    const dropdown = document.getElementById('notif-dropdown');

    if (bellBtn && dropdown) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== bellBtn) {
                dropdown.classList.remove('active');
            }
        });
    }

    // Form de configurações de notificações
    const formNotif = document.getElementById('form-settings-notifications');
    if (formNotif) {
        formNotif.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pushCheckbox = document.getElementById('notif-push');

            if (pushCheckbox && pushCheckbox.checked) {
                if ('Notification' in window) {
                    const perm = await Notification.requestPermission();
                    if (perm !== 'granted') {
                        alert('Permissão de notificação negada pelo navegador. Ative as permissões nas configurações do navegador.');
                        pushCheckbox.checked = false;
                    }
                }
            }

            localStorage.setItem('contaComigo_notifEmail', document.getElementById('notif-email')?.checked);
            localStorage.setItem('contaComigo_notifPush', document.getElementById('notif-push')?.checked);
            localStorage.setItem('contaComigo_notifReports', document.getElementById('notif-reports')?.checked);

            alert('Preferências de notificação salvas com sucesso!');
            document.getElementById('modal-settings-notifications')?.classList.remove('active');
            checkAlertsAndNotify();
        });
    }
}

export function checkAlertsAndNotify() {
    if (!state.currentUser) return;

    const alerts = [];
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const currentMonthStr = today.toISOString().slice(0, 7);
    const currentDay = today.getDate();

    // 1. Verifica Transações Fixas / Recorrentes do mês
    state.fixedTransactionsList.forEach(ft => {
        const isProcessed = ft.lastProcessedMonth === currentMonthStr;
        if (!isProcessed && ft.type === 'expense') {
            const diffDays = ft.dayOfMonth - currentDay;

            if (diffDays === 0) {
                alerts.push({
                    id: `fixed_${ft.id}`,
                    title: `⚠️ Conta a pagar hoje: ${ft.description}`,
                    desc: `Valor: ${formatCurrency(ft.amount)} (Vencimento Hoje - Dia ${ft.dayOfMonth})`,
                    urgency: 'high'
                });
            } else if (diffDays > 0 && diffDays <= 3) {
                alerts.push({
                    id: `fixed_${ft.id}`,
                    title: `📅 Conta a vencer em ${diffDays} dia(s): ${ft.description}`,
                    desc: `Valor: ${formatCurrency(ft.amount)} (Vencimento no dia ${ft.dayOfMonth})`,
                    urgency: 'medium'
                });
            }
        }
    });

    // 2. Verifica Cartões de Crédito / Faturas
    state.cardsList.forEach(c => {
        const isProcessed = c.lastProcessedMonth === currentMonthStr;
        if (!isProcessed) {
            const diffDays = c.dueDay - currentDay;
            const spentOnCard = state.transactions
                .filter(t => t.paymentMethod === c.id && t.date && t.date.startsWith(currentMonthStr))
                .reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0);

            if (spentOnCard > 0) {
                if (diffDays === 0) {
                    alerts.push({
                        id: `card_${c.id}`,
                        title: `💳 Fatura do cartão ${c.nickname} vence HOJE!`,
                        desc: `Valor a pagar: ${formatCurrency(spentOnCard)}`,
                        urgency: 'high'
                    });
                } else if (diffDays > 0 && diffDays <= 3) {
                    alerts.push({
                        id: `card_${c.id}`,
                        title: `💳 Fatura do cartão ${c.nickname} vence em ${diffDays} dia(s)`,
                        desc: `Valor: ${formatCurrency(spentOnCard)} (Dia ${c.dueDay})`,
                        urgency: 'medium'
                    });
                }
            }
        }
    });

    // Renderiza UI do sino
    renderNotificationBadgeAndDropdown(alerts);

    // Dispara Notificação Push no SO se ativo
    const notifPush = localStorage.getItem('contaComigo_notifPush') === 'true';
    if (notifPush && alerts.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
        const lastNotifKey = 'contaComigo_lastPushDate';
        const lastNotifDate = localStorage.getItem(lastNotifKey);

        if (lastNotifDate !== todayStr) {
            const highAlert = alerts.find(a => a.urgency === 'high') || alerts[0];
            new Notification(highAlert.title, {
                body: highAlert.desc,
                icon: '/img/ContaComigoPRO-logo-nobg-favicon.png'
            });
            localStorage.setItem(lastNotifKey, todayStr);
        }
    }
}

function renderNotificationBadgeAndDropdown(alerts) {
    const badge = document.getElementById('notif-badge');
    const dropdownContent = document.getElementById('notif-dropdown-content');

    if (badge) {
        if (alerts.length > 0) {
            badge.textContent = alerts.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    if (dropdownContent) {
        if (alerts.length === 0) {
            dropdownContent.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    <i class="fa-regular fa-bell-slash" style="font-size: 1.5rem; margin-bottom: 6px; display: block;"></i>
                    Nenhuma notificação ou pendência no momento.
                </div>
            `;
            return;
        }

        let html = '';
        alerts.forEach(a => {
            const isHigh = a.urgency === 'high';
            html += `
                <div style="padding: 12px; border-bottom: 1px solid var(--border); background: ${isHigh ? 'var(--danger-bg, rgba(239, 68, 68, 0.05))' : 'transparent'};">
                    <p style="margin: 0; font-weight: 600; font-size: 0.85rem; color: ${isHigh ? 'var(--danger)' : 'var(--text-main)'};">${a.title}</p>
                    <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">${a.desc}</p>
                </div>
            `;
        });
        dropdownContent.innerHTML = html;
    }
}
