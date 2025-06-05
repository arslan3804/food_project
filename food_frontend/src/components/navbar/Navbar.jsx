import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link to="/" className="navbar-brand">Главная</Link>

      <button 
        className="navbar-toggler" 
        type="button" 
        onClick={toggleMenu}
        aria-controls="navbarContent" 
        aria-expanded={isOpen} 
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarContent">
        <ul className="navbar-nav ms-auto">
          {user ? (
            <>
              <li className="nav-item">
                <Link to="/cart" className="nav-link" onClick={() => setIsOpen(false)}>
                  Корзина: {(cart?.total || 0).toFixed(2)} ₽
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/orders" className="nav-link" onClick={() => setIsOpen(false)}>Мои заказы</Link>
              </li>
              <li className="nav-item">
                <Link to="/promo-codes" className="nav-link" onClick={() => setIsOpen(false)}>Промокоды</Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className="nav-link" onClick={() => setIsOpen(false)}>Профиль</Link>
              </li>
              <li className="nav-item">
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }} 
                  className="btn btn-outline-light ms-2"
                >
                  Выход ({user.username})
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Вход</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link" onClick={() => setIsOpen(false)}>Регистрация</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
