/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — CategoriasScreen.jsx
 * Categorias Personalizadas com Seleção de Ícones
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
import LIGHT_THEME from '../constants/theme';

export default function CategoriasScreen() {
  const [categories, setCategories] = useState(state.categoriesList);

  useEffect(() => {
    const update = () => setCategories([...state.categoriesList]);
    update();
    const unsub = subscribeState(update);
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={item => item.id || Math.random().toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.catCard}>
            <Text style={styles.catIcon}>🏷️</Text>
            <Text style={styles.catName} numberOfLines={1}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma categoria cadastrada.</Text>
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
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  catCard: {
    width: '48%',
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  catIcon: {
    fontSize: 18,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: LIGHT_THEME.textMain,
    flex: 1,
  },
  emptyCard: {
    width: '100%',
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
