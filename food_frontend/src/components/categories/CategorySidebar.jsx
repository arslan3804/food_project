import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import styles from './CategorySidebar.module.css';

export default function CategorySidebar() {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    api.get('/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Ошибка загрузки категорий:', err));

    const handleResize = () => {
      setIsOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.title} onClick={toggleSidebar}>
        <h5>Категории</h5>
        <button className={styles.toggleButton} type="button" aria-label="Переключить категории">
          <span className={`${styles.toggleIcon} ${isOpen ? styles.open : ''}`}></span>
        </button>
      </div>
      <ul className={`${styles.categoryList} ${isOpen ? styles.open : ''}`}>
        {categories.map(category => (
          <li key={category.slug} className={styles.categoryItem}>
            <Link 
              to={`/products/category/${category.slug}/`}
              state={{ categoryName: category.name }}
              className={styles.categoryLink}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
