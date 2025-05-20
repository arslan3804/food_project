import { useEffect, useState } from 'react';
import api from '../../services/api';
import ProductItem from './ProductItem';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = (query = '') => {
    const params = { limit: 8 };
    if (query) {
      params.search = query;
    }
    api.get('/products/', { params })
      .then(res => setProducts(res.data.results || []))
      .catch(() => setError('Ошибка загрузки продуктов'));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchProducts(value);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Популярные продукты</h2>

      <form className="mb-4" onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          placeholder="Поиск продуктов по имени"
          value={searchQuery}
          onChange={handleSearchChange}
          className="form-control"
        />
      </form>

      {error && <p className="text-danger">{error}</p>}

      {products.length === 0 ? (
        <p>Продукты не найдены.</p>
      ) : (
        <div className="row">
          {products.map(product => (
            <div key={product.id} className="col-md-6 col-lg-4 mb-4">
              <ProductItem product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
