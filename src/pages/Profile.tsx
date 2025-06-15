import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { User, Mail, Shield, Calendar, Key, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  name?: string;
  created_at: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile update state
  const [displayName, setDisplayName] = useState('');

  const content = {
    ko: {
      title: '내 프로필',
      email: '이메일',
      role: '권한',
      memberSince: '가입일',
      displayName: '표시 이름',
      changePassword: '비밀번호 변경',
      currentPassword: '현재 비밀번호',
      newPassword: '새 비밀번호',
      confirmPassword: '새 비밀번호 확인',
      updatePassword: '비밀번호 업데이트',
      updateProfile: '프로필 업데이트',
      signOut: '로그아웃',
      cancel: '취소',
      passwordMismatch: '새 비밀번호가 일치하지 않습니다.',
      passwordTooShort: '비밀번호는 최소 6자 이상이어야 합니다.',
      updateSuccess: '성공적으로 업데이트되었습니다.',
      updateError: '업데이트 중 오류가 발생했습니다.',
      resetPassword: '비밀번호를 잊으셨나요?',
      resetPasswordInfo: '이메일로 비밀번호 재설정 링크를 보내드립니다.',
      sendResetLink: '재설정 링크 보내기',
      resetLinkSent: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
      roles: {
        admin: '관리자',
        lead: '팀장',
        member: '팀원',
        user: '일반 사용자'
      }
    },
    en: {
      title: 'My Profile',
      email: 'Email',
      role: 'Role',
      memberSince: 'Member Since',
      displayName: 'Display Name',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      updatePassword: 'Update Password',
      updateProfile: 'Update Profile',
      signOut: 'Sign Out',
      cancel: 'Cancel',
      passwordMismatch: 'New passwords do not match.',
      passwordTooShort: 'Password must be at least 6 characters.',
      updateSuccess: 'Successfully updated.',
      updateError: 'Error updating.',
      resetPassword: 'Forgot Password?',
      resetPasswordInfo: 'We\'ll send you a password reset link via email.',
      sendResetLink: 'Send Reset Link',
      resetLinkSent: 'Password reset link has been sent to your email.',
      roles: {
        admin: 'Administrator',
        lead: 'Team Lead',
        member: 'Team Member',
        user: 'User'
      }
    },
    ja: {
      title: 'マイプロフィール',
      email: 'メール',
      role: '権限',
      memberSince: '登録日',
      displayName: '表示名',
      changePassword: 'パスワード変更',
      currentPassword: '現在のパスワード',
      newPassword: '新しいパスワード',
      confirmPassword: '新しいパスワード（確認）',
      updatePassword: 'パスワードを更新',
      updateProfile: 'プロフィールを更新',
      signOut: 'ログアウト',
      cancel: 'キャンセル',
      passwordMismatch: '新しいパスワードが一致しません。',
      passwordTooShort: 'パスワードは6文字以上である必要があります。',
      updateSuccess: '正常に更新されました。',
      updateError: '更新中にエラーが発生しました。',
      resetPassword: 'パスワードを忘れましたか？',
      resetPasswordInfo: 'パスワードリセットリンクをメールで送信します。',
      sendResetLink: 'リセットリンクを送信',
      resetLinkSent: 'パスワードリセットリンクがメールで送信されました。',
      roles: {
        admin: '管理者',
        lead: 'チームリーダー',
        member: 'チームメンバー',
        user: 'ユーザー'
      }
    }
  };

  const t = content[language];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) throw new Error('No user found');

      const profile: UserProfile = {
        id: authUser.user.id,
        email: authUser.user.email || '',
        role: authUser.user.user_metadata?.role || 'user',
        name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0],
        created_at: authUser.user.created_at
      };

      setProfile(profile);
      setDisplayName(profile.name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(t.updateError);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setUpdating(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: displayName }
      });

      if (error) throw error;

      setMessage(t.updateSuccess);
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(t.updateError);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setMessage('');

    // Validation
    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage(t.updateSuccess);
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setError(t.updateError);
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!profile?.email) return;
    
    setUpdating(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setMessage(t.resetLinkSent);
    } catch (error) {
      console.error('Error sending reset link:', error);
      setError(t.updateError);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t.title}</h1>

          {/* Messages */}
          {message && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Profile Info */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">기본 정보</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">{t.email}</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">{t.role}</p>
                  <p className="font-medium">{t.roles[profile.role as keyof typeof t.roles]}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">{t.memberSince}</p>
                  <p className="font-medium">{formatDate(profile.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Update Profile */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">프로필 설정</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                  {t.displayName}
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-md transition-colors"
              >
                {t.updateProfile}
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">보안</h2>
            
            {!showPasswordChange ? (
              <div className="space-y-4">
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Key className="h-5 w-5" />
                  {t.changePassword}
                </button>

                <button
                  onClick={handleResetPassword}
                  disabled={updating}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {t.resetPassword}
                </button>
                <p className="text-sm text-gray-400">{t.resetPasswordInfo}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                    {t.newPassword}
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                    {t.confirmPassword}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-md transition-colors"
                  >
                    {t.updatePassword}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-md transition-colors font-medium"
          >
            {t.signOut}
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;