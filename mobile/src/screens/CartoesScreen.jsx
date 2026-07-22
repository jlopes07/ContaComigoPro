/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — CartoesScreen.jsx
 * Meus Cartões com Extrato Expansível e Navegação de Faturas por Setas (< e >)
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
import { state, subscribeState } from '../services/state';
import { formatCurrency } from '../utils/utils';
import LIGHT_THEME from '../constants/theme';

export default function CartoesScreen() {
  const [cards, setCards] = useState(state.cardsList);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const update = () => setCards([...state.cardsList]);
    update();
    const unsub = subscribeState(update);
    return () => unsub();
  }, []);

  const changeMonth = (offset) => {
    let [year, month] = selectedMonth.split('-').map(Number);
    month += offset;
    if (month > 12) { month = 1; year += 1; }
    else if (month < 1) { month = 12; year -= 1; }
    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navegação de Mês por Setas */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => changeMonth(-1)}>
          <Text style={styles.arrowText}>◄</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>Fatura: {selectedMonth}</Text>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => changeMonth(1)}>
          <Text style={styles.arrowText}>►</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cards}
        keyExtractor={item => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardVisual}>
            <Text style={styles.cardNickname}>💳 {item.nickname || item.name}</Text>
            <Text style={styles.cardBank}>{item.bank}</Text>
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.label}>Limite</Text>
                <Text style={styles.value}>{formatCurrency(item.limit || 0)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Vencimento</Text>
                <Text style={styles.value}>Dia {item.dueDay || item.due}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum cartão cadastrado.</Text>
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
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: LIGHT_THEME.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border,
  },
  arrowBtn: {
    padding: 8,
    backgroundColor: LIGHT_THEME.bgBody,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  arrowText: {
    fontSize: 14,
    color: LIGHT_THEME.textMain,
    fontWeight: 'bold',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
  },
  listContent: {
    padding: 16,
  },
  cardVisual: {
    backgroundColor: LIGHT_THEME.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardNickname: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardBank: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
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
