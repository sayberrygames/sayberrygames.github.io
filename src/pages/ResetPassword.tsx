import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { Key, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const content = {
    ko: {
      title: '비밀번호 재설정',
      newPassword: '새 비밀번호',
      confirmPassword: '새 비밀번호 확인',
      resetPassword: '비밀번호 재설정',
      passwordMismatch: '비밀번호가 일치하지 않습니다.',
      passwordTooShort: '비밀번호는 최소 6자 이상이어야 합니다.',
      resetSuccess: '비밀번호가 성공적으로 재설정되었습니다.',
      resetError: '비밀번호 재설정 중 오류가 발생했습니다.',
      invalidLink: '유효하지 않은 재설정 링크입니다.',
      redirecting: '로그인 페이지로 이동 중...'
    },
    en: {
      title: 'Reset Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      resetPassword: 'Reset Password',
      passwordMismatch: 'Passwords do not match.',
      passwordTooShort: 'Password must be at least 6 characters.',
      resetSuccess: 'Password has been reset successfully.',
      resetError: 'Error resetting password.',
      invalidLink: 'Invalid reset link.',
      redirecting: 'Redirecting to login...'
    },
    ja: {
      title: 'パスワードリセット',
      newPassword: '新しいパスワード',
      confirmPassword: '新しいパスワード（確認）',
      resetPassword: 'パスワードをリセット',
      passwordMismatch: 'パスワードが一致しません。',
      passwordTooShort: 'パスワードは6文字以上である必要があります。',
      resetSuccess: 'パスワードが正常にリセットされました。',
      resetError: 'パスワードのリセット中にエラーが発生しました。',
      invalidLink: '無効なリセットリンクです。',
      redirecting: 'ログインページにリダイレクト中...'
    }
  };

  const t = content[language];

  useEffect(() => {
    // Check if we have a valid session from the reset link
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError(t.invalidLink);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(t.resetError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              {t.title}
            </h2>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400">
                {t.resetSuccess}
              </div>
              <p className="text-gray-400">{t.redirecting}</p>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}

              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="new-password" className="sr-only">
                    {t.newPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-700 placeholder-gray-500 text-white bg-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={t.newPassword}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">
                    {t.confirmPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-700 placeholder-gray-500 text-white bg-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={t.confirmPassword}
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-600"
                >
                  {loading ? '...' : t.resetPassword}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;