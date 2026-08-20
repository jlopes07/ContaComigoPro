/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — TransacoesScreen.jsx
 * Tela de Histórico Completo de Transações com Paginação de 25 Itens e Filtro
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { state, subscribeState } from '../../../src/state.js';
import { formatCurrency, formatDate } from '../../../src/utils.js';
import LIGHT_THEME from '../constants/theme';

export default function TransacoesScreen() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [filteredTxs, setFilteredTxs] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const applyFilters = () => {
      const query = search.toLowerCase().trim();
      const res = state.transactions.filter(t => {
        const descMatch = (t.description || '').toLowerCase().includes(query);
        return descMatch;
      });

      const tot = res.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
      setTotalBalance(tot);
      setFilteredTxs(res);
    };

    applyFilters();
    const unsubscribe = subscribeState(applyFilters);
    return () => unsubscribe();
  }, [search]);

  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTxs = filteredTxs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <SafeAreaView style={styles.container}>
      {/* Campo de Busca */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar transação por descrição..."
          placeholderTextColor={LIGHT_THEME.textMuted}
          value={search}
          onChangeText={text => {
            setSearch(text);
            setCurrentPage(1);
          }}
        />
      </View>

      {/* Bar de Saldo Filtrado Otimizada */}
      <View style={styles.balanceBar}>
        <Text style={styles.balanceLabel}>Total Filtrado:</Text>
        <Text style={[styles.balanceValue, totalBalance < 0 ? styles.colorDanger : styles.colorSuccess]}>
          {formatCurrency(totalBalance)}
        </Text>
      </View>

      {/* Lista Paginada (25 Itens) */}
      <FlatList
        data={paginatedTxs}
        keyExtractor={item => item.id || Math.random().toString()}
        renderItem={({ item }) => {
          const isInc = item.type === 'income';
          return (
            <View style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={[styles.badge, isInc ? styles.bgSuccess : styles.bgDanger]}>
                  <Text style={[styles.badgeText, isInc ? styles.colorSuccess : styles.colorDanger]}>
                    {isInc ? '+' : '-'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle} numberOfLines={1}>{item.description}</Text>
                  <Text style={styles.txCategory}>{item.category || 'Outros'}</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txAmount, isInc ? styles.colorSuccess : styles.colorDanger]}>
                  {formatCurrency(item.amount)}
                </Text>
                <Text style={styles.txDate}>{formatDate(item.date)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          </View>
        }
      />

      {/* Controles de Paginação */}
      <View style={styles.paginationControls}>
        <TouchableOpacity
          disabled={currentPage === 1}
          onPress={() => setCurrentPage(p => Math.max(p - 1, 1))}
          style={[styles.pageBtn, currentPage === 1 && styles.btnDisabled]}
        >
          <Text style={styles.pageBtnText}>← Anterior</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Página {currentPage} de {totalPages} ({filteredTxs.length})
        </Text>

        <TouchableOpacity
          disabled={currentPage >= totalPages}
          onPress={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          style={[styles.pageBtn, currentPage >= totalPages && styles.btnDisabled]}
        >
          <Text style={styles.pageBtnText}>Próximo →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.bgBody,
  },
  filterSection: {
    padding: 16,
    backgroundColor: LIGHT_THEME.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border,
  },
  searchInput: {
    backgroundColor: LIGHT_THEME.bgBody,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: LIGHT_THEME.textMain,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  balanceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    margin: 16,
    marginBottom: 8,
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  balanceLabel: {
    fontSize: 14,
    color: LIGHT_THEME.textMuted,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  txRow: {
    backgroundColor: LIGHT_THEME.bgCard,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
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
    flex: 1,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  txTitle: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  txDate: {
    fontSize: 11,
    color: LIGHT_THEME.textMuted,
    marginTop: 2,
  },
  colorSuccess: { color: LIGHT_THEME.success },
  colorDanger: { color: LIGHT_THEME.danger },
  bgSuccess: { backgroundColor: 'rgba(5, 150, 105, 0.15)' },
  bgDanger: { backgroundColor: 'rgba(220, 38, 38, 0.15)' },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: LIGHT_THEME.textMuted,
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: LIGHT_THEME.bgCard,
    borderTopWidth: 1,
    borderTopColor: LIGHT_THEME.border,
  },
  pageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: LIGHT_THEME.bgBody,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: LIGHT_THEME.textMain,
  },
  pageInfo: {
    fontSize: 12,
    color: LIGHT_THEME.textMuted,
    fontWeight: '500',
  },
});
