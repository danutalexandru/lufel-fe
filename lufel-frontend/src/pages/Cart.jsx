import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Coș de Cumpărături</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">Coșul tău este gol</p>
            <Link
              to="/shop"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Continuă Cumpărăturile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-ceramic-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Coș de Cumpărături</h1>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            {cartItems.map((item) => {
              const imageUrl = item.images && item.images.length > 0 ? item.images[0] : '/placeholder-image.jpg';
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to={`/shop/${item.id}`} className="flex-shrink-0 self-center sm:self-start">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded"
                      />
                    </Link>
                    <div className="flex-grow">
                      <Link to={`/shop/${item.id}`}>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                      </Link>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">${item.price.toFixed(2)} bucata</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center border border-gray-300 rounded self-start">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-3 sm:px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center justify-between sm:block sm:text-right">
                          <p className="font-semibold text-gray-900 text-base sm:text-lg">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm mt-1"
                          >
                            Elimină
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 md:sticky md:top-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Rezumat Comandă</h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gray-800 text-white px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Finalizează Comanda
              </button>
              <Link
                to="/shop"
                className="block text-center text-sm sm:text-base text-gray-600 hover:text-gray-900 mt-3 sm:mt-4"
              >
                Continuă Cumpărăturile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

