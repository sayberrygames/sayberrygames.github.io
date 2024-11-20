import { Mail, Youtube, Twitter, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { commonTranslations } from '../translations/common';

const Footer = () => {
  const { language } = useLanguage();
  const t = commonTranslations[language];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-t border-gray-800 flex flex-col items-center pt-8">
          <img 
            src="/sayberry-string-logo.svg" 
            alt="SayBerry Games" 
            className="h-8 mb-4"
          />
          <p className="text-sm text-center text-gray-400 mb-2 flex items-center justify-center">
            <Building2 className="h-4 w-4 mr-2" />
            <span>{t.footer.businessNumber}: 516-87-02542</span>
          </p>
          <p className="text-sm text-center mb-4">
            {t.footer.copyright}
          </p>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-4 text-sm">
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                {t.footer.terms}
              </Link>
              <Link to="/corporation-notice" className="text-gray-400 hover:text-white transition-colors">
                {t.footer.corporationNotice}
              </Link>
            </div>
            <div className="flex space-x-6">
              <a 
                href="mailto:sayberrygames@gmail.com" 
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                <Mail className="h-5 w-5 mr-2" />
                <span>sayberrygames@gmail.com</span>
              </a>
              <a 
                href="https://x.com/sayberrygames" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                <Twitter className="h-5 w-5 mr-2" />
                <span>Twitter</span>
              </a>
              <a 
                href="https://www.youtube.com/@SayberryGames/featured" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                <Youtube className="h-5 w-5 mr-2" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;