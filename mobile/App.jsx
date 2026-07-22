/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — App.jsx
 * Ponto de entrada do aplicativo React Native
 * =============================================================================
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
