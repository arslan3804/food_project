import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export default function CategorySidebar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Ошибка загрузки категорий:', err));
  }, []);

  return (
    <div className="p-3 border rounded bg-light">
      <h5>Категории</h5>
      <ul className="list-unstyled">
        {categories.map(category => (
          <li key={category.slug}>
            <Link 
              to={`/products/category/${category.slug}/`}
              state={{ categoryName: category.name }}
              className="text-decoration-none"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
