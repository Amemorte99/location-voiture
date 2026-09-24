import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import WhatsAppButton from './components/WhatsAppButton';

const Cars = lazy(() => import('./pages/Cars'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const Booking = lazy(() => import('./pages/Booking'));
const Login = lazy(() => import('./pages/Login'));
const WhyChooseUs = lazy(() => import('./pages/WhyChooseUs'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const BookingSuccess = lazy(() => import('./pages/BookingSuccess'));
const Profile = lazy(() => import('./pages/Profile'));
const Contact = lazy(() => import('./pages/Contact'));

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-transparent">
      <div className="w-12 h-12 border-4 border-[#E3383C] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F9FAFB]">
      <h2 className="text-3xl font-black text-[#111827] mb-4">Oups ! Quelque chose s'est mal passé.</h2>
      <p className="text-[#6B7280] mb-8 max-w-md">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-8 py-4 bg-[#0F2F75] text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-black/10"
      >
        Réessayer
      </button>
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/WhyChooseUs" element={<WhyChooseUs />} />
          <Route path="/why-choose-us" element={<WhyChooseUs />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route 
            path="/booking/:id" 
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login defaultRegister={true} />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } 
          />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const hideNavAndFooter = isDashboard || isAuthPage;

  return (
    <div className="min-h-screen flex flex-col">
      <a 
        href='#main-content' 
        className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:text-[#111827] focus:p-4 focus:rounded-xl focus:shadow-2xl focus:z-50 font-bold border border-[#E3383C]'
      >
        Aller au contenu principal
      </a>
      <ScrollToTop />
      {!hideNavAndFooter && <Navbar />}
      <main id="main-content" className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <AnimatedRoutes />
        </Suspense>
      </main>
      {!hideNavAndFooter && <Footer />}
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AppContent />
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
