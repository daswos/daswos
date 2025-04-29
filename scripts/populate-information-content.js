import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

// Connect to the database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Information content data linking to our HTML files
const informationContent = [
  {
    title: "Technology Trends 2025",
    content: "See full article at: /info-pages/technology-trends.html",
    summary: "Analysis of current technology trends in 2025, including AI developments, quantum computing breakthroughs, and predictions for consumer vs enterprise adoption. Data shows significant shifts in user behaviors following new digital transformation policies.",
    sourceUrl: "/info-pages/technology-trends.html",
    sourceName: "DasWohnen Research Institute",
    sourceVerified: true,
    sourceType: "research",
    trustScore: 92,
    category: "Technology",
    tags: ["artificial intelligence", "quantum computing", "digital transformation", "remote work impact", "technology adoption"],
    imageUrl: null,
    verifiedSince: "2024-12-15",
    warning: null
  },
  {
    title: "Sustainable Innovation: Building for the Future",
    content: "See full article at: /info-pages/sustainable-innovation.html",
    summary: "An exploration of modern sustainable innovation practices, examining how research, materials, and technologies are helping create environmentally responsible solutions that reduce carbon footprints while enhancing quality of life.",
    sourceUrl: "/info-pages/sustainable-innovation.html",
    sourceName: "Journal of Sustainable Innovation",
    sourceVerified: true,
    sourceType: "academic",
    trustScore: 95,
    category: "Science",
    tags: ["sustainable innovation", "green technology", "eco-friendly design", "renewable materials", "energy efficiency"],
    imageUrl: null,
    verifiedSince: "2025-01-08",
    warning: null
  },
  {
    title: "Modern Cybersecurity Systems: A Comprehensive Guide",
    content: "See full article at: /info-pages/cybersecurity-systems.html",
    summary: "A detailed overview of contemporary cybersecurity systems, comparing various technologies, integration capabilities, and privacy considerations to help individuals and organizations make informed decisions about protecting their digital assets.",
    sourceUrl: "/info-pages/cybersecurity-systems.html",
    sourceName: "Cybersecurity Association of America",
    sourceVerified: true,
    sourceType: "industry",
    trustScore: 89,
    category: "Technology",
    tags: ["cybersecurity", "digital security", "data protection", "threat detection", "network security"],
    imageUrl: null,
    verifiedSince: "2025-03-05",
    warning: null
  },
  {
    title: "Energy-Efficient Technologies: Saving Money and the Planet",
    content: "See full article at: /info-pages/energy-efficient-technologies.html",
    summary: "A comprehensive guide to energy-efficient technologies, covering selection criteria, efficiency ratings, cost-benefit analysis, and the environmental impact of choosing eco-friendly solutions.",
    sourceUrl: "/info-pages/energy-efficient-technologies.html",
    sourceName: "International Energy Conservation Council",
    sourceVerified: true,
    sourceType: "non-profit",
    trustScore: 91,
    category: "Science",
    tags: ["energy saving", "clean technology", "eco-friendly", "cost savings", "sustainability"],
    imageUrl: null,
    verifiedSince: "2025-02-20",
    warning: null
  },
  {
    title: "Navigating the Digital Marketplace: A Comprehensive Guide",
    content: "See full article at: /info-pages/digital-marketplace-guide.html",
    summary: "This guide provides consumers with practical advice for finding, evaluating, and securing digital products and services, including understanding service agreements, consumer rights, and strategies for successful transactions.",
    sourceUrl: "/info-pages/digital-marketplace-guide.html",
    sourceName: "National Consumer Association",
    sourceVerified: true,
    sourceType: "government",
    trustScore: 94,
    category: "Business",
    tags: ["digital marketplace", "consumer rights", "service agreements", "online shopping", "e-commerce"],
    imageUrl: null,
    verifiedSince: "2025-01-15",
    warning: null
  },
  {
    title: "Smart Device Integration: Creating a Connected Experience",
    content: "See full article at: /info-pages/smart-device-integration.html",
    summary: "This guide explores the fundamentals of building an integrated smart device ecosystem, including platform selection, device compatibility, connectivity options, privacy considerations, and strategies for creating a cohesive user experience.",
    sourceUrl: "/info-pages/smart-device-integration.html",
    sourceName: "Smart Technology Institute",
    sourceVerified: true,
    sourceType: "technology",
    trustScore: 88,
    category: "Technology",
    tags: ["smart devices", "device automation", "IoT", "connected devices", "voice assistants"],
    imageUrl: null,
    verifiedSince: "2025-03-10",
    warning: null
  },
  {
    title: "Understanding Investment Options for First-Time Investors",
    content: "See full article at: /info-pages/investment-options.html",
    summary: "A comprehensive guide to investment types, eligibility requirements, and portfolio strategies for first-time investors, including explanations of key terms, government regulations, and approaches for securing long-term financial growth.",
    sourceUrl: "/info-pages/investment-options.html",
    sourceName: "Federal Financial Agency",
    sourceVerified: true,
    sourceType: "government",
    trustScore: 96,
    category: "Business",
    tags: ["investments", "financial planning", "first-time investors", "portfolio diversity", "interest rates"],
    imageUrl: null,
    verifiedSince: "2025-01-30",
    warning: null
  },
  {
    title: "Content Creation Principles: Building Engaging Digital Experiences",
    content: "See full article at: /info-pages/content-creation-principles.html",
    summary: "A comprehensive guide to fundamental content creation principles, including engagement, structure, rhythm, emphasis, and coherence, with practical applications for creating aesthetically pleasing and functional digital experiences.",
    sourceUrl: "/info-pages/content-creation-principles.html",
    sourceName: "Academy of Digital Media",
    sourceVerified: true,
    sourceType: "educational",
    trustScore: 90,
    category: "Entertainment",
    tags: ["content creation", "digital media", "design principles", "audience engagement", "digital aesthetics"],
    imageUrl: null,
    verifiedSince: "2025-02-05",
    warning: null
  },
  {
    title: "Project Management: A Step-by-Step Guide",
    content: "See full article at: /info-pages/project-management-guide.html",
    summary: "A comprehensive guide to planning and executing projects, covering budgeting, team selection, scheduling, timeline development, and strategies for managing common challenges throughout the project lifecycle.",
    sourceUrl: "/info-pages/project-management-guide.html",
    sourceName: "National Association of Project Managers",
    sourceVerified: true,
    sourceType: "industry",
    trustScore: 93,
    category: "Business",
    tags: ["project management", "team leadership", "scheduling", "resource allocation", "risk management"],
    imageUrl: null,
    verifiedSince: "2025-03-15",
    warning: null
  },
  {
    title: "Fitness and Nutrition: Building a Healthy Lifestyle",
    content: "See full article at: /info-pages/fitness-nutrition-guide.html",
    summary: "A comprehensive guide to developing and maintaining fitness routines and nutrition plans that support health goals, provide sustainable results, and create well-balanced approaches to physical wellness.",
    sourceUrl: "/info-pages/fitness-nutrition-guide.html",
    sourceName: "Health and Wellness Institute",
    sourceVerified: true,
    sourceType: "educational",
    trustScore: 89,
    category: "Health",
    tags: ["fitness", "nutrition", "wellness", "exercise routines", "healthy eating"],
    imageUrl: null,
    verifiedSince: "2025-02-28",
    warning: null
  }
];

async function populateDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if the information_content table exists
    try {
      const checkTable = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'information_content'
        );
      `);

      if (!checkTable.rows[0].exists) {
        console.log('Creating information_content table...');
        await client.query(`
          CREATE TABLE information_content (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            summary TEXT NOT NULL,
            source_url TEXT NOT NULL,
            source_name TEXT NOT NULL,
            source_verified BOOLEAN NOT NULL DEFAULT false,
            source_type TEXT NOT NULL DEFAULT 'website',
            trust_score INTEGER NOT NULL,
            category TEXT NOT NULL,
            tags TEXT[] NOT NULL,
            image_url TEXT,
            verified_since TEXT,
            warning TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP
          )
        `);
        console.log('information_content table created successfully');
      }
    } catch (err) {
      console.error('Error checking table existence:', err);
      throw err;
    }

    // Clear existing data
    await client.query('DELETE FROM information_content');
    console.log('Cleared existing information content');

    // Insert information content
    for (const item of informationContent) {
      const query = `
        INSERT INTO information_content (
          title, content, summary, source_url, source_name, source_verified,
          source_type, trust_score, category, tags, image_url, verified_since, warning
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;
      const values = [
        item.title, item.content, item.summary, item.sourceUrl, item.sourceName, item.sourceVerified,
        item.sourceType, item.trustScore, item.category, item.tags, item.imageUrl, item.verifiedSince, item.warning
      ];
      
      await client.query(query, values);
      console.log(`Added: ${item.title}`);
    }

    console.log('Information content populated successfully!');
  } catch (err) {
    console.error('Error populating database:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

// Run the database population
populateDatabase();