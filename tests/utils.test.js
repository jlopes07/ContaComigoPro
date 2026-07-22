import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrencyInput, formatDate, getCategoryIcon } from '../src/utils.js';

describe('Utils Functions Tests', () => {
    it('deve formatar valor numérico para Moeda Real (BRL)', () => {
        const formatted = formatCurrency(1250.50);
        expect(formatted).toContain('1.250,50');
    });

    it('deve converter input monetário em formato brasileiro para número', () => {
        expect(parseCurrencyInput('1.250,50')).toBe(1250.50);
        expect(parseCurrencyInput('100')).toBe(100);
        expect(parseCurrencyInput('R$ 50,25')).toBe(50.25);
    });

    it('deve formatar data ISO (AAAA-MM-DD) para formato brasileiro (DD/MM/AAAA)', () => {
        expect(formatDate('2026-07-22')).toBe('22/07/2026');
    });

    it('deve retornar o ícone da categoria padrão', () => {
        const icon = getCategoryIcon('Alimentação');
        expect(typeof icon).toBe('string');
        expect(icon.length).toBeGreaterThan(0);
    });
});
