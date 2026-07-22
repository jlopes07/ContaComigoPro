/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — AuthScreen.jsx
 * Tela de Autenticação (Login e Cadastro com Firebase Auth)
 * =============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView
} from 'react-native';
import { auth } from '../config/firebase';
import LIGHT_THEME from '../constants/theme';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, informe email e senha.');
      return;
    }

    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email.trim(), password);
      } else {
        await auth.createUserWithEmailAndPassword(email.trim(), password);
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      }
    } catch (err) {
      Alert.alert('Erro de Autenticação', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Conta Comigo PRO</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Acesse sua conta' : 'Criar nova conta'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Seu e-mail"
          placeholderTextColor={LIGHT_THEME.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          placeholderTextColor={LIGHT_THEME.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btnPrimary} onPress={handleAuth}>
          <Text style={styles.btnPrimaryText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
          <Text style={styles.switchText}>
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já possui uma conta? Entrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.bgBody,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: LIGHT_THEME.bgCard,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LIGHT_THEME.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: LIGHT_THEME.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  input: {
    backgroundColor: LIGHT_THEME.bgBody,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: LIGHT_THEME.textMain,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
    marginBottom: 14,
  },
  btnPrimary: {
    backgroundColor: LIGHT_THEME.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: LIGHT_THEME.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
