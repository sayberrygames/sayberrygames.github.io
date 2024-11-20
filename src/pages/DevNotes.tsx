import { motion } from 'framer-motion';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { devNotesTranslations } from '../translations/devnotes';

const DevNotes = () => {
  const { language } = useLanguage();
  const content = devNotesTranslations[language];

  return (
    <div className="pt-20 pb-16 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-white mb-4">{content.title}</h1>
          <p className="text-gray-400 text-lg">
            {content.subtitle}
          </p>
        </motion.div>

        <div className="space-y-8">
          {content.posts.map((note) => (
            <motion.article
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    {note.date}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    {note.readTime || '5 min'}
                  </div>
                </div>
                <span className="text-purple-400">{note.author || 'Chaos'}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">{note.title}</h2>
              <p className="text-gray-400 mb-4">{note.content}</p>
              <a
                href={note.steamLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {content.readMore}
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevNotes;