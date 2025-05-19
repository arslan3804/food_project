import { Link } from 'react-router-dom';
import styles from './ProductItem.module.css';

export default function ProductItem({ product }) {
  return (
    <div className={styles.product}>
      <Link to={`/products/${product.id}`} className={styles.detailsLink}>
        <div>
          <h2 className={styles.title}>{product.name}</h2>

          {product.category_detail && (
            <div className={styles.category}>
              Категория:{' '}
              <span className={styles.categoryName}>
                {product.category_detail.name}
              </span>
            </div>
          )}

          <div className={styles.rating}>
            {product.average_rating > 0
              ? `Рейтинг: ${product.average_rating.toFixed(1)}`
              : 'Пока нет оценок'}
          </div>

          {product.images && product.images.length > 0 && (
            <div className={styles.images}>
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image.image}
                  alt={`Изображение ${product.name} ${index + 1}`}
                  className={styles.image}
                />
              ))}
            </div>
          )}

          <div className={styles.priceAvailability}>
            <span className={styles.price}>{product.price} ₽</span>
            <span
              className={
                product.is_available ? styles.available : styles.unavailable
              }
            >
              {product.is_available ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>
        </div>
      </Link>

      {product.category_detail && (
        <div className={styles.categoryOutsideLink}>
          Категория:{' '}
          <Link to={`/products?category=${product.category_detail.slug}`}>
            {product.category_detail.name}
          </Link>
        </div>
      )}
    </div>
  );
}
