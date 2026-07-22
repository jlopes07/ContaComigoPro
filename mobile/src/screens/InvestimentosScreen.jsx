/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — InvestimentosScreen.jsx
 * Meus Investimentos com Cálculo de Rentabilidade e Edição
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView
} from 'react-native';
import { state, subscribeState } from '../services/state';
import { formatCurrency, formatDate } from '../utils/utils';
import LIGHT_THEME from '../constants/theme';

export default function InvestimentosScreen() {
  const [investments, setInvestments] = useState(state.investmentsList);
  const [totalInvested, setTotalInvested] = useState(0);

  useEffect(() => {
    const update = () => {
      setInvestments([...state.investmentsList]);
      const tot = state.investmentsList.reduce((acc, i) => acc + (i.amount || 0), 0);
      setTotalInvested(tot);
    };
    update();
    const unsub = subscribeState(update);
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Total Investido */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Investido</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalInvested)}</Text>
      </View>

      <FlatList
        data={investments}
        keyExtractor={item => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>📈 {item.name}</Text>
              <Text style={styles.badge}>{item.type === 'fixed' ? 'Renda Fixa' : 'Renda Variável'}</Text>
            </View>
            <Text style={styles.institution}>Instituição: {item.institution || 'Outros'}</Text>
            <View style={styles.footer}>
              <View>
                <Text style={styles.subLabel}>Aporte Inicial</Text>
                <Text style={styles.subValue}>{formatCurrency(item.amount)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.subLabel}>Data Aplicação</Text>
                <Text style={styles.subValue}>{formatDate(item.date)}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum investimento cadastrado.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.bgBody,
  },
  totalCard: {
    backgroundColor: LIGHT_THEME.primary,
    padding: 20,
    margin: 16,
    borderRadius: 14,
  },
  totalLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  totalAmount: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
  },
  badge: {
    fontSize: 11,
    backgroundColor: LIGHT_THEME.bgBody,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    color: LIGHT_THEME.textMuted,
  },
  institution: {
    fontSize: 12,
    color: LIGHT_THEME.textMuted,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: LIGHT_THEME.border,
  },
  subLabel: {
    fontSize: 11,
    color: LIGHT_THEME.textMuted,
  },
  subValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
    marginTop: 2,
  },
  emptyCard: {
    padding: 24,
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  emptyText: {
    color: LIGHT_THEME.textMuted,
    fontSize: 14,
  },
});
