import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import MarkdownEditor from '../components/MarkdownEditor';
import MarkdownViewer from '../components/MarkdownViewer';
import { Eye, Edit, Save, X, Globe, Lock, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
}

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  parent_id: string | null;
  project_id: string | null;
  is_public: boolean;
}

const WikiEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parent');
  const { user, isTeamMember } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const isEditMode = !!slug;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slugValue, setSlugValue] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [originalPage, setOriginalPage] = useState<WikiPage | null>(null);

  const translations = {
    ko: {
      newPage: '새 위키 페이지',
      editPage: '위키 페이지 편집',
      title: '제목',
      slug: 'URL 슬러그',
      content: '내용',
      project: '프로젝트',
      selectProject: '프로젝트 선택 (선택사항)',
      visibility: '공개 설정',
      public: '공개 (누구나 볼 수 있음)',
      private: '비공개 (팀원만 볼 수 있음)',
      save: '저장',
      cancel: '취소',
      preview: '미리보기',
      edit: '편집',
      requiredFields: '제목과 내용은 필수입니다.',
      slugExists: '이미 사용 중인 URL입니다.',
      unauthorized: '권한이 없습니다.',
      savingError: '저장 중 오류가 발생했습니다.'
    },
    en: {
      newPage: 'New Wiki Page',
      editPage: 'Edit Wiki Page',
      title: 'Title',
      slug: 'URL Slug',
      content: 'Content',
      project: 'Project',
      selectProject: 'Select Project (Optional)',
      visibility: 'Visibility',
      public: 'Public (Anyone can view)',
      private: 'Private (Team members only)',
      save: 'Save',
      cancel: 'Cancel',
      preview: 'Preview',
      edit: 'Edit',
      requiredFields: 'Title and content are required.',
      slugExists: 'This URL is already in use.',
      unauthorized: 'Unauthorized.',
      savingError: 'Error saving page.'
    },
    ja: {
      newPage: '新しいWikiページ',
      editPage: 'Wikiページを編集',
      title: 'タイトル',
      slug: 'URLスラッグ',
      content: '内容',
      project: 'プロジェクト',
      selectProject: 'プロジェクトを選択（オプション）',
      visibility: '公開設定',
      public: '公開（誰でも閲覧可能）',
      private: '非公開（チームメンバーのみ）',
      save: '保存',
      cancel: 'キャンセル',
      preview: 'プレビュー',
      edit: '編集',
      requiredFields: 'タイトルと内容は必須です。',
      slugExists: 'このURLは既に使用されています。',
      unauthorized: '権限がありません。',
      savingError: 'ページの保存中にエラーが発生しました。'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (!isTeamMember) {
      navigate('/wiki');
      return;
    }
    
    fetchUserProjects();
    fetchProjects();
    
    if (isEditMode && slug) {
      fetchPage();
    }
  }, [isTeamMember, slug]);

  const fetchUserProjects = async () => {
    if (!user) return;
    
    try {
      // First, find the team member record for this user
      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .single();
      
      if (teamMemberError || !teamMember) {
        console.log('No team member record found for user');
        setUserProjects([]);
        return;
      }
      
      // Then fetch their project assignments
      const { data, error } = await supabase
        .from('team_member_projects')
        .select('project_id')
        .eq('team_member_id', teamMember.id);
      
      if (error) throw error;
      
      const projectIds = data?.map(item => item.project_id) || [];
      setUserProjects(projectIds);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      setUserProjects([]);
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

  const fetchPage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setOriginalPage(data);
        setTitle(data.title);
        setContent(data.content);
        setSlugValue(data.slug);
        setProjectId(data.project_id);
        setIsPublic(data.is_public);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setError(t.unauthorized);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditMode && !slugValue) {
      setSlugValue(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError(t.requiredFields);
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      if (isEditMode && originalPage) {
        // Update existing page
        const { error } = await supabase
          .from('wiki_pages')
          .update({
            title,
            content,
            project_id: projectId,
            is_public: isPublic,
            last_edited_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', originalPage.id);
        
        if (error) throw error;
      } else {
        // Create new page
        const { error } = await supabase
          .from('wiki_pages')
          .insert({
            title,
            slug: slugValue,
            content,
            parent_id: parentId,
            project_id: projectId,
            is_public: isPublic,
            author_id: user?.id,
            last_edited_by: user?.id
          });
        
        if (error) {
          if (error.code === '23505') {
            setError(t.slugExists);
            return;
          }
          throw error;
        }
      }
      
      navigate(`/wiki/${slugValue}`);
    } catch (error) {
      console.error('Error saving page:', error);
      setError(t.savingError);
    } finally {
      setSaving(false);
    }
  };

  const getProjectName = (project: Project) => {
    return project[`name_${language}`] || project.name_en;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isTeamMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl">{t.unauthorized}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={(isEditMode ? t.editPage : t.newPage) + ' | Wiki | SayBerry Games'} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">
            {isEditMode ? t.editPage : t.newPage}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.title} *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            {/* Slug (only for new pages) */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium mb-2">{t.slug} *</label>
                <input
                  type="text"
                  value={slugValue}
                  onChange={(e) => setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>
            )}
            
            {/* Project */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.project}</label>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value || null)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
              >
                <option value="">{t.selectProject}</option>
                {projects
                  .filter(p => userProjects.includes(p.id))
                  .map(project => (
                    <option key={project.id} value={project.id}>
                      {getProjectName(project)}
                    </option>
                  ))}
              </select>
            </div>
            
            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.visibility}</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-400" />
                    <span>{t.private}</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span>{t.public}</span>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">{t.content} *</label>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                >
                  {previewMode ? (
                    <>
                      <Edit className="h-4 w-4" />
                      {t.edit}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      {t.preview}
                    </>
                  )}
                </button>
              </div>
              
              {previewMode ? (
                <div className="bg-gray-800 rounded-lg p-6 min-h-[400px] prose prose-invert max-w-none">
                  <MarkdownViewer content={content} />
                </div>
              ) : (
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  height={400}
                />
              )}
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
                {saving ? '...' : t.save}
              </button>
              <button
                type="button"
                onClick={() => navigate('/wiki')}
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

export default WikiEditor;