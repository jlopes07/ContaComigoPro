/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — RelatoriosScreen.jsx
 * Relatórios Financeiros e Resumo de Despesas
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { state, subscribeState } from '../services/state';
import { formatCurrency } from '../utils/utils';
import LIGHT_THEME from '../constants/theme';

export default function RelatoriosScreen() {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    const update = () => {
      const inc = state.transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + (t.amount || 0), 0);
      const exp = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + (t.amount || 0), 0);
      setIncome(inc);
      setExpense(exp);
    };
    update();
    const unsub = subscribeState(update);
    return () => unsub();
  }, []);

  const balance = income - expense;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Relatório Financeiro</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Total de Entradas</Text>
          <Text style={[styles.amount, styles.colorSuccess]}>{formatCurrency(income)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Total de Saídas</Text>
          <Text style={[styles.amount, styles.colorDanger]}>{formatCurrency(expense)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Balanço do Período</Text>
          <Text style={[styles.amount, balance < 0 ? styles.colorDanger : styles.colorSuccess]}>
            {formatCurrency(balance)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.bgBody,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
    marginBottom: 16,
  },
  card: {
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  label: {
    fontSize: 13,
    color: LIGHT_THEME.textMuted,
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 6,
  },
  colorSuccess: { color: LIGHT_THEME.success },
  colorDanger: { color: LIGHT_THEME.danger },
});
