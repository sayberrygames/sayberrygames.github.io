import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = {
    ko: {
      title: '회원가입',
      email: '이메일',
      name: '이름',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      submit: '회원가입',
      alreadyHaveAccount: '이미 계정이 있으신가요?',
      login: '로그인',
      errors: {
        passwordMismatch: '비밀번호가 일치하지 않습니다.',
        passwordTooShort: '비밀번호는 최소 6자 이상이어야 합니다.',
        signupFailed: '회원가입에 실패했습니다. 다시 시도해주세요.',
        emailExists: '이미 사용 중인 이메일입니다.',
      },
      successMessage: '회원가입이 완료되었습니다! 이메일을 확인해주세요.',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: '최소 6자 이상',
      namePlaceholder: '홍길동'
    },
    en: {
      title: 'Sign Up',
      email: 'Email',
      name: 'Name',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      submit: 'Sign Up',
      alreadyHaveAccount: 'Already have an account?',
      login: 'Login',
      errors: {
        passwordMismatch: 'Passwords do not match.',
        passwordTooShort: 'Password must be at least 6 characters.',
        signupFailed: 'Sign up failed. Please try again.',
        emailExists: 'Email already in use.',
      },
      successMessage: 'Sign up successful! Please check your email.',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: 'At least 6 characters',
      namePlaceholder: 'John Doe'
    },
    ja: {
      title: 'サインアップ',
      email: 'メール',
      name: '名前',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      submit: 'サインアップ',
      alreadyHaveAccount: 'すでにアカウントをお持ちですか？',
      login: 'ログイン',
      errors: {
        passwordMismatch: 'パスワードが一致しません。',
        passwordTooShort: 'パスワードは6文字以上である必要があります。',
        signupFailed: 'サインアップに失敗しました。もう一度お試しください。',
        emailExists: 'このメールは既に使用されています。',
      },
      successMessage: 'サインアップ成功！メールをご確認ください。',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: '6文字以上',
      namePlaceholder: '山田太郎'
    },
  };

  const t = content[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (password !== confirmPassword) {
      setError(t.errors.passwordMismatch);
      return;
    }

    if (password.length < 6) {
      setError(t.errors.passwordTooShort);
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'user'
          },
          emailRedirectTo: `${window.location.origin}/login`
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        if (error.message.includes('already registered')) {
          setError(t.errors.emailExists);
        } else {
          setError(error.message || t.errors.signupFailed);
        }
        return;
      }

      if (data.user) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(t.errors.signupFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <UserPlus className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-gray-400 mt-2">SayBerry Games에 오신 것을 환영합니다</p>
          </div>

          {success ? (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-500 mb-4">{t.successMessage}</h2>
              <p className="text-gray-400 mb-6">
                가입을 완료하려면 이메일의 인증 링크를 클릭해주세요.
              </p>
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                {t.login} →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-8 space-y-6">
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
                {loading ? '...' : t.submit}
              </button>

              {/* Login link */}
              <div className="text-center text-sm">
                <span className="text-gray-400">{t.alreadyHaveAccount}</span>{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                  {t.login}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default SignUp;