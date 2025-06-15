import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { Users, Shield, Edit2, Check, X, AlertCircle, Plus, Trash2, UserPlus } from 'lucide-react';

interface TeamMember {
  id: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  role_ko: string;
  role_en: string;
  role_ja: string;
  bio_ko: string;
  bio_en: string;
  bio_ja: string;
  profile_image: string;
  social_links: any;
  sort_order: number;
  active: boolean;
  joined_date: string;
}

interface Project {
  id: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
}

const AdminTeam = () => {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TeamMember>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);

  const content = {
    ko: {
      title: '팀원 관리',
      name: '이름',
      role: '역할',
      bio: '소개',
      profileImage: '프로필 이미지',
      socialLinks: '소셜 링크',
      sortOrder: '정렬 순서',
      active: '활성',
      joinedDate: '입사일',
      edit: '수정',
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      addNew: '새 팀원 추가',
      updateSuccess: '성공적으로 업데이트되었습니다.',
      updateError: '업데이트 중 오류가 발생했습니다.',
      deleteConfirm: '정말 이 팀원을 삭제하시겠습니까?',
      unauthorized: '관리자 권한이 필요합니다.',
      totalMembers: '전체 팀원',
      github: 'GitHub',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      website: '웹사이트'
    },
    en: {
      title: 'Team Management',
      name: 'Name',
      role: 'Role',
      bio: 'Bio',
      profileImage: 'Profile Image',
      socialLinks: 'Social Links',
      sortOrder: 'Sort Order',
      active: 'Active',
      joinedDate: 'Joined Date',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      addNew: 'Add New Member',
      updateSuccess: 'Successfully updated.',
      updateError: 'Error updating.',
      deleteConfirm: 'Are you sure you want to delete this team member?',
      unauthorized: 'Admin access required.',
      totalMembers: 'Total Members',
      github: 'GitHub',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      website: 'Website'
    },
    ja: {
      title: 'チーム管理',
      name: '名前',
      role: '役割',
      bio: '紹介',
      profileImage: 'プロフィール画像',
      socialLinks: 'ソーシャルリンク',
      sortOrder: 'ソート順',
      active: 'アクティブ',
      joinedDate: '入社日',
      edit: '編集',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      addNew: '新しいメンバーを追加',
      updateSuccess: '正常に更新されました。',
      updateError: '更新中にエラーが発生しました。',
      deleteConfirm: 'このチームメンバーを削除してもよろしいですか？',
      unauthorized: '管理者権限が必要です。',
      totalMembers: '総メンバー数',
      github: 'GitHub',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      website: 'ウェブサイト'
    }
  };

  const t = content[language];

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchTeamMembers();
    fetchProjects();
  }, [isAdmin]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('팀원 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('active', true)
        .order('sort_order');
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleEdit = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      setEditingMember(memberId);
      setEditData(member);
    }
  };

  const handleSave = async (memberId: string) => {
    setError('');
    setMessage('');

    try {
      const { error } = await supabase
        .from('team_members')
        .update(editData)
        .eq('id', memberId);

      if (error) throw error;

      // Update local state
      setTeamMembers(teamMembers.map(m => 
        m.id === memberId ? { ...m, ...editData } : m
      ));

      setEditingMember(null);
      setEditData({});
      setMessage(t.updateSuccess);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating team member:', error);
      setError(t.updateError);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
      setMessage('팀원이 삭제되었습니다.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting team member:', error);
      setError(t.updateError);
    }
  };

  const handleCancel = () => {
    setEditingMember(null);
    setEditData({});
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Users className="h-10 w-10" />
                {t.title}
              </h1>
              <p className="text-gray-400 mt-2">{t.totalMembers}: {teamMembers.length}</p>
            </div>
            <button
              onClick={() => setShowNewMemberForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              {t.addNew}
            </button>
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

          {/* Team Members Table */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">프로필</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">{t.name}</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">{t.role}</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">{t.sortOrder}</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">{t.active}</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">{t.joinedDate}</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        {editingMember === member.id ? (
                          <input
                            type="url"
                            value={editData.profile_image || ''}
                            onChange={(e) => handleInputChange('profile_image', e.target.value)}
                            className="w-32 px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                            placeholder="Image URL"
                          />
                        ) : (
                          <img
                            src={member.profile_image || '/default-avatar.png'}
                            alt={member.name_ko}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingMember === member.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editData.name_ko || ''}
                              onChange={(e) => handleInputChange('name_ko', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="한국어 이름"
                            />
                            <input
                              type="text"
                              value={editData.name_en || ''}
                              onChange={(e) => handleInputChange('name_en', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="English Name"
                            />
                            <input
                              type="text"
                              value={editData.name_ja || ''}
                              onChange={(e) => handleInputChange('name_ja', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="日本語名前"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">{member[`name_${language}` as keyof TeamMember] as string}</div>
                            <div className="text-xs text-gray-400">
                              KO: {member.name_ko} | EN: {member.name_en} | JA: {member.name_ja}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingMember === member.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editData.role_ko || ''}
                              onChange={(e) => handleInputChange('role_ko', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="한국어 역할"
                            />
                            <input
                              type="text"
                              value={editData.role_en || ''}
                              onChange={(e) => handleInputChange('role_en', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="English Role"
                            />
                            <input
                              type="text"
                              value={editData.role_ja || ''}
                              onChange={(e) => handleInputChange('role_ja', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="日本語役割"
                            />
                          </div>
                        ) : (
                          member[`role_${language}` as keyof TeamMember] as string
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingMember === member.id ? (
                          <input
                            type="number"
                            value={editData.sort_order || 0}
                            onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                          />
                        ) : (
                          member.sort_order
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingMember === member.id ? (
                          <input
                            type="checkbox"
                            checked={editData.active !== undefined ? editData.active : member.active}
                            onChange={(e) => handleInputChange('active', e.target.checked)}
                            className="w-4 h-4"
                          />
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${member.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {member.active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {editingMember === member.id ? (
                          <input
                            type="date"
                            value={editData.joined_date || member.joined_date}
                            onChange={(e) => handleInputChange('joined_date', e.target.value)}
                            className="px-2 py-1 bg-gray-800 border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                          />
                        ) : (
                          formatDate(member.joined_date)
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingMember === member.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(member.id)}
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(member.id)}
                              className="p-1 text-blue-400 hover:text-blue-300"
                              title={t.edit}
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                              title={t.delete}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminTeam;