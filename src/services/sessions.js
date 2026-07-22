/**
 * =============================================================================
 * CONTA COMIGO PRO — sessions.js
 * Rastreamento e gerenciamento de dispositivos conectados (Sessões Firestore)
 * =============================================================================
 */

import { db, auth } from '../firebase.js';
import { state } from '../state.js';
import { showMessage } from '../utils.js';

const sessionsCollection = db.collection('sessions');
let sessionUnsubscribe = null;

export function getOrCreateSessionId() {
    let sid = localStorage.getItem('contaComigo_sessionId');
    if (!sid) {
        sid = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('contaComigo_sessionId', sid);
    }
    return sid;
}

export function detectDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = "Navegador Desconhecido";
    let os = "Sistema Desconhecido";
    let icon = "fa-laptop";

    // Detecta Navegador
    if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome/")) browser = "Google Chrome";
    else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Safari";
    else if (ua.includes("OPR/") || ua.includes("Opera/")) browser = "Opera";

    // Detecta Sistema Operacional
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Android")) { os = "Android"; icon = "fa-mobile-screen-button"; }
    else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; icon = "fa-mobile-screen-button"; }
    else if (ua.includes("Linux")) os = "Linux";

    return {
        deviceName: `${browser} em ${os}`,
        browser,
        os,
        icon
    };
}

export async function registerCurrentSession(userId) {
    if (!userId) return;
    const sessionId = getOrCreateSessionId();
    const info = detectDeviceInfo();

    try {
        await sessionsCollection.doc(sessionId).set({
            userId,
            sessionId,
            deviceName: info.deviceName,
            browser: info.browser,
            os: info.os,
            icon: info.icon,
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        listenToSessionChanges(userId, sessionId);
    } catch (e) {
        console.error("Erro ao registrar sessão:", e);
    }
}

function listenToSessionChanges(userId, currentSessionId) {
    if (sessionUnsubscribe) sessionUnsubscribe();

    sessionUnsubscribe = sessionsCollection
        .where("userId", "==", userId)
        .onSnapshot(snap => {
            let currentExists = false;
            const activeSessions = [];

            snap.forEach(doc => {
                const data = doc.data();
                if (doc.id === currentSessionId) {
                    currentExists = true;
                }
                activeSessions.push({ id: doc.id, ...data });
            });

            // Se a sessão atual foi removida por outro dispositivo, desconecta
            if (snap.size > 0 && !currentExists) {
                alert("Sua sessão foi encerrada por outro dispositivo.");
                auth.signOut();
                return;
            }

            renderConnectedDevicesUI(activeSessions, currentSessionId);
        }, err => console.error("Erro ao escutar sessões:", err));
}

export function renderConnectedDevicesUI(sessionsList, currentSessionId) {
    const modalBody = document.querySelector('#modal-settings-devices .modal-body');
    if (!modalBody) return;

    if (!sessionsList || sessionsList.length === 0) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                <i class="fa-solid fa-laptop" style="font-size: 2rem; margin-bottom: 8px;"></i>
                <p>Nenhum dispositivo encontrado.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; max-height: 350px; overflow-y: auto;">
    `;

    sessionsList.forEach(s => {
        const isCurrent = s.id === currentSessionId;
        const iconClass = s.icon || 'fa-laptop';

        html += `
            <div style="display: flex; align-items: center; padding: 12px 16px; border: 1px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}; border-radius: 10px; background: ${isCurrent ? 'var(--bg-secondary)' : 'var(--bg-card)'}; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-body); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: ${isCurrent ? 'var(--primary)' : 'var(--text-muted)'};">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0; font-size: 0.95rem;">${s.deviceName || 'Navegador'} ${isCurrent ? '<span style="font-size: 0.75rem; background: var(--primary); color: white; padding: 2px 6px; border-radius: 10px; margin-left: 6px;">Este Dispositivo</span>' : ''}</h4>
                        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: ${isCurrent ? 'var(--success)' : 'var(--text-muted)'};">
                            ${isCurrent ? '● Ativo agora' : 'Dispositivo registrado'}
                        </p>
                    </div>
                </div>
                ${!isCurrent ? `
                    <button class="btn-icon" onclick="window.revokeSession('${s.id}')" title="Encerrar Sessão" style="color: var(--danger);">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                ` : ''}
            </div>
        `;
    });

    html += `</div>`;

    if (sessionsList.length > 1) {
        html += `
            <button type="button" class="btn btn-secondary w-100" onclick="window.revokeAllOtherSessions()">
                <i class="fa-solid fa-right-from-bracket"></i> Sair de todos os outros dispositivos
            </button>
        `;
    }

    modalBody.innerHTML = html;
}

window.revokeSession = async (sessionId) => {
    if (confirm("Deseja desconectar este dispositivo?")) {
        try {
            await sessionsCollection.doc(sessionId).delete();
            showMessage("Dispositivo desconectado com sucesso!");
        } catch (e) {
            alert("Erro ao encerrar sessão: " + e.message);
        }
    }
};

window.revokeAllOtherSessions = async () => {
    if (!state.currentUser) return;
    if (!confirm("Certeza que deseja encerrar a sessão em todos os outros dispositivos?")) return;

    const currentSessionId = getOrCreateSessionId();
    try {
        const snap = await sessionsCollection.where("userId", "==", state.currentUser.uid).get();
        const batch = db.batch();
        let count = 0;

        snap.forEach(doc => {
            if (doc.id !== currentSessionId) {
                batch.delete(doc.ref);
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            showMessage(`${count} outro(s) dispositivo(s) desconectado(s)!`);
        } else {
            alert("Não há outros dispositivos conectados.");
        }
    } catch (e) {
        alert("Erro ao encerrar sessões: " + e.message);
    }
};
