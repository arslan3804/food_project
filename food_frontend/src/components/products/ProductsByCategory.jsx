import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import ProductItem from './ProductItem';
import CategorySidebar from '../categories/CategorySidebar';

export default function ProductsByCategory() {
  const { category_slug } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);

  const categoryName = location.state?.categoryName || category_slug;

  useEffect(() => {
    api.get(`/products/category/${category_slug}/`)
      .then(res => setProducts(res.data))
      .catch(err => console.error('Ошибка загрузки статей по категории:', err));
  }, [category_slug]);

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-md-2">
          <CategorySidebar />
        </div>
        <div className="col-md-10">
          <h2>Продукты категории: {categoryName}</h2>
          {products.length === 0 ? (
            <p>Нет статей в этой категории.</p>
          ) : (
            <div className="row">
              {products.map(product => (
                <div key={product.id} className="col-md-6 mb-4">
                  <ProductItem product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
