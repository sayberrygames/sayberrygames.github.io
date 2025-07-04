import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { homeTranslations } from '../translations/home';
import SEO from '../components/SEO';

const Home = () => {
  const { language } = useLanguage();
  const content = homeTranslations[language];
  return (
    <>
      <SEO />
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
        >
          <source src="https://video.cloudflare.steamstatic.com/store_trailers/257076259/movie_max_vp9.webm?t=1732603340" type="video/webm" />
        </video>
        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <img
              src="/sayberry-square-logo.png"
              alt="SayBerry Games"
              className="h-24 md:h-32 mx-auto mb-4"
            />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl md:text-3xl text-gray-300 mb-8"
          >
            {content.heroSubtitle}
          </motion.p>
        </div>
      </section>
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8 text-gray-300 max-w-4xl mx-auto">
            {content.gameDescription.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-xl md:text-2xl leading-relaxed"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-center">
            <div className="w-full">
              <motion.a
                href="https://store.steampowered.com/app/3119830/Chaos_Bringer/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.img
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  src="/chaos-bringer-logo.png"
                  alt="Chaos Bringer"
                  className="w-full max-w-lg mx-auto"
                />
              </motion.a>
            </div>
            <div className="w-full flex justify-center mt-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
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
