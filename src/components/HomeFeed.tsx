import React, { useState, useEffect } from 'react';

interface HomeFeedProps {
  onNavigate?: (tab: string) => void;
}

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

const HomeFeed: React.FC<HomeFeedProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'user' | 'ai'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get current user info
  const getCurrentUser = () => {
    const username = localStorage.getItem('username') || 'Unknown';
    const displayName = localStorage.getItem('displayName') || username;
    return { username, displayName };
  };

  // Check if user can post (only Matttrd, Jontrd, and Jessetrd)
  const canPost = () => {
    const { username } = getCurrentUser();
    return username === 'Matttrd' || username === 'Jontrd' || username === 'Jessetrd';
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
    "🔗 Link Building Strategy: One high-quality backlink from a local authority site beats 100 low-quality directory submissions."
  ];

  // Generate AI content for the feed
  const generateAIPost = async () => {
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
        id: Date.now().toString(),
        author: 'TRD AI Coach',
        authorRole: 'AI Marketing Assistant',
        content: 'Welcome to the TRD Team Feed! 🚀 This is your central hub for team updates, AI-powered insights, and marketing wisdom. I\'ll be sharing daily tips to help you dominate local search and close more deals. Let\'s make this quarter legendary! 💪',
        timestamp: new Date(),
        type: 'ai',
        likes: 0,
        comments: [],
        aiGenerated: true,
        category: 'Welcome'
      }
    ];

    // Add some recent AI tips
    for (let i = 0; i < 3; i++) {
      const aiContent = await generateAIPost();
      initialPosts.push({
        id: `ai_${Date.now() + i}`,
        author: 'TRD AI Coach',
        authorRole: 'AI Marketing Assistant',
        content: aiContent.content,
        timestamp: new Date(Date.now() - (i * 2 * 60 * 60 * 1000)), // Stagger by 2 hours
        type: 'ai',
        likes: Math.floor(Math.random() * 5),
        comments: [],
        aiGenerated: true,
        category: aiContent.category
      });
    }

    setPosts(initialPosts);
    savePosts(initialPosts);
  };

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    
    setIsPosting(true);
    const { displayName } = getCurrentUser();
    
    const post: Post = {
      id: Date.now().toString(),
      author: displayName,
      authorRole: 'Team Leader',
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
  };

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
  };

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
    <div className="min-h-screen bg-gradient-to-br from-tech-background via-tech-background to-tech-secondary">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
                TRD Team Feed
              </h1>
              <p className="text-gray-400 text-lg">Stay connected with your team and AI-powered marketing insights</p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <div className="bg-tech-card rounded-xl p-4 border border-tech-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-gray-400">
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="xl:col-span-3">
            {/* Filter Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-tech-foreground">Activity Feed</h2>
              <div className="flex bg-tech-card rounded-xl p-1 border border-tech-border">
                {[
                  { id: 'all', label: 'All Posts', icon: '📋' },
                  { id: 'user', label: 'Team Updates', icon: '👥' },
                  { id: 'ai', label: 'AI Insights', icon: '🤖' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.id}
                    onClick={() => setFilter(filterOption.id as any)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      filter === filterOption.id
                        ? 'bg-gradient text-white shadow-lg'
                        : 'text-gray-300 hover:bg-tech-secondary'
                    }`}
                  >
                    <span>{filterOption.icon}</span>
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* New Post Section */}
            {canPost() && (
              <div className="bg-tech-card rounded-xl shadow-tech overflow-hidden mb-8 border border-tech-border">
                <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {getCurrentUser().displayName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="Share an update, success story, or motivational message with the team..."
                        className="w-full p-4 bg-tech-input border border-tech-border rounded-xl text-tech-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                        rows={4}
                      />
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-400">
                          {newPost.length}/1000 characters
                        </div>
                        <button
                          onClick={handleSubmitPost}
                          disabled={!newPost.trim() || isPosting}
                          className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 font-medium ${
                            !newPost.trim() || isPosting
                              ? 'bg-tech-secondary text-gray-400 cursor-not-allowed'
                              : 'bg-gradient hover:shadow-lg hover:shadow-blue-500/25 text-white transform hover:scale-105'
                          }`}
                        >
                          {isPosting ? (
                            <>
                              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Publishing...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                              </svg>
                              Post Update
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
              {filteredPosts.map((post, index) => (
                <div key={post.id} className="bg-tech-card rounded-xl shadow-tech overflow-hidden border border-tech-border hover:shadow-xl transition-all duration-300">
                  <div className={`h-1 ${post.type === 'ai' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}></div>
                  <div className="p-6">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                          post.type === 'ai' 
                            ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                            : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                        }`}>
                          {post.type === 'ai' ? '🤖' : post.author.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-tech-foreground text-lg">{post.author}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              post.type === 'ai' 
                                ? 'bg-purple-900 bg-opacity-30 text-purple-300' 
                                : 'bg-blue-900 bg-opacity-30 text-blue-300'
                            }`}>
                              {post.authorRole}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <span>{post.timestamp.toLocaleString()}</span>
                            {post.category && (
                              <>
                                <span>•</span>
                                <span className="text-accent font-medium">{post.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {post.aiGenerated && (
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          AI Generated
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="text-tech-foreground mb-6 leading-relaxed text-lg">
                      {post.content}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-tech-border">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors duration-200 group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform duration-200">❤️</span>
                          <span className="font-medium">{post.likes}</span>
                        </button>
                        <button
                          onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform duration-200">💬</span>
                          <span className="font-medium">{post.comments.length}</span>
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span>{post.type === 'ai' ? '🤖 AI Assistant' : '👤 Team Member'}</span>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {activeCommentPost === post.id && (
                      <div className="mt-6 pt-4 border-t border-tech-border">
                        {/* Existing Comments */}
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="mb-4 p-4 bg-tech-secondary bg-opacity-30 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-blue-400">{comment.author}</span>
                              <span className="text-xs text-gray-400">{comment.timestamp.toLocaleString()}</span>
                            </div>
                            <p className="text-gray-300">{comment.content}</p>
                          </div>
                        ))}
                        
                        {/* Add Comment */}
                        <div className="flex gap-3 mt-4">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-4 py-3 bg-tech-input border border-tech-border rounded-xl text-tech-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment.trim()}
                            className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                              !newComment.trim()
                                ? 'bg-tech-secondary text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
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
              <div className="text-center py-16">
                <div className="text-8xl mb-6">📭</div>
                <h3 className="text-2xl font-medium text-gray-300 mb-3">No posts yet</h3>
                <p className="text-gray-400 text-lg">
                  {filter === 'all' 
                    ? 'Be the first to share something with the team!'
                    : `No ${filter === 'user' ? 'team updates' : 'AI insights'} available.`}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-tech-card rounded-xl shadow-tech overflow-hidden border border-tech-border">
                <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-tech-foreground">Quick Actions</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Message Sender', icon: '💬', color: 'from-blue-500 to-cyan-500', tab: 'message-sender' },
                      { label: 'AI Tools', icon: '🤖', color: 'from-purple-500 to-pink-500', tab: 'ai-tools' },
                      { label: 'Analytics', icon: '📊', color: 'from-green-500 to-blue-500', tab: 'stats' },
                      { label: 'Tutorials', icon: '📚', color: 'from-orange-500 to-red-500', tab: 'tutorials' }
                    ].map((action, index) => (
                      <button
                        key={index}
                        onClick={() => onNavigate?.(action.tab)}
                        className={`w-full p-3 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium hover:shadow-lg transition-all duration-200 hover:scale-105`}
                      >
                        <span className="mr-2">{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Status */}
              <div className="bg-tech-card rounded-xl shadow-tech overflow-hidden border border-tech-border">
                <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-tech-foreground">Team Status</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Jose', status: 'Online', color: 'bg-green-500' },
                      { name: 'Juan', status: 'Online', color: 'bg-green-500' },
                      { name: 'Jon', status: 'Away', color: 'bg-yellow-500' },
                      { name: 'Jesse', status: 'Online', color: 'bg-green-500' },
                      { name: 'Sean', status: 'Online', color: 'bg-green-500' },
                      { name: 'Matt', status: 'Online', color: 'bg-green-500' }
                    ].map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${member.color}`}></div>
                          <span className="text-tech-foreground">{member.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{member.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Today's Tip */}
              <div className="bg-tech-card rounded-xl shadow-tech overflow-hidden border border-tech-border">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-tech-foreground">💡 Daily Insight</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    "SEO success isn't about gaming Google's algorithm—it's about understanding your customers so well that Google can't help but send them to you."
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    — TRD Marketing Philosophy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFeed; 