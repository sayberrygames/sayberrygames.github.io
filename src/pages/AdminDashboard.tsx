import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { BarChart3, Users, FileText, Eye, TrendingUp, Calendar, Globe } from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  pageViews: { path: string; views: number }[];
  dailyViews: { date: string; views: number }[];
  referrers: { source: string; count: number }[];
}

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [teamCount, setTeamCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [wikiCount, setWikiCount] = useState(0);

  const content = {
    ko: {
      title: '관리자 대시보드',
      overview: '사이트 개요',
      analytics: '방문자 분석',
      totalViews: '총 조회수',
      uniqueVisitors: '순 방문자',
      teamMembers: '팀원',
      newsArticles: '뉴스 게시물',
      wikiPages: '위키 페이지',
      topPages: '인기 페이지',
      dailyTraffic: '일별 트래픽',
      referrers: '유입 경로',
      viewDetails: '자세히 보기',
      unauthorized: '관리자 권한이 필요합니다.',
      noData: '데이터가 없습니다'
    },
    en: {
      title: 'Admin Dashboard',
      overview: 'Site Overview',
      analytics: 'Visitor Analytics',
      totalViews: 'Total Views',
      uniqueVisitors: 'Unique Visitors',
      teamMembers: 'Team Members',
      newsArticles: 'News Articles',
      wikiPages: 'Wiki Pages',
      topPages: 'Top Pages',
      dailyTraffic: 'Daily Traffic',
      referrers: 'Referrers',
      viewDetails: 'View Details',
      unauthorized: 'Admin access required.',
      noData: 'No data available'
    },
    ja: {
      title: '管理者ダッシュボード',
      overview: 'サイト概要',
      analytics: '訪問者分析',
      totalViews: '総閲覧数',
      uniqueVisitors: 'ユニーク訪問者',
      teamMembers: 'チームメンバー',
      newsArticles: 'ニュース記事',
      wikiPages: 'Wikiページ',
      topPages: '人気ページ',
      dailyTraffic: '日別トラフィック',
      referrers: '参照元',
      viewDetails: '詳細を見る',
      unauthorized: '管理者権限が必要です。',
      noData: 'データがありません'
    }
  };

  const t = content[language];

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      // Fetch team members count
      const { count: teamCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
      
      // Fetch news count
      const { count: newsCount } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);
      
      // Fetch wiki pages count
      const { count: wikiCount } = await supabase
        .from('wiki_pages')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      setTeamCount(teamCount || 0);
      setNewsCount(newsCount || 0);
      setWikiCount(wikiCount || 0);

      // Fetch real analytics data
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Get total page views
      const { count: totalViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });
      
      // Get unique visitors (by session_id)
      const { data: uniqueSessions } = await supabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', sevenDaysAgo.toISOString());
      
      const uniqueVisitors = new Set(uniqueSessions?.map(s => s.session_id) || []).size;
      
      // Get page views by path
      const { data: pathViews } = await supabase
        .rpc('get_page_view_counts');
      
      // Get daily views for the last 7 days
      const { data: dailyData } = await supabase
        .rpc('get_daily_views', { days: 7 });
      
      // Get referrer data
      const { data: referrerData } = await supabase
        .rpc('get_referrer_counts');
      
      setAnalytics({
        totalViews: totalViews || 0,
        uniqueVisitors: uniqueVisitors,
        pageViews: pathViews?.slice(0, 5) || [],
        dailyViews: dailyData || [],
        referrers: referrerData?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
        <p className="text-xl">{t.unauthorized}</p>
      </div>
    );
  }

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t.title}</h1>

          {/* Overview Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{t.overview}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-8 w-8 text-blue-500" />
                  <span className="text-sm text-gray-400">{t.totalViews}</span>
                </div>
                <p className="text-3xl font-bold">{analytics?.totalViews.toLocaleString()}</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-8 w-8 text-green-500" />
                  <span className="text-sm text-gray-400">{t.uniqueVisitors}</span>
                </div>
                <p className="text-3xl font-bold">{analytics?.uniqueVisitors.toLocaleString()}</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-8 w-8 text-purple-500" />
                  <span className="text-sm text-gray-400">{t.teamMembers}</span>
                </div>
                <p className="text-3xl font-bold">{teamCount}</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-8 w-8 text-yellow-500" />
                  <span className="text-sm text-gray-400">{t.newsArticles}</span>
                </div>
                <p className="text-3xl font-bold">{newsCount}</p>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Pages */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.topPages}
              </h3>
              <div className="space-y-3">
                {analytics?.pageViews.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{page.path}</span>
                    <span className="text-sm text-gray-500">{page.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Referrers */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t.referrers}
              </h3>
              <div className="space-y-3">
                {analytics?.referrers.map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{referrer.source}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(referrer.count / (analytics?.totalViews || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{referrer.count.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/team')}
              className="bg-gray-900 hover:bg-gray-800 rounded-lg p-6 text-left transition-colors"
            >
              <Users className="h-8 w-8 mb-2 text-purple-500" />
              <p className="font-semibold">{t.teamMembers}</p>
              <p className="text-sm text-gray-400">{t.viewDetails}</p>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="bg-gray-900 hover:bg-gray-800 rounded-lg p-6 text-left transition-colors"
            >
              <Users className="h-8 w-8 mb-2 text-green-500" />
              <p className="font-semibold">사용자 관리</p>
              <p className="text-sm text-gray-400">{t.viewDetails}</p>
            </button>

            <button
              onClick={() => navigate('/wiki')}
              className="bg-gray-900 hover:bg-gray-800 rounded-lg p-6 text-left transition-colors"
            >
              <FileText className="h-8 w-8 mb-2 text-blue-500" />
              <p className="font-semibold">{t.wikiPages}</p>
              <p className="text-sm text-gray-400">{t.viewDetails}</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;