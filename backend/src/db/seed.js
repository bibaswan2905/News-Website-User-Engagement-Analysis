import { db, runStmt, queryAll, execSql } from './database.js';

const ARTICLES = [
  // Politics
  {
    slug: 'global-climate-treaty-ratification',
    title: 'Global Climate Treaty Passes Crucial Ratification Hurdle in Geneva',
    category: 'Politics',
    author: 'Elena Rostova',
    publish_offset_days: 28,
    read_time_min: 6,
    word_count: 1420,
    summary: 'International negotiators reach a consensus on stricter emissions ceilings after marathon 48-hour talks.',
    tags: 'climate, treaties, united nations, diplomacy'
  },
  {
    slug: 'parliamentary-budget-reform-debate',
    title: 'Heated Parliamentary Debate Over Autumn Fiscal Spending Cap',
    category: 'Politics',
    author: 'Marcus Vance',
    publish_offset_days: 21,
    read_time_min: 5,
    word_count: 1180,
    summary: 'Opposition leaders challenge government spending forecasts as fiscal deficits widen.',
    tags: 'budget, parliament, tax policy, economics'
  },
  {
    slug: 'local-elections-voter-turnout-surge',
    title: 'Youth Voter Turnout Hits Historic High in Nationwide Local Elections',
    category: 'Politics',
    author: 'Aaliyah Chen',
    publish_offset_days: 14,
    read_time_min: 4,
    word_count: 940,
    summary: 'Digital registration drives and campus ballot boxes propel record demographic participation.',
    tags: 'elections, voting, youth, civic tech'
  },
  {
    slug: 'infrastructure-bill-signed-into-law',
    title: 'Bipartisan $240B Green Transit Bill Officially Signed Into Law',
    category: 'Politics',
    author: 'Marcus Vance',
    publish_offset_days: 4,
    read_time_min: 7,
    word_count: 1650,
    summary: 'Mass transit overhauls and high-speed rail corridors secure federal funding across twelve states.',
    tags: 'infrastructure, transport, law, green energy'
  },

  // Tech
  {
    slug: 'open-source-foundation-models-leap',
    title: 'Open-Weight Multimodal AI Models Narrow the Proprietary Gap',
    category: 'Tech',
    author: 'Devon Reed',
    publish_offset_days: 29,
    read_time_min: 5,
    word_count: 1250,
    summary: 'Benchmarking the latest 70B parameter models against enterprise commercial APIs shows surprising parity.',
    tags: 'ai, machine learning, open source, neural networks'
  },
  {
    slug: 'quantum-computing-error-mitigation-milestone',
    title: 'Engineers Achieve 99.9% Quantum Gate Fidelity Using Surface Codes',
    category: 'Tech',
    author: 'Dr. Hiroshi Tanaka',
    publish_offset_days: 22,
    read_time_min: 8,
    word_count: 1890,
    summary: 'Breakthrough in logical qubit architecture brings fault-tolerant quantum computing one step closer.',
    tags: 'quantum, computing, physics, hardware'
  },
  {
    slug: 'cybersecurity-zero-day-patch-alert',
    title: 'Critical Zero-Day Vulnerability Patched in Core Kernel Networking Stack',
    category: 'Tech',
    author: 'Devon Reed',
    publish_offset_days: 12,
    read_time_min: 4,
    word_count: 890,
    summary: 'System administrators urged to update perimeter firewalls immediately following active exploitation reports.',
    tags: 'cybersecurity, vulnerability, linux, networking'
  },
  {
    slug: 'silicon-photonics-datacenter-revolution',
    title: 'Silicon Photonics Co-Packaged Optics Slash Cloud Power Usage by 40%',
    category: 'Tech',
    author: 'Samantha Miller',
    publish_offset_days: 5,
    read_time_min: 6,
    word_count: 1380,
    summary: 'Optical interconnects replace copper traces, solving the thermal bottleneck of dense AI training clusters.',
    tags: 'hardware, silicon photonics, datacenters, green tech'
  },
  {
    slug: 'mobile-os-privacy-controls-expansion',
    title: 'Next-Gen Mobile OS Updates Introduce Granular Hardware Sandboxing',
    category: 'Tech',
    author: 'Samantha Miller',
    publish_offset_days: 2,
    read_time_min: 4,
    word_count: 920,
    summary: 'Users gain explicit permission switches for on-device telemetry and background sensor scraping.',
    tags: 'mobile, privacy, security, smartphone'
  },

  // Business
  {
    slug: 'central-bank-interest-rate-forecast',
    title: 'Central Banks Signal Cautious Rate Cuts Amid Resilient Labor Market',
    category: 'Business',
    author: 'Julian Thorne',
    publish_offset_days: 26,
    read_time_min: 5,
    word_count: 1100,
    summary: 'Monetary policy committees maintain balance between inflation targets and sustainable credit flow.',
    tags: 'finance, interest rates, macroeconomics, markets'
  },
  {
    slug: 'venture-capital-clean-energy-surge',
    title: 'CleanTech Startups Capture 38% of Global Series-A Funding in Q3',
    category: 'Business',
    author: 'Julian Thorne',
    publish_offset_days: 18,
    read_time_min: 6,
    word_count: 1320,
    summary: 'Grid battery storage and sustainable aviation fuel ventures lead venture capital deployment.',
    tags: 'venture capital, cleantech, startups, funding'
  },
  {
    slug: 'cross-border-digital-payments-standard',
    title: 'ISO 20022 Adoption Reaches Tipping Point Across Major Clearing Houses',
    category: 'Business',
    author: 'Rachel Abramson',
    publish_offset_days: 10,
    read_time_min: 4,
    word_count: 980,
    summary: 'Standardized financial messaging streamlines real-time global remittances and reduces fraud.',
    tags: 'banking, payments, fintech, global trade'
  },
  {
    slug: 'commercial-real-estate-repurposing',
    title: 'Urban Centers Pivot to Mixed-Use Housing in Vacant Downtown Towers',
    category: 'Business',
    author: 'Rachel Abramson',
    publish_offset_days: 3,
    read_time_min: 5,
    word_count: 1210,
    summary: 'Zoning relaxations and tax credits drive conversions of empty office spaces into residential lofts.',
    tags: 'real estate, urban planning, economy, architecture'
  },

  // Sports
  {
    slug: 'champions-league-thriller-stoppage-winner',
    title: 'Injury-Time Stunner Sends Underdogs to European Championship Final',
    category: 'Sports',
    author: 'Carlos Mendes',
    publish_offset_days: 25,
    read_time_min: 4,
    word_count: 870,
    summary: 'A 94th-minute curling strike caps an unforgettable comeback in front of 75,000 roaring fans.',
    tags: 'football, champions league, sports drama, soccer'
  },
  {
    slug: 'marathon-world-record-broken',
    title: 'Marathon World Record Shattered Under Crisp Autumn Berlin Skies',
    category: 'Sports',
    author: 'Carlos Mendes',
    publish_offset_days: 16,
    read_time_min: 3,
    word_count: 750,
    summary: 'Pacing precision and next-generation carbon running plates produce an unprecedented 2:00:15 time.',
    tags: 'athletics, marathon, running, world record'
  },
  {
    slug: 'grand-slam-tennis-five-set-epic',
    title: 'Young Phenom Triumphs in Five-Set Epic Grand Slam Decider',
    category: 'Sports',
    author: 'Fiona Gallagher',
    publish_offset_days: 8,
    read_time_min: 5,
    word_count: 1120,
    summary: 'Four hours and thirty-eight minutes of baseline rallies conclude with a changing-of-the-guard moment.',
    tags: 'tennis, grand slam, sports rivalry'
  },
  {
    slug: 'formula-one-aerodynamic-regulations',
    title: 'Technical Deep-Dive: How Ground Effect Downforce Reshaped F1 Overtakes',
    category: 'Sports',
    author: 'Fiona Gallagher',
    publish_offset_days: 1,
    read_time_min: 6,
    word_count: 1400,
    summary: 'Telemetry data reveals tighter pack racing and increased corner exit speeds across high-downforce circuits.',
    tags: 'motorsport, formula 1, aerodynamics, data analytics'
  },

  // Entertainment
  {
    slug: 'film-festival-palme-dor-winner',
    title: 'Indie Sci-Fi Drama Clinches Prestigious Film Festival Golden Palm',
    category: 'Entertainment',
    author: 'Leo Sterling',
    publish_offset_days: 27,
    read_time_min: 4,
    word_count: 910,
    summary: 'Shoestring budget feature shot on 16mm film captivates international critics and distributors.',
    tags: 'cinema, film festival, awards, directing'
  },
  {
    slug: 'music-streaming-royalty-transparency',
    title: 'Independent Artists Rally for Algorithmic Transparency in Streaming Pools',
    category: 'Entertainment',
    author: 'Leo Sterling',
    publish_offset_days: 19,
    read_time_min: 5,
    word_count: 1080,
    summary: 'Coalition proposes user-centric royalty payouts to support niche and emerging musicians.',
    tags: 'music, streaming, copyright, indie artists'
  },
  {
    slug: 'prestige-television-season-finale-recap',
    title: 'The Narrative Mastery of the Year’s Most Talked-About Miniseries Finale',
    category: 'Entertainment',
    author: 'Chloe Dupont',
    publish_offset_days: 11,
    read_time_min: 6,
    word_count: 1350,
    summary: 'An intricate web of family betrayal and corporate espionage culminates in a devastating final shot.',
    tags: 'television, reviews, drama, storytelling'
  },
  {
    slug: 'video-game-narrative-adaptation-boom',
    title: 'Why Hollywood Finally Mastered Video Game Adaptations',
    category: 'Entertainment',
    author: 'Chloe Dupont',
    publish_offset_days: 6,
    read_time_min: 5,
    word_count: 1190,
    summary: 'Faithful lore integration and director-gamer collaborations transform once-derided genre.',
    tags: 'gaming, movies, streaming, pop culture'
  },

  // Science
  {
    slug: 'deep-space-telescope-exoplanet-atmosphere',
    title: 'James Webb Telescope Detects Water Vapor and Carbon Compounds on Trappist-1e',
    category: 'Science',
    author: 'Dr. Aris Thorne',
    publish_offset_days: 30,
    read_time_min: 7,
    word_count: 1720,
    summary: 'Transmission spectroscopy reveals atmospheric signatures in the habitable zone of an M-dwarf system.',
    tags: 'astronomy, exoplanets, nasa, space'
  },
  {
    slug: 'crispr-gene-therapy-approval',
    title: 'First Epigenetic Gene-Silencing Therapy Cleared for Rare Liver Disorders',
    category: 'Science',
    author: 'Dr. Nicole Vance',
    publish_offset_days: 20,
    read_time_min: 6,
    word_count: 1450,
    summary: 'Precision molecular scissors halt harmful protein buildup without cutting double-stranded DNA.',
    tags: 'medicine, genetics, biotechnology, clinical trials'
  },
  {
    slug: 'deep-sea-biodiversity-hydrothermal-vents',
    title: 'Robotic Submersible Discovers 40 Uncataloged Extremophile Species at Mariana Trench',
    category: 'Science',
    author: 'Dr. Aris Thorne',
    publish_offset_days: 13,
    read_time_min: 5,
    word_count: 1200,
    summary: 'Bioluminescent organisms thriving at 350 atmospheres shed light on origins of life on Earth.',
    tags: 'oceanography, biodiversity, biology, exploration'
  },
  {
    slug: 'solid-state-battery-energy-density-jump',
    title: 'Ceramic Electrolyte Battery Achieves 500 Wh/kg in Continuous Cycling Tests',
    category: 'Science',
    author: 'Dr. Nicole Vance',
    publish_offset_days: 7,
    read_time_min: 5,
    word_count: 1310,
    summary: 'Non-flammable solid-state cell retains 92% capacity after 1,200 fast-charging cycles.',
    tags: 'materials science, energy, batteries, physics'
  }
];

export function seedDatabase() {
  console.log('Clearing existing data and re-seeding...');
  execSql('DELETE FROM page_views;');
  execSql('DELETE FROM user_sessions;');
  execSql('DELETE FROM articles;');
  try { execSql("DELETE FROM sqlite_sequence WHERE name IN ('articles', 'page_views');"); } catch (e) {}

  const now = new Date();

  // 1. Insert Articles
  const insertArticleStmt = `
    INSERT INTO articles (slug, title, category, author, publish_date, read_time_min, word_count, summary, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  execSql('BEGIN TRANSACTION;');

  const articleMap = [];
  for (const art of ARTICLES) {
    const pubDate = new Date(now.getTime() - art.publish_offset_days * 86400000);
    runStmt(insertArticleStmt, [
      art.slug,
      art.title,
      art.category,
      art.author,
      pubDate.toISOString(),
      art.read_time_min,
      art.word_count,
      art.summary,
      art.tags
    ]);
  }

  const insertedArticles = queryAll('SELECT id, slug, category, read_time_min FROM articles');
  console.log(`Inserted ${insertedArticles.length} news articles.`);

  // 2. Generate Realistic User Sessions and Page Views
  // Target: ~2,200 sessions, ~4,800 page views over 30 days
  const devices = [
    { type: 'mobile', weight: 0.52 },
    { type: 'desktop', weight: 0.38 },
    { type: 'tablet', weight: 0.10 }
  ];

  const trafficSources = [
    { source: 'organic_search', weight: 0.36 },
    { source: 'social_media', weight: 0.28 },
    { source: 'direct', weight: 0.20 },
    { source: 'newsletter', weight: 0.10 },
    { source: 'referral', weight: 0.06 }
  ];

  const countries = ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'India', 'France', 'Japan'];

  function weightedPick(items) {
    const r = Math.random();
    let acc = 0;
    for (const item of items) {
      acc += item.weight;
      if (r <= acc) return item;
    }
    return items[0];
  }

  const insertSessionStmt = `
    INSERT INTO user_sessions (session_id, user_id, entry_page, exit_page, duration, bounce_status, device_type, traffic_source, country, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertPageViewStmt = `
    INSERT INTO page_views (session_id, article_id, page_url, timestamp, time_spent, scroll_depth_pct, clicked_recommendation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  let totalSessions = 0;
  let totalPageViews = 0;

  // Distribute sessions over 30 days
  // More recent days have higher traffic with realistic diurnal peaks (8-10am, 12-2pm, 7-10pm)
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    // Weekend multiplier for sports/entertainment
    const dayDate = new Date(now.getTime() - dayOffset * 86400000);
    const dayOfWeek = dayDate.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    
    // Slight upward trend in traffic over the month
    const baseTraffic = 50 + (30 - dayOffset) * 2;
    const dailySessionsCount = Math.floor(baseTraffic * (isWeekend ? 1.15 : 1.0) * (0.85 + Math.random() * 0.3));

    for (let s = 0; s < dailySessionsCount; s++) {
      totalSessions++;
      const sessionId = `sess_${dayOffset}_${s}_${Math.random().toString(36).substring(2, 8)}`;
      const userId = `usr_${Math.floor(Math.random() * 800) + 1}`;

      const device = weightedPick(devices).type;
      const traffic = weightedPick(trafficSources).source;
      const country = countries[Math.floor(Math.random() * countries.length)];

      // Diurnal time distribution
      let hour;
      const randHour = Math.random();
      if (randHour < 0.25) hour = Math.floor(Math.random() * 4) + 7;   // Morning commute 7-10 AM
      else if (randHour < 0.50) hour = Math.floor(Math.random() * 3) + 12; // Lunch 12-2 PM
      else if (randHour < 0.85) hour = Math.floor(Math.random() * 5) + 18; // Evening 6-10 PM
      else hour = Math.floor(Math.random() * 24);

      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const sessionStart = new Date(dayDate);
      sessionStart.setHours(hour, minute, second);

      // Pick category bias based on day and traffic source
      let categoryFilter = null;
      if (isWeekend && Math.random() < 0.5) {
        categoryFilter = Math.random() < 0.6 ? 'Sports' : 'Entertainment';
      } else if (traffic === 'social_media') {
        categoryFilter = Math.random() < 0.5 ? 'Entertainment' : 'Tech';
      } else if (device === 'mobile' && Math.random() < 0.4) {
        categoryFilter = 'Politics'; // high mobile politics traffic
      }

      const candidateArticles = categoryFilter 
        ? insertedArticles.filter(a => a.category === categoryFilter)
        : insertedArticles;
      
      const primaryArticle = candidateArticles[Math.floor(Math.random() * candidateArticles.length)] || insertedArticles[0];

      // Entry Page
      let entryPage;
      if (Math.random() < 0.35) {
        entryPage = '/';
      } else if (Math.random() < 0.55) {
        entryPage = `/category/${primaryArticle.category.toLowerCase()}`;
      } else {
        entryPage = `/article/${primaryArticle.slug}`;
      }

      // Determine if session bounces
      // Mobile has higher bounce rate (especially Politics ~65%)
      let bounceProbability = 0.38;
      if (device === 'mobile') bounceProbability += 0.16;
      if (primaryArticle.category === 'Politics' && device === 'mobile') bounceProbability += 0.12;
      if (traffic === 'social_media') bounceProbability += 0.08;
      if (traffic === 'newsletter') bounceProbability -= 0.18;

      const isBounce = Math.random() < Math.max(0.15, Math.min(0.85, bounceProbability));
      
      const sessionViews = [];
      let currentTimestamp = new Date(sessionStart);

      if (isBounce) {
        // Single page view, short duration (8 - 45s)
        const timeSpent = Math.floor(8 + Math.random() * 37);
        const scrollPct = Math.floor(10 + Math.random() * 30);
        
        sessionViews.push({
          articleId: entryPage.startsWith('/article/') ? primaryArticle.id : null,
          url: entryPage,
          timestamp: currentTimestamp.toISOString(),
          timeSpent,
          scrollPct,
          clickedRec: 0
        });

        const sessionDuration = timeSpent;
        const exitPage = entryPage;

        runStmt(insertSessionStmt, [
          sessionId,
          userId,
          entryPage,
          exitPage,
          sessionDuration,
          1, // bounce
          device,
          traffic,
          country,
          sessionStart.toISOString()
        ]);
      } else {
        // Engaged multi-page session (2 to 5 views)
        const viewCount = Math.floor(2 + Math.random() * 4);
        let totalDuration = 0;
        let lastUrl = entryPage;

        // View 1 (Entry)
        const time1 = Math.floor(25 + Math.random() * 70);
        const scroll1 = Math.floor(35 + Math.random() * 50);
        const clickedRec1 = viewCount > 1 ? 1 : 0;
        sessionViews.push({
          articleId: entryPage.startsWith('/article/') ? primaryArticle.id : null,
          url: entryPage,
          timestamp: currentTimestamp.toISOString(),
          timeSpent: time1,
          scrollPct: scroll1,
          clickedRec: clickedRec1
        });
        totalDuration += time1;

        // Subsequent Views
        for (let v = 1; v < viewCount; v++) {
          currentTimestamp = new Date(currentTimestamp.getTime() + (time1 + 5) * 1000);
          
          // Select next article (often in same or complementary category)
          const nextArticle = insertedArticles[Math.floor(Math.random() * insertedArticles.length)];
          const nextUrl = `/article/${nextArticle.slug}`;
          
          // High engagement on tech/science
          let baseReadingTime = nextArticle.read_time_min * 40; // in seconds
          if (device === 'mobile') baseReadingTime *= 0.75;
          const timeSpent = Math.floor(baseReadingTime * (0.5 + Math.random() * 0.8));
          const scrollPct = Math.min(100, Math.floor(50 + Math.random() * 50));
          const clickedRec = v < viewCount - 1 ? 1 : 0;

          sessionViews.push({
            articleId: nextArticle.id,
            url: nextUrl,
            timestamp: currentTimestamp.toISOString(),
            timeSpent,
            scrollPct,
            clickedRec
          });

          totalDuration += timeSpent;
          lastUrl = nextUrl;
        }

        const exitPage = lastUrl;
        runStmt(insertSessionStmt, [
          sessionId,
          userId,
          entryPage,
          exitPage,
          totalDuration,
          0, // not bounced
          device,
          traffic,
          country,
          sessionStart.toISOString()
        ]);
      }

      // Insert all pageviews for this session
      for (const pv of sessionViews) {
        totalPageViews++;
        runStmt(insertPageViewStmt, [
          sessionId,
          pv.articleId,
          pv.url,
          pv.timestamp,
          pv.timeSpent,
          pv.scrollPct,
          pv.clickedRec
        ]);
      }
    }
  }

  execSql('COMMIT;');
  console.log(`Database seeded successfully! Total Sessions: ${totalSessions}, Total Page Views: ${totalPageViews}`);
}

// Run if executed directly
if (process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}

export default seedDatabase;
