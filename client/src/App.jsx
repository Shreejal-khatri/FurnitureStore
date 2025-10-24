import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import MyAccount from './pages/MyAccount';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AboutUs from './pages/AboutUs';
import Profile from './pages/Profile';
import AdminLogin from "./pages/AdminLogin";      
import AdminRegister from "./pages/AdminRegister";
import Wishlist from "./pages/Wishlist"; 
import AdminDashboard from "./components/AdminDashboard";
import OrderSuccess from './components/OrderSuccess';
import MyOrders from './pages/MyOrders';
import MessageManagement from './components/MessageManagement';
import AdminSettings from "./components/AdminSettings";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/login-register" element={<MyAccount />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/messages" element={<MessageManagement />} />
        <Route path="/admin/settings" element={<AdminSettings />} />


        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order/:id" element={<OrderSuccess />} />
        <Route path="/my-orders" element={<MyOrders />} />

        
      </Routes>
    </Router>
  );
}

export default App;
