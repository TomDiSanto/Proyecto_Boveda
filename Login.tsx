/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './StoreContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';

const AppContent: React.FC = () => {
  const { state } = useStore();
  const [currentView, setCurrentView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  if (state.user) {
    return <Dashboard />;
  }

  if (currentView === 'LOGIN') {
    return <Login onGoToRegister={() => setCurrentView('REGISTER')} />;
  }

  return <Register onGoToLogin={() => setCurrentView('LOGIN')} />;
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

