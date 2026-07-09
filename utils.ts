import React, { useState } from 'react';
import { useStore } from '../StoreContext';
import { Loader2 } from 'lucide-react';

interface RegisterProps {
  onGoToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onGoToLogin }) => {
  const { register } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; repeatPassword?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato de email es inválido';
    }
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'Debe tener al menos 6 caracteres';
    }
    if (password !== repeatPassword) {
      newErrors.repeatPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    
    // Save to window variable to allow login later during the same session
    const userId = `usr_${Math.random().toString(36).substr(2, 9)}`;
    const mockUsers = (window as any).mockUsers || {};
    mockUsers[email] = { id: userId, name, password };
    (window as any).mockUsers = mockUsers;

    await register({ id: userId, name, email });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 mt-2">Únete a Bóveda en segundos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Juan Pérez"
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="tu@email.com"
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repetir Contraseña</label>
            <input
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.repeatPassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.repeatPassword && <p className="text-red-500 text-xs mt-1">{errors.repeatPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onGoToLogin}
              className="text-blue-600 font-medium hover:underline focus:outline-none"
              disabled={loading}
            >
              Ingresar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
