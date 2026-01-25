import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!login) {
        throw new Error('Serviciul de autentificare nu este disponibil. Te rugăm să reîncarci pagina.');
      }
      await login(email, password);
      
      // Show success message briefly
      setSuccess('Autentificare reușită!');
      
      // Use full page refresh to ensure auth state is properly loaded
      // Redirect after minimal delay to show success message
      setTimeout(() => {
        if (from) {
          window.location.href = from;
        } else {
          window.location.href = '/';
        }
      }, 200);
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      if (err.code === 'auth/user-not-found') {
        setError('Nu există cont cu acest email. Te rugăm să verifici emailul sau să te înregistrezi.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Parolă incorectă. Te rugăm să încerci din nou.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresă email invalidă. Te rugăm să introduci un email valid.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Prea multe încercări eșuate. Te rugăm să încerci mai târziu.');
      } else {
        setError(err.message || 'Autentificare eșuată. Te rugăm să verifici emailul și parola.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-ceramic-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Autentificare Utilizator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Conectează-te la contul tău
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm"
                placeholder="Adresă email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm"
                placeholder="Parolă"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se conectează...' : 'Conectează-te'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Nu ai cont?{' '}
              <Link to="/register" className="font-medium text-gray-900 hover:text-gray-700">
                Creează unul aici
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

