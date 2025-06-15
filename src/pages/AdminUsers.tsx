import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { Users, Shield, Calendar, Mail, Edit2, Check, X, AlertCircle } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    role?: string;
    name?: string;
  };
}

const AdminUsers = () => {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const content = {
    ko: {
      title: '회원 관리',
      email: '이메일',
      name: '이름',
      role: '권한',
      memberSince: '가입일',
      edit: '수정',
      save: '저장',
      cancel: '취소',
      updateSuccess: '성공적으로 업데이트되었습니다.',
      updateError: '업데이트 중 오류가 발생했습니다.',
      unauthorized: '관리자 권한이 필요합니다.',
      totalUsers: '전체 회원',
      roles: {
        admin: '관리자',
        lead: '팀장',
        member: '팀원',
        user: '일반 사용자'
      }
    },
    en: {
      title: 'User Management',
      email: 'Email',
      name: 'Name',
      role: 'Role',
      memberSince: 'Member Since',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      updateSuccess: 'Successfully updated.',
      updateError: 'Error updating.',
      unauthorized: 'Admin access required.',
      totalUsers: 'Total Users',
      roles: {
        admin: 'Administrator',
        lead: 'Team Lead',
        member: 'Team Member',
        user: 'User'
      }
    },
    ja: {
      title: 'ユーザー管理',
      email: 'メール',
      name: '名前',
      role: '権限',
      memberSince: '登録日',
      edit: '編集',
      save: '保存',
      cancel: 'キャンセル',
      updateSuccess: '正常に更新されました。',
      updateError: '更新中にエラーが発生しました。',
      unauthorized: '管理者権限が必要です。',
      totalUsers: '総ユーザー数',
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
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      // Use Supabase Management API to get all users
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get the service role key from environment or use the admin's token
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });

      if (!response.ok) {
        // If admin token doesn't work, we'll need to use service role key
        // For now, we'll show an error
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Admin privileges may be required.');
      
      // Fallback: show current user at least
      if (user) {
        setUsers([{
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          user_metadata: user.user_metadata || {}
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId: string) => {
    const userData = users.find(u => u.id === userId);
    if (userData) {
      setEditingUser(userId);
      setEditRole(userData.user_metadata.role || 'user');
      setEditName(userData.user_metadata.name || '');
    }
  };

  const handleSave = async (userId: string) => {
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          role: editRole,
          name: editName
        }
      });

      if (error) throw error;

      // Update local state
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, user_metadata: { ...u.user_metadata, role: editRole, name: editName } }
          : u
      ));

      setEditingUser(null);
      setMessage(t.updateSuccess);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(t.updateError);
      
      // Try alternative method using custom function
      try {
        const { error: fnError } = await supabase.functions.invoke('update-user-role', {
          body: { userId, role: editRole, name: editName }
        });
        
        if (!fnError) {
          setUsers(users.map(u => 
            u.id === userId 
              ? { ...u, user_metadata: { ...u.user_metadata, role: editRole, name: editName } }
              : u
          ));
          setEditingUser(null);
          setMessage(t.updateSuccess);
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (fnError) {
        console.error('Alternative method also failed:', fnError);
      }
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditRole('');
    setEditName('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'lead': return 'text-yellow-400';
      case 'member': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl">{t.unauthorized}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Users className="h-10 w-10" />
                {t.title}
              </h1>
              <p className="text-gray-400 mt-2">{t.totalUsers}: {users.length}</p>
            </div>
          </div>

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

          {/* Users Table */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">
                      <Mail className="inline h-4 w-4 mr-2" />
                      {t.email}
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">
                      {t.name}
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">
                      <Shield className="inline h-4 w-4 mr-2" />
                      {t.role}
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      {t.memberSince}
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        {userData.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingUser === userData.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          userData.user_metadata.name || '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingUser === userData.id ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none"
                          >
                            <option value="user">{t.roles.user}</option>
                            <option value="member">{t.roles.member}</option>
                            <option value="lead">{t.roles.lead}</option>
                            <option value="admin">{t.roles.admin}</option>
                          </select>
                        ) : (
                          <span className={`font-medium ${getRoleColor(userData.user_metadata.role || 'user')}`}>
                            {t.roles[userData.user_metadata.role as keyof typeof t.roles] || t.roles.user}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(userData.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingUser === userData.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(userData.id)}
                              className="p-1 text-green-400 hover:text-green-300"
                              title={t.save}
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1 text-red-400 hover:text-red-300"
                              title={t.cancel}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(userData.id)}
                            className="p-1 text-blue-400 hover:text-blue-300"
                            title={t.edit}
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role descriptions */}
          <div className="mt-8 bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">권한 설명</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Shield className={`h-5 w-5 mt-0.5 ${getRoleColor('admin')}`} />
                <div>
                  <p className="font-medium">{t.roles.admin}</p>
                  <p className="text-gray-400">모든 권한. 회원 관리, 모든 게시물 작성/수정/삭제 가능</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className={`h-5 w-5 mt-0.5 ${getRoleColor('lead')}`} />
                <div>
                  <p className="font-medium">{t.roles.lead}</p>
                  <p className="text-gray-400">팀장급. 뉴스 작성 가능, 모든 개발노트 수정 가능</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className={`h-5 w-5 mt-0.5 ${getRoleColor('member')}`} />
                <div>
                  <p className="font-medium">{t.roles.member}</p>
                  <p className="text-gray-400">팀원. 개발노트 작성 가능, 본인 글만 수정 가능</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className={`h-5 w-5 mt-0.5 ${getRoleColor('user')}`} />
                <div>
                  <p className="font-medium">{t.roles.user}</p>
                  <p className="text-gray-400">일반 사용자. 콘텐츠 열람만 가능</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;