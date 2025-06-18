import { Menu, X, Globe, ChevronDown, LogIn, LogOut, User, BookOpen, Shield, UserPlus, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { commonTranslations } from '../translations/common';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { user, signOut, isTeamMember, isAdmin } = useAuth();
  const navigate = useNavigate();

  const languages = [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
  ];

  const t = commonTranslations[language];

  const navigation = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.team, href: '/team' },
    { name: t.nav.devNotes, href: '/devnotes' },
    { name: t.nav.news, href: '/news' },
    { name: t.nav.projects, href: '/projects' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <img
                  src="/sayberry-string-logo.png"
                  alt="SayBerry Games"
                  className="h-8"
                  style={{
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.9
                  }}
                />
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}

              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center text-gray-300 hover:text-white text-lg"
                >
                  <Globe className="h-5 w-5" />
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>

                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Team member links */}
              {isTeamMember && (
                <>
                  <Link
                    to="/wiki"
                    className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition-colors"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>{language === 'ko' ? '위키' : language === 'ja' ? 'Wiki' : 'Wiki'}</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/users"
                      className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition-colors"
                    >
                      <Shield className="h-5 w-5" />
                      <span>{language === 'ko' ? '관리' : language === 'ja' ? '管理' : 'Admin'}</span>
                    </Link>
                  )}
                </>
              )}

              {/* Auth buttons */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-300 hover:text-white"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm">
                      {user.user_metadata?.name || user.email?.split('@')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate('/');
                    }}
                    className="flex items-center text-gray-300 hover:text-white"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/signup"
                    className="text-gray-300 hover:text-white"
                    title={language === 'ko' ? '회원가입' : language === 'ja' ? '新規登録' : 'Sign up'}
                  >
                    <UserPlus className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white"
                    title={language === 'ko' ? '로그인' : language === 'ja' ? 'ログイン' : 'Login'}
                  >
                    <LogIn className="h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/90">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-xl font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile team member links */}
            {isTeamMember && (
              <>
                <Link
                  to="/wiki"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-xl font-medium flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen className="h-5 w-5" />
                  {language === 'ko' ? '위키' : language === 'ja' ? 'Wiki' : 'Wiki'}
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-xl font-medium flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <BarChart3 className="h-5 w-5" />
                      {language === 'ko' ? '대시보드' : language === 'ja' ? 'ダッシュボード' : 'Dashboard'}
                    </Link>
                    <Link
                      to="/admin/users"
                      className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-xl font-medium flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="h-5 w-5" />
                      {language === 'ko' ? '관리' : language === 'ja' ? '管理' : 'Admin'}
                    </Link>
                  </>
                )}
              </>
            )}
            
            {/* Mobile auth section */}
            {user ? (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-xl font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{user.user_metadata?.name || user.email?.split('@')[0]}</span>
                  </div>
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                    setIsOpen(false);
                  }}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-xl font-medium w-full text-left"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-5 w-5" />
                    <span>{language === 'ko' ? '로그아웃' : language === 'ja' ? 'ログアウト' : 'Logout'}</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <Link
                  to="/signup"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-xl font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>{language === 'ko' ? '회원가입' : language === 'ja' ? '新規登録' : 'Sign up'}</span>
                  </div>
                </Link>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-xl font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-5 w-5" />
                    <span>{language === 'ko' ? '로그인' : language === 'ja' ? 'ログイン' : 'Login'}</span>
                  </div>
                </Link>
              </div>
            )}
            
            <div className="px-3 py-2">
              <div className="flex flex-col space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className="text-left text-gray-300 hover:text-white text-xl"
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
