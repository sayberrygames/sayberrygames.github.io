import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = {
    ko: {
      title: '회원가입',
      email: '이메일',
      username: '사용자명',
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
    },
    en: {
      title: 'Sign Up',
      email: 'Email',
      username: 'Username',
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
    },
    ja: {
      title: 'サインアップ',
      email: 'メール',
      username: 'ユーザー名',
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
            username,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError(t.errors.emailExists);
        } else {
          setError(t.errors.signupFailed);
        }
        return;
      }

      if (data.user) {
        // Update profile with username
        await supabase
          .from('profiles')
          .update({ username })
          .eq('id', data.user.id);

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
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              {t.title}
            </h2>
          </div>
          
          {success ? (
            <div className="text-center">
              <p className="text-green-500 text-lg">{t.successMessage}</p>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    {t.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder={t.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    {t.username}
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder={t.username}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    {t.password}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder={t.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    {t.confirmPassword}
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder={t.confirmPassword}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? '...' : t.submit}
                </button>
              </div>

              <div className="text-center">
                <span className="text-gray-400">{t.alreadyHaveAccount}</span>{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
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

export default Signup;