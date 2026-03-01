import { useState, useEffect } from 'react';
import { getProducts, deleteProduct, uploadProductImage, addProduct, updateProduct } from '../../services/products';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Nu s-au putut încărca produsele');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    // Clean up old preview URLs to prevent memory leaks
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    }
    
    // Preview images
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData({
      ...formData,
      images: imageUrls
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrls = [];

      // Upload images if there are new files
      if (imageFiles.length > 0) {
        try {
          console.log('Uploading images...');
          imageUrls = await Promise.all(
            imageFiles.map(file => uploadProductImage(file))
          );
          console.log('Images uploaded:', imageUrls);
        } catch (imageError) {
          console.error('Error uploading images:', imageError);
          // If image upload fails, ask user if they want to continue without images
          const continueWithoutImages = window.confirm(
            'Nu s-au putut încărca imaginile. Vrei să continui și să adaugi produsul fără imagini?'
          );
          if (!continueWithoutImages) {
            setUploading(false);
            return;
          }
          imageUrls = []; // Continue with empty images array
        }
      } else if (editingProduct) {
        // Keep existing images if editing and no new images
        imageUrls = formData.images || [];
      } else {
        // New product with no images - empty array is fine
        imageUrls = [];
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        images: imageUrls
      };

      console.log('Saving product:', productData);

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        console.log('Product updated successfully');
        // Reset form
        setFormData({ name: '', description: '', price: '', stock: '', images: [] });
        setImageFiles([]);
        setEditingProduct(null);
        setShowForm(false);
        await fetchProducts();
      } else {
        await addProduct(productData);
        console.log('Product added successfully');
        // Show success message
        setSuccessMessage(`Ai adăugat produsul: ${formData.name}, cu prețul: ${parseFloat(formData.price).toFixed(2)} lei, în cantitatea de: ${formData.stock}`);
        // Reset form and hide it
        setFormData({ name: '', description: '', price: '', stock: '', images: [] });
        setImageFiles([]);
        setEditingProduct(null);
        setShowForm(false);
        await fetchProducts();
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Nu s-a putut salva produsul. Te rugăm să încerci din nou.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock?.toString() || '0',
      images: product.images || []
    });
    setImageFiles([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest produs?')) {
      return;
    }

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Nu s-a putut șterge produsul');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', price: '', stock: '', images: [] });
    setImageFiles([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă produsele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ceramic-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Gestionează Produse</h1>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setSuccessMessage(''); // Clear success message when opening form
              }}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Adaugă Produs Nou
            </button>
          )}
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage('')}
                className="text-green-600 hover:text-green-800 ml-4"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Editează Produs' : 'Adaugă Produs Nou'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Produs *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descriere *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Preț (lei) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Cantitate Stoc *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  required
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Imagini Produs {editingProduct && '(Lasă gol pentru a păstra imaginile existente)'}
                </label>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Se salvează...' : editingProduct ? 'Actualizează Produs' : 'Adaugă Produs'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg';
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-square w-full bg-gray-100 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xl font-bold text-gray-900">{product.price.toFixed(2)} lei</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      (product.stock || 0) > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Stoc: {product.stock || 0}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    >
                      Editează
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && !showForm && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">Încă nu există produse. Adaugă primul tău produs!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

