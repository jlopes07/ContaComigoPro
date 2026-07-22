/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — MetasScreen.jsx
 * Gestão de Metas Financeiras e Aportes
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
import { formatCurrency } from '../utils/utils';
import LIGHT_THEME from '../constants/theme';

export default function MetasScreen() {
  const [goals, setGoals] = useState(state.goalsList);

  useEffect(() => {
    const update = () => setGoals([...state.goalsList]);
    update();
    const unsub = subscribeState(update);
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={item => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const current = item.currentValue || 0;
          const target = item.targetValue || 1;
          const percent = Math.min(Math.round((current / target) * 100), 100);

          return (
            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>🎯 {item.name}</Text>
                <Text style={styles.goalPercent}>{percent}%</Text>
              </View>

              {/* Barra de Progresso */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>

              <View style={styles.goalFooter}>
                <Text style={styles.goalSub}>Atual: {formatCurrency(current)}</Text>
                <Text style={styles.goalSub}>Meta: {formatCurrency(target)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma meta financeira cadastrada.</Text>
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
  goalCard: {
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
  },
  goalPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: LIGHT_THEME.success,
  },
  progressTrack: {
    height: 10,
    backgroundColor: LIGHT_THEME.bgBody,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: LIGHT_THEME.success,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalSub: {
    fontSize: 12,
    color: LIGHT_THEME.textMuted,
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
