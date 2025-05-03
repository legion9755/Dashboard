'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home as HomeIcon,
  BarChart2 as MetricsIcon,
  Settings2 as SettingsIcon,
  HelpCircle as HelpIcon,
  Menu as MenuIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Bell as BellIcon,
  User as UserIcon,
  LogOut as LogOutIcon,
  Settings as SettingsIconSmall
} from 'lucide-react';

// Types
interface Notification { id: string; message: string; time?: string; }
interface Metric { key: string; title: string; status: 'up' | 'down'; change: number; min: number; max: number; icon: JSX.Element; gradient: string; }

const metricList: Metric[] = [
  { key: 'users', title: 'Users', status: 'up', change: 3.5, min: 1000, max: 2000, icon: <UserIcon className="w-6 h-6" />, gradient: 'from-indigo-500 to-purple-600' },
  { key: 'errors', title: 'Errors', status: 'down', change: -1.2, min: 10, max: 30, icon: <BellIcon className="w-6 h-6" />, gradient: 'from-red-500 to-pink-600' },
  { key: 'requests', title: 'Requests/min', status: 'up', change: 1.8, min: 500, max: 900, icon: <MetricsIcon className="w-6 h-6" />, gradient: 'from-green-400 to-teal-500' },
  { key: 'sessions', title: 'Active Sessions', status: 'down', change: -0.9, min: 150, max: 300, icon: <HomeIcon className="w-6 h-6" />, gradient: 'from-yellow-400 to-orange-500' },
];

// Utility functions
const generateRandom = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const generateTimestamp = (): string => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function PremiumDashboard() {
  const [landing, setLanding] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [lineData, setLineData] = useState([{ time: '10:00', value: 80 }]);
  const [barData, setBarData] = useState([{ name: 'CPU', usage: 70 }, { name: 'Memory', usage: 55 }]);
  const [pieData] = useState([
    { name: 'Mobile', value: 40, color: '#8884d8' },
    { name: 'Desktop', value: 35, color: '#82ca9d' },
    { name: 'Tablet', value: 25, color: '#ffc658' }
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([ 
    { id: crypto.randomUUID(), message: 'Server 1 is up', time: '10:30 AM' }, 
    { id: crypto.randomUUID(), message: 'New login from India', time: '10:15 AM' } 
  ]);
  const [search, setSearch] = useState('');
  const [visibleMetrics, setVisibleMetrics] = useState(metricList.map((m) => m.key));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('dashboard');
  const [showToast, setShowToast] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Persist theme
  useEffect(() => {
    const stored = localStorage.getItem('premium-dark');
    if (stored) setDarkMode(stored === 'true');
  }, []);
  useEffect(() => { localStorage.setItem('premium-dark', String(darkMode)); }, [darkMode]);

  // Live update
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setLineData(prev => [...prev.slice(-9), { time: generateTimestamp(), value: generateRandom(60, 120) }]);
      setBarData([ { name: 'CPU', usage: generateRandom(30, 90) }, { name: 'Memory', usage: generateRandom(20, 80) } ]);
      setNotifications(prev => [ 
        { id: crypto.randomUUID(), message: `Connection from ${generateRandom(100,255)}.${generateRandom(0,255)}`, time: timeString }, 
        ...prev.slice(0, 9) 
      ]);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const filteredNotifications = notifications.filter(n => n.message.toLowerCase().includes(search.toLowerCase()));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'metrics', label: 'Metrics', icon: <MetricsIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
    { id: 'help', label: 'Help', icon: <HelpIcon className="w-5 h-5" /> },
  ];

  // Modal content
  const modalContentMap: Record<string, JSX.Element> = {
    settings: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Settings</h2>
        <p>Configure your dashboard preferences</p>
        <div className="space-y-3 mt-4">
          {metricList.map(metric => (
            <label key={metric.key} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {metric.icon}
                <span>{metric.title}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={visibleMetrics.includes(metric.key)}
                onClick={() => setVisibleMetrics(prev =>
                  prev.includes(metric.key)
                    ? prev.filter(k => k !== metric.key)
                    : [...prev, metric.key]
                )}
                className={`w-10 h-6 rounded-full relative focus:outline-none ${
                  visibleMetrics.includes(metric.key) ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                    visibleMetrics.includes(metric.key) ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2000);
              setIsModalOpen(false);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    ),
    help: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Help Center</h2>
        <p>Welcome to the dashboard! Here are some quick tips:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the sidebar to navigate between sections</li>
          <li>Toggle dark mode with the sun/moon icon</li>
          <li>Hover over charts to see detailed information</li>
          <li>Search notifications using the search box</li>
        </ul>
      </div>
    ),
    dashboard: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Dashboard Overview</h2>
        <p>This is your main dashboard view showing real-time metrics and system status.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Metric cards show current values with trend indicators</li>
          <li>Charts update automatically every few seconds</li>
          <li>Notifications appear in real-time as events occur</li>
        </ul>
      </div>
    ),
    metrics: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Detailed Metrics</h2>
        <p>View comprehensive metrics and analytics about your system.</p>
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
          <p className="font-medium">Current System Status: <span className="text-green-500">Healthy</span></p>
          <p className="text-sm mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    ),
    profile: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">User Profile</h2>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-3">
            <span className="text-4xl">👨‍💻</span>
          </div>
          <p className="font-semibold">Vaibhav Kotnala</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
        </div>
        <hr className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} />
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Email:</strong> vaibhav@example.com
          </p>
          <p className="text-sm">
            <strong>Role:</strong> Administrator
          </p>
          <p className="text-sm">
            <strong>Last Login:</strong> {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    ),
    notifications: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">All Notifications</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
          ) : (
            notifications.map(note => (
              <div key={note.id} className="flex items-start space-x-3 p-2 border-b border-gray-200 dark:border-gray-700">
                <BellIcon className="w-5 h-5 text-indigo-500 mt-1" />
                <div className="flex-1">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{note.message}</p>
                  <p className="text-xs text-gray-400">{note.time || generateTimestamp()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    ),
  };

  // Render
  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen flex`}>
      <AnimatePresence mode="wait">
        {landing ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen text-center px-4 w-full relative overflow-hidden"
          >
            {/* Abstract background shapes */}
            <motion.div 
              className="absolute inset-0 -z-10 opacity-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
            >
              <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 blur-3xl" />
            </motion.div>
            
            {/* 3D Interactive Heading */}
            <motion.div
              className="perspective-1000 transform-gpu"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              whileHover={{ scale: 1.02, rotateX: 5, rotateY: -5 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                ⚡ Premium Dashboard
              </h1>
              <p className="text-xl mb-8 max-w-xl mx-auto text-gray-600 dark:text-gray-300">
                Real-time analytics and insights with a modern, intuitive interface
              </p>
            </motion.div>
            
            {/* Feature highlights with progressive blur */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
              {[
                { icon: "📊", title: "Data Visualization", desc: "Interactive charts with real-time updates" },
                { icon: "🔍", title: "AI Insights", desc: "Smart recommendations and anomaly detection" },
                { icon: "⚡", title: "Lightning Fast", desc: "Optimized performance for instant analysis" }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                  className={`p-6 rounded-2xl backdrop-blur-sm bg-white/10 border border-gray-200/20 dark:border-gray-700/30 shadow-xl`}
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
            
            {/* CTA Button with 3D effect */}
            <motion.button
              whileHover={{ scale: 1.05, rotateZ: 0.5 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onClick={() => setLanding(false)}
              className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transform-gpu"
            >
              <span className="relative z-10">Enter Dashboard</span>
              <motion.div 
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            
            {/* Social proof section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-16 text-gray-500 text-sm"
            >
              <p className="mb-3">Trusted by innovative teams worldwide</p>
              <div className="flex justify-center space-x-8 opacity-70">
                {["Microsoft", "Google", "Amazon", "Tesla", "Meta"].map((company, i) => (
                  <span key={i} className="font-semibold">{company}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <>
            {/* Sidebar - Fixed position for smooth animation */}
            <aside 
              className={`fixed left-0 top-0 h-full z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-300 ease-in-out ${sidebarMinimized ? 'w-20' : 'w-64'} shadow-lg`}
            >        
              <div className="flex items-center justify-between p-4">
                {!sidebarMinimized ? (
                  <div className="flex items-center space-x-2">
                    <AnimatedLogo darkMode={darkMode} />
                    <span className="font-bold">Dashboard</span>
                  </div>
                ) : (
                  <AnimatedLogo darkMode={darkMode} small />
                )}
                <button 
                  onClick={() => setSidebarMinimized(!sidebarMinimized)} 
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {sidebarMinimized ? <ExpandIcon size={18} /> : <CollapseIcon size={18} />}
                </button>
              </div>
              {!sidebarMinimized && (
                <div className="flex items-center space-x-3 px-4 mb-6">
                  <MemojiAvatar darkMode={darkMode} />
                  <div>
                    <p className="font-semibold">Vaibhav Kotnala</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                  </div>
                </div>
              )}
              <nav className="flex-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsModalOpen(true); }}
                    className={`flex items-center w-full gap-3 px-4 py-3 hover:bg-indigo-500 hover:text-white transition-colors ${activeTab === item.id ? 'bg-indigo-600 text-white' : ''}`}
                  >
                    {item.icon}
                    {!sidebarMinimized && <span>{item.label}</span>}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Area - With margin that transitions smoothly with sidebar */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarMinimized ? 'ml-20' : 'ml-64'}`}>
              {/* Header */}
              <header className={`flex items-center justify-between p-4 sticky top-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>          
                <div className="flex items-center space-x-4">
                  <button className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => setSidebarMinimized(false)}>
                    <MenuIcon />
                  </button>
                  <input
                    type="text"
                    placeholder="Quick search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`hidden md:block px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-indigo-400 focus:outline-none w-64`}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  {/* Notification Button with Dropdown */}
                  <div className="relative" ref={notificationRef}>
                    <button 
                      className="relative p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                    >
                      <BellIcon />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {notifications.length}
                        </span>
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {showNotificationDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg z-50 p-3`}
                        >
                          <h3 className="font-semibold mb-2">Recent Notifications</h3>
                          <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
                            ) : (
                              notifications.slice(0, 5).map(note => (
                                <div key={note.id} className={`flex items-start space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}>
                                  <BellIcon className="w-5 h-5 text-indigo-500 mt-1" />
                                  <div className="flex-1">
                                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{note.message}</p>
                                    <p className="text-xs text-gray-400">{note.time || generateTimestamp()}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <button 
                            className="w-full mt-2 text-center text-sm text-indigo-500 hover:underline"
                            onClick={() => {
                              setActiveTab('notifications');
                              setIsModalOpen(true);
                              setShowNotificationDropdown(false);
                            }}
                          >
                            View all notifications
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                    {darkMode ? <SunIcon /> : <MoonIcon />}
                  </button>
                  
                  {/* Profile Button with Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button 
                      className="w-8 h-8 rounded-full overflow-hidden"
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    >
                      <MemojiAvatar darkMode={darkMode} small />
                    </button>
                    
                    <AnimatePresence>
                      {showProfileDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg z-50`}
                        >
                          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="font-semibold">Vaibhav Kotnala</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                          </div>
                          <div className="p-2">
                            <button 
                              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2" 
                              onClick={() => {
                                setActiveTab('profile');
                                setIsModalOpen(true);
                                setShowProfileDropdown(false);
                              }}
                            >
                              <UserIcon size={16} />
                              View Profile
                            </button>
                            <button 
                              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2" 
                              onClick={() => {
                                setActiveTab('settings');
                                setIsModalOpen(true);
                                setShowProfileDropdown(false);
                              }}
                            >
                              <SettingsIconSmall size={16} />
                              Settings
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-500 flex items-center gap-2">
                              <LogOutIcon size={16} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </header>

              {/* Content */}
              <main className="p-6 overflow-y-auto space-y-8">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metricList.filter(m => visibleMetrics.includes(m.key)).map(metric => {
                    const value = generateRandom(metric.min, metric.max);
                    return (
                      <motion.div
                        key={metric.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ 
                          scale: 1.03, 
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                        }}
                        className={`p-5 rounded-2xl shadow-xl bg-gradient-to-br ${metric.gradient} text-white relative overflow-hidden`}
                      >
                        <div className="absolute top-4 right-4 opacity-20 text-6xl">
                          {metric.icon}
                        </div>
                        <div className="text-sm font-medium uppercase">{metric.title}</div>
                        <div className="mt-2 text-3xl font-bold flex items-baseline">
                          {value}
                          <span className={`ml-2 text-sm ${metric.status === 'up' ? 'text-green-200' : 'text-red-200'}`}>{metric.status === 'up' ? '▲' : '▼'} {metric.change}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Live Traffic" darkMode={darkMode}>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={lineData}>
                        <XAxis dataKey="time" stroke={darkMode ? '#aaa' : '#555'} />
                        <YAxis stroke={darkMode ? '#aaa' : '#555'} />
                        <Tooltip wrapperClassName={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} rounded-lg`} />
                        <defs>
                          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8884d8" />
                            <stop offset="100%" stopColor="#82ca9d" />
                          </linearGradient>
                        </defs>
                        <Line type="monotone" dataKey="value" stroke="url(#lineGrad)" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Resource Usage" darkMode={darkMode}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barData}>
                        <XAxis dataKey="name" stroke={darkMode ? '#aaa' : '#555'} />
                        <YAxis stroke={darkMode ? '#aaa' : '#555'} />
                        <Tooltip wrapperClassName={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} rounded-lg`} />
                        <Bar dataKey="usage" fill={darkMode ? '#82ca9d' : '#4ade80'} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Memory Trend" darkMode={darkMode}>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={lineData}>
                        <XAxis dataKey="time" stroke={darkMode ? '#aaa' : '#555'} />
                        <YAxis stroke={darkMode ? '#aaa' : '#555'} />
                        <Tooltip wrapperClassName={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} rounded-lg`} />
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#ffc658" fillOpacity={1} fill="url(#areaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Device Distribution" darkMode={darkMode}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" outerRadius={80} innerRadius={50} paddingAngle={4}>
                          {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                        <Tooltip wrapperClassName={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} rounded-lg`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                {/* Notifications Panel */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Notifications</h2>
                    <button onClick={() => setNotifications([])} className="text-sm text-indigo-500 hover:underline">Clear All</button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
                    ) : (
                      filteredNotifications.map(note => (
                        <div key={note.id} className="flex items-start space-x-3">
                          <BellIcon className="w-5 h-5 text-indigo-500 mt-1" />
                          <div className="flex-1">
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{note.message}</p>
                            <p className="text-xs text-gray-400">{note.time || generateTimestamp()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </main>

              {/* Footer */}
              <footer className="p-4 text-center text-xs text-gray-500">
                © 2025 Dashboard Pro · <a href="https://vaibhav-portfolio-website-virid.vercel.app/" className="underline">Vaibhav's Portfolio</a>
              </footer>
            </div>

            {/* Modal Component */}
            <AnimatePresence>
              {isModalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 flex items-center justify-center p-4"
                  onClick={() => setIsModalOpen(false)}
                >
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`relative max-w-md w-full rounded-lg shadow-xl p-6 ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                      onClick={() => setIsModalOpen(false)}
                    >
                      &times;
                    </button>
                    {activeTab && modalContentMap[activeTab]}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toast Message */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50"
                >
                  ✔ Changes saved successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Premium components
function ChartCard({ title, darkMode, children }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-all duration-300`}
    >
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </motion.div>
  );
}

// Fixed spinning logo using SVG instead of image
function AnimatedLogo({ darkMode, small }: { darkMode: boolean; small?: boolean }) {
  return (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      className={small ? 'w-6 h-6' : 'w-8 h-8'}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M12 4L12 20" stroke={darkMode ? "#fff" : "#000"} strokeWidth="2" strokeLinecap="round" />
        <path d="M4 12L20 12" stroke={darkMode ? "#fff" : "#000"} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="8" stroke={darkMode ? "#fff" : "#000"} strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill={darkMode ? "#fff" : "#000"} />
      </svg>
    </motion.div>
  );
}

// Memoji avatar component
function MemojiAvatar({ darkMode, small }: { darkMode: boolean; small?: boolean }) {
  return (
    <div className={`${small ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'} ring-2 ring-indigo-500`}>
      <span className={`${small ? 'text-lg' : 'text-2xl'}`}>👨‍💻</span>
    </div>
  );
}
