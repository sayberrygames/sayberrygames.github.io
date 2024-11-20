import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { homeTranslations } from '../translations/home';

const Home = () => {
  const { language } = useLanguage();
  const content = homeTranslations[language];

  return (
    <>
      {/* Hero Section with Video */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
        >
          <source src="https://video.fastly.steamstatic.com/store_trailers/257068009/movie480_vp9.webm?t=1729960266" type="video/webm" />
        </video>
        
        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <img 
              src="/sayberry-square-logo.svg" 
              alt="SayBerry Games" 
              className="h-24 md:h-32 mx-auto mb-4"
              style={{
                filter: 'brightness(0) invert(1)',
                opacity: 0.9
              }}
            />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            {content.heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Game Description Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8 text-gray-300 max-w-4xl mx-auto">
            {content.gameDescription.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-lg leading-relaxed"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <div className="mt-16 flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <motion.img
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                src="/chaos-bringer-logo.png"
                alt="Chaos Bringer"
                className="w-full max-w-lg mx-auto"
              />
            </div>
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <a
                  href="https://store.steampowered.com/app/3119830/Chaos_Bringer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-[#171a21] text-white px-6 py-3 rounded-lg hover:bg-[#1b2838] transition-colors"
                >
                  <ExternalLink className="h-6 w-6" />
                  <span>Available on Steam</span>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;