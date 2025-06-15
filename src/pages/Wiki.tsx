import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { 
  BookOpen, Plus, Search, Folder, File, Lock, 
  Users, Home, ChevronRight, Edit, History,
  Settings, User
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
  children?: WikiPage[];
}

interface Project {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  logo_url: string | null;
}

const Wiki = () => {
  const { user, isTeamMember, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const content = {
    ko: {
      title: '팀 위키',
      subtitle: '팀 내부 문서 및 지식 공유',
      createPage: '새 페이지',
      search: '검색...',
      allProjects: '전체 프로젝트',
      recentPages: '최근 페이지',
      myPages: '내 페이지',
      projectDocs: '프로젝트 문서',
      unauthorized: '팀원만 접근 가능합니다.',
      noPages: '아직 위키 페이지가 없습니다.',
      public: '공개',
      private: '비공개',
      lastUpdated: '최종 수정',
      by: '작성자',
      newPage: '새 페이지 만들기',
      projects: '프로젝트',
      settings: '설정'
    },
    en: {
      title: 'Team Wiki',
      subtitle: 'Internal documentation and knowledge sharing',
      createPage: 'New Page',
      search: 'Search...',
      allProjects: 'All Projects',
      recentPages: 'Recent Pages',
      myPages: 'My Pages',
      projectDocs: 'Project Docs',
      unauthorized: 'Team members only.',
      noPages: 'No wiki pages yet.',
      public: 'Public',
      private: 'Private',
      lastUpdated: 'Last updated',
      by: 'by',
      newPage: 'Create New Page',
      projects: 'Projects',
      settings: 'Settings'
    },
    ja: {
      title: 'チームWiki',
      subtitle: 'チーム内部ドキュメントと知識共有',
      createPage: '新規ページ',
      search: '検索...',
      allProjects: 'すべてのプロジェクト',
      recentPages: '最近のページ',
      myPages: 'マイページ',
      projectDocs: 'プロジェクト文書',
      unauthorized: 'チームメンバーのみアクセス可能です。',
      noPages: 'Wikiページがまだありません。',
      public: '公開',
      private: '非公開',
      lastUpdated: '最終更新',
      by: '作成者',
      newPage: '新しいページを作成',
      projects: 'プロジェクト',
      settings: '設定'
    }
  };

  const t = content[language];

  useEffect(() => {
    if (!isTeamMember) {
      navigate('/');
      return;
    }
    
    fetchUserProjects();
    fetchProjects();
    fetchPages();
  }, [isTeamMember]);

  useEffect(() => {
    fetchPages();
  }, [selectedProject, searchQuery]);

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

  const fetchPages = async () => {
    try {
      let query = supabase
        .from('wiki_pages')
        .select('*')
        .order('updated_at', { ascending: false });
      
      // Filter by project if selected
      if (selectedProject) {
        query = query.eq('project_id', selectedProject);
      }
      
      // Search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Build page hierarchy
      const pagesWithHierarchy = buildPageHierarchy(data || []);
      setPages(pagesWithHierarchy);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildPageHierarchy = (flatPages: WikiPage[]): WikiPage[] => {
    const pageMap = new Map<string, WikiPage>();
    const rootPages: WikiPage[] = [];
    
    // First pass: create map
    flatPages.forEach(page => {
      pageMap.set(page.id, { ...page, children: [] });
    });
    
    // Second pass: build hierarchy
    flatPages.forEach(page => {
      const pageCopy = pageMap.get(page.id)!;
      if (page.parent_id && pageMap.has(page.parent_id)) {
        const parent = pageMap.get(page.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(pageCopy);
      } else {
        rootPages.push(pageCopy);
      }
    });
    
    return rootPages;
  };

  const getProjectName = (project: Project) => {
    return project[`name_${language}`] || project.name_en;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return language === 'ko' ? `${diffMins}분 전` : 
             language === 'ja' ? `${diffMins}分前` : 
             `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return language === 'ko' ? `${diffHours}시간 전` : 
             language === 'ja' ? `${diffHours}時間前` : 
             `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString(
        language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US'
      );
    }
  };

  const renderPageTree = (pages: WikiPage[], level = 0) => {
    return pages.map(page => (
      <div key={page.id} style={{ marginLeft: `${level * 20}px` }}>
        <Link
          to={`/wiki/${page.slug}`}
          className="flex items-center gap-2 p-3 hover:bg-gray-800 rounded-lg transition-colors group"
        >
          {page.children && page.children.length > 0 ? (
            <Folder className="h-5 w-5 text-gray-400" />
          ) : (
            <File className="h-5 w-5 text-gray-400" />
          )}
          <span className="flex-1">{page.title}</span>
          {!page.is_public && <Lock className="h-4 w-4 text-gray-500" />}
          <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100">
            {formatDate(page.updated_at)}
          </span>
        </Link>
        {page.children && page.children.length > 0 && (
          <div className="ml-2">
            {renderPageTree(page.children, level + 1)}
          </div>
        )}
      </div>
    ));
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
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <BookOpen className="h-6 w-6" />
              {t.title}
            </h2>
            <p className="text-sm text-gray-400">{t.subtitle}</p>
          </div>

          {/* Create button */}
          <button
            onClick={() => navigate('/wiki/new')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mb-6"
          >
            <Plus className="h-5 w-5" />
            {t.createPage}
          </button>

          {/* Project filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">{t.projects}</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedProject(null)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedProject === null ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {t.allProjects}
              </button>
              {projects
                .filter(project => isAdmin || userProjects.includes(project.id))
                .map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      selectedProject === project.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {project.logo_url && (
                      <img src={project.logo_url} alt="" className="w-4 h-4" />
                    )}
                    {getProjectName(project)}
                  </button>
                ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-1">
            <Link
              to="/wiki/recent"
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              <History className="h-5 w-5" />
              {t.recentPages}
            </Link>
            <Link
              to="/wiki/my"
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              <User className="h-5 w-5" />
              {t.myPages}
            </Link>
            {isAdmin && (
              <Link
                to="/wiki/settings"
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              >
                <Settings className="h-5 w-5" />
                {t.settings}
              </Link>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Page list */}
          <div className="bg-gray-900 rounded-lg p-6">
            {pages.length > 0 ? (
              <div className="space-y-1">
                {renderPageTree(pages)}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">{t.noPages}</p>
                <button
                  onClick={() => navigate('/wiki/new')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  {t.newPage}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Wiki;