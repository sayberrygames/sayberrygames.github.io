import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, User, Eye, Tag, ExternalLink, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { newsTranslations } from '../translations/news';

interface NewsItem {
  id: string;
  slug: string;
  date: string;
  category: string;
  author: string;
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
  steam_link?: string;
  tags?: string[];
  published: boolean;
  views: number;
}

const News = () => {
  const { language } = useLanguage();
  const { userRole } = useAuth();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  const t = newsTranslations[language];
  const canWriteNews = userRole === 'admin' || userRole === 'lead';

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        setNewsItems(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = selectedCategory === 'all'
    ? newsItems
    : newsItems.filter(item => item.category === selectedCategory);

  const getTitle = (item: NewsItem) => {
    switch (language) {
      case 'ko': return item.title_ko;
      case 'en': return item.title_en;
      case 'ja': return item.title_ja;
      default: return item.title_ko;
    }
  };

  const getExcerpt = (item: NewsItem) => {
    switch (language) {
      case 'ko': return item.excerpt_ko || item.content_ko.substring(0, 150) + '...';
      case 'en': return item.excerpt_en || item.content_en.substring(0, 150) + '...';
      case 'ja': return item.excerpt_ja || item.content_ja.substring(0, 150) + '...';
      default: return item.excerpt_ko || item.content_ko.substring(0, 150) + '...';
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

  return (
    <>
      <SEO title={t.pageTitle} description={t.pageDescription} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl text-gray-400">{t.subtitle}</p>
          </div>

          {/* Write Button for Authorized Users */}
          {canWriteNews && (
            <div className="flex justify-end mb-6">
              <Link
                to="/write?type=news"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t.writeNews}
              </Link>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t.allCategories}
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* News Grid */}
          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">{t.noNews}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map(item => (
                <article
                  key={item.id}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Featured Image */}
                  {item.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.featured_image}
                        alt={getTitle(item)}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Category & Date */}
                    <div className="flex items-center justify-between mb-3 text-sm text-gray-400">
                      <span className="bg-gray-800 px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.date)}
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold mb-3 line-clamp-2">
                      <Link
                        to={`/news/${item.slug}`}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {getTitle(item)}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {getExcerpt(item)}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {item.author}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {item.views}
                        </div>
                      </div>
                      {item.steam_link && (
                        <a
                          href={item.steam_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default News;