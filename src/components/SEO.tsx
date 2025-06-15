import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEO = ({ title, description, keywords, image, url }: SEOProps) => {
  const { language } = useLanguage();
  
  const defaultTitle = {
    ko: 'SayBerry Games - 게임의 새로운 지평',
    en: 'SayBerry Games - New Horizons in Gaming',
    ja: 'SayBerry Games - ゲームの新しい地平'
  };
  
  const defaultDescription = {
    ko: '세이베리 게임즈는 혁신적이고 몰입감 있는 게임 경험을 제공하는 인디 게임 개발 스튜디오입니다.',
    en: 'SayBerry Games is an indie game development studio providing innovative and immersive gaming experiences.',
    ja: 'SayBerry Gamesは革新的で没入感のあるゲーム体験を提供するインディーゲーム開発スタジオです。'
  };
  
  const defaultKeywords = {
    ko: '세이베리게임즈, 인디게임, 게임개발, 카오스브링어, Chaos Bringer',
    en: 'SayBerry Games, indie games, game development, Chaos Bringer',
    ja: 'SayBerry Games, インディーゲーム, ゲーム開発, Chaos Bringer'
  };
  
  const finalTitle = title || defaultTitle[language];
  const finalDescription = description || defaultDescription[language];
  const finalKeywords = keywords || defaultKeywords[language];
  const finalImage = image || '/sayberry-square-logo.png';
  const finalUrl = url || window.location.href;
  
  return (
    <Helmet>
      <html lang={language} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content="SayBerry Games" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:site" content="@sayberrygames" />
      
      {/* Additional */}
      <link rel="canonical" href={finalUrl} />
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
};

export default SEO;