import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

export default function Cart() {
  const { user } = useAuth();
  const { cart, addToCart, decreaseFromCart, removeFromCart, clearCart, applyPromo, removePromo, fetchCart } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [orderMessage, setOrderMessage] = useState('');

  if (!user) return <p className="mt-4 text-center">Пожалуйста, войдите, чтобы посмотреть корзину.</p>;
  if (!cart || cart.items.length === 0) return <p className="mt-4 text-center">Ваша корзина пуста.</p>;

  const canOrder = user.first_name && user.last_name && user.address;

  const handleCreateOrder = async () => {
    if (!canOrder) {
      setOrderMessage("Пожалуйста, заполните имя, фамилию и адрес в профиле перед оформлением заказа.");
      return;
    }

    try {
      await api.post('/orders/create-from-cart/', {
        first_name: user.first_name,
        last_name: user.last_name,
        delivery_address: user.address,
      });
      setOrderMessage("Заказ успешно создан!");
      await fetchCart();
    } catch (error) {
      setOrderMessage(error.response?.data?.detail || "Ошибка при создании заказа.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Ваша корзина</h2>
      <ul className="list-group mb-3">
        {cart.items.map(item => (
          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{item.product}</strong> — {item.quantity} шт.
              <br />
              <small>{item.product_detail?.description}</small>
              <div className="mt-2">
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => addToCart(item.product_detail.slug)}
                >
                  +
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => decreaseFromCart(item.product_detail.slug)}
                  disabled={item.quantity === 1}
                >
                  −
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeFromCart(item.product_detail.slug)}
                >
                  Удалить
                </button>
              </div>
            </div>
            <span>{(item.product_detail?.price * item.quantity).toFixed(2)} ₽</span>
          </li>
        ))}
      </ul>

      <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
        <span>Итого:</span>
        <span>{cart.total.toFixed(2)} ₽</span>
      </div>

      {cart.promo_code ? (
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          Промокод применён: <strong>{cart.promo_code.code}</strong> — скидка {cart.promo_code.discount_percent}%
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={removePromo}>
            Удалить
          </button>
        </div>
      ) : (
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Введите промокод"
            value={promoCode}
            onChange={e => setPromoCode(e.target.value)}
          />
          <button
            className="btn btn-outline-success"
            onClick={() => applyPromo(promoCode)}
            disabled={!promoCode.trim()}
          >
            Применить
          </button>
        </div>
      )}

      <button className="btn btn-danger me-2" onClick={clearCart}>
        Очистить корзину
      </button>

      {/* Кнопка оформления заказа */}
      <button
        className="btn btn-success"
        disabled={!canOrder}
        onClick={handleCreateOrder}
      >
        Оформить заказ
      </button>

      {orderMessage && (
        <div className="alert alert-info mt-3">
          {orderMessage}
        </div>
      )}
    </div>
  );
}
