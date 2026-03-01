import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!resetPassword) {
        throw new Error('Serviciul nu este disponibil. Te rugăm să reîncarci pagina.');
      }
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Nu există cont cu acest email. Te rugăm să verifici adresa.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresă email invalidă. Te rugăm să introduci un email valid.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Prea multe încercări. Te rugăm să încerci mai târziu.');
      } else {
        setError('Ceva nu a mers bine. Te rugăm să încerci din nou în câteva momente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-ceramic-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-lg">
            <p className="font-medium">Email trimis</p>
            <p className="mt-2 text-sm">
              Dacă există un cont cu adresa <strong>{email}</strong>, vei primi un link pentru resetarea parolei. Verifică și folderul Spam.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            <Link to="/admin/login" className="font-medium text-gray-900 hover:text-gray-700">
              Înapoi la autentificare
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ceramic-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Resetează parola
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Introdu emailul contului tău și îți vom trimite un link pentru resetarea parolei.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">
              Adresă email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm"
              placeholder="Adresă email"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se trimite...' : 'Trimite link resetare parolă'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/admin/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Înapoi la autentificare
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
