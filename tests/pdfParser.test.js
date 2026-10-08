import { describe, it, expect } from 'vitest';
import { parsePDFTextHeuristic } from '../src/services/pdfParser.js';

describe('parsePDFTextHeuristic', () => {
    it('lê extrato do Banco Inter (data como cabeçalho, -R$ antes do valor)', () => {
        const text = [
            'Extrato Conta Corrente',
            'Período: 01/09/2025 a 30/09/2025',
            'Saldo total Saldo disponível R$ 1.234,56',
            '1 de Setembro de 2025 Saldo do dia: R$ 150,00',
            'Pix recebido: "Cp :00000000-FULANO DE TAL" R$ 50,00 R$ 150,00',
            'Pix enviado: "Cp :18236120-SUPERMERCADO BOM PRECO" -R$ 30,00 R$ 120,00',
            '3 de Setembro de 2025 Saldo do dia: R$ 110,00',
            'Compra no debito: "No estabelecimento PADARIA PAO QUENTE" -R$ 1.010,00 R$ 110,00',
        ].join('\n');

        const txs = parsePDFTextHeuristic(text, 2024);
        expect(txs).toHaveLength(3);

        expect(txs[0]).toMatchObject({ date: '2025-09-01', amount: 50, type: 'income' });
        expect(txs[0].description).toContain('FULANO DE TAL');

        expect(txs[1]).toMatchObject({ date: '2025-09-01', amount: 30, type: 'expense', category: 'Alimentação' });
        expect(txs[1].description).toContain('SUPERMERCADO BOM PRECO');
        expect(txs[1].description).not.toContain('Cp');

        expect(txs[2]).toMatchObject({ date: '2025-09-03', amount: 1010, type: 'expense' });
    });

    it('lê fatura de cartão com data escrita na linha', () => {
        const text = [
            'Despesas da fatura',
            '05 de set. 2025 UBER *TRIP - R$ 25,90',
            '06 de set. 2025 IFOOD *RESTAURANTE - R$ 48,00',
            '10 de set. 2025 PAGAMENTO ON LINE + R$ 500,00',
            'Total da fatura R$ 73,90',
        ].join('\n');

        const txs = parsePDFTextHeuristic(text, 2024);
        expect(txs).toHaveLength(3);
        expect(txs[0]).toMatchObject({ date: '2025-09-05', amount: 25.9, type: 'expense', category: 'Transporte' });
        expect(txs[1]).toMatchObject({ date: '2025-09-06', amount: 48, type: 'expense' });
        expect(txs[2]).toMatchObject({ date: '2025-09-10', amount: 500, type: 'income' });
    });

    it('continua lendo o formato dd/mm com sufixo D/C', () => {
        const text = '12/08 PIX TRANSF JOAO 150,00 C\n13/08 FARMACIA SAO JOAO 32,50 D';
        const txs = parsePDFTextHeuristic(text, 2025);
        expect(txs).toEqual([
            expect.objectContaining({ date: '2025-08-12', amount: 150, type: 'income' }),
            expect.objectContaining({ date: '2025-08-13', amount: 32.5, type: 'expense', category: 'Saúde' }),
        ]);
    });
});
