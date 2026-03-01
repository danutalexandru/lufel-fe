import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.password || !formData.address) {
        throw new Error('Te rugăm să completezi toate câmpurile obligatorii');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Parolele nu se potrivesc');
      }

      if (formData.password.length < 6) {
        throw new Error('Parola trebuie să aibă cel puțin 6 caractere');
      }

      // Create account with CUSTOMER role
      await signup(formData.email, formData.password, {
        name: formData.name,
        address: formData.address
      });

      // Show success message briefly
      setSuccess('Cont creat cu succes!');
      
      // Redirect to home page quickly
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err) {
      console.error('Registration error:', err);
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setError('Acest email este deja înregistrat. Te rugăm să folosești un alt email sau să te conectezi.');
      } else if (err.code === 'auth/weak-password') {
        setError('Parola este prea slabă. Te rugăm să folosești o parolă mai puternică.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresă email invalidă. Te rugăm să introduci un email valid.');
      } else {
        setError('Nu s-a putut crea contul. Te rugăm să încerci din nou.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-ceramic-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Creează Cont
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Înregistrează-te pentru a-ți urmări comenzile și a-ți gestiona contul
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
          <div className="rounded-md shadow-sm space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nume Complet
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm"
                  placeholder="Introdu numele tău complet"
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresă Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm"
                  placeholder="Introdu adresa ta de email"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Parolă
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm"
                  placeholder="Introdu parola ta (min. 6 caractere)"
                />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmă Parola
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm"
                  placeholder="Confirmă parola ta"
                />
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresă *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-800 focus:border-gray-800 focus:z-10 sm:text-sm"
                  placeholder="Introdu adresa ta"
                />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se creează contul...' : 'Creează Cont'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Ai deja cont?{' '}
              <Link to="/admin/login" className="font-medium text-gray-900 hover:text-gray-700">
                Conectează-te aici
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;


