import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link to="/" className="navbar-brand">Главная</Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          {user ? (
            <>
              <li className="nav-item">
                <Link to="/cart" className="nav-link">
                  Корзина: {(cart?.total || 0).toFixed(2)} ₽
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/orders" className="nav-link">Мои заказы</Link>
              </li>
              <li className="nav-item">
                <Link to="/promo-codes" className="nav-link">Промокоды</Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className="nav-link">Профиль</Link>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="btn btn-outline-light ms-2">
                  Выход ({user.username})
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Вход</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">Регистрация</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
