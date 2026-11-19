import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Category from './pages/Category';
import Ask from './pages/Ask';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';

const LegacyCategoryRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/categories/${slug}`} replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="site-shell min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col font-sans overflow-x-clip w-full">
          <Navbar />
          <main className="flex-1 w-full overflow-x-clip">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/daily" element={<Home />} />
                <Route path="/home" element={<Navigate to="/daily" replace />} />
                <Route path="/categories" element={<Explore />} />
                <Route path="/categories/:slug" element={<Category />} />
                <Route path="/explore" element={<Navigate to="/categories" replace />} />
                <Route path="/explore/:slug" element={<LegacyCategoryRedirect />} />
                <Route path="/ask" element={<Ask />} />
                <Route path="/history" element={<History />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
