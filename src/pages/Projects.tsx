import { motion } from 'framer-motion';
import { ExternalLink, Star, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectsTranslations } from '../translations/projects';

const Projects = () => {
  const { language } = useLanguage();
  const content = projectsTranslations[language] || projectsTranslations.en; // Fallback to English if translation not found

  const getStatusColor = (status: string) => {
    switch (status) {
      case content.status.inDevelopment:
        return "bg-green-500/20 text-green-400";
      case content.status.alphaTest:
        return "bg-blue-500/20 text-blue-400";
      case content.status.planning:
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="pt-20 pb-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 gap-8">
          {content.projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-800 rounded-lg overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-6">{project.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-purple-400">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {project.steamLink ? (
                        <a 
                          href={project.steamLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          {project.platform}
                        </a>
                      ) : (
                        <span>{project.platform}</span>
                      )}
                    </div>
                    <div className="flex items-center text-purple-400">
                      <Star className="h-4 w-4 mr-2" />
                      {project.genre}
                    </div>
                    <div className="flex items-center text-purple-400">
                      <Users className="h-4 w-4 mr-2" />
                      {project.releaseDate}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;