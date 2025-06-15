import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load all pages except Home for better initial load performance
const Home = lazy(() => import('./pages/Home'));
const Team = lazy(() => import('./pages/Team'));
const DevNotes = lazy(() => import('./pages/DevNotes'));
const Projects = lazy(() => import('./pages/Projects'));
const Terms = lazy(() => import('./pages/Terms'));
const CorporationNotice = lazy(() => import('./pages/CorporationNotice'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const WritePost = lazy(() => import('./pages/WritePost'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <Navbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/team" element={<Team />} />
              <Route path="/devnotes" element={<DevNotes />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/corporation-notice" element={<CorporationNotice />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/write" element={<WritePost />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
