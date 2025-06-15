import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, User, Eye, Tag, ExternalLink, ChevronLeft, Edit2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import MarkdownViewer from '../components/MarkdownViewer';
import { newsTranslations } from '../translations/news';

interface NewsItem {
  id: string;
  slug: string;
  date: string;
  category: string;
  author?: string;
  title_ko: string;
  title_en: string;
  title_ja: string;
  excerpt_ko?: string;
  excerpt_en?: string;
  excerpt_ja?: string;
  content_ko: string;
  content_en: string;
  content_ja: string;
  featured_image?: string;
  tags?: string[];
  published: boolean;
  views?: number;
}

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAdmin, userRole } = useAuth();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);

  const t = newsTranslations[language];

  useEffect(() => {
    if (slug) {
      fetchNewsItem();
    }
  }, [slug]);

  const fetchNewsItem = async () => {
    try {
      // Fetch the news item
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      if (data) {
        setNewsItem(data);
        
        // Update view count if views column exists
        if ('views' in data) {
          await supabase
            .from('news')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', data.id);
        }

        // Fetch related news
        fetchRelatedNews(data.category, data.id);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      navigate('/news');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async (category: string, currentId: string) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .eq('category', category)
        .neq('id', currentId)
        .order('date', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRelatedNews(data || []);
    } catch (error) {
      console.error('Error fetching related news:', error);
    }
  };

  const getTitle = (item: NewsItem) => {
    switch (language) {
      case 'ko': return item.title_ko;
      case 'en': return item.title_en;
      case 'ja': return item.title_ja;
      default: return item.title_ko;
    }
  };

  const getContent = (item: NewsItem) => {
    switch (language) {
      case 'ko': return item.content_ko;
      case 'en': return item.content_en;
      case 'ja': return item.content_ja;
      default: return item.content_ko;
    }
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
        <div className="text-xl">{t.loading}</div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">News not found</p>
          <Link to="/news" className="text-blue-500 hover:text-blue-400">
            {t.backToList}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={getTitle(newsItem) + ' | SayBerry Games News'} 
        description={newsItem[`excerpt_${language}`] || getContent(newsItem).substring(0, 150)}
      />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button and Edit button */}
          <div className="flex justify-between items-center mb-6">
            <Link
              to="/news"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              {t.backToList}
            </Link>
            
            {(isAdmin || userRole === 'lead') && (
              <button
                onClick={() => navigate(`/edit/${newsItem.id}?type=news`)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                {language === 'ko' ? '수정' : language === 'ja' ? '編集' : 'Edit'}
              </button>
            )}
          </div>

          {/* Main article */}
          <article>
            {/* Featured image */}
            {newsItem.featured_image && (
              <div className="aspect-video mb-8 overflow-hidden rounded-lg">
                <img
                  src={newsItem.featured_image}
                  alt={getTitle(newsItem)}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                  {newsItem.category}
                </span>
                <time className="text-gray-400 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(newsItem.date)}
                </time>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {getTitle(newsItem)}
              </h1>

              {/* Meta info */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                {newsItem.author && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {newsItem.author}
                  </div>
                )}
                {newsItem.views !== undefined && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {newsItem.views}
                  </div>
                )}
              </div>
            </header>

            {/* Article content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <MarkdownViewer content={getContent(newsItem)} />
            </div>

            {/* Tags */}
            {newsItem.tags && newsItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-800">
                <Tag className="h-5 w-5 text-gray-400" />
                {newsItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Related news */}
          {relatedNews.length > 0 && (
            <section className="mt-16 pt-16 border-t border-gray-800">
              <h2 className="text-2xl font-bold mb-8">{t.relatedNews}</h2>
              <div className="grid gap-6">
                {relatedNews.map(item => (
                  <Link
                    key={item.id}
                    to={`/news/${item.slug}`}
                    className="block bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                          {getTitle(item)}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {formatDate(item.date)}
                        </p>
                      </div>
                      {item.featured_image && (
                        <img
                          src={item.featured_image}
                          alt={getTitle(item)}
                          className="w-24 h-24 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsDetail;