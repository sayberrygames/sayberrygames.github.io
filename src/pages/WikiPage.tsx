import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import MarkdownViewer from '../components/MarkdownViewer';
import { 
  Edit2, History, Lock, Globe, ChevronLeft, 
  Share2, Trash2, Plus, Home, Eye, Users
} from 'lucide-react';

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  parent_id: string | null;
  project_id: string | null;
  is_public: boolean;
  author_id: string;
  last_edited_by: string;
  created_at: string;
  updated_at: string;
  project?: {
    name_ko: string;
    name_en: string;
    name_ja: string;
  };
  parent?: {
    title: string;
    slug: string;
  };
}

interface PageHistory {
  id: string;
  title: string;
  content: string;
  edited_by: string;
  created_at: string;
}

const WikiPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isTeamMember } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [page, setPage] = useState<WikiPage | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [canView, setCanView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<PageHistory[]>([]);

  const content = {
    ko: {
      edit: '편집',
      history: '히스토리',
      share: '공유',
      delete: '삭제',
      newSubpage: '하위 페이지 만들기',
      lastUpdated: '최종 수정',
      by: '작성자',
      public: '공개',
      private: '비공개',
      backToWiki: '위키로 돌아가기',
      unauthorized: '이 페이지를 볼 권한이 없습니다.',
      notFound: '페이지를 찾을 수 없습니다.',
      confirmDelete: '정말로 이 페이지를 삭제하시겠습니까?',
      viewHistory: '변경 이력 보기',
      version: '버전',
      editedBy: '수정자',
      viewCount: '조회수'
    },
    en: {
      edit: 'Edit',
      history: 'History',
      share: 'Share',
      delete: 'Delete',
      newSubpage: 'Create Subpage',
      lastUpdated: 'Last updated',
      by: 'by',
      public: 'Public',
      private: 'Private',
      backToWiki: 'Back to Wiki',
      unauthorized: 'You do not have permission to view this page.',
      notFound: 'Page not found.',
      confirmDelete: 'Are you sure you want to delete this page?',
      viewHistory: 'View History',
      version: 'Version',
      editedBy: 'Edited by',
      viewCount: 'Views'
    },
    ja: {
      edit: '編集',
      history: '履歴',
      share: '共有',
      delete: '削除',
      newSubpage: 'サブページを作成',
      lastUpdated: '最終更新',
      by: '作成者',
      public: '公開',
      private: '非公開',
      backToWiki: 'Wikiに戻る',
      unauthorized: 'このページを表示する権限がありません。',
      notFound: 'ページが見つかりません。',
      confirmDelete: '本当にこのページを削除しますか？',
      viewHistory: '変更履歴を表示',
      version: 'バージョン',
      editedBy: '編集者',
      viewCount: '閲覧数'
    }
  };

  const t = content[language];

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select(`
          *,
          project:projects(name_ko, name_en, name_ja),
          parent:wiki_pages!parent_id(title, slug)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      
      if (data) {
        setPage(data);
        
        // Check permissions
        const hasAccess = await checkAccess(data);
        setCanView(hasAccess);
        
        if (hasAccess && isTeamMember) {
          const editAccess = await checkEditAccess(data);
          setCanEdit(editAccess);
        }
        
        // Increment view count if user can view
        if (hasAccess) {
          await incrementViewCount(data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setPage(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async (page: WikiPage): Promise<boolean> => {
    // Public pages can be viewed by anyone
    if (page.is_public) return true;
    
    // Non-team members can't view private pages
    if (!isTeamMember) return false;
    
    // Check if user has access to the project
    if (page.project_id && user) {
      // First, find the team member record for this user
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .single();
      
      if (!teamMember) return false;
      
      // Then check if they're assigned to this project
      const { data } = await supabase
        .from('team_member_projects')
        .select('id')
        .eq('team_member_id', teamMember.id)
        .eq('project_id', page.project_id)
        .single();
      
      return !!data;
    }
    
    // Team members can view general wiki pages
    return true;
  };

  const checkEditAccess = async (page: WikiPage): Promise<boolean> => {
    if (!user) return false;
    
    // Check if user has explicit edit permission
    const { data: permission } = await supabase
      .from('wiki_page_permissions')
      .select('can_edit')
      .eq('page_id', page.id)
      .eq('user_id', user.id)
      .single();
    
    if (permission?.can_edit) return true;
    
    // Check if user is in the same project
    if (page.project_id) {
      // First, find the team member record for this user
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .single();
      
      if (!teamMember) return false;
      
      // Then check if they're assigned to this project
      const { data } = await supabase
        .from('team_member_projects')
        .select('id')
        .eq('team_member_id', teamMember.id)
        .eq('project_id', page.project_id)
        .single();
      
      return !!data;
    }
    
    // All team members can edit general pages
    return true;
  };

  const incrementViewCount = async (pageId: string) => {
    // This would typically increment a view count in the database
    // For now, we'll just log it
    console.log('Page viewed:', pageId);
  };

  const fetchHistory = async () => {
    if (!page) return;
    
    try {
      const { data, error } = await supabase
        .from('wiki_page_history')
        .select('*')
        .eq('page_id', page.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHistory(data || []);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleDelete = async () => {
    if (!page || !window.confirm(t.confirmDelete)) return;
    
    try {
      const { error } = await supabase
        .from('wiki_pages')
        .delete()
        .eq('id', page.id);
      
      if (error) throw error;
      navigate('/wiki');
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(
      language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">{t.notFound}</p>
          <Link to="/wiki" className="text-blue-500 hover:text-blue-400">
            {t.backToWiki}
          </Link>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl mb-4">{t.unauthorized}</p>
          <Link to="/wiki" className="text-blue-500 hover:text-blue-400">
            {t.backToWiki}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={page.title + ' | Wiki | SayBerry Games'} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/wiki" className="hover:text-white">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            {page.parent && (
              <>
                <Link to={`/wiki/${page.parent.slug}`} className="hover:text-white">
                  {page.parent.title}
                </Link>
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </>
            )}
            <span className="text-white">{page.title}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{page.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    {page.is_public ? (
                      <>
                        <Globe className="h-4 w-4" />
                        {t.public}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {t.private}
                      </>
                    )}
                  </span>
                  {page.project && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {page.project[`name_${language}`] || page.project.name_en}
                    </span>
                  )}
                  <span>
                    {t.lastUpdated} {formatDate(page.updated_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {canEdit && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/wiki/edit/${page.slug}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    {t.edit}
                  </button>
                  <button
                    onClick={fetchHistory}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <History className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <MarkdownViewer content={page.content} />
          </div>

          {/* Footer actions */}
          {canEdit && (
            <div className="border-t border-gray-800 pt-6">
              <button
                onClick={() => navigate(`/wiki/new?parent=${page.id}`)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <Plus className="h-5 w-5" />
                {t.newSubpage}
              </button>
            </div>
          )}
        </div>

        {/* History modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold">{t.viewHistory}</h2>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={item.id} className="border-l-2 border-gray-700 pl-4">
                      <div className="text-sm text-gray-400 mb-1">
                        {t.version} {history.length - index} • {formatDate(item.created_at)}
                      </div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-400">
                        {t.editedBy}: {item.edited_by}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-gray-800">
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WikiPage;