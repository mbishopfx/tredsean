import React, { useState, useEffect } from 'react';

interface Post {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'ai';
  likes: number;
  comments: Comment[];
  aiGenerated?: boolean;
  category?: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

const HomeFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'user' | 'ai'>('all');

  // Get current user info
  const getCurrentUser = () => {
    const username = localStorage.getItem('username') || 'Unknown';
    const displayName = localStorage.getItem('displayName') || username;
    return { username, displayName };
  };

  // Check if user can post (only Matttrd and Jontrd)
  const canPost = () => {
    const { username } = getCurrentUser();
    return username === 'Matttrd' || username === 'Jontrd';
  };

  // Load posts from localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem('trd_feed_posts');
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts).map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp),
          comments: post.comments?.map((comment: any) => ({
            ...comment,
            timestamp: new Date(comment.timestamp)
          })) || []
        }));
        setPosts(parsedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    } else {
      // Add some initial AI-generated posts
      generateInitialPosts();
    }
  }, []);

  // Save posts to localStorage
  const savePosts = (postsToSave: Post[]) => {
    localStorage.setItem('trd_feed_posts', JSON.stringify(postsToSave));
  };

  // High-Level TRD Tips & Insights
  const trdHighLevelTips = [
    "💡 SEO Psychology: People trust Google's judgment. Being #1 makes you the automatic expert in their minds.",
    "🎯 Local SEO Truth: 76% of people who search for something nearby visit a business within 24 hours. Make sure it's yours.",
    "📊 Conversion Rate Reality: The difference between page 1 and page 2 on Google is the difference between 33% and 3% click-through rates.",
    "🔍 Search Intent Matters: Don't just rank for keywords. Rank for buyer intent keywords that convert into customers.",
    "📱 Mobile-First World: 60% of Google searches happen on mobile. If your site isn't mobile-perfect, you're losing money.",
    "⚡ Site Speed Impact: A 1-second delay in page load time can reduce conversions by 20%. Speed equals revenue.",
    "🎯 Target Long-Tail Keywords: 'Best plumber in [city]' converts better than just 'plumber' - less competition, higher intent.",
    "📍 Google My Business Power: Businesses with complete GMB profiles get 70% more location visits than incomplete profiles.",
    "💬 Reviews Drive Revenue: Each additional star in your rating can increase revenue by 5-19% according to Harvard research.",
    "🔗 Link Building Strategy: One high-quality backlink from a local authority site beats 100 low-quality directory submissions.",
    "📝 Content Marketing Truth: Answer the questions your customers ask, and Google will send them to you.",
    "🎥 Video SEO Advantage: Videos are 50x more likely to appear on Google's first page than text-only content.",
    "📊 Analytics Insight: Track phone calls, not just website visits. Phone leads convert 10x higher than web forms.",
    "🏆 Competitive Analysis: Your competitor's backlinks are your roadmap. See who links to them, then get better links.",
    "🎯 Schema Markup: Structured data helps Google understand your content and can increase click-through rates by 30%.",
    "📱 Voice Search Optimization: 20% of searches are voice searches. Optimize for conversational keywords.",
    "🔍 Featured Snippets: Ranking in position 0 (featured snippet) gets 35% of all clicks, even above position 1.",
    "📊 Seasonal SEO Planning: Start optimizing for seasonal keywords 3-4 months before the season begins.",
    "🎯 Local Citations Consistency: Your business name, address, and phone must be identical across all 50+ citation sites.",
    "💡 User Experience Signals: Google measures how people interact with your site. Good UX = better rankings.",
    "📍 Proximity Ranking Factor: Being physically closer to the searcher gives you a ranking advantage in local search.",
    "🔗 Internal Linking Strategy: Strategic internal links can boost page rankings by 25% without any external backlinks.",
    "📊 E-A-T Algorithm: Expertise, Authoritativeness, Trustworthiness. Google ranks sites that demonstrate all three higher.",
    "🎯 Keyword Cannibalization: Multiple pages targeting the same keyword compete against each other. Consolidate for power.",
    "📱 Core Web Vitals: Google's page experience update makes site performance a direct ranking factor.",
    "🔍 Search Volume vs Competition: Sometimes it's better to rank #1 for 100 searches than #10 for 10,000 searches.",
    "📝 Content Clusters: Group related content around pillar topics to show Google you're an authority on the subject.",
    "🎯 Local Keyword Variations: Don't just target '[service] + [city]'. Target '[service] near me', '[service] in [area]', etc.",
    "📊 CTR Optimization: Your title and meta description are your ad copy. Make them compelling to increase click-through rates.",
    "🏆 Domain Authority Building: Focus on getting links from sites with higher domain authority than yours.",
    "📍 Google Posts Impact: Regular Google My Business posts can increase customer actions by 30%.",
    "🔍 Search Console Insights: Use Google Search Console to find queries where you rank 11-20. These are quick wins to optimize.",
    "📊 Bounce Rate Factor: If people immediately leave your site, Google assumes it's not relevant. Improve engagement.",
    "🎯 Geo-Targeted Landing Pages: Create separate pages for each service area to dominate local search completely.",
    "📱 AMP Implementation: Accelerated Mobile Pages load 4x faster and get preferential treatment in mobile search.",
    "🔗 Link Velocity Matters: Getting 10 links over 10 weeks looks more natural than getting 10 links in 1 week.",
    "📝 FAQ Schema Benefits: FAQ structured data can help you rank for multiple related queries on one page.",
    "🎯 Negative SEO Protection: Monitor your backlink profile monthly. Bad links can hurt your rankings.",
    "📊 Local Search Ranking Factors: Proximity (25%), Relevance (25%), and Prominence (50%) determine local rankings.",
    "🔍 Intent-Based Content: Create different content for 'What is', 'How to', 'Best', and 'Near me' search intents.",
    "📍 Citation Building Priority: Focus on the big ones first: Google, Yelp, Facebook, Apple Maps, Bing Places.",
    "🎯 Competitor Content Gaps: Find topics your competitors rank for that you don't. Create better content for those topics.",
    "📊 Technical SEO Audit: Fix crawl errors, broken links, and duplicate content before focusing on link building.",
    "🔗 Link Building Outreach: Personalized emails get 3x higher response rates than generic template emails.",
    "📱 Mobile Usability: Google's mobile-first indexing means your mobile site is your primary site now.",
    "🎯 Keyword Research Evolution: Focus on search intent and topic clusters, not just individual keywords.",
    "📝 Content Quality Over Quantity: One comprehensive 3,000-word article beats five shallow 500-word posts.",
    "🔍 Search Trends Analysis: Use Google Trends to time your content around seasonal search patterns.",
    "📊 Conversion Tracking Setup: Track which keywords and pages generate actual customers, not just traffic.",
    "🎯 Local Link Building: Partner with local organizations, sponsor events, and engage with community websites.",
    "📍 GMB Optimization: Complete every section, add photos weekly, respond to reviews, and post updates regularly.",
    "🔗 Link Quality Assessment: One link from a local newspaper beats 50 links from random blog networks.",
    "📊 Page Experience Update: Core Web Vitals, mobile-friendliness, and HTTPS are now ranking factors.",
    "🎯 Content Marketing ROI: Educational content generates 3x more leads than paid advertising at 62% less cost.",
    "🔍 Zero-Click Searches: 50% of searches don't result in clicks. Optimize for featured snippets to capture these.",
    "📝 Blog Post Optimization: Include target keywords in title, first paragraph, subheadings, and naturally throughout.",
    "🎯 Anchor Text Diversity: Vary your link anchor text. Too much exact-match anchor text looks unnatural to Google.",
    "📊 Rank Tracking Strategy: Track rankings for buyer-intent keywords, not just brand terms or high-volume keywords.",
    "🔗 Guest Posting Strategy: Focus on industry relevance and audience overlap, not just domain authority.",
    "📍 Local SEO Citation Building: Consistency across directories is more important than quantity of citations.",
    "🎯 Content Update Strategy: Refresh and expand existing content regularly. Updated content gets ranking boosts.",
    "📊 Analytics Segmentation: Separate organic traffic by location, device, and landing page for better insights.",
    "🔍 SERP Feature Optimization: Optimize for image packs, local packs, and knowledge panels, not just organic listings.",
    "📝 Meta Description Psychology: Write descriptions that create curiosity and urgency to improve click-through rates.",
    "🎯 Keyword Difficulty Assessment: Target keywords where you can realistically rank in the top 5 within 6 months.",
    "📊 Local Competition Analysis: Study businesses ranking above you locally. What are they doing differently?",
    "🔗 Link Building Scale: Aim for 2-5 high-quality links per month rather than 50 low-quality links.",
    "📍 Service Area Expansion: Create location pages for all areas you serve, even if you don't have physical offices.",
    "🎯 Content Calendar Planning: Align content creation with seasonal search trends and business goals.",
    "📊 Conversion Rate Optimization: A 1% improvement in conversion rate often beats a 10% increase in traffic.",
    "🔍 Search Query Analysis: Study actual search queries bringing traffic. Often different from your target keywords.",
    "📝 Title Tag Optimization: Include location and service for local businesses. 'Best [Service] in [City] | [Brand]'",
    "🎯 Link Building Relationships: Build genuine relationships with other business owners for natural link opportunities.",
    "📊 ROI Measurement: Track lifetime customer value, not just immediate conversions from SEO traffic.",
    "🔗 Internal Link Strategy: Use descriptive anchor text for internal links to help Google understand page topics.",
    "📍 Google Reviews Strategy: More reviews + higher ratings = better local rankings. Make review requests systematic.",
    "🎯 Content Pillar Strategy: Create comprehensive guides on main topics, then support with detailed sub-topic pages.",
    "📊 Technical SEO Monitoring: Set up alerts for site speed, uptime, and crawl errors. Fix issues immediately.",
    "🔍 Long-Term SEO Mindset: SEO is a marathon, not a sprint. Consistent effort beats sporadic intense campaigns.",
    "📝 Content Repurposing: Turn one comprehensive blog post into social media posts, videos, and infographics.",
    "🎯 Competitor Backlink Analysis: Monthly audits of competitor backlinks reveal new link building opportunities.",
    "📊 Local Search Behavior: 'Near me' searches have grown 150% faster than regular searches in recent years.",
    "🔗 Link Building Quality Control: Disavow toxic links quarterly to protect your site's authority.",
    "📍 Multi-Location SEO: Each location needs its own dedicated page with unique content and local keywords.",
    "🎯 Content Marketing Psychology: Address fears, desires, and pain points of your target audience in content.",
    "📊 SEO Tool Integration: Connect Google Analytics, Search Console, and rank tracking for comprehensive insights.",
    "🔍 Featured Snippet Optimization: Answer questions clearly in 40-50 words for featured snippet opportunities.",
    "📝 Blog Post Structure: Use clear headings, short paragraphs, and bullet points for better readability and SEO.",
    "🎯 Seasonal Link Building: Pitch seasonal content and resources to earn links during relevant time periods.",
    "📊 Mobile Page Speed: 53% of users abandon mobile sites that take longer than 3 seconds to load.",
    "🔗 Link Building Persistence: Most successful link building outreach requires 3-5 follow-up emails.",
    "📍 Local Landing Page Strategy: Create unique pages for each service in each location you serve.",
    "🎯 Content Gap Analysis: Find keywords your competitors rank for that you don't. Fill those content gaps.",
    "📊 SEO Reporting Focus: Report on metrics that matter to business: leads, customers, revenue, not just rankings.",
    "🔍 Voice Search Adaptation: Optimize for question-based queries and conversational search patterns.",
    "📝 Content Quality Metrics: Measure time on page, scroll depth, and return visitors to gauge content quality.",
    "🎯 Link Building Diversification: Earn links from various types of sites: news, industry, local, educational.",
    "📊 Local SEO Tracking: Monitor local pack rankings separately from organic rankings for complete visibility.",
    "🔗 Internal Link Architecture: Create clear site structure with logical linking patterns for better crawling.",
    "📍 Citations Cleanup: Regularly audit and correct inconsistent business information across all directories.",
    "🎯 Content Marketing Distribution: Great content without promotion is worthless. Plan distribution strategy first.",
    "📊 SEO A/B Testing: Test different title tags, meta descriptions, and content formats to improve performance.",
    "🔍 Search Intent Evolution: Search intent changes over time. Regularly update content to match current intent.",
    "📝 Content Length Strategy: Match content length to search intent: quick answers vs comprehensive guides.",
    "🎯 Link Building Template: Create reusable email templates but always personalize them for each outreach.",
    "📊 Technical SEO Priority: Fix critical issues first: crawlability, indexability, site speed, mobile usability."
  ];

  // Generate AI content for the feed
  const generateAIPost = async () => {
    // Use the TRD high-level tips instead of fake success stories
    const randomTip = trdHighLevelTips[Math.floor(Math.random() * trdHighLevelTips.length)];
    
    const categories = [
      "SEO Tips", "Local SEO", "Technical SEO", "Content Marketing", 
      "Link Building", "Analytics", "Mobile SEO", "Voice Search"
    ];
    
    return {
      content: randomTip,
      category: categories[Math.floor(Math.random() * categories.length)]
    };
  };

  // Generate initial posts
  const generateInitialPosts = async () => {
    const initialPosts: Post[] = [
      {
        id: '1',
        author: 'TRD AI Assistant',
        authorRole: 'AI Coach',
        content: '🎯 Welcome to the TRD Feed! This is your central hub for high-level SEO tips, marketing insights, and team updates. Ready to dominate? 💪',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        type: 'ai',
        likes: 0, // No mock likes
        comments: [],
        aiGenerated: true,
        category: 'Welcome'
      }
    ];

    // Generate 4 more AI posts with genuine tips
    for (let i = 0; i < 4; i++) {
      const aiContent = await generateAIPost();
      initialPosts.push({
        id: Date.now().toString() + i,
        author: 'TRD AI Coach',
        authorRole: 'AI Marketing Expert',
        content: aiContent.content,
        timestamp: new Date(Date.now() - (Math.random() * 172800000)), // Random time in last 2 days
        type: 'ai',
        likes: 0, // No mock likes
        comments: [],
        aiGenerated: true,
        category: aiContent.category
      });
    }

    setPosts(initialPosts);
    savePosts(initialPosts);
  };

  // Auto-refresh AI content every 45 seconds
  useEffect(() => {
    const refreshAIContent = async () => {
      const newAIContent = await generateAIPost();
      const newAIPost: Post = {
        id: `ai-refresh-${Date.now()}`,
        author: 'TRD AI Coach',
        authorRole: 'AI Marketing Expert',
        content: newAIContent.content,
        timestamp: new Date(),
        type: 'ai',
        likes: 0,
        comments: [],
        aiGenerated: true,
        category: newAIContent.category
      };

      setPosts(prevPosts => {
        // Add new AI post and keep only the most recent 20 posts to prevent infinite growth
        const updatedPosts = [newAIPost, ...prevPosts].slice(0, 20);
        savePosts(updatedPosts);
        return updatedPosts;
      });
    };

    // Set up 45-second interval for AI content refresh
    const aiRefreshInterval = setInterval(refreshAIContent, 45000);

    // Cleanup interval on component unmount
    return () => clearInterval(aiRefreshInterval);
  }, []);

  // Handle new post submission
  const handleSubmitPost = async () => {
    if (!newPost.trim() || !canPost()) return;

    setIsPosting(true);
    const { displayName } = getCurrentUser();

    const post: Post = {
      id: Date.now().toString(),
      author: displayName,
      authorRole: 'Team Lead',
      content: newPost,
      timestamp: new Date(),
      type: 'user',
      likes: 0,
      comments: []
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    savePosts(updatedPosts);
    setNewPost('');
    setIsPosting(false);

    // Generate an AI response post occasionally
    if (Math.random() > 0.7) {
      setTimeout(async () => {
        const aiContent = await generateAIPost();
        const aiPost: Post = {
          id: (Date.now() + 1).toString(),
          author: 'TRD AI Coach',
          authorRole: 'AI Sales Assistant',
          content: `💬 Great point! ${aiContent.content}`,
          timestamp: new Date(),
          type: 'ai',
          likes: 0,
          comments: [],
          aiGenerated: true,
          category: aiContent.category
        };

        const newPosts = [aiPost, ...updatedPosts];
        setPosts(newPosts);
        savePosts(newPosts);
      }, 3000);
    }
  };

  // Handle adding comments
  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    const { displayName } = getCurrentUser();
    const comment: Comment = {
      id: Date.now().toString(),
      author: displayName,
      content: newComment,
      timestamp: new Date()
    };

    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, comment] }
        : post
    );

    setPosts(updatedPosts);
    savePosts(updatedPosts);
    setNewComment('');
    setActiveCommentPost(null);
  };

  // Handle likes
  const handleLike = (postId: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    );
    setPosts(updatedPosts);
    savePosts(updatedPosts);
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.type === filter;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">TRD Team Feed</h1>
          <p className="text-gray-400 mt-1">Stay connected with your team and AI coaching</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex bg-tech-secondary bg-opacity-50 rounded-lg p-1">
          {[
            { id: 'all', label: 'All Posts', icon: '📋' },
            { id: 'user', label: 'Team Updates', icon: '👥' },
            { id: 'ai', label: 'AI Insights', icon: '🤖' }
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as any)}
              className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 flex items-center gap-2 ${
                filter === filterOption.id
                  ? 'bg-gradient text-white'
                  : 'text-gray-300 hover:bg-tech-secondary'
              }`}
            >
              <span>{filterOption.icon}</span>
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* New Post Section - Only for Matt and Jon */}
      {canPost() && (
        <div className="bg-tech-card rounded-xl shadow-tech overflow-hidden mb-8">
          <div className="h-1 bg-gradient"></div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient rounded-full flex items-center justify-center text-white font-bold">
                {getCurrentUser().displayName.charAt(0)}
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share an update, success story, or motivational message with the team..."
                  className="w-full p-4 bg-tech-input border border-tech-border rounded-lg text-tech-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-400">
                    {newPost.length}/1000 characters
                  </div>
                  <button
                    onClick={handleSubmitPost}
                    disabled={!newPost.trim() || isPosting}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      !newPost.trim() || isPosting
                        ? 'bg-tech-secondary text-gray-400 cursor-not-allowed'
                        : 'bg-gradient hover:shadow-accent text-white'
                    }`}
                  >
                    {isPosting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </>
                    ) : (
                      <>
                        📝 Post Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-tech-card rounded-xl shadow-tech overflow-hidden">
            <div className={`h-1 ${post.type === 'ai' ? 'bg-gradient-accent' : 'bg-gradient'}`}></div>
            <div className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    post.type === 'ai' ? 'bg-gradient-accent' : 'bg-gradient'
                  }`}>
                    {post.type === 'ai' ? '🤖' : post.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-tech-foreground">{post.author}</h3>
                      <span className="text-xs bg-tech-secondary px-2 py-1 rounded-full text-gray-300">
                        {post.authorRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{post.timestamp.toLocaleString()}</span>
                      {post.category && (
                        <>
                          <span>•</span>
                          <span className="text-accent">{post.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {post.aiGenerated && (
                  <div className="bg-accent bg-opacity-20 text-accent px-2 py-1 rounded text-xs">
                    AI Generated
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="text-tech-foreground mb-4 leading-relaxed">
                {post.content}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-tech-border">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors"
                  >
                    ❤️ <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
                  >
                    💬 <span>{post.comments.length}</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {post.type === 'ai' ? '🤖 AI Assistant' : '👤 Team Member'}
                </div>
              </div>

              {/* Comments Section */}
              {activeCommentPost === post.id && (
                <div className="mt-4 pt-4 border-t border-tech-border">
                  {/* Existing Comments */}
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="mb-3 p-3 bg-tech-secondary bg-opacity-30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-primary">{comment.author}</span>
                        <span className="text-xs text-gray-400">{comment.timestamp.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  ))}
                  
                  {/* Add Comment */}
                  <div className="flex gap-3 mt-4">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 bg-tech-input border border-tech-border rounded-lg text-tech-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newComment.trim()}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        !newComment.trim()
                          ? 'bg-tech-secondary text-gray-400 cursor-not-allowed'
                          : 'bg-accent hover:bg-accent-light text-white'
                      }`}
                    >
                      💬
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-medium text-gray-300 mb-2">No posts yet</h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? 'Be the first to share something with the team!'
              : `No ${filter === 'user' ? 'team updates' : 'AI insights'} available.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default HomeFeed; 