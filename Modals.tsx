import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction, User, WalletState } from './types';
import { DEMO_INITIAL_BALANCE, DEMO_TRANSACTIONS, DEMO_USER } from './data';
import { simulateNetworkLatency } from './utils';

interface StoreContextType {
  state: WalletState;
  login: (user: User) => Promise<void>;
  register: (user: User) => Promise<void>;
  logout: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'balanceAfter'>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WalletState>({
    user: null,
    balance: 0,
    transactions: [],
  });

  const login = async (user: User) => {
    await simulateNetworkLatency();
    if (user.email === DEMO_USER.email) {
      setState({
        user,
        balance: DEMO_INITIAL_BALANCE,
        transactions: DEMO_TRANSACTIONS,
      });
    } else {
      // Login for newly registered user without mock transactions
      setState({
        user,
        balance: 0,
        transactions: [],
      });
    }
  };

  const register = async (user: User) => {
    await simulateNetworkLatency();
    setState({
      user,
      balance: 0,
      transactions: [],
    });
  };

  const logout = () => {
    setState({
      user: null,
      balance: 0,
      transactions: [],
    });
  };

  const addTransaction = async (txInfo: Omit<Transaction, 'id' | 'date' | 'balanceAfter'>) => {
    await simulateNetworkLatency();
    
    setState((prevState) => {
      const newBalance = prevState.balance + txInfo.amount;
      const newTx: Transaction = {
        ...txInfo,
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        balanceAfter: newBalance,
      };

      return {
        ...prevState,
        balance: newBalance,
        transactions: [newTx, ...prevState.transactions],
      };
    });
  };

  return (
    <StoreContext.Provider value={{ state, login, register, logout, addTransaction }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
