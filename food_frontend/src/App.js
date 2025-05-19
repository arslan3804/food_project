import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/navbar/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductsByCategory from './components/products/ProductsByCategory'
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import OrderList from './components/orders/OrderList';
import Cart from './components/cart/Cart';
import PromoCodes from './components/promocodes/PromoCodes';

import ArticlesByCategory from './components/products/ProductsByCategory';
import AddArticle from './components/forms/AddArticle';
import AddCategory from './components/forms/AddCategory';
import AddNewsSource from './components/forms/AddNewsSource';



export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products/category/:category_slug" element={<ProductsByCategory />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/promo-codes" element={<PromoCodes />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
/*
          <Route path="/add_article" element={<AddArticle />} />
          <Route path="/add_category" element={<AddCategory />} />
          <Route path="/add_source" element={<AddNewsSource />} />
*/