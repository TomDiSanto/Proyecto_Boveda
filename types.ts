import React, { useState } from 'react';
import { MOCK_CONTACTS } from '../data';
import { useStore } from '../StoreContext';
import { Loader2, X } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CargarModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction } = useStore();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setError('');
    
    await addTransaction({
      type: 'CARGA',
      description: 'Carga de saldo',
      amount: numAmount,
    });
    
    setLoading(false);
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Cargar Dinero</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto a cargar</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${error ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Carga'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const DebitarModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { state, addTransaction } = useStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }
    if (numAmount > state.balance) {
      setError('Saldo insuficiente');
      return;
    }
    if (!description.trim()) {
      setError('La descripción es requerida');
      return;
    }

    setLoading(true);
    setError('');
    
    await addTransaction({
      type: 'DEBITO',
      description: description.trim(),
      amount: -numAmount,
    });
    
    setLoading(false);
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Debitar Dinero</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4 flex justify-between">
            <span>Saldo disponible:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(state.balance)}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto a debitar</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors border-gray-300"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors border-gray-300"
              placeholder="Ej. Pago de tarjeta"
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Débito'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const TransferirModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { state, addTransaction } = useStore();
  const [contactId, setContactId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!contactId) {
      setError('Seleccione un destinatario');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }
    if (numAmount > state.balance) {
      setError('Saldo insuficiente');
      return;
    }

    setLoading(true);
    setError('');
    
    const contact = MOCK_CONTACTS.find(c => c.id === contactId);
    
    await addTransaction({
      type: 'TRANSFERENCIA',
      description: `Envío a ${contact?.name}`,
      amount: -numAmount,
    });
    
    setLoading(false);
    setAmount('');
    setContactId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Transferir Dinero</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4 flex justify-between">
            <span>Saldo disponible:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(state.balance)}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario</label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors border-gray-300 bg-white"
              disabled={loading}
            >
              <option value="" disabled>Seleccione un contacto...</option>
              {MOCK_CONTACTS.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.accountNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto a transferir</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors border-gray-300"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Transferencia'}
          </button>
        </form>
      </div>
    </div>
  );
};
