import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import ProductItem from './ProductItem';


export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/products/?limit=8')
      .then(res => setProducts(res.data))
      .catch(() => setError('Ошибка загрузки статей'))
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Популярные продукты</h2>
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
