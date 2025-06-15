import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import MarkdownEditor from '../components/MarkdownEditor';
import MarkdownViewer from '../components/MarkdownViewer';

const WriteDevNote = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    slug: '',
    title_ko: '',
    title_en: '',
    title_ja: '',
    content_ko: '',
    content_en: '',
    content_ja: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Development',
    author: 'SayBerry Games',
    steam_link: '',
    published: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const content = {
    ko: {
      title: '개발 노트 작성',
      slug: 'Slug (URL용 고유 ID)',
      titleKo: '제목 (한국어)',
      titleEn: '제목 (영어)',
      titleJa: '제목 (일본어)',
      contentKo: '내용 (한국어)',
      contentEn: '내용 (영어)',
      contentJa: '내용 (일본어)',
      date: '날짜',
      category: '카테고리',
      author: '작성자',
      steamLink: 'Steam 링크 (선택사항)',
      published: '공개',
      submit: '저장',
      cancel: '취소',
      error: '저장에 실패했습니다.',
      unauthorized: '권한이 없습니다.',
    },
    en: {
      title: 'Write Development Note',
      slug: 'Slug (Unique ID for URL)',
      titleKo: 'Title (Korean)',
      titleEn: 'Title (English)',
      titleJa: 'Title (Japanese)',
      contentKo: 'Content (Korean)',
      contentEn: 'Content (English)',
      contentJa: 'Content (Japanese)',
      date: 'Date',
      category: 'Category',
      author: 'Author',
      steamLink: 'Steam Link (Optional)',
      published: 'Published',
      submit: 'Save',
      cancel: 'Cancel',
      error: 'Failed to save.',
      unauthorized: 'Unauthorized.',
    },
    ja: {
      title: '開発ノート作成',
      slug: 'Slug (URL用の一意のID)',
      titleKo: 'タイトル（韓国語）',
      titleEn: 'タイトル（英語）',
      titleJa: 'タイトル（日本語）',
      contentKo: '内容（韓国語）',
      contentEn: '内容（英語）',
      contentJa: '内容（日本語）',
      date: '日付',
      category: 'カテゴリー',
      author: '著者',
      steamLink: 'Steamリンク（オプション）',
      published: '公開',
      submit: '保存',
      cancel: 'キャンセル',
      error: '保存に失敗しました。',
      unauthorized: '権限がありません。',
    },
  };

  const t = content[language];

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{t.unauthorized}</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.from('dev_notes').insert([formData]);
      if (error) throw error;
      navigate('/devnotes');
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t.title}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t.slug}</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.titleKo}</label>
                <input
                  type="text"
                  name="title_ko"
                  value={formData.title_ko}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.titleEn}</label>
                <input
                  type="text"
                  name="title_en"
                  value={formData.title_en}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.titleJa}</label>
                <input
                  type="text"
                  name="title_ja"
                  value={formData.title_ja}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.contentKo}</label>
                <textarea
                  name="content_ko"
                  value={formData.content_ko}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.contentEn}</label>
                <textarea
                  name="content_en"
                  value={formData.content_en}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.contentJa}</label>
                <textarea
                  name="content_ja"
                  value={formData.content_ja}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.date}</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.category}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="Development">Development</option>
                  <option value="Update">Update</option>
                  <option value="Feature">Feature</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Milestone">Milestone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.author}</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.steamLink}</label>
              <input
                type="url"
                name="steam_link"
                value={formData.steam_link}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="mr-2"
              />
              <label>{t.published}</label>
            </div>

            {error && (
              <div className="text-red-500">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white disabled:opacity-50"
              >
                {loading ? '...' : t.submit}
              </button>
              <button
                type="button"
                onClick={() => navigate('/devnotes')}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white"
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

export default WriteDevNote;