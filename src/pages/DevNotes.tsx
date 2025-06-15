import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, User, Tag, Plus, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { devNotesTranslations } from '../translations/devnotes';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import MarkdownViewer from '../components/MarkdownViewer';

interface DevNote {
  id: string;
  slug: string;
  title_ko: string;
  title_en: string;
  title_ja: string;
  excerpt_ko: string | null;
  excerpt_en: string | null;
  excerpt_ja: string | null;
  content_ko: string;
  content_en: string;
  content_ja: string;
  date: string;
  category: string;
  author: string;
  featured_image: string | null;
  steam_link: string | null;
  tags: string[] | null;
  view_count: number;
  published: boolean;
  created_at: string;
}

const DevNotes = () => {
  const { language } = useLanguage();
  const { isTeamMember } = useAuth();
  const navigate = useNavigate();
  const content = devNotesTranslations[language];
  
  const [notes, setNotes] = useState<DevNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<DevNote | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('dev_notes')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching dev notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteClick = async (note: DevNote) => {
    setSelectedNote(note);
    setViewMode('detail');
    
    // Increment view count
    await supabase
      .from('dev_notes')
      .update({ view_count: note.view_count + 1 })
      .eq('id', note.id);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Development': 'bg-blue-600',
      'Update': 'bg-green-600',
      'Feature': 'bg-purple-600',
      'Announcement': 'bg-yellow-600',
      'Milestone': 'bg-red-600',
      'Technical': 'bg-gray-600',
    };
    return colors[category] || 'bg-gray-600';
  };

  const getTitle = (note: DevNote) => {
    return note[`title_${language}`] || note.title_en;
  };

  const getExcerpt = (note: DevNote) => {
    return note[`excerpt_${language}`] || note[`content_${language}`].substring(0, 150) + '...';
  };

  const getContent = (note: DevNote) => {
    return note[`content_${language}`] || note.content_en;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedNote) {
    return (
      <>
        <SEO 
          title={getTitle(selectedNote) + ' | SayBerry Games'} 
          description={getExcerpt(selectedNote)}
        />
        <section className="py-20 px-4 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedNote(null);
              }}
              className="mb-6 text-gray-400 hover:text-white transition-colors"
            >
              ← {language === 'ko' ? '목록으로' : language === 'ja' ? 'リストに戻る' : 'Back to list'}
            </button>

            <article>
              {selectedNote.featured_image && (
                <img 
                  src={selectedNote.featured_image} 
                  alt={getTitle(selectedNote)}
                  className="w-full h-64 object-cover rounded-lg mb-8"
                />
              )}

              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-4">{getTitle(selectedNote)}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(selectedNote.date).toLocaleDateString(
                      language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US'
                    )}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {selectedNote.author}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {selectedNote.view_count}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(selectedNote.category)}`}>
                    {selectedNote.category}
                  </span>
                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {selectedNote.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <MarkdownViewer content={getContent(selectedNote)} />
              </div>

              {selectedNote.steam_link && (
                <div className="mt-8">
                  <a
                    href={selectedNote.steam_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-[#171a21] text-white px-6 py-3 rounded-lg hover:bg-[#1b2838] transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>{content.readMore}</span>
                  </a>
                </div>
              )}
            </article>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={content.title + ' | SayBerry Games'} 
        description={content.subtitle}
      />
      <section className="py-20 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold mb-4"
              >
                {content.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-400"
              >
                {content.subtitle}
              </motion.p>
            </div>
            
            {isTeamMember && (
              <button
                onClick={() => navigate('/write?type=dev_notes')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>{language === 'ko' ? '글쓰기' : language === 'ja' ? '新規作成' : 'Write'}</span>
              </button>
            )}
          </div>

          <div className="grid gap-8">
            {notes.map((note, index) => (
              <motion.article
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all cursor-pointer"
                onClick={() => handleNoteClick(note)}
              >
                <div className="flex">
                  {note.featured_image && (
                    <div className="w-48 h-48 flex-shrink-0">
                      <img 
                        src={note.featured_image} 
                        alt={getTitle(note)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getCategoryColor(note.category)}`}>
                        {note.category}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(note.date).toLocaleDateString(
                          language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US'
                        )}
                      </span>
                      <span className="text-gray-500 text-sm">• {note.author}</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2 hover:text-blue-400 transition-colors">
                      {getTitle(note)}
                    </h2>
                    
                    <p className="text-gray-400 mb-4">
                      {getExcerpt(note)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            {note.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-gray-500 text-sm">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {note.view_count}
                        </div>
                        {note.steam_link && (
                          <ExternalLink className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {notes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {language === 'ko' ? '아직 작성된 개발 노트가 없습니다.' : 
                 language === 'ja' ? 'まだ開発ノートがありません。' : 
                 'No development notes yet.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DevNotes;