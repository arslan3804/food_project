import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { cart, addToCart, decreaseFromCart, removeFromCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedReviewText, setEditedReviewText] = useState('');
  const [editedRating, setEditedRating] = useState(5);

  useEffect(() => {
    api.get(`/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(err => console.error('Ошибка загрузки продукта:', err));

    loadReviews();
  }, [id]);

  const loadReviews = () => {
    api.get(`/products/${id}/reviews/`)
      .then(res => setReviews(res.data))
      .catch(err => console.error('Ошибка загрузки отзывов:', err));
  };

  const handleAddReview = () => {
    if (!newReview.trim()) return;

    api.post(`/products/${id}/reviews/`, {
      text: newReview,
      rating: newRating,
    })
      .then(() => {
        setNewReview('');
        setNewRating(5);
        loadReviews();
      })
      .catch(err => console.error('Ошибка добавления отзыва:', err));
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review.id);
    setEditedReviewText(review.text);
    setEditedRating(review.rating);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditedReviewText('');
    setEditedRating(5);
  };

  const handleUpdateReview = () => {
    if (!editedReviewText.trim()) return;

    api.put(`/products/${id}/reviews/${editingReviewId}/`, {
      text: editedReviewText,
      rating: editedRating,
    })
      .then(() => {
        handleCancelEdit();
        loadReviews();
      })
      .catch(err => console.error('Ошибка обновления отзыва:', err));
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      api.delete(`/products/${id}/reviews/${reviewId}/`)
        .then(() => loadReviews())
        .catch(err => console.error('Ошибка удаления отзыва:', err));
    }
  };

  const cartItem = cart?.items?.find(item => item.product_detail.slug === product?.slug);

  if (!product) return <p className="text-center mt-5">Загрузка...</p>;

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <h1 className="mb-3">{product.name}</h1>

      <div className="mb-3">
        <strong>Категория: </strong>
        <Link 
          to={`/products/category/${product.category_detail.slug}/`}
          state={{ categoryName: product.category_detail.name }}
          className="text-decoration-none"
        >
          {product.category_detail.name}
        </Link>
      </div>

      <div className="mb-3">
        <strong>Доступность: </strong>
        {product.is_available ? (
          <span className="text-success">В наличии</span>
        ) : (
          <span className="text-danger">Нет в наличии</span>
        )}
      </div>

      {product.images?.length > 0 && (
        <div
          style={{
            width: '100%',
            maxWidth: 450,
            maxHeight: 300,
            marginBottom: '1.5rem',
            overflow: 'hidden',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <img
            src={product.images[0].image}
            alt={product.name}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      )}

      <p className="mb-4" style={{ lineHeight: 1.6, fontSize: 16 }}>
        {product.description}
      </p>

      <div className="mb-3">
        <strong>Оценка: </strong>
        {product.average_rating ? `${product.average_rating.toFixed(1)}` : 'нет оценок'}
      </div>

      <p className="text-muted fs-5">{product.price} ₽</p>

      {user && (
        <div className="mb-5">
          {!cartItem ? (
            <button className="btn btn-success btn-lg" onClick={() => addToCart(product.slug)}>
              Добавить в корзину
            </button>
          ) : (
            <div
              className="d-flex align-items-center gap-3"
              style={{ maxWidth: 300 }}
            >
              <span>
                В корзине: <strong>{cartItem.quantity}</strong> шт.
              </span>

              <button
                className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, padding: 0 }}
                onClick={() => addToCart(product.slug)}
                title="Добавить ещё"
                aria-label="Добавить товар"
              >
                <strong style={{ fontSize: '1.2rem', lineHeight: 1 }}>＋</strong>
              </button>

              <button
                className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, padding: 0 }}
                onClick={() => decreaseFromCart(product.slug)}
                title="Убавить на 1"
                aria-label="Убавить товар"
              >
                <strong style={{ fontSize: '1.5rem', lineHeight: 1 }}>−</strong>
              </button>

              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeFromCart(product.slug)}
                title="Удалить из корзины"
              >
                Удалить
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-5">
        <h3 className="mb-4">Отзывы ({reviews.length})</h3>

        {user && (
          <div className="mb-4 p-3 border rounded shadow-sm bg-light">
            <h5 className="mb-3">Оставить отзыв</h5>
            <div className="form-group mb-2">
              <textarea
                className="form-control"
                rows="3"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Напишите ваш отзыв..."
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">
                Оценка: <strong>{newRating}</strong>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="form-range"
              />
            </div>
            <button
              onClick={handleAddReview}
              className="btn btn-primary"
              disabled={!newReview.trim()}
            >
              Отправить отзыв
            </button>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-muted">Пока нет отзывов</p>
        ) : (
          <div className="list-group">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="list-group-item py-3 px-4 mb-3 border rounded shadow-sm"
              >
                {editingReviewId === review.id ? (
                  <>
                    <div className="form-group mb-2">
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editedReviewText}
                        onChange={(e) => setEditedReviewText(e.target.value)}
                      />
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label">
                        Оценка: <strong>{editedRating}</strong>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={editedRating}
                        onChange={(e) => setEditedRating(Number(e.target.value))}
                        className="form-range"
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={handleUpdateReview}
                        className="btn btn-success btn-sm"
                        disabled={!editedReviewText.trim()}
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-secondary btn-sm"
                      >
                        Отмена
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>{review.user}</strong>
                      <small className="text-muted">
                        {new Date(review.created_at).toLocaleString('ru-RU')}
                      </small>
                    </div>
                    <p className="mb-2">{review.text}</p>
                    <p className="mb-0">
                      <strong>Оценка:</strong> {review.rating} / 5
                    </p>

                    {user?.username === review.user && (
                      <div className="mt-2 d-flex gap-2">
                        <button
                          onClick={() => handleStartEdit(review)}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
