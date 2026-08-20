/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — FixasScreen.jsx
 * Transações Fixas / Recorrentes
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
import { state, subscribeState } from '../../../src/state.js';
import { formatCurrency } from '../../../src/utils.js';
import LIGHT_THEME from '../constants/theme';

export default function FixasScreen() {
  const [fixedList, setFixedList] = useState(state.fixedTransactionsList);

  useEffect(() => {
    const update = () => setFixedList([...state.fixedTransactionsList]);
    update();
    const unsub = subscribeState(update);
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={fixedList}
        keyExtractor={item => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isInc = item.type === 'income';
          return (
            <View style={styles.card}>
              <View style={styles.left}>
                <Text style={styles.title}>{item.description}</Text>
                <Text style={styles.sub}>Vence todo dia {item.dayOfMonth || item.day}</Text>
              </View>
              <Text style={[styles.amount, isInc ? styles.colorSuccess : styles.colorDanger]}>
                {isInc ? '+' : '-'} {formatCurrency(item.amount)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma transação fixa cadastrada.</Text>
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
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
  },
  sub: {
    fontSize: 12,
    color: LIGHT_THEME.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  colorSuccess: { color: LIGHT_THEME.success },
  colorDanger: { color: LIGHT_THEME.danger },
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
