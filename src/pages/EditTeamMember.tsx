import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { Save, X, AlertCircle, User, Calendar, Image, Link as LinkIcon } from 'lucide-react';

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

const EditTeamMember = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [member, setMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const content = {
    ko: {
      title: '팀원 수정',
      name: '이름',
      role: '역할',
      bio: '소개',
      profileImage: '프로필 이미지',
      socialLinks: '소셜 링크',
      sortOrder: '정렬 순서',
      active: '활성',
      joinedDate: '입사일',
      save: '저장',
      cancel: '취소',
      saveError: '저장 중 오류가 발생했습니다.',
      loadError: '팀원 정보를 불러오는 중 오류가 발생했습니다.',
      unauthorized: '관리자 권한이 필요합니다.',
      github: 'GitHub',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      website: '웹사이트',
      nameKo: '한국어 이름',
      nameEn: '영어 이름',
      nameJa: '일본어 이름',
      roleKo: '한국어 역할',
      roleEn: '영어 역할',
      roleJa: '일본어 역할',
      bioKo: '한국어 소개',
      bioEn: '영어 소개',
      bioJa: '일본어 소개'
    },
    en: {
      title: 'Edit Team Member',
      name: 'Name',
      role: 'Role',
      bio: 'Bio',
      profileImage: 'Profile Image',
      socialLinks: 'Social Links',
      sortOrder: 'Sort Order',
      active: 'Active',
      joinedDate: 'Joined Date',
      save: 'Save',
      cancel: 'Cancel',
      saveError: 'Error saving changes.',
      loadError: 'Error loading team member.',
      unauthorized: 'Admin access required.',
      github: 'GitHub',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      website: 'Website',
      nameKo: 'Korean Name',
      nameEn: 'English Name',
      nameJa: 'Japanese Name',
      roleKo: 'Korean Role',
      roleEn: 'English Role',
      roleJa: 'Japanese Role',
      bioKo: 'Korean Bio',
      bioEn: 'English Bio',
      bioJa: 'Japanese Bio'
    },
    ja: {
      title: 'チームメンバー編集',
      name: '名前',
      role: '役割',
      bio: '紹介',
      profileImage: 'プロフィール画像',
      socialLinks: 'ソーシャルリンク',
      sortOrder: 'ソート順',
      active: 'アクティブ',
      joinedDate: '入社日',
      save: '保存',
      cancel: 'キャンセル',
      saveError: '保存中にエラーが発生しました。',
      loadError: 'チームメンバーの読み込み中にエラーが発生しました。',
      unauthorized: '管理者権限が必要です。',
      github: 'GitHub',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      website: 'ウェブサイト',
      nameKo: '韓国語名',
      nameEn: '英語名',
      nameJa: '日本語名',
      roleKo: '韓国語役割',
      roleEn: '英語役割',
      roleJa: '日本語役割',
      bioKo: '韓国語紹介',
      bioEn: '英語紹介',
      bioJa: '日本語紹介'
    }
  };

  const t = content[language];

  useEffect(() => {
    if (!isAdmin) {
      navigate('/team');
      return;
    }
    
    if (id) {
      fetchMember();
    }
  }, [isAdmin, id]);

  const fetchMember = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setMember(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching team member:', error);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('team_members')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      navigate('/team');
    } catch (error) {
      console.error('Error updating team member:', error);
      setError(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: url
      }
    }));
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
          <User className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl">{t.unauthorized}</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl">{t.loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center gap-6">
                <div>
                  {formData.profile_image ? (
                    <img
                      src={formData.profile_image}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                      {formData.name_ko?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    <Image className="inline h-4 w-4 mr-2" />
                    {t.profileImage}
                  </label>
                  <input
                    type="url"
                    value={formData.profile_image || ''}
                    onChange={(e) => handleInputChange('profile_image', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Names */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.nameKo}</label>
                  <input
                    type="text"
                    value={formData.name_ko || ''}
                    onChange={(e) => handleInputChange('name_ko', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.nameEn}</label>
                  <input
                    type="text"
                    value={formData.name_en || ''}
                    onChange={(e) => handleInputChange('name_en', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.nameJa}</label>
                  <input
                    type="text"
                    value={formData.name_ja || ''}
                    onChange={(e) => handleInputChange('name_ja', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t.role}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.roleKo}</label>
                  <input
                    type="text"
                    value={formData.role_ko || ''}
                    onChange={(e) => handleInputChange('role_ko', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.roleEn}</label>
                  <input
                    type="text"
                    value={formData.role_en || ''}
                    onChange={(e) => handleInputChange('role_en', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.roleJa}</label>
                  <input
                    type="text"
                    value={formData.role_ja || ''}
                    onChange={(e) => handleInputChange('role_ja', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bios */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t.bio}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.bioKo}</label>
                  <textarea
                    value={formData.bio_ko || ''}
                    onChange={(e) => handleInputChange('bio_ko', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.bioEn}</label>
                  <textarea
                    value={formData.bio_en || ''}
                    onChange={(e) => handleInputChange('bio_en', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.bioJa}</label>
                  <textarea
                    value={formData.bio_ja || ''}
                    onChange={(e) => handleInputChange('bio_ja', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">
                <LinkIcon className="inline h-5 w-5 mr-2" />
                {t.socialLinks}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.github}</label>
                  <input
                    type="url"
                    value={formData.social_links?.github || ''}
                    onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.twitter}</label>
                  <input
                    type="url"
                    value={formData.social_links?.twitter || ''}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.linkedin}</label>
                  <input
                    type="url"
                    value={formData.social_links?.linkedin || ''}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.website}</label>
                  <input
                    type="url"
                    value={formData.social_links?.website || ''}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Other Settings */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">설정</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.sortOrder}</label>
                  <input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    {t.joinedDate}
                  </label>
                  <input
                    type="date"
                    value={formData.joined_date || ''}
                    onChange={(e) => handleInputChange('joined_date', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active !== undefined ? formData.active : true}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>{t.active}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-md transition-colors"
              >
                <Save className="h-5 w-5" />
                {saving ? '저장 중...' : t.save}
              </button>
              <button
                type="button"
                onClick={() => navigate('/team')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditTeamMember;