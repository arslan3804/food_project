import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const fetchCart = useCallback(() => {
    if (!user) {
      setCart(null);
      return;
    }

    api.get('/cart/')
      .then(res => setCart({ ...res.data })) // создаём новый объект, чтобы триггерить перерендер
      .catch(err => {
        console.error('Ошибка загрузки корзины', err);
        setCart(null);
      });
  }, [user]);

  const addToCart = async (productSlug) => {
    await api.post('/cart/add/', { product: productSlug });
    fetchCart();
  };

  const decreaseFromCart = async (productSlug) => {
    await api.post('/cart/decrease/', { product: productSlug });
    fetchCart();
  };

  const removeFromCart = async (productSlug) => {
    await api.post('/cart/remove/', { product: productSlug });
    fetchCart();
  };

  const clearCart = async () => {
    await api.post('/cart/clear/');
    fetchCart();
  };

    const applyPromo = async (code) => {
    try {
        await api.post('/cart/apply-promo/', { code });
        await fetchCart();
        return { success: true };
    } catch (error) {
        console.error('Ошибка применения промокода:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.detail || 'Не удалось применить промокод' };
    }
    };

  const removePromo = async () => {
    await api.post('/cart/remove-promo/', {});
    fetchCart();
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user, fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCart,
        addToCart,
        decreaseFromCart,
        removeFromCart,
        clearCart,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
