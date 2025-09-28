import React, { useState, useEffect, useCallback, useMemo, useReducer, createContext, useContext, memo, Suspense } from 'react';
import { useAppContext, AppProvider } from './context/AppContext';
// Controllers and views (MVC)
import useGenealogyController from './controllers/useGenealogyController';
import GenealogyView from './views/GenealogyView';
import useDocumentArchiveController from './controllers/useDocumentArchiveController';
import DocumentArchiveView from './views/DocumentArchiveView';

// Page Transition Component
const PageTransition = memo(({ children }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
      {children}
    </div>
  );
});

// Advanced Dashboard with Real-time Analytics
const DashboardPage = memo(() => {
  const { state, dispatch } = useAppContext();
  const { theme } = state;
  const [animatedStats, setAnimatedStats] = useState({});

  const stats = useMemo(() => [
    { 
      label: 'Family Members', 
      value: 247, 
      change: 12, 
      icon: '👥', 
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      trend: 'up',
      percentage: 5.1
    },
    { 
      label: 'Photos Archived', 
      value: 1432, 
      change: 89, 
      icon: '📸', 
      gradient: 'from-purple-500 via-pink-500 to-rose-600',
      trend: 'up',
      percentage: 6.6
    },
    { 
      label: 'Documents', 
      value: 186, 
      change: 5, 
      icon: '📄', 
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      trend: 'up',
      percentage: 2.8
    },
    { 
      label: 'Stories Written', 
      value: 23, 
      change: 3, 
      icon: '📖', 
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      trend: 'up',
      percentage: 15.0
    }
  ], []);

  // Animate numbers on mount
  useEffect(() => {
    stats.forEach((stat, index) => {
      setTimeout(() => {
        let start = 0;
        const end = stat.value;
        const duration = 2000;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          setAnimatedStats(prev => ({ ...prev, [index]: Math.floor(start) }));
        }, 16);
      }, index * 200);
    });
  }, [stats]);

  const quickActions = useMemo(() => [
    { 
      label: 'Add Family Member', 
      icon: '👤', 
      action: () => dispatch({ type: 'SET_PAGE', payload: 'genealogy' }), 
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Expand your family tree'
    },
    { 
      label: 'Upload Photos', 
      icon: '📸', 
      action: () => dispatch({ type: 'SET_PAGE', payload: 'media-vault' }), 
      gradient: 'from-purple-500 to-pink-600',
      description: 'Preserve precious memories'
    },
    { 
      label: 'Write Story', 
      icon: '✍️', 
      action: () => dispatch({ type: 'SET_PAGE', payload: 'family-stories' }), 
      gradient: 'from-green-500 to-teal-600',
      description: 'Share family narratives'
    },
    { 
      label: 'Import Data', 
      icon: '📊', 
      action: () => dispatch({ type: 'SET_PAGE', payload: 'settings' }), 
      gradient: 'from-orange-500 to-red-600',
      description: 'Bulk import records'
    }
  ], [dispatch]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl p-8 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' 
          : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      } border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-2xl`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-5xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome back, John
              </h1>
              <p className={`text-xl ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Your family heritage continues to grow
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-2xl">
                <span className="text-6xl">🏡</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Last updated: Today
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
              <span className="text-sm">🔄</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Auto-sync enabled
              </span>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-20 animate-bounce"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-red-500 opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 opacity-20 animate-ping"></div>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden rounded-2xl p-6 group cursor-pointer
              ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'}
              backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'}
              shadow-xl hover:shadow-2xl transition-all duration-500
              hover:-translate-y-2 hover:scale-105
            `}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {stat.trend === 'up' ? '↑' : '↓'} {stat.percentage}%
                </div>
              </div>
              
              <div>
                <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {animatedStats[index]?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-green-500 font-medium">
                  +{stat.change} this month
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1">
              <div 
                className={`h-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min((animatedStats[index] || 0) / stat.value * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`rounded-2xl p-8 ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
      } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-xl`}>
        <h2 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`
                p-6 rounded-2xl text-left group transition-all duration-300
                ${theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50/70 hover:bg-white'}
                hover:shadow-xl hover:-translate-y-2 border
                ${theme === 'dark' ? 'border-gray-600/50' : 'border-gray-200/50'}
              `}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {action.label}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Insights */}
      <div className="grid lg:grid-cols-2 gap-8">
        <RecentActivity />
        <FamilyInsights />
      </div>
    </div>
  );
});

// Enhanced Recent Activity
const RecentActivity = memo(() => {
  const { state } = useAppContext();
  const { theme } = state;
  
  const activities = useMemo(() => [
    { type: 'upload', content: 'Wedding photos from 1952 uploaded', time: '2 hours ago', icon: '📸', color: 'from-blue-500 to-indigo-500' },
    { type: 'add', content: 'Michael Johnson added to family tree', time: '1 day ago', icon: '👤', color: 'from-green-500 to-emerald-500' },
    { type: 'story', content: 'Grandmother\'s recipe story published', time: '3 days ago', icon: '📖', color: 'from-purple-500 to-pink-500' },
    { type: 'document', content: 'Birth certificate archived', time: '1 week ago', icon: '📄', color: 'from-orange-500 to-red-500' }
  ], []);

  return (
    <div className={`rounded-2xl p-6 ${
      theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
    } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-xl`}>
      <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-white/10 transition-all duration-200">
            <div className={`w-12 h-12 bg-gradient-to-br ${activity.color} rounded-xl flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform duration-200`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} group-hover:text-indigo-600 transition-colors duration-200`}>
                {activity.content}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {activity.time}
              </p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-white/20 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

// Enhanced Family Insights
const FamilyInsights = memo(() => {
  const { state } = useAppContext();
  const { theme } = state;
  
  const insights = useMemo(() => [
    { label: 'Profile Completion', value: 78, color: 'from-green-500 to-emerald-500', target: 90 },
    { label: 'Photos Organized', value: 92, color: 'from-blue-500 to-indigo-500', target: 95 },
    { label: 'Stories Documented', value: 45, color: 'from-purple-500 to-pink-500', target: 75 }
  ], []);
  
  return (
    <div className={`rounded-2xl p-6 ${
      theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
    } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-xl`}>
      <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Family Insights
      </h3>
      <div className="space-y-6">
        {insights.map((insight, index) => (
          <div key={index} className="group">
            <div className="flex justify-between items-center mb-3">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {insight.label}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-bold bg-gradient-to-r ${insight.color} bg-clip-text text-transparent`}>
                  {insight.value}%
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  / {insight.target}%
                </span>
              </div>
            </div>
            <div className="relative">
              <div className={`w-full h-3 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${insight.color} transition-all duration-1000 ease-out relative overflow-hidden`}
                  style={{ width: `${insight.value}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                </div>
              </div>
              {/* Target Line */}
              <div 
                className="absolute top-0 w-0.5 h-3 bg-gray-400 opacity-50"
                style={{ left: `${insight.target}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Placeholder Pages with Enhanced Design

const GenealogyPage = memo(() => {
  const { state, dispatch } = useAppContext();
  const { theme } = state;

  const controller = useGenealogyController();

  // Wire controller actions to global dispatch when needed
  const handleSelect = (member) => {
    controller.handleSelect(member);
    dispatch({ type: 'SET_SELECTED_PERSON', payload: member?.id ?? null });
  };

  const handleCloseDrawer = () => {
    controller.handleCloseDrawer();
    dispatch({ type: 'SET_SELECTED_PERSON', payload: null });
  };

  const handleEdit = (member) => {
    dispatch({ type: 'SET_PAGE', payload: 'person-profile' });
  };

  return (
    <GenealogyView
      theme={theme}
      members={controller.members}
      loading={controller.loading}
      error={controller.error}
      selectedMember={controller.selectedMember}
      onSelect={handleSelect}
      onCloseDrawer={handleCloseDrawer}
      onEdit={handleEdit}
    />
  );
});

const DocumentArchivePage = memo(() => {
  const { state } = useAppContext();
  const { theme } = state;
  const controller = useDocumentArchiveController();

  return (
    <DocumentArchiveView theme={theme} controller={controller} />
  );
});

const MediaVaultPage = memo(() => {
  const { state } = useAppContext();
  const { theme } = state;
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`rounded-3xl p-16 text-center ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
      } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-2xl`}>
        <div className="text-8xl mb-6">📸</div>
        <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Family Photo Vault
        </h2>
        <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Organize and preserve your family photos with intelligent tagging, facial recognition, timeline views, and collaborative albums...
        </p>
      </div>
    </div>
  );
});

const FamilyStoriesPage = memo(() => {
  const { state } = useAppContext();
  const { theme } = state;
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`rounded-3xl p-16 text-center ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
      } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-2xl`}>
        <div className="text-8xl mb-6">📖</div>
        <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Interactive Family Stories
        </h2>
        <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Rich multimedia storytelling with audio recordings, video testimonials, collaborative editing, and AI-assisted transcription...
        </p>
      </div>
    </div>
  );
});

const PersonProfilePage = memo(() => {
  const { state } = useAppContext();
  const { theme } = state;
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`rounded-3xl p-16 text-center ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
      } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-2xl`}>
        <div className="text-8xl mb-6">👤</div>
        <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Dynamic Person Profiles
        </h2>
        <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Comprehensive individual profiles with interactive timelines, relationship mapping, achievement tracking, and legacy preservation...
        </p>
      </div>
    </div>
  );
});

const AnalyticsPage = memo(() => {
  const { state } = useAppContext();
  const { theme } = state;
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`rounded-3xl p-16 text-center ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
      } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-2xl`}>
        <div className="text-8xl mb-6">📊</div>
        <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Family Analytics Hub
        </h2>
        <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Advanced data visualization, family statistics, growth trends, content analytics, and predictive insights using AI...
        </p>
      </div>
    </div>
  );
});

const ProfilePage = memo(() => {
  const { state } = useAppContext();
  const { theme, user } = state;
  
  const currentUser = user || {
    name: 'John Smith',
    email: 'john.smith@family.com',
    avatar: '/images/avatar1.svg',
    role: 'Family Admin',
    joinDate: '2023-01-15',
    location: 'New York, NY',
    bio: 'Family historian and genealogy enthusiast. Passionate about preserving our family heritage for future generations.'
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className={`rounded-3xl p-8 ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
      } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-2xl`}>
        <h2 className={`text-4xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          My Profile
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 mb-4"
            />
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Change Photo
            </button>
          </div>
          
          {/* Profile Information */}
          <div className="flex-1 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={currentUser.name}
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role
                </label>
                <input
                  type="text"
                  value={currentUser.role}
                  disabled
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-600 text-gray-300'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  } cursor-not-allowed`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location
                </label>
                <input
                  type="text"
                  defaultValue={currentUser.location}
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Bio
              </label>
              <textarea
                rows={4}
                defaultValue={currentUser.bio}
                className={`w-full p-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Save Changes
              </button>
              <button className={`px-6 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const SettingsPage = memo(() => {
  const { state } = useAppContext();
  const { theme } = state;
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`rounded-3xl p-16 text-center ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
      } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-2xl`}>
        <div className="text-8xl mb-6">⚙️</div>
        <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Advanced Settings
        </h2>
        <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Comprehensive privacy controls, data export/import, backup management, user permissions, and system preferences...
        </p>
      </div>
    </div>
  );
});

const HelpPage = memo(() => {
  const { state } = useAppContext();
  const { theme } = state;
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`rounded-3xl p-16 text-center ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
      } backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-2xl`}>
        <div className="text-8xl mb-6">❓</div>
        <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Help & Support
        </h2>
        <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Get help with using the Family Portfolio platform, find tutorials, and contact our support team...
        </p>
      </div>
    </div>
  );
});

// Notification System
const NotificationSystem = memo(() => {
  const { state } = useAppContext();
  const { notifications } = state;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg animate-in slide-in-from-right-4 duration-300"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}></div>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
});

// Command Palette (Future Enhancement)
const CommandPalette = memo(() => {
  return null; // Placeholder for future command palette implementation
});

// Global Loading Overlay
const GlobalLoadingOverlay = memo(() => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-lg font-medium">Processing...</span>
      </div>
    </div>
  </div>
));

// User Profile Menu Component
const UserProfileMenu = memo(() => {
  const { state, dispatch } = useAppContext();
  const { user, theme } = state;
  const [showDropdown, setShowDropdown] = useState(false);

  // Mock user data - replace with real authentication
  const currentUser = user || {
    name: 'John Smith',
    email: 'john.smith@family.com',
    avatar: '/images/avatar1.svg',
    role: 'Family Admin'
  };

  const handleSignOut = () => {
    dispatch({ type: 'SET_USER', payload: null });
    setShowDropdown(false);
    // Add sign out logic here
  };

  const handleSignIn = () => {
    // Mock sign in - replace with real authentication
    const mockUser = {
      name: 'John Smith',
      email: 'john.smith@family.com',
      avatar: '/images/avatar1.svg',
      role: 'Family Admin'
    };
    dispatch({ type: 'SET_USER', payload: mockUser });
  };

  if (!user) {
    // Show sign in button when not authenticated
    return (
      <button
        onClick={handleSignIn}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'hover:bg-gray-700'
            : 'hover:bg-gray-100'
        }`}
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500"
        />
        <div className="hidden md:block text-left">
          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {currentUser.name}
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentUser.role}
          </div>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''} ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg border z-20 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            {/* User Info */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.name}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentUser.email}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    theme === 'dark'
                      ? 'bg-indigo-900 text-indigo-300'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {currentUser.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  dispatch({ type: 'SET_PAGE', payload: 'profile' });
                  setShowDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-lg">👤</span>
                <span>My Profile</span>
              </button>
              
              <button
                onClick={() => {
                  dispatch({ type: 'SET_PAGE', payload: 'settings' });
                  setShowDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-lg">⚙️</span>
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  dispatch({ type: 'SET_PAGE', payload: 'help' });
                  setShowDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-lg">❓</span>
                <span>Help & Support</span>
              </button>

              <hr className={`my-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />

              <button
                onClick={handleSignOut}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors text-red-600 hover:bg-red-50 ${
                  theme === 'dark' ? 'hover:bg-red-900/20' : ''
                }`}
              >
                <span className="text-lg">🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// Main App Component with Navigation
function AppContent() {
  const { state, dispatch } = useAppContext();
  const { page, theme } = state;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage />;
      case 'genealogy':
        return <GenealogyPage />;
      case 'media-vault':
        return <MediaVaultPage />;
      case 'document-archive':
        return <DocumentArchivePage />;
      case 'family-stories':
        return <FamilyStoriesPage />;
      case 'person-profile':
        return <PersonProfilePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'
    }`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b ${
        theme === 'dark' 
          ? 'bg-gray-900/80 border-gray-700/50' 
          : 'bg-white/80 border-white/60'
      } shadow-lg`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold gradient-text">Family Portfolio</h1>
              <div className="hidden md:flex space-x-6">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
                  { id: 'genealogy', label: 'Family Tree', icon: '🌳' },
                  { id: 'media-vault', label: 'Photos', icon: '📸' },
                  { id: 'document-archive', label: 'Documents', icon: '📚' },
                  { id: 'family-stories', label: 'Stories', icon: '📖' },
                  { id: 'profile', label: 'Profile', icon: '👤' },
                  { id: 'analytics', label: 'Analytics', icon: '📊' },
                  { id: 'settings', label: 'Settings', icon: '⚙️' }
                ].map((nav) => (
                  <button
                    key={nav.id}
                    onClick={() => dispatch({ type: 'SET_PAGE', payload: nav.id })}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      page === nav.id
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>{nav.icon}</span>
                    <span className="font-medium">{nav.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch({ type: 'SET_THEME', payload: theme === 'dark' ? 'light' : 'dark' })}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        <PageTransition>
          {renderPage()}
        </PageTransition>
      </main>

      {/* Notifications */}
      <NotificationSystem />

      {/* Global Loading Overlay */}
      {state.loading && <GlobalLoadingOverlay />}
    </div>
  );
}

// Main App Component with Provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;