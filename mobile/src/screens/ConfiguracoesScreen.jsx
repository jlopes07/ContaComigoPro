/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — ConfiguracoesScreen.jsx
 * Configurações de Perfil, Foto de Perfil, Tema e Suporte Secreto
 * =============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native';
import { auth } from '../config/firebase';
import LIGHT_THEME from '../constants/theme';

export default function ConfiguracoesScreen() {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert('Sessão Encerrada', 'Você saiu da sua conta.');
    } catch (e) {
      Alert.alert('Erro ao sair', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <Text style={styles.name}>{user?.displayName || 'Usuário Conta Comigo'}</Text>
        <Text style={styles.email}>{user?.email || 'email@exemplo.com'}</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.bgBody,
    padding: 20,
  },
  card: {
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: LIGHT_THEME.bgBody,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  avatarText: {
    fontSize: 32,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LIGHT_THEME.textMain,
  },
  email: {
    fontSize: 13,
    color: LIGHT_THEME.textMuted,
    marginTop: 4,
    marginBottom: 24,
  },
  logoutBtn: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: LIGHT_THEME.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
