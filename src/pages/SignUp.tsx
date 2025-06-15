import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const SignUp = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const content = {
    ko: {
      title: '회원가입',
      subtitle: 'SayBerry Games에 오신 것을 환영합니다',
      email: '이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      name: '이름',
      signUp: '가입하기',
      signing: '가입 중...',
      alreadyHaveAccount: '이미 계정이 있으신가요?',
      login: '로그인',
      passwordMismatch: '비밀번호가 일치하지 않습니다.',
      passwordTooShort: '비밀번호는 최소 6자 이상이어야 합니다.',
      signUpError: '회원가입 중 오류가 발생했습니다.',
      checkEmail: '이메일을 확인해주세요',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: '최소 6자 이상',
      namePlaceholder: '홍길동'
    },
    en: {
      title: 'Sign Up',
      subtitle: 'Welcome to SayBerry Games',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Name',
      signUp: 'Sign Up',
      signing: 'Signing up...',
      alreadyHaveAccount: 'Already have an account?',
      login: 'Login',
      passwordMismatch: 'Passwords do not match.',
      passwordTooShort: 'Password must be at least 6 characters.',
      signUpError: 'Error during sign up.',
      checkEmail: 'Please check your email',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: 'At least 6 characters',
      namePlaceholder: 'John Doe'
    },
    ja: {
      title: '新規登録',
      subtitle: 'SayBerry Gamesへようこそ',
      email: 'メールアドレス',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      name: '名前',
      signUp: '登録',
      signing: '登録中...',
      alreadyHaveAccount: 'すでにアカウントをお持ちですか？',
      login: 'ログイン',
      passwordMismatch: 'パスワードが一致しません。',
      passwordTooShort: 'パスワードは6文字以上である必要があります。',
      signUpError: '登録中にエラーが発生しました。',
      checkEmail: 'メールをご確認ください',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: '6文字以上',
      namePlaceholder: '山田太郎'
    }
  };

  const t = content[language];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'user' // Default role for new users
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        setError(error.message || t.signUpError);
        return;
      }

      setSuccess(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || t.signUpError);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <SEO title={t.title + ' | SayBerry Games'} />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-500 mb-4">{t.checkEmail}</h2>
            <p className="text-gray-400 mb-6">
              {language === 'ko' ? 
                '가입을 완료하려면 이메일의 인증 링크를 클릭해주세요.' : 
                language === 'ja' ? 
                '登録を完了するには、メール内の確認リンクをクリックしてください。' : 
                'Click the verification link in your email to complete registration.'}
            </p>
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              {t.login} →
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <UserPlus className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-gray-400 mt-2">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSignUp} className="bg-gray-900 rounded-lg p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <UserIcon className="inline h-4 w-4 mr-2" />
                {t.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                placeholder={t.namePlaceholder}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                placeholder={t.emailPlaceholder}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Lock className="inline h-4 w-4 mr-2" />
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                placeholder={t.passwordPlaceholder}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Lock className="inline h-4 w-4 mr-2" />
                {t.confirmPassword}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                placeholder={t.passwordPlaceholder}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500 rounded-md text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              {loading ? t.signing : t.signUp}
            </button>

            {/* Login link */}
            <div className="text-center text-sm">
              <span className="text-gray-400">{t.alreadyHaveAccount}</span>{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                {t.login}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;