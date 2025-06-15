import { supabase } from '../lib/supabase';

export async function seedRemainingDevNotes() {
  const remainingNotes = [
    {
      slug: "combat-system",
      date: "2024-11-05",
      category: "Feature",
      author: "카오스",
      steam_link: "https://store.steampowered.com/news/app/3119830/view/4446834797838336382",
      title_ko: "카오스브링어 전투 시스템 소개: 혼자서 즐기는 MMORPG 스타일의 짜릿한 레이드",
      title_en: "ChaosBringer Combat System Introduction",
      title_ja: "カオスブリンガー戦闘システム紹介",
      content_ko: "MMORPG의 전략적 깊이와 역동성을 혼자서도 경험할 수 있는 싱글 플레이 전투 feat.실시간-정지 시스템과 어그로 미터기",
      content_en: "Experience the thrill of MMORPG-style raids solo with Chaosbringer's RTwP combat system, aggro, and damage meters",
      content_ja: "カオスブリンガーのRTwP戦闘システム、アグロ、ダメージメーターで、MMORPGスタイルのレイドをソロで体験できます。"
    },
    {
      slug: "party-raid",
      date: "2024-10-15",
      category: "Announcement",
      author: "연필",
      steam_link: "https://store.steampowered.com/news/app/3119830/view/4518890760255810501",
      title_ko: "카오스브링어: 혼자서 즐기는 파티 기반 보스 레이드",
      title_en: "Chaos Bringer: Solo Party-Based Boss Raids",
      title_ja: "カオスブリンガー：ソロで楽しむパーティーベースのボスレイド",
      content_ko: "카오스브링어의 스팀 페이지가 공개되었으며, 개발 과정을 포스팅을 통해 공유할 예정입니다. MMORPG 레이드의 짜릿함을 혼자서도 느낄 수 있는 파티 기반 싱글플레이 RPG인 카오스브링어가 탄생했습니다.",
      content_en: "ChaosBringer's Steam page is live, and we'll be sharing the development process through posts. This party-based single-player RPG brings the thrill of MMORPG raids to solo players.",
      content_ja: "カオスブリンガーのSteamページが公開され、開発プロセスを投稿で共有していく予定です。MMORPGレイドの興奮をソロプレイヤーにもたらすパーティーベースのシングルプレイRPGが誕生しました。"
    }
  ];

  for (const note of remainingNotes) {
    const { error } = await supabase
      .from('dev_notes')
      .upsert(note, { onConflict: 'slug' });
    
    if (error) {
      console.error(`Error inserting ${note.slug}:`, error);
    } else {
      console.log(`✓ Inserted ${note.slug}`);
    }
  }
}

// Run this function once when needed
// seedRemainingDevNotes();