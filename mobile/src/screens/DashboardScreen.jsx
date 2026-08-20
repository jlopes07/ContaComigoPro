/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — DashboardScreen.jsx
 * Visão Geral com FlatList, ScrollView, Cards de Resumo e Ações Rápidas
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { state, subscribeState } from '../../../src/state.js';
import { formatCurrency, formatDate, getCategoryIcon } from '../../../src/utils.js';
import LIGHT_THEME from '../constants/theme';

export default function DashboardScreen({ navigation }) {
  const [transactions, setTransactions] = useState(state.transactions);
  const [banks, setBanks] = useState(state.banksList);
  const [totalBalance, setTotalBalance] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);

  useEffect(() => {
    const updateDashboard = () => {
      setTransactions([...state.transactions]);
      setBanks([...state.banksList]);

      const inc = state.transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + (t.amount || 0), 0);
      const exp = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + (t.amount || 0), 0);
      
      const bankBal = state.banksList.reduce((acc, b) => acc + (b.balance || 0), 0);

      setIncomeTotal(inc);
      setExpenseTotal(exp);
      setTotalBalance(bankBal + inc - exp);
    };

    updateDashboard();
    const unsubscribe = subscribeState(updateDashboard);
    return () => unsubscribe();
  }, []);

  const renderTransactionItem = ({ item }) => {
    const isInc = item.type === 'income';
    return (
      <View style={styles.txCard}>
        <View style={styles.txLeft}>
          <View style={[styles.txIconBadge, isInc ? styles.bgSuccess : styles.bgDanger]}>
            <Text style={[styles.txIconText, isInc ? styles.colorSuccess : styles.colorDanger]}>
              {isInc ? '↑' : '↓'}
            </Text>
          </View>
          <View>
            <Text style={styles.txTitle}>{item.description}</Text>
            <Text style={styles.txCategory}>{item.category || 'Outros'}</Text>
          </View>
        </View>
        <View style={styles.txRight}>
          <Text style={[styles.txAmount, isInc ? styles.colorSuccess : styles.colorDanger]}>
            {isInc ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
          <Text style={styles.txDate}>{formatDate(item.date)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={LIGHT_THEME.bgBody} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Bem-vindo(a)! 👋</Text>
            <Text style={styles.subtitle}>Conta Comigo PRO Mobile</Text>
          </View>
        </View>

        {/* Cards de Resumo de Saldo */}
        <View style={styles.summaryContainer}>
          <View style={styles.cardPrimary}>
            <Text style={styles.cardLabelLight}>Saldo Geral</Text>
            <Text style={styles.cardAmountLight}>{formatCurrency(totalBalance)}</Text>
          </View>

          <View style={styles.rowCards}>
            <View style={[styles.cardHalf, styles.cardSuccess]}>
              <Text style={styles.cardLabel}>Receitas</Text>
              <Text style={[styles.cardAmount, styles.colorSuccess]}>{formatCurrency(incomeTotal)}</Text>
            </View>
            <View style={[styles.cardHalf, styles.cardDanger]}>
              <Text style={styles.cardLabel}>Despesas</Text>
              <Text style={[styles.cardAmount, styles.colorDanger]}>{formatCurrency(expenseTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Seção de Transações Recentes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Transações</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transacoes')}>
            <Text style={styles.seeAllText}>Ver Todas →</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma transação registrada ainda.</Text>
          </View>
        ) : (
          <FlatList
            data={transactions.slice(0, 5)}
            keyExtractor={item => item.id || Math.random().toString()}
            renderItem={renderTransactionItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.bgBody,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
  },
  subtitle: {
    fontSize: 14,
    color: LIGHT_THEME.textMuted,
    marginTop: 2,
  },
  summaryContainer: {
    gap: 12,
    marginBottom: 24,
  },
  cardPrimary: {
    backgroundColor: LIGHT_THEME.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardLabelLight: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  cardAmountLight: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  rowCards: {
    flexDirection: 'row',
    gap: 12,
  },
  cardHalf: {
    flex: 1,
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  cardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: LIGHT_THEME.success,
  },
  cardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: LIGHT_THEME.danger,
  },
  cardLabel: {
    fontSize: 13,
    color: LIGHT_THEME.textMuted,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  colorSuccess: {
    color: LIGHT_THEME.success,
  },
  colorDanger: {
    color: LIGHT_THEME.danger,
  },
  bgSuccess: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
  },
  bgDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
  },
  seeAllText: {
    color: LIGHT_THEME.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  txCard: {
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: LIGHT_THEME.textMain,
  },
  txCategory: {
    fontSize: 12,
    color: LIGHT_THEME.textMuted,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  txDate: {
    fontSize: 11,
    color: LIGHT_THEME.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: LIGHT_THEME.bgCard,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderColor: LIGHT_THEME.border,
    borderWidth: 1,
  },
  emptyText: {
    color: LIGHT_THEME.textMuted,
    fontSize: 14,
  },
});
