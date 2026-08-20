/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — BancosScreen.jsx
 * Gestão de Contas Bancárias e Extrato Inline
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { state, subscribeState } from '../../../src/state.js';
import { formatCurrency } from '../../../src/utils.js';
import LIGHT_THEME from '../constants/theme';

export default function BancosScreen() {
  const [banks, setBanks] = useState(state.banksList);

  useEffect(() => {
    const update = () => setBanks([...state.banksList]);
    update();
    const unsub = subscribeState(update);
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={banks}
        keyExtractor={item => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.bankCard, { borderLeftColor: item.color || LIGHT_THEME.primary }]}>
            <View style={styles.bankHeader}>
              <Text style={styles.bankName}>🏦 {item.name}</Text>
              <Text style={styles.bankBalance}>{formatCurrency(item.balance || 0)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma conta bancária cadastrada.</Text>
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
  bankCard: {
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
    borderLeftWidth: 6,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
  },
  bankBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LIGHT_THEME.success,
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
