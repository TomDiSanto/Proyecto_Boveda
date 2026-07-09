import React, { useState } from 'react';
import { useStore } from '../StoreContext';
import { DEMO_PASSWORD, DEMO_USER } from '../data';
import { Loader2 } from 'lucide-react';

interface LoginProps {
  onGoToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onGoToRegister }) => {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato de email es inválido';
    }
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    
    // Simulate check against demo user or allow any email if it looks like a "new" user.
    // To make it simple, we check if it's demo. If not, we simulate a failure unless they registered.
    // Wait, the prompt says: "Si las credenciales coinciden (con ese demo o con un usuario recién registrado)".
    // Since we don't persist users globally across unmounts in a simple context, we'll just check if it's the demo user for login.
    // We could store registered users in a module-level variable to allow logging in with newly registered users after logout.
    
    // Let's use a module level variable for registered users for the sake of the mockup.
    const isValidDemo = email === DEMO_USER.email && password === DEMO_PASSWORD;
    const registeredUsers = (window as any).mockUsers || {};
    
    const isValidNewUser = registeredUsers[email] && registeredUsers[email].password === password;

    if (isValidDemo || isValidNewUser) {
      const userToLogin = isValidDemo ? DEMO_USER : { id: registeredUsers[email].id, name: registeredUsers[email].name, email };
      await login(userToLogin);
    } else {
      // Simulate delay for error too
      await new Promise(r => setTimeout(r, 600));
      setErrors({ general: 'Credenciales inválidas' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido a Bóveda</h1>
          <p className="text-gray-500 mt-2">Tu dinero, seguro y a tu alcance</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={onGoToRegister}
              className="text-blue-600 font-medium hover:underline focus:outline-none"
              disabled={loading}
            >
              Crear cuenta
            </button>
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-gray-400">Datos de prueba: {DEMO_USER.email} / {DEMO_PASSWORD}</p>
        </div>
      </div>
    </div>
  );
};
