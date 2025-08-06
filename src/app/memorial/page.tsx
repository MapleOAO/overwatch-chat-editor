'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BoltIcon,
  HeartIcon,
  ShieldCheckIcon,
  CubeIcon,
  SparklesIcon,
  TrophyIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';

// 数字动画组件
const AnimatedNumber = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    
    const startTime = Date.now();
    const startValue = displayValue;
    const difference = value - startValue;

    const updateNumber = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + difference * easeOutQuart);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

// 浮动粒子组件
const FloatingParticles = () => {
  const [particles, setParticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 10,
      duration: 20 + Math.random() * 10,
      x: Math.random() * 100,
      y: Math.random() * 100,
    })));
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-orange-400/30 rounded-full"
          initial={{ 
            x: `${particle.x}vw`, 
            y: `${particle.y}vh`,
            opacity: 0 
          }}
          animate={{
            y: [`${particle.y}vh`, `${particle.y - 20}vh`, `${particle.y}vh`],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// 弹幕组件
const DanmakuItem = ({ template, delay, randomSeed }: { template: any; delay: number; randomSeed: number }) => {
  const duration = 12 + (randomSeed * 8); // 12-20秒持续时间，稍微缩短避免卡住
  const topPosition = (randomSeed * 60 + 10); // 垂直位置
  const fontSize = (randomSeed * 0.5 + 0.8); // 字体大小
  
  return (
    <motion.div
      initial={{ x: '100vw', opacity: 0 }}
      animate={{ x: '-120vw', opacity: 1 }} // 增加移动距离确保完全离开屏幕
      exit={{ opacity: 0 }}
      transition={{
        duration: duration,
        delay: delay,
        ease: 'linear'
      }}
      className="absolute whitespace-nowrap z-20 pointer-events-none"
      style={{
        top: `${topPosition}%`,
        fontSize: `${fontSize}rem`,
      }}
    >
      <div className="bg-black/85 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-400/50 shadow-lg">
        <span className="text-orange-300 font-medium drop-shadow-lg">
          {template.name} - {template.description || '守望先锋模板'}
        </span>
      </div>
    </motion.div>
  );
};

// 弹幕容器组件
const DanmakuContainer = ({ enabled = true }: { enabled?: boolean }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDanmaku, setActiveDanmaku] = useState<any[]>([]);

  // 获取模板数据
  useEffect(() => {
    if (!enabled) return;
    
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/user-templates?limit=100&sortBy=likesCount&order=desc');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates || []);
        }
      } catch (error) {
        console.error('获取模板数据失败:', error);
      }
    };

    fetchTemplates();
  }, [enabled]);

  // 定时添加新弹幕
  useEffect(() => {
    if (!enabled || templates.length === 0) return;

    const interval = setInterval(() => {
      const template = templates[currentIndex % templates.length];
      const newDanmaku = {
        id: `${template.id}-${Date.now()}`,
        template,
        delay: 0,
        randomSeed: Math.random()
      };

      setActiveDanmaku(prev => [...prev, newDanmaku]);
      setCurrentIndex(prev => prev + 1);

      // 清理过期的弹幕
      setTimeout(() => {
        setActiveDanmaku(prev => prev.filter(d => d.id !== newDanmaku.id));
      }, 30000); // 30秒后清理
    }, 3000 + Math.random() * 2000); // 3-5秒间隔

    return () => clearInterval(interval);
  }, [enabled, templates, currentIndex]);

  // 当弹幕被禁用时，清空所有活跃弹幕
  useEffect(() => {
    if (!enabled) {
      setActiveDanmaku([]);
    }
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      <AnimatePresence>
        {activeDanmaku.map((danmaku) => (
          <DanmakuItem
            key={danmaku.id}
            template={danmaku.template}
            delay={danmaku.delay}
            randomSeed={danmaku.randomSeed}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function MemorialPage() {

  const [showIncense, setShowIncense] = useState(false);
  const [loading, setLoading] = useState(true);
  const [danmakuEnabled, setDanmakuEnabled] = useState(true);
  const [incenseStats, setIncenseStats] = useState({
    totalCount: 0,
    todayCount: 0,
    recentOfferings: [],
    projectStats: {
      totalTemplates: 0,
      totalUsers: 0,
      totalLikes: 0
    }
  });
  const [selectedOffering, setSelectedOffering] = useState('');
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [isOffering, setIsOffering] = useState(false);
  const [showIncenseAnimation, setShowIncenseAnimation] = useState(false);

  // 加载真实统计数据
  const loadStats = async () => {
    try {
      const incenseResponse = await fetch('/api/incense');
      
      if (incenseResponse.ok) {
        const incenseData = await incenseResponse.json();
        setIncenseStats({
          totalCount: incenseData.totalCount || 0,
          todayCount: incenseData.todayCount || 0,
          recentOfferings: incenseData.recentOfferings || [],
          projectStats: incenseData.projectStats || {
            totalTemplates: 0,
            totalUsers: 0,
            totalLikes: 0
          }
        });
      } else {
        console.error('Failed to load incense stats');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初始加载
    loadStats();
    
    // 设置定时器，每30秒更新一次数据
    const interval = setInterval(() => {
      loadStats();
    }, 30000);
    
    // 清理定时器
    return () => clearInterval(interval);
  }, []);

  // 守望先锋贡品选项
  const offerings = [
    { id: '能量饮料', name: '能量饮料', icon: BoltIcon, color: 'text-yellow-400' },
    { id: '治疗包', name: '治疗包', icon: HeartIcon, color: 'text-red-400' },
    { id: '护甲包', name: '护甲包', icon: ShieldCheckIcon, color: 'text-blue-400' },
    { id: '终极技能充能', name: '终极技能充能', icon: BoltIcon, color: 'text-purple-400' },
    { id: '传奇皮肤', name: '传奇皮肤', icon: SparklesIcon, color: 'text-orange-400' },
    { id: '金色武器', name: '金色武器', icon: TrophyIcon, color: 'text-yellow-500' },
    { id: '竞技点数', name: '竞技点数', icon: TagIcon, color: 'text-green-400' },
    { id: '守望币', name: '守望币', icon: CurrencyDollarIcon, color: 'text-cyan-400' },
    { id: '经验值加成', name: '经验值加成', icon: ChartBarIcon, color: 'text-indigo-400' }
  ];

  // 上香功能
  const handleOffering = async () => {
    if (!selectedOffering || isOffering) return;
    
    setIsOffering(true);
    try {
      const response = await fetch('/api/incense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ offering: selectedOffering })
      });
      
      if (response.ok) {
        const result = await response.json();
        setShowIncenseAnimation(true);
        setShowOfferingModal(false);
        setSelectedOffering('');
        
        // 重新加载上香统计
        const incenseResponse = await fetch('/api/incense');
        if (incenseResponse.ok) {
          const incenseData = await incenseResponse.json();
          setIncenseStats({
            totalCount: incenseData.totalCount || 0,
            todayCount: incenseData.todayCount || 0,
            recentOfferings: incenseData.recentOfferings || [],
            projectStats: incenseData.projectStats || {
              totalTemplates: 0,
              totalUsers: 0,
              totalLikes: 0
            }
          });
        }
        
        // 3秒后隐藏动画
        setTimeout(() => {
          setShowIncenseAnimation(false);
        }, 3000);
      } else {
        console.error('Failed to offer incense');
      }
    } catch (error) {
      console.error('Error offering incense:', error);
    } finally {
      setIsOffering(false);
    }
  };

  const handleIncense = () => {
    setShowIncense(true);
    setTimeout(() => setShowIncense(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* 浮动粒子效果 */}
      <FloatingParticles />
      
      {/* 弹幕容器 */}
      <DanmakuContainer enabled={danmakuEnabled} />
      
      {/* 弹幕控制按钮 */}
      <div className="fixed top-4 right-4 z-30">
        <button
          onClick={() => setDanmakuEnabled(!danmakuEnabled)}
          className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm border text-sm md:text-base ${
            danmakuEnabled 
              ? 'bg-orange-500/80 border-orange-400 text-white hover:bg-orange-600/80' 
              : 'bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-gray-600/80'
          }`}
        >
          <span className="hidden sm:inline">{danmakuEnabled ? '🎭 关闭弹幕' : '🎭 开启弹幕'}</span>
          <span className="sm:hidden">{danmakuEnabled ? '🎭' : '🎭'}</span>
        </button>
      </div>
      
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 标题区域 */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4 md:mb-6 px-4">
              守望先锋聊天编辑器
            </h1>
            <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-3 md:mb-4 px-4">
              纪念页面
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-3 md:mb-4 px-4">
              2025年8月6日，暴雪官方修复了"文字聊天的显示颜色有误的问题"，这意味着我们的聊天编辑器功能将无法继续使用。
            </p>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
              感谢所有用户的支持与陪伴。虽然编辑器功能已经结束，但我们共同创造的回忆将永远珍藏。
            </p>
            <p className="text-sm sm:text-base text-gray-500 mt-3 md:mt-4 px-4">
              项目运行时间：2025年7月25日 - 2025年8月6日
            </p>
          </div>
        </motion.div>

        {/* 数据统计区域 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12 px-4"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 md:p-6 text-center hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-400 mb-1 sm:mb-2">
              {loading ? '...' : <AnimatedNumber value={incenseStats.projectStats.totalTemplates} />}
            </div>
            <div className="text-gray-300 text-xs sm:text-sm md:text-base">社区模板</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 md:p-6 text-center hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-400 mb-1 sm:mb-2">
              {loading ? '...' : <AnimatedNumber value={incenseStats.projectStats.totalUsers} />}
            </div>
            <div className="text-gray-300 text-xs sm:text-sm md:text-base">用户数量</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 md:p-6 text-center hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400 mb-1 sm:mb-2">
              {loading ? '...' : <AnimatedNumber value={incenseStats.projectStats.totalLikes} />}
            </div>
            <div className="text-gray-300 text-xs sm:text-sm md:text-base">模板点赞</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 md:p-6 text-center hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-1 sm:mb-2">
              {loading ? '...' : <AnimatedNumber value={incenseStats.totalCount} />}
            </div>
            <div className="text-gray-300 text-xs sm:text-sm md:text-base">上香次数</div>
          </div>
        </motion.div>

        {/* 时间轴 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-8 md:mb-12 px-4"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 md:mb-8 text-gray-200">项目历程</h3>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="bg-gray-800/30 p-3 md:p-4 rounded-lg flex-1">
                  <div className="font-semibold text-green-400 text-sm md:text-base">2025年7月25日</div>
                  <div className="text-gray-300 text-sm md:text-base">第一期B站视频发布，开始开发聊天编辑器功能</div>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div className="bg-gray-800/30 p-3 md:p-4 rounded-lg flex-1">
                  <div className="font-semibold text-blue-400 text-sm md:text-base">2025年7月28日</div>
                  <div className="text-gray-300 text-sm md:text-base">添加社区模板功能，用户可以分享和使用模板</div>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-500 rounded-full flex-shrink-0"></div>
                <div className="bg-gray-800/30 p-3 md:p-4 rounded-lg flex-1">
                  <div className="font-semibold text-purple-400 text-sm md:text-base">2025年8月1日</div>
                  <div className="text-gray-300 text-sm md:text-base">优化用户体验，添加更多纹理和自定义选项</div>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <div className="bg-gray-800/30 p-3 md:p-4 rounded-lg flex-1">
                  <div className="font-semibold text-red-400 text-sm md:text-base">2025年8月6日</div>
                  <div className="text-gray-300 text-sm md:text-base">暴雪修复颜色显示bug，编辑器功能停止服务</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 上香统计区域 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-8 md:mb-12 px-4"
        >
          <div className="bg-gradient-to-r from-orange-900/30 to-purple-900/30 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 md:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 md:mb-6 text-orange-400">全球上香统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-orange-400 mb-1 md:mb-2">
                  {loading ? '...' : <AnimatedNumber value={incenseStats.totalCount} />}
                </div>
                <div className="text-gray-300 text-sm md:text-base">总上香次数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-1 md:mb-2">
                  {loading ? '...' : <AnimatedNumber value={incenseStats.todayCount} />}
                </div>
                <div className="text-gray-300 text-sm md:text-base">今日上香</div>
              </div>
            </div>
            
            {/* 最近上香动态 */}
             {incenseStats.recentOfferings.length > 0 && (
               <div className="text-center">
                 <div className="text-xs sm:text-sm text-gray-400 mb-2">最近贡品</div>
                 <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                   {incenseStats.recentOfferings.slice(0, 5).map((record: any, index: number) => {
                     const offering = offerings.find(o => o.id === record.offering);
                     return (
                       <span key={index} className="bg-gray-700/50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-gray-300">
                         {offering ? offering.name : record.offering}
                       </span>
                     );
                   })}
                 </div>
               </div>
             )}
          </div>
        </motion.div>

        {/* 上香区域 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-center mb-8 md:mb-12 px-4"
        >
          <button
            onClick={() => setShowOfferingModal(true)}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-3 md:mb-4 text-sm md:text-base"
          >
            献上贡品 · 为编辑器上香
          </button>
          
          <div className="text-xs sm:text-sm text-gray-400">
            选择守望先锋道具作为贡品，为编辑器祈福
          </div>
          
          {showIncenseAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="mt-6 p-4 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-xl border border-orange-500/30"
            >
              <div className="text-lg text-orange-300 font-semibold mb-2">
                贡品已献上 🙏
              </div>
              <div className="text-gray-300">
                愿编辑器在数字天堂安息，感谢您的祈福
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 仍然可用的功能 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mb-8 md:mb-12 px-4"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 md:mb-8 text-gray-200">好消息！这些功能仍然可用</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm border border-blue-600/50 rounded-xl p-4 md:p-6">
              <div className="text-center mb-3 md:mb-4">
                <h4 className="text-lg md:text-xl font-bold text-blue-300">守望先锋集卡市场</h4>
              </div>
              <a
                href="/overwatch-market"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-center text-sm md:text-base"
              >
                前往集卡市场
              </a>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-sm border border-green-600/50 rounded-xl p-4 md:p-6">
              <div className="text-center mb-3 md:mb-4">
                <h4 className="text-lg md:text-xl font-bold text-green-300">队友匹配系统</h4>
              </div>
              <a
                href="/teammate-matching"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-center text-sm md:text-base"
              >
                寻找队友
              </a>
            </div>
          </div>
        </motion.div>

        {/* 感谢信息 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-center bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-4 md:p-8 max-w-4xl mx-auto px-4"
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4 text-gray-200">特别感谢</h3>
          <div className="text-gray-300 leading-relaxed space-y-2 md:space-y-3 text-sm md:text-base">
            <p>
              感谢所有为项目贡献模板、提供反馈和支持的用户们。
            </p>
            <p>
              感谢守望先锋社区的热情参与，让这个项目充满了意义。
            </p>
            <p>
              虽然编辑器功能已经结束，但这段美好的回忆将永远保存在我们心中。
            </p>
            <p className="text-orange-400 font-semibold">
              别忘了试试我们的集卡市场和队友匹配功能！
            </p>
          </div>
        </motion.div>

        {/* 返回按钮 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="text-center mt-12"
        >
          <a
            href="/"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            返回首页
          </a>
        </motion.div>
      </div>

      {/* 贡品选择模态框 */}
      {showOfferingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gray-800 border border-orange-500/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-orange-400 mb-2">选择贡品</h3>
              <p className="text-gray-300">选择一件守望先锋道具作为贡品，为编辑器祈福</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {offerings.map((offering) => (
                <button
                  key={offering.id}
                  onClick={() => setSelectedOffering(offering.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    selectedOffering === offering.id
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-600 bg-gray-700/30 hover:border-orange-500/50'
                  }`}
                >
                  <div className="mb-2">
                     <offering.icon className="w-8 h-8 mx-auto" />
                   </div>
                  <div className={`font-semibold ${offering.color}`}>{offering.name}</div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowOfferingModal(false);
                  setSelectedOffering('');
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleOffering}
                disabled={!selectedOffering || isOffering}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  selectedOffering && !isOffering
                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isOffering ? '献上中...' : '献上贡品'}
              </button>
            </div>
          </motion.div>
         </div>
       )}

      {/* 上香成功动画 */}
      {showIncenseAnimation && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-r from-orange-500/90 to-purple-600/90 backdrop-blur-sm rounded-xl p-6 text-center border border-orange-500/50"
          >
            <div className="mb-2">
               <BoltIcon className="w-12 h-12 mx-auto text-orange-400" />
             </div>
            <div className="text-white font-bold text-xl mb-1">上香成功</div>
            <div className="text-orange-200">愿编辑器永远被铭记</div>
          </motion.div>
        </div>
       )}
     </div>
   );
};