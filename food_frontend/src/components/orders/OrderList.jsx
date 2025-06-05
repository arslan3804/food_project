import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Ошибка при загрузке заказов:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-5">Загрузка заказов...</p>;

  if (!orders.length) return <p className="mt-4 text-center">У вас пока нет заказов.</p>;

  return (
    <div className="container mt-4">
      <h2>Мои заказы</h2>

      {orders.map(order => (
        <div key={order.id} className="card mb-4 shadow-sm">
          <div className="card-body">
            <p className="card-text text-muted mb-3">
              Создан: {new Date(order.created_at).toLocaleString('ru-RU')}
            </p>

            <p className="card-text">
              <strong>Адрес доставки:</strong> {order.delivery_address}
            </p>

            <div className="mb-3">
              <strong>Товары:</strong>
              <ul className="list-group list-group-flush">
                {order.items.map(item => (
                  <li key={item.id} className="list-group-item">
                    {item.product} — {item.quantity} шт. × {item.price_per_item} ₽
                  </li>
                ))}
              </ul>
            </div>

            {order.promo_code && (
              <div className="alert alert-info">
                <strong>Промокод:</strong> {order.promo_code.code} <br />
                <strong>Скидка:</strong> {order.promo_code.discount_percent}%
              </div>
            )}

            <p className="card-text mt-3">
              <strong>Итого:</strong> {order.total_price} ₽
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
