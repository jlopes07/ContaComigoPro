/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — AppNavigator.jsx
 * Navegação Completa por Abas e Pilha Nativa para todas as telas do App
 * =============================================================================
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import TransacoesScreen from '../screens/TransacoesScreen';
import BancosScreen from '../screens/BancosScreen';
import CartoesScreen from '../screens/CartoesScreen';
import MetasScreen from '../screens/MetasScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import FixasScreen from '../screens/FixasScreen';
import InvestimentosScreen from '../screens/InvestimentosScreen';
import RelatoriosScreen from '../screens/RelatoriosScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import LIGHT_THEME from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: LIGHT_THEME.bgCard },
        headerTitleStyle: { fontWeight: 'bold', color: LIGHT_THEME.textMain },
        tabBarStyle: { backgroundColor: LIGHT_THEME.bgCard, borderTopColor: LIGHT_THEME.border },
        tabBarActiveTintColor: LIGHT_THEME.primary,
        tabBarInactiveTintColor: LIGHT_THEME.textMuted,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Visão Geral',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Transacoes"
        component={TransacoesScreen}
        options={{
          title: 'Transações',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>💸</Text>,
        }}
      />
      <Tab.Screen
        name="Bancos"
        component={BancosScreen}
        options={{
          title: 'Bancos',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>🏦</Text>,
        }}
      />
      <Tab.Screen
        name="Cartoes"
        component={CartoesScreen}
        options={{
          title: 'Cartões',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>💳</Text>,
        }}
      />
      <Tab.Screen
        name="Investimentos"
        component={InvestimentosScreen}
        options={{
          title: 'Investimentos',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>📈</Text>,
        }}
      />
      <Tab.Screen
        name="Configuracoes"
        component={ConfiguracoesScreen}
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Metas" component={MetasScreen} options={{ headerShown: true, title: 'Minhas Metas' }} />
        <Stack.Screen name="Categorias" component={CategoriasScreen} options={{ headerShown: true, title: 'Categorias' }} />
        <Stack.Screen name="Fixas" component={FixasScreen} options={{ headerShown: true, title: 'Transações Fixas' }} />
        <Stack.Screen name="Relatorios" component={RelatoriosScreen} options={{ headerShown: true, title: 'Relatórios' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
