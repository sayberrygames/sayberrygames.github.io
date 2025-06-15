import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import NotionEditor from '../components/NotionEditor';
import MarkdownViewer from '../components/MarkdownViewer';
import { Eye, Edit, Info } from 'lucide-react';

interface Project {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
}

const WritePost = () => {
  const { user, isAdmin, isTeamMember, userRole } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const postType = searchParams.get('type') || 'dev_notes';

  const [activeTab, setActiveTab] = useState<'ko' | 'en' | 'ja'>('ko');
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);

  const [formData, setFormData] = useState({
    slug: '',
    title_ko: '',
    title_en: '',
    title_ja: '',
    excerpt_ko: '',
    excerpt_en: '',
    excerpt_ja: '',
    content_ko: '',
    content_en: '',
    content_ja: '',
    date: new Date().toISOString().split('T')[0],
    category: postType === 'news' ? 'Announcement' : 'Development',
    author: user?.user_metadata?.name || user?.email?.split('@')[0] || 'SayBerry Games',
    featured_image: '',
    steam_link: '',
    tags: [] as string[],
    published: true,
    project_id: '',
  });

  // Auto-generate slug from Korean title
  const generateSlug = (title: string) => {
    // Get current timestamp for uniqueness
    const timestamp = Date.now().toString(36);
    
    // Try to romanize Korean or use as-is for English
    const baseSlug = title
      .toLowerCase()
      .replace(/[가-힣]/g, '') // Remove Korean characters
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    // If no English characters remain, use timestamp only
    return baseSlug || `post-${timestamp}`;
  };

  const content = {
    ko: {
      title: postType === 'news' ? '뉴스 작성' : '개발 노트 작성',
      slug: 'URL 주소 (자동 생성됨)',
      slugTooltip: '제목을 입력하면 자동으로 생성됩니다',
      titleLabel: '제목',
      excerptLabel: '요약 (선택사항)',
      contentLabel: '내용',
      date: '날짜',
      category: '카테고리',
      author: '작성자',
      featuredImage: '대표 이미지 URL (선택사항)',
      steamLink: 'Steam 링크 (선택사항)',
      tags: '태그 (쉼표로 구분)',
      published: '공개',
      project: '프로젝트',
      selectProject: '프로젝트를 선택하세요',
      submit: '저장',
      cancel: '취소',
      preview: '미리보기',
      edit: '편집',
      error: '저장에 실패했습니다.',
      unauthorized: '권한이 없습니다.',
      requiredFields: '필수 입력 항목을 모두 작성해주세요.',
    },
    en: {
      title: postType === 'news' ? 'Write News' : 'Write Development Note',
      slug: 'URL Address (auto-generated)',
      slugTooltip: 'Automatically generated from title',
      titleLabel: 'Title',
      excerptLabel: 'Excerpt (Optional)',
      contentLabel: 'Content',
      date: 'Date',
      category: 'Category',
      author: 'Author',
      featuredImage: 'Featured Image URL (Optional)',
      steamLink: 'Steam Link (Optional)',
      tags: 'Tags (comma separated)',
      published: 'Published',
      project: 'Project',
      selectProject: 'Select a project',
      submit: 'Save',
      cancel: 'Cancel',
      preview: 'Preview',
      edit: 'Edit',
      error: 'Failed to save.',
      unauthorized: 'Unauthorized.',
      requiredFields: 'Please fill in all required fields.',
    },
    ja: {
      title: postType === 'news' ? 'ニュース作成' : '開発ノート作成',
      slug: 'URLアドレス（自動生成）',
      slugTooltip: 'タイトルから自動的に生成されます',
      titleLabel: 'タイトル',
      excerptLabel: '要約（オプション）',
      contentLabel: '内容',
      date: '日付',
      category: 'カテゴリー',
      author: '著者',
      featuredImage: 'アイキャッチ画像URL（オプション）',
      steamLink: 'Steamリンク（オプション）',
      tags: 'タグ（カンマ区切り）',
      published: '公開',
      project: 'プロジェクト',
      selectProject: 'プロジェクトを選択してください',
      submit: '保存',
      cancel: 'キャンセル',
      preview: 'プレビュー',
      edit: '編集',
      error: '保存に失敗しました。',
      unauthorized: '権限がありません。',
      requiredFields: '必須項目をすべて入力してください。',
    },
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const t = content[language];

  // Check permissions based on post type
  const hasPermission = () => {
    if (!user) return false;
    
    if (postType === 'dev_notes') {
      // Dev notes can be written by team members and above
      return isTeamMember;
    } else if (postType === 'news') {
      // News can be written by leads and admins only
      return userRole === 'admin' || userRole === 'lead';
    }
    
    return false;
  };

  if (!hasPermission()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{t.unauthorized}</p>
          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.slug || !formData.title_ko || !formData.title_en || !formData.title_ja ||
        !formData.content_ko || !formData.content_en || !formData.content_ja) {
      setError(t.requiredFields);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags.length > 0 
        ? formData.tags.join(',').split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const dataToInsert = {
        ...formData,
        tags: tagsArray,
        created_by: user.id,
      };

      const { error } = await supabase.from(postType).insert([dataToInsert]);
      if (error) throw error;

      navigate(postType === 'news' ? '/news' : '/devnotes');
    } catch (err) {
      console.error('Error saving post:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug when Korean title changes
    if (field === 'title_ko' && value) {
      const newSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: newSlug,
      }));
    }
  };

  const categories = postType === 'news' 
    ? ['Announcement', 'Update', 'Event', 'Release', 'Partnership']
    : ['Development', 'Update', 'Feature', 'Announcement', 'Milestone', 'Technical'];

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-900 p-6 rounded-lg space-y-4">
              <h2 className="text-2xl font-bold mb-4">기본 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    {t.slug} *
                    <div className="group relative">
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-700 text-xs text-white p-2 rounded whitespace-nowrap">
                        {t.slugTooltip}
                      </div>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"
                    placeholder="제목을 먼저 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.date} *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.category} *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.author} *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleChange('author', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.tags}</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.featuredImage}</label>
                  <input
                    type="url"
                    value={formData.featured_image}
                    onChange={(e) => handleChange('featured_image', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.steamLink}</label>
                  <input
                    type="url"
                    value={formData.steam_link}
                    onChange={(e) => handleChange('steam_link', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  />
                </div>
              </div>

              {postType === 'dev_notes' && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t.project} *</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => handleChange('project_id', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">{t.selectProject}</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {language === 'ko' ? project.name_ko : 
                         language === 'ja' ? project.name_ja : 
                         project.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => handleChange('published', e.target.checked)}
                  className="mr-2"
                  id="published"
                />
                <label htmlFor="published">{t.published}</label>
              </div>
            </div>

            {/* Language Tabs */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex space-x-4 mb-6 border-b border-gray-700">
                {(['ko', 'en', 'ja'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveTab(lang)}
                    className={`pb-2 px-4 ${
                      activeTab === lang
                        ? 'border-b-2 border-blue-500 text-blue-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang === 'ko' ? '한국어' : lang === 'en' ? 'English' : '日本語'}
                  </button>
                ))}
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white"
                >
                  {previewMode ? (
                    <>
                      <Edit className="h-4 w-4" />
                      <span>{t.edit}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>{t.preview}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t.titleLabel} *</label>
                <input
                  type="text"
                  value={formData[`title_${activeTab}`]}
                  onChange={(e) => handleChange(`title_${activeTab}`, e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>

              {/* Excerpt */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t.excerptLabel}</label>
                <textarea
                  value={formData[`excerpt_${activeTab}`]}
                  onChange={(e) => handleChange(`excerpt_${activeTab}`, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">{t.contentLabel} *</label>
                {previewMode ? (
                  <div className="bg-gray-800 p-4 rounded-lg min-h-[500px]">
                    <MarkdownViewer content={formData[`content_${activeTab}`]} />
                  </div>
                ) : (
                  <NotionEditor
                    content={formData[`content_${activeTab}`]}
                    onChange={(value) => handleChange(`content_${activeTab}`, value)}
                    placeholder={language === 'ko' ? '내용을 입력하세요... (/ 를 누르면 메뉴가 나타납니다)' : 'Type your content... (Press / for menu)'}
                    height={500}
                  />
                )}
              </div>
            </div>

            {error && (
              <div className="text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium disabled:opacity-50"
              >
                {loading ? '...' : t.submit}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-medium"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default WritePost;