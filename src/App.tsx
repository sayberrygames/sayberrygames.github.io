import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Team from './pages/Team';
import DevNotes from './pages/DevNotes';
import Projects from './pages/Projects';
import Terms from './pages/Terms';
import CorporationNotice from './pages/CorporationNotice';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<Team />} />
            <Route path="/devnotes" element={<DevNotes />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/corporation-notice" element={<CorporationNotice />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;