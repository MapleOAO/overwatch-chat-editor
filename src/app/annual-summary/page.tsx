'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { AppreciationButton } from '@/components/AppreciationModal';
import {
  ChartBarIcon,
  UsersIcon,
  TrophyIcon,
  ClockIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  CalendarDaysIcon,
  UserIcon,
  InformationCircleIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  BoltIcon,
  CubeIcon,
  GlobeAltIcon,
  ChartPieIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,

  CameraIcon
} from '@heroicons/react/24/outline';

interface AnnualSummaryData {
  overview: {
    totalCardExchanges: number;
    activeUsers: number;
    successfulExchanges: number;
    activeExchanges: number;
    successRate: number;
  };
  exchangeModes: {
    ask: number;
    exchange: number;
    give: number;
    askPercentage: number;
    exchangePercentage: number;
    givePercentage: number;
  };
  popularCards: {
    mostRequestedCards: Array<{ cardId: number; count: number }>;
    mostExchangedCards: Array<{ cardId: number; count: number }>;
  };
  timeAnalysis: {
    dailyStats: Record<string, number>;
    averageLifespan: number;
    fastestExchange: number;
    oldestActiveCard: { cardId: number; daysActive: number } | null;
  };
  regionStats: {
    CN: number;
    APAC: number;
    EMEA: number;
    NA: number;
  };
  communityIndex: {
    giveCount: number;
    exchangeActivity: number;
    askSuccessRate: number;
  };
  personalStats?: {
    totalExchanges: number;
    successfulExchanges: number;
    successRate: number;
    modePreferences: {
      ask: number;
      exchange: number;
      give: number;
    };
    fastestExchange: {
      cardId: number;
      timeToComplete: number;
    } | null;
    participationDays: number;
    firstExchangeDate: string;
    lastExchangeDate: string;
    favoriteCards?: Array<{ cardId: number; count: number }>;
  } | null;
  lastUpdated: string;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}> = ({ title, value, subtitle, icon, color, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8, rotateX: 45 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      whileHover={{ 
        scale: 1.08, 
        y: -10,
        rotateY: 5,
        transition: { duration: 0.3, type: "spring", stiffness: 300 }
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.8, delay, type: "spring", stiffness: 100 }}
      className={`bg-gradient-to-br ${color} p-8 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-md cursor-pointer relative overflow-hidden group transform-gpu`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-500" />
      
      {/* 主要内容 */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            className="text-white/90 p-3 rounded-xl bg-white/10 backdrop-blur-sm"
            whileHover={{ 
              rotate: 360,
              scale: 1.1,
              transition: { duration: 0.6, type: "spring" }
            }}
            animate={{
              scale: [1, 1.05, 1],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {icon}
          </motion.div>
          <div className="text-right">
            <motion.div 
              className="text-4xl font-black text-white mb-1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: delay + 0.3, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
            >
              {value}
            </motion.div>
            {subtitle && (
              <motion.div 
                className="text-sm text-white/80 font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.5 }}
              >
                {subtitle}
              </motion.div>
            )}
          </div>
        </div>
        <motion.h3 
          className="text-white font-bold text-lg tracking-wide"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: delay + 0.4 }}
        >
          {title}
        </motion.h3>
      </div>
      
      {/* 底部装饰线 */}
      <motion.div 
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white/30 to-white/60"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1, delay: delay + 0.6 }}
      />
    </motion.div>
  );
};

const ProgressBar: React.FC<{
  label: string;
  value: number;
  maxValue: number;
  color: string;
  delay?: number;
}> = ({ label, value, maxValue, color, delay = 0 }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay }}
      className="mb-4 group cursor-pointer"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-300 text-sm group-hover:text-white transition-colors duration-200">{label}</span>
        <motion.span 
          className="text-white font-medium"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.1 }}
        >
          {value}
        </motion.span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
          className={`h-2 rounded-full ${color} relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const RegionChart: React.FC<{ regionStats: AnnualSummaryData['regionStats']; delay?: number }> = ({ regionStats, delay = 0 }) => {
  const total = Object.values(regionStats).reduce((sum, count) => sum + count, 0);
  const regions = [
    { name: '中国', key: 'CN', color: 'bg-red-500', count: regionStats.CN },
    { name: '亚太', key: 'APAC', color: 'bg-blue-500', count: regionStats.APAC },
    { name: '欧中非', key: 'EMEA', color: 'bg-green-500', count: regionStats.EMEA },
    { name: '北美', key: 'NA', color: 'bg-purple-500', count: regionStats.NA }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-800/50 p-6 rounded-xl border border-orange-500/20"
    >
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6 text-orange-400" />
        赛区分布
      </h3>
      <div className="space-y-4">
        {regions.map((region, index) => {
          const percentage = total > 0 ? (region.count / total) * 100 : 0;
          return (
            <motion.div 
              key={region.key} 
              className="flex items-center gap-4 group cursor-pointer"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: delay + 0.1 * index }}
              whileHover={{ 
                scale: 1.02,
                x: 5,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="w-16 text-gray-300 text-sm group-hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
              >
                {region.name}
              </motion.div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <motion.span 
                    className="text-white font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: delay + 0.2 + 0.1 * index }}
                  >
                    {region.count}
                  </motion.span>
                  <motion.span 
                    className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: delay + 0.3 + 0.1 * index }}
                  >
                    {percentage.toFixed(1)}%
                  </motion.span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0, opacity: 0.8 }}
                    animate={{ width: `${percentage}%`, opacity: 1 }}
                    transition={{ 
                      duration: 1.5, 
                      delay: delay + 0.1 * index,
                      ease: "easeOut"
                    }}
                    className={`h-2 rounded-full ${region.color} relative overflow-hidden shadow-lg`}
                    style={{
                      boxShadow: `0 0 10px ${region.color.includes('red') ? '#ef4444' : 
                                              region.color.includes('blue') ? '#3b82f6' : 
                                              region.color.includes('green') ? '#10b981' : '#a855f7'}40`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// 卡片ID到图片路径的映射函数
const getCardImagePath = (cardId: number): string => {
  if (cardId >= 1 && cardId <= 9) {
    return `/card/cn-${cardId}-c.png`;
  } else if (cardId >= 10 && cardId <= 15) {
    const naCardNum = cardId - 9;
    return `/card/na-${naCardNum}-c.png`;
  } else if (cardId >= 16 && cardId <= 21) {
    const apacCardNum = cardId - 15;
    return `/card/apac-${apacCardNum}-c.png`;
  } else if (cardId >= 22 && cardId <= 27) {
    const emeaCardNum = cardId - 21;
    return `/card/emea-${emeaCardNum}-c.png`;
  }
  return '/card/cn-2-c.png';
};

const getCardName = (cardId: number): string => {
  // 根据卡片ID返回卡片名称
  if (cardId >= 1 && cardId <= 9) return `CN-${cardId}`;
  if (cardId >= 10 && cardId <= 15) return `NA-${cardId - 9}`;
  if (cardId >= 16 && cardId <= 21) return `APAC-${cardId - 15}`;
  if (cardId >= 22 && cardId <= 27) return `EMEA-${cardId - 21}`;
  return `Card-${cardId}`;
};

const getCardRegion = (cardId: number): string => {
  if (cardId >= 1 && cardId <= 9) return '中国赛区';
  if (cardId >= 10 && cardId <= 15) return '北美赛区';
  if (cardId >= 16 && cardId <= 21) return '亚太赛区';
  if (cardId >= 22 && cardId <= 27) return '欧中非赛区';
  return '未知赛区';
};

// 获取用户IP地址（使用内部API）
  const getUserIP = async (): Promise<string | null> => {
    try {
      // 使用内部API获取IP，避免外部依赖
      const response = await fetch('/api/get-ip');
      if (response.ok) {
        const data = await response.json();
        return data.ip;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user IP:', error);
      return null;
    }
  };

const AnnualSummaryPage: React.FC = () => {
  const [data, setData] = useState<AnnualSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDouyinModal, setShowDouyinModal] = useState(false);
  const [showWechatModal, setShowWechatModal] = useState(false);
  const [showQQModal, setShowQQModal] = useState(false);
  const [battleTag, setBattleTag] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    totalExchanges: number;
    successfulExchanges: number;
    successRate: number;
    modePreferences: {
      ask: number;
      exchange: number;
      give: number;
    };
    participationDays: number;
    rank: number;
    firstExchange: string;
    lastExchange: string;
    favoriteCards?: Array<{ cardId: number; count: number }>;
    fastestExchange?: {
      cardId: number;
      timeToComplete: number;
    };
    battleTag?: string;
    activeDays?: number;
  } | { error: string } | null>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [queryMode, setQueryMode] = useState<'ip' | 'battletag'>('battletag');


  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取用户IP以获取个人数据
        const userIp = await getUserIP();
        const url = userIp 
          ? `/api/card-exchanges/annual-summary?userIp=${encodeURIComponent(userIp)}`
          : '/api/card-exchanges/annual-summary';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
        
        // 获取最活跃用户数据
        const activeUsersResponse = await fetch('/api/card-exchanges/active-users');
        if (activeUsersResponse.ok) {
          const activeUsersData = await activeUsersResponse.json();
          setActiveUsers(activeUsersData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const searchBattleTag = async () => {
    if (!battleTag.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/card-exchanges/user-stats?battleTag=${encodeURIComponent(battleTag)}`);
      if (response.ok) {
        const result = await response.json();
        setSearchResult(result);
      } else {
        setSearchResult({ error: '未找到该战网用户数据' });
      }
    } catch (err) {
      setSearchResult({ error: '查询失败，请稍后重试' });
    } finally {
      setSearchLoading(false);
    }
  };





  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/30 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">加载年终总结数据中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">加载失败: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
      <div className="container mx-auto px-4 py-8">

        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
            集卡市场活动结束总结
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            回顾整个集卡活动的精彩历程，见证社区的成长与活跃
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full border border-orange-500/30">
              <RocketLaunchIcon className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 text-sm font-medium">活动圆满结束</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
              <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">数据统计完成</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-sm">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>数据更新时间: {new Date(data.lastUpdated).toLocaleString('zh-CN')}</span>
          </div>
          <div className="flex justify-center mt-6">
            <AppreciationButton className="text-sm" />
          </div>
        </motion.div>

        {/* 核心数据概览 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              核心数据概览
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <StatCard
              title="总交换记录"
              value={data.overview.totalCardExchanges.toLocaleString()}
              subtitle="次交换"
              icon={<CubeIcon className="w-10 h-10" />}
              color="from-blue-500 via-blue-600 to-blue-800"
              delay={0.2}
            />
            <div className="relative">
                <StatCard
                  title="活跃用户"
                  value={data.overview.activeUsers.toLocaleString()}
                  subtitle="位玩家"
                  icon={<GlobeAltIcon className="w-10 h-10" />}
                  color="from-green-500 via-green-600 to-green-800"
                  delay={0.4}
                />
                <motion.div 
                  className="absolute top-3 right-3 flex items-center gap-1 text-xs text-gray-300 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  <InformationCircleIcon className="w-3 h-3" />
                  <span>基于IP统计</span>
                </motion.div>
              </div>
            <StatCard
              title="成功交换"
              value={data.overview.successfulExchanges.toLocaleString()}
              subtitle={`成功率 ${(Number(data.overview.successRate) || 0).toFixed(1)}%`}
              icon={<StarIcon className="w-10 h-10" />}
              color="from-purple-500 via-purple-600 to-purple-800"
              delay={0.6}
            />
            <StatCard
              title="平均交换时长"
              value={(() => {
                 const hours = Number(data.timeAnalysis.averageLifespan) || 0;
                 if (hours < 1) {
                   const minutes = hours * 60;
                   return `${minutes.toFixed(0)}分钟`;
                 } else if (hours < 24) {
                   return `${hours.toFixed(1)}小时`;
                 } else {
                   return `${(hours / 24).toFixed(1)}天`;
                 }
               })()}
              subtitle="从发布到完成"
              icon={<ClockIcon className="w-10 h-10" />}
              color="from-orange-500 via-orange-600 to-orange-800"
              delay={0.8}
            />
          </div>
        </motion.div>

        {/* 卡片展示区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 rounded-2xl border border-orange-500/30 mb-12 backdrop-blur-sm"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <CubeIcon className="w-8 h-8 text-orange-400" />
              精美卡片收藏展示
              <CubeIcon className="w-8 h-8 text-orange-400" />
            </h2>
            <p className="text-gray-300 text-lg">感谢您参与集卡活动，四大赛区精美卡片，记录美好回忆</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 中国赛区 */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <FireIcon className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-bold text-white">中国区域 (CN)</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cardNum, index) => (
                  <motion.div 
                    key={cardNum} 
                    className="relative group"
                    initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.7 + index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotateY: 10,
                      z: 50,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 border-red-500/30 group-hover:border-red-400 transition-all duration-300 shadow-lg group-hover:shadow-red-500/25">
                      <Image
                        src={`/card/cn-${cardNum}-c.png`}
                        alt={`CN-${cardNum}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 16vw, 12vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center pb-2">
                      <span className="text-white text-xs font-medium bg-red-500/80 px-2 py-1 rounded backdrop-blur-sm">CN-{cardNum}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="text-red-400 text-sm font-medium">9张卡片</div>
                <div className="flex items-center gap-1">
                  <SparklesIcon className="w-4 h-4 text-red-300" />
                  <span className="text-red-300 text-xs">收藏完整</span>
                </div>
              </div>
            </div>

            {/* 北美区域 */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <StarIcon className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">北美区域 (NA)</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6].map((cardNum, index) => (
                  <motion.div 
                    key={cardNum} 
                    className="relative group"
                    initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 1.6 + index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotateY: -10,
                      z: 50,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 border-blue-500/30 group-hover:border-blue-400 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/25">
                      <Image
                        src={`/card/na-${cardNum}-c.png`}
                        alt={`NA-${cardNum}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 16vw, 12vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center pb-2">
                      <span className="text-white text-xs font-medium bg-blue-500/80 px-2 py-1 rounded backdrop-blur-sm">NA-{cardNum}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="text-blue-400 text-sm font-medium">6张卡片</div>
                <div className="flex items-center gap-1">
                  <SparklesIcon className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-300 text-xs">精美收藏</span>
                </div>
              </div>
            </div>

            {/* 亚太区域 */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BoltIcon className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">亚太区域 (APAC)</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6].map((cardNum, index) => (
                  <motion.div 
                    key={cardNum} 
                    className="relative group"
                    initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 2.2 + index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotateX: 10,
                      z: 50,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 border-green-500/30 group-hover:border-green-400 transition-all duration-300 shadow-lg group-hover:shadow-green-500/25">
                      <Image
                        src={`/card/apac-${cardNum}-c.png`}
                        alt={`APAC-${cardNum}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 16vw, 12vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center pb-2">
                      <span className="text-white text-xs font-medium bg-green-500/80 px-2 py-1 rounded backdrop-blur-sm">APAC-{cardNum}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="text-green-400 text-sm font-medium">6张卡片</div>
                <div className="flex items-center gap-1">
                  <SparklesIcon className="w-4 h-4 text-green-300" />
                  <span className="text-green-300 text-xs">珍贵纪念</span>
                </div>
              </div>
            </div>

            {/* 欧中非区域 */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <HeartIcon className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">欧中非区域 (EMEA)</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6].map((cardNum, index) => (
                  <motion.div 
                    key={cardNum} 
                    className="relative group"
                    initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 2.8 + index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotateX: -10,
                      z: 50,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 border-purple-500/30 group-hover:border-purple-400 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/25">
                      <Image
                        src={`/card/emea-${cardNum}-c.png`}
                        alt={`EMEA-${cardNum}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 16vw, 12vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center pb-2">
                      <span className="text-white text-xs font-medium bg-purple-500/80 px-2 py-1 rounded backdrop-blur-sm">EMEA-{cardNum}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="text-purple-400 text-sm font-medium">6张卡片</div>
                <div className="flex items-center gap-1">
                  <SparklesIcon className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-300 text-xs">特别收藏</span>
                </div>
              </div>
            </div>
          </div>
          
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 3.5 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full border border-orange-500/30"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 20px rgba(249, 115, 22, 0.3)",
                transition: { duration: 0.2 }
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <TrophyIcon className="w-5 h-5 text-orange-400" />
              </motion.div>
              <span className="text-orange-300 font-medium">共计 27 张精美卡片</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 交换模式分析 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 rounded-2xl border border-orange-500/30 mb-12 backdrop-blur-sm relative overflow-hidden"
        >
          {/* 装饰性背景元素 */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <ChartPieIcon className="w-8 h-8 text-orange-400" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                交换模式分析
              </h2>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChartBarIcon className="w-8 h-8 text-blue-400" />
              </motion.div>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                探索不同交换模式的使用情况，了解社区的交换偏好与习惯
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">模式分布</h3>
              <ProgressBar
                label="求卡模式 (Ask)"
                value={data.exchangeModes.ask}
                maxValue={data.overview.totalCardExchanges}
                color="bg-gradient-to-r from-red-500 to-red-600"
                delay={0.1}
              />
              <ProgressBar
                label="换卡模式 (Exchange)"
                value={data.exchangeModes.exchange}
                maxValue={data.overview.totalCardExchanges}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                delay={0.2}
              />
              <ProgressBar
                label="送卡模式 (Give)"
                value={data.exchangeModes.give}
                maxValue={data.overview.totalCardExchanges}
                color="bg-gradient-to-r from-green-500 to-green-600"
                delay={0.3}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">占比统计</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">求卡占比</span>
                  <span className="text-red-400 font-bold">{(Number(data.exchangeModes.askPercentage) || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">换卡占比</span>
                  <span className="text-blue-400 font-bold">{(Number(data.exchangeModes.exchangePercentage) || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">送卡占比</span>
                  <span className="text-green-400 font-bold">{(Number(data.exchangeModes.givePercentage) || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 卡片热度排行和赛区分布 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* 热门卡片排行 - 在大屏幕上占2列 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="xl:col-span-2 bg-gray-800/50 p-6 rounded-xl border border-orange-500/20"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FireIcon className="w-6 h-6 text-orange-400" />
              热门卡片排行
            </h3>
            {/* 在大屏幕上使用两列布局 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <HeartIcon className="w-5 h-5 text-red-400" />
                  最受欢迎求卡
                </h4>
                <div className="space-y-3">
                  {data.popularCards.mostRequestedCards.slice(0, 8).map((card, index) => (
                    <div key={card.cardId} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="relative w-10 h-14 flex-shrink-0">
                        <Image
                          src={getCardImagePath(card.cardId)}
                          alt={getCardName(card.cardId)}
                          fill
                          className="object-cover rounded"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{getCardName(card.cardId)}</div>
                        <div className="text-gray-400 text-sm">{getCardRegion(card.cardId)}</div>
                      </div>
                      <div className="text-orange-400 font-bold text-lg">{card.count}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BoltIcon className="w-5 h-5 text-blue-400" />
                  最热门交换卡
                </h4>
                <div className="space-y-3">
                  {data.popularCards.mostExchangedCards.slice(0, 8).map((card, index) => (
                    <div key={card.cardId} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="relative w-10 h-14 flex-shrink-0">
                        <Image
                          src={getCardImagePath(card.cardId)}
                          alt={getCardName(card.cardId)}
                          fill
                          className="object-cover rounded"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{getCardName(card.cardId)}</div>
                        <div className="text-gray-400 text-sm">{getCardRegion(card.cardId)}</div>
                      </div>
                      <div className="text-blue-400 font-bold text-lg">{card.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 赛区分布 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="relative bg-gray-800/50 p-6 rounded-xl border border-blue-500/20 h-fit"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <GlobeAltIcon className="w-6 h-6 text-blue-400" />
              区域分布
            </h3>
            <RegionChart regionStats={data.regionStats} delay={0.7} />
            <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-400 bg-gray-800/80 px-2 py-1 rounded">
              <InformationCircleIcon className="w-3 h-3" />
              <span>基于IP推测</span>
            </div>
          </motion.div>
        </div>

        {/* 活跃用户排名和社区指数 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 活跃用户排名 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-gradient-to-br from-indigo-800/60 to-purple-900/60 p-6 rounded-xl border border-indigo-500/30 backdrop-blur-sm relative overflow-hidden"
          >
            {/* 装饰性背景元素 */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-xl"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <TrophyIcon className="w-7 h-7 text-indigo-400" />
                </motion.div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  活跃用户排名
                </h3>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </div>
            </div>
            
            {activeUsers.length > 0 ? (
              <div className="space-y-3">
                {activeUsers.slice(0, 5).map((user, index) => (
                  <motion.div
                    key={user.battleTag || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-indigo-600/30 rounded-lg border border-indigo-400/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-orange-600 text-orange-100' :
                        'bg-indigo-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.battleTag || `用户${index + 1}`}
                        </div>
                        <div className="text-indigo-300 text-sm">
                          {user.totalExchanges} 次交换
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-indigo-400 text-xs">
                        活跃 {user.activeDays || 0} 天
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-indigo-300">
                <UsersIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无活跃用户数据</p>
              </div>
            )}
          </motion.div>

          {/* 社区互助指数 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-gray-800/50 p-6 rounded-xl border border-pink-500/20"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <HeartIcon className="w-6 h-6 text-pink-400" />
              社区互助指数
            </h3>
            
            <div className="space-y-4">
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="p-4 bg-gradient-to-r from-green-700/30 to-green-800/30 rounded-lg border border-green-500/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-lg"></div>
                <div className="relative flex items-center gap-3">
                  <GiftIcon className="w-6 h-6 text-green-400" />
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm mb-1">赠送卡片数量</div>
                    <div className="text-2xl font-bold text-green-400">{data.communityIndex.giveCount}</div>
                    <div className="text-sm text-gray-400">体现社区互助精神</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="p-4 bg-gradient-to-r from-blue-700/30 to-blue-800/30 rounded-lg border border-blue-500/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-lg"></div>
                <div className="relative flex items-center gap-3">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-blue-400" />
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm mb-1">互换活跃度</div>
                    <div className="text-2xl font-bold text-blue-400">{data.communityIndex.exchangeActivity}</div>
                    <div className="text-sm text-gray-400">交易活跃程度</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="p-4 bg-gradient-to-r from-purple-700/30 to-purple-800/30 rounded-lg border border-purple-500/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-lg"></div>
                <div className="relative flex items-center gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm mb-1">求助响应率</div>
                    <div className="text-2xl font-bold text-purple-400">{(Number(data.communityIndex.askSuccessRate) || 0).toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">社区响应度</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>



        {/* 个人数据统计 */}
        <motion.div
          id="personal-achievements"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="bg-gradient-to-br from-cyan-800/50 to-teal-900/50 p-6 rounded-xl border border-cyan-500/20 mb-12"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
              <AcademicCapIcon className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400" />
              个人成就查询
            </h2>
          </div>
          
          {/* 查询方式切换 */}
          <div className="mb-4 sm:mb-6">
            <div className="flex bg-cyan-800/30 rounded-lg p-1 w-full sm:w-fit mx-auto">
              <button
                onClick={() => setQueryMode('ip')}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  queryMode === 'ip'
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'text-cyan-300 hover:text-white hover:bg-cyan-700/50'
                }`}
              >
                <GlobeAltIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">IP地址查询</span>
                <span className="sm:hidden">IP查询</span>
              </button>
              <button
                onClick={() => setQueryMode('battletag')}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  queryMode === 'battletag'
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'text-cyan-300 hover:text-white hover:bg-cyan-700/50'
                }`}
              >
                <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">战网ID查询</span>
                <span className="sm:hidden">战网ID</span>
              </button>
            </div>
          </div>
          
          {/* 战网ID查询输入框 */}
          {queryMode === 'battletag' && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-cyan-700/30 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                战网ID查询
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-cyan-300 text-xs sm:text-sm mb-2">
                    输入战网ID（例如：Ddalao#5220）
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={battleTag}
                      onChange={(e) => setBattleTag(e.target.value)}
                      placeholder="请输入完整的战网ID"
                      className="flex-1 px-3 sm:px-4 py-2 bg-cyan-600/30 border border-cyan-400/30 rounded-lg text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm sm:text-base"
                      onKeyPress={(e) => e.key === 'Enter' && searchBattleTag()}
                    />
                    <button
                      onClick={searchBattleTag}
                      disabled={searchLoading || !battleTag.trim()}
                      className="px-4 sm:px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                    >
                      {searchLoading ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      查询
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 显示查询结果 */}
          {queryMode === 'battletag' ? (
            /* 战网ID查询模式 */
            searchResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {'error' in searchResult ? (
                  <div className="text-red-400 text-center py-8">
                    <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg">{'error' in searchResult ? searchResult.error : ''}</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {'battleTag' in searchResult ? searchResult.battleTag : ''} 的个人成就
                      </h3>
                      
                      {/* 称号系统 */}
                      <div className="mb-4 px-2 sm:px-0">
                        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                          {/* 主要称号 */}
                          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
                            <StarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
                            <span className="text-yellow-300 font-medium text-xs sm:text-sm whitespace-nowrap">
                              {'error' in searchResult ? '新手交换者' : (
                                (searchResult.totalExchanges || 0) >= 100 ? '传奇交换大师' :
                                (searchResult.totalExchanges || 0) >= 50 ? '资深交换专家' :
                                (searchResult.totalExchanges || 0) >= 20 ? '活跃交换者' :
                                (searchResult.totalExchanges || 0) >= 5 ? '初级交换者' :
                                '新手交换者'
                              )}
                            </span>
                          </div>
                          
                          {/* 成功率称号 */}
                          {'error' in searchResult ? null : (searchResult.successRate || 0) >= 90 && (
                            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
                              <TrophyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                              <span className="text-green-300 font-medium text-xs sm:text-sm whitespace-nowrap">交换达人</span>
                            </div>
                          )}
                          
                          {/* 活跃度称号 */}
                          {'error' in searchResult ? null : (searchResult.activeDays || 0) >= 30 && (
                            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30">
                              <FireIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                              <span className="text-blue-300 font-medium text-xs sm:text-sm whitespace-nowrap">活跃玩家</span>
                            </div>
                          )}
                          
                          {/* 慷慨称号 */}
                           {'error' in searchResult ? null : (searchResult.modePreferences?.give || 0) >= 10 && (
                             <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full border border-pink-500/30">
                               <HeartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400 flex-shrink-0" />
                               <span className="text-pink-300 font-medium text-xs sm:text-sm whitespace-nowrap">慷慨之心</span>
                             </div>
                           )}
                           
                           {/* 排名称号 */}
                           {'error' in searchResult ? null : (searchResult.rank || 0) <= 10 && (searchResult.rank || 0) > 0 && (
                             <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full border border-purple-500/30">
                               <RocketLaunchIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                               <span className="text-purple-300 font-medium text-xs sm:text-sm whitespace-nowrap">顶级玩家</span>
                             </div>
                           )}
                           
                           {/* 快速交换称号 */}
                           {'error' in searchResult ? null : searchResult.fastestExchange && (
                             <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30">
                               <BoltIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
                               <span className="text-orange-300 font-medium text-xs sm:text-sm whitespace-nowrap">闪电交换</span>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <div className="text-cyan-300 text-sm">
                        基于战网ID的精确统计
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 px-2 sm:px-0">
                      <div className="bg-cyan-700/30 p-3 sm:p-4 rounded-lg">
                        <div className="text-cyan-300 text-xs sm:text-sm mb-1">总交换次数</div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{'error' in searchResult ? 0 : (searchResult.totalExchanges || 0)}</div>
                      </div>
                      <div className="bg-cyan-700/30 p-3 sm:p-4 rounded-lg">
                        <div className="text-cyan-300 text-xs sm:text-sm mb-1">成功交换次数</div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-400">{'error' in searchResult ? 0 : (searchResult.successfulExchanges || 0)}</div>
                      </div>
                      <div className="bg-cyan-700/30 p-3 sm:p-4 rounded-lg">
                        <div className="text-cyan-300 text-xs sm:text-sm mb-1">交换成功率</div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">{'error' in searchResult ? '0' : ((Number(searchResult.successRate) || 0).toFixed(1))}%</div>
                      </div>
                      <div className="bg-cyan-700/30 p-3 sm:p-4 rounded-lg">
                        <div className="text-cyan-300 text-xs sm:text-sm mb-1">活跃天数</div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-400">{'error' in searchResult ? 0 : (searchResult.activeDays || 0)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
                      {/* 交换模式偏好 */}
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">交换模式偏好</h3>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center p-2.5 sm:p-3 bg-cyan-700/20 rounded-lg">
                            <span className="text-cyan-300 text-sm sm:text-base">求卡模式</span>
                            <span className="text-red-400 font-bold text-sm sm:text-base">{'error' in searchResult ? 0 : (searchResult.modePreferences?.ask || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2.5 sm:p-3 bg-cyan-700/20 rounded-lg">
                            <span className="text-cyan-300 text-sm sm:text-base">换卡模式</span>
                            <span className="text-blue-400 font-bold text-sm sm:text-base">{'error' in searchResult ? 0 : (searchResult.modePreferences?.exchange || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2.5 sm:p-3 bg-cyan-700/20 rounded-lg">
                            <span className="text-cyan-300 text-sm sm:text-base">送卡模式</span>
                            <span className="text-green-400 font-bold text-sm sm:text-base">{'error' in searchResult ? 0 : (searchResult.modePreferences?.give || 0)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 活跃排名 */}
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">社区排名</h3>
                        <div className="p-3 sm:p-4 bg-cyan-700/20 rounded-lg text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">
                            #{'error' in searchResult ? 'N/A' : (searchResult.rank || 'N/A')}
                          </div>
                          <div className="text-cyan-300 text-sm sm:text-base">活跃排名</div>
                          <div className="text-xs sm:text-sm text-cyan-400 mt-1 sm:mt-2">
                            在所有用户中的排名
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 最常用卡片展示 */}
                    {'error' in searchResult ? false : (searchResult.favoriteCards && searchResult.favoriteCards.length > 0) && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-white mb-4">最常交换的卡片</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-0">
                          {('error' in searchResult ? [] : searchResult.favoriteCards || []).map((card: any, index: number) => (
                            <div key={card.cardId} className="bg-cyan-700/20 rounded-lg p-3 sm:p-4 text-center">
                              <div className="relative w-16 h-20 sm:w-20 sm:h-24 mx-auto mb-2 sm:mb-3">
                                <Image
                                  src={getCardImagePath(card.cardId)}
                                  alt={getCardName(card.cardId)}
                                  fill
                                  className="object-contain rounded-lg"
                                  sizes="(max-width: 640px) 64px, 80px"
                                />
                              </div>
                              <div className="text-white font-medium text-xs sm:text-sm mb-1">
                                {getCardName(card.cardId)}
                              </div>
                              <div className="text-cyan-300 text-xs mb-1">
                                {getCardRegion(card.cardId)}
                              </div>
                              <div className="text-cyan-400 font-bold text-xs sm:text-sm">
                                {card.count} 次
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 最快完成交换 */}
                    {'error' in searchResult ? false : searchResult.fastestExchange && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-white mb-4">最快完成交换</h3>
                        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-24 flex-shrink-0">
                              <Image
                                src={getCardImagePath('error' in searchResult ? 0 : searchResult.fastestExchange?.cardId || 0)}
                                alt={getCardName('error' in searchResult ? 0 : searchResult.fastestExchange?.cardId || 0)}
                                fill
                                className="object-contain rounded-lg"
                                sizes="80px"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1">
                                {getCardName('error' in searchResult ? 0 : searchResult.fastestExchange?.cardId || 0)}
                              </div>
                              <div className="text-yellow-300 text-sm mb-1">
                                {getCardRegion('error' in searchResult ? 0 : searchResult.fastestExchange?.cardId || 0)}
                              </div>
                              <div className="text-orange-400 font-bold">
                                {'error' in searchResult ? '0' : ((Number(searchResult.fastestExchange?.timeToComplete) || 0).toFixed(1))} 小时完成
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {'error' in searchResult ? false : (searchResult.firstExchange && searchResult.lastExchange) && (
                      <div className="mt-6 p-4 bg-cyan-700/20 rounded-lg">
                        <div className="text-cyan-300 text-sm mb-2">参与时间</div>
                        <div className="text-white">
                          从 {new Date('error' in searchResult ? '' : searchResult.firstExchange || '').toLocaleDateString('zh-CN')} 
                          到 {new Date('error' in searchResult ? '' : searchResult.lastExchange || '').toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-8 text-cyan-300">
                <UserIcon className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg">请输入战网ID查询您的个人成就</p>
              </div>
            )
          ) : (
            /* IP查询模式 */
            data.personalStats ? (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    您的个人成就
                  </h3>
                  
                  {/* 称号系统 */}
                   <div className="mb-4">
                     <div className="flex flex-wrap justify-center gap-2">
                       {/* 主要称号 */}
                       <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
                         <StarIcon className="w-4 h-4 text-yellow-400" />
                         <span className="text-yellow-300 font-medium text-sm">
                           {(data.personalStats?.totalExchanges || 0) >= 100 ? '传奇交换大师' :
                            (data.personalStats?.totalExchanges || 0) >= 50 ? '资深交换专家' :
                            (data.personalStats?.totalExchanges || 0) >= 20 ? '活跃交换者' :
                            (data.personalStats?.totalExchanges || 0) >= 5 ? '初级交换者' :
                            '新手交换者'}
                         </span>
                       </div>
                       
                       {/* 成功率称号 */}
                       {(data.personalStats?.successRate || 0) >= 90 && (
                         <div className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
                           <TrophyIcon className="w-4 h-4 text-green-400" />
                           <span className="text-green-300 font-medium text-sm">交换达人</span>
                         </div>
                       )}
                       
                       {/* 活跃度称号 */}
                       {(data.personalStats?.participationDays || 0) >= 30 && (
                         <div className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30">
                           <FireIcon className="w-4 h-4 text-blue-400" />
                           <span className="text-blue-300 font-medium text-sm">活跃玩家</span>
                         </div>
                       )}
                       
                       {/* 慷慨称号 */}
                        {(data.personalStats?.modePreferences?.give || 0) >= 10 && (
                          <div className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full border border-pink-500/30">
                            <HeartIcon className="w-4 h-4 text-pink-400" />
                            <span className="text-pink-300 font-medium text-sm">慷慨之心</span>
                          </div>
                        )}
                        
                        {/* 快速交换称号 */}
                        {data.personalStats?.fastestExchange && (
                          <div className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30">
                            <BoltIcon className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-300 font-medium text-sm">闪电交换</span>
                          </div>
                        )}
                     </div>
                   </div>
                  
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
                    <InformationCircleIcon className="w-4 h-4" />
                    <span>基于IP地址统计，可能不完全准确</span>
                  </div>
                </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-cyan-700/30 p-3 sm:p-4 rounded-lg">
                <div className="text-cyan-300 text-xs sm:text-sm mb-1">发布交换次数</div>
                <div className="text-xl sm:text-2xl font-bold text-white">{data.personalStats.totalExchanges}</div>
              </div>
              <div className="bg-cyan-700/30 p-3 sm:p-4 rounded-lg">
                <div className="text-cyan-300 text-xs sm:text-sm mb-1">成功交换次数</div>
                <div className="text-xl sm:text-2xl font-bold text-green-400">{data.personalStats.successfulExchanges}</div>
              </div>
              <div className="bg-cyan-700/30 p-3 sm:p-4 rounded-lg">
                <div className="text-cyan-300 text-xs sm:text-sm mb-1">交换成功率</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-400">{(Number(data.personalStats.successRate) || 0).toFixed(1)}%</div>
              </div>
              <div className="bg-cyan-700/30 p-3 sm:p-4 rounded-lg">
                <div className="text-cyan-300 text-xs sm:text-sm mb-1">参与天数</div>
                <div className="text-xl sm:text-2xl font-bold text-orange-400">{data.personalStats.participationDays}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* 交换模式偏好 */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">交换模式偏好</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-cyan-700/20 rounded-lg">
                    <span className="text-cyan-300 text-sm sm:text-base">求卡模式</span>
                    <span className="text-red-400 font-bold text-sm sm:text-base">{data.personalStats.modePreferences.ask}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-cyan-700/20 rounded-lg">
                    <span className="text-cyan-300 text-sm sm:text-base">换卡模式</span>
                    <span className="text-blue-400 font-bold text-sm sm:text-base">{data.personalStats.modePreferences.exchange}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-cyan-700/20 rounded-lg">
                    <span className="text-cyan-300 text-sm sm:text-base">送卡模式</span>
                    <span className="text-green-400 font-bold text-sm sm:text-base">{data.personalStats.modePreferences.give}</span>
                  </div>
                </div>
              </div>

              {/* 最受欢迎卡片 */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">最受欢迎的卡片</h3>
                {data.personalStats.fastestExchange ? (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-cyan-700/20 rounded-lg">
                    <div className="relative w-12 h-16 sm:w-16 sm:h-20 flex-shrink-0">
                      <Image
                        src={getCardImagePath(data.personalStats.fastestExchange.cardId)}
                        alt={getCardName(data.personalStats.fastestExchange.cardId)}
                        fill
                        className="object-cover rounded"
                        sizes="(max-width: 640px) 48px, 64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-bold text-sm sm:text-lg truncate">{getCardName(data.personalStats.fastestExchange.cardId)}</div>
                      <div className="text-cyan-300 text-xs sm:text-sm">{getCardRegion(data.personalStats.fastestExchange.cardId)}</div>
                      <div className="text-green-400 text-xs sm:text-sm mt-1">
                        最快成交: {(Number(data.personalStats.fastestExchange.timeToComplete) || 0).toFixed(1)} 小时
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 bg-cyan-700/20 rounded-lg text-center text-cyan-300 text-sm sm:text-base">
                    暂无成功交换记录
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-cyan-700/20 rounded-lg">
              <div className="text-cyan-300 text-xs sm:text-sm mb-2">参与时间</div>
              <div className="text-white text-sm sm:text-base">
                从 {new Date(data.personalStats.firstExchangeDate).toLocaleDateString('zh-CN')} 
                到 {new Date(data.personalStats.lastExchangeDate).toLocaleDateString('zh-CN')}
              </div>
            </div>
            </>
             ) : (
               <div className="text-center py-8 text-cyan-300">
                 <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
                 <p className="text-lg">请使用战网ID查询功能获取您的个人成就</p>
               </div>
             )
           )}
        </motion.div>

        {/* IP查询说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="bg-blue-800/30 p-4 rounded-lg border border-blue-500/20 mb-8"
        >
          <div className="flex items-center gap-2 text-blue-300 mb-2">
            <InformationCircleIcon className="w-5 h-5" />
            <span className="font-medium">数据说明</span>
          </div>
          <p className="text-blue-200 text-sm">
            本页面中标注"基于IP地址统计"的数据可能不完全准确，因为IP地址可能会发生变化，或多个用户共享同一IP地址。
            个人数据统计仅供参考，实际参与情况可能与显示数据有所差异。
          </p>
        </motion.div>

          <div className="text-center">
            {/* Coming Soon 部分 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="bg-gradient-to-br from-blue-800/50 to-indigo-900/50 p-6 rounded-xl border border-blue-500/30 backdrop-blur-sm mb-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block"
                >
                  <RocketLaunchIcon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
                <p className="text-blue-200 text-lg">小鱿小屋正在开发中</p>
                <p className="text-blue-300 text-sm mt-2">可以关注以下渠道获得最新消息</p>
              </div>
              
              {/* 社交媒体渠道 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* 抖音 */}
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 p-4 rounded-lg text-center cursor-pointer backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300"
                    onClick={() => setShowDouyinModal(true)}
                  >
                    <img 
                      src="https://ts2.tc.mm.bing.net/th/id/ODF.6ZkCjv2hR5s6SR35yaulqQ?w=32&h=32&qlt=90&pcl=fffffc&o=6&cb=thwsc4&pid=1.2" 
                      alt="抖音" 
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <span className="text-white text-sm">抖音</span>
                  </motion.div>
                </div>
                
                {/* B站 */}
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 p-4 rounded-lg text-center cursor-pointer backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300"
                    onClick={() => window.open('https://space.bilibili.com/73687595', '_blank')}
                  >
                    <img 
                      src="https://ts3.tc.mm.bing.net/th/id/ODF.HcIfqnk4n-lbffGcaqDC2w?w=32&h=32&qlt=90&pcl=fffffc&o=6&cb=thwsc4&pid=1.2" 
                      alt="B站" 
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <span className="text-white text-sm">B站</span>
                  </motion.div>
                </div>
                
                {/* 小红书 */}
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 p-4 rounded-lg text-center cursor-pointer backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300"
                    onClick={() => window.open('https://www.xiaohongshu.com/user/profile/6288799e00000000210272bb', '_blank')}
                  >
                    <img 
                      src="https://ts2.tc.mm.bing.net/th/id/ODF.uBc5FfhX8MukVL5zLsgKqg?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=thwsc4&pid=1.2" 
                      alt="小红书" 
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <span className="text-white text-sm">小红书</span>
                  </motion.div>
                </div>
                
                {/* 微信公众号 */}
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 p-4 rounded-lg text-center cursor-pointer backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300"
                    onClick={() => setShowWechatModal(true)}
                  >
                    <img 
                      src="https://ts4.tc.mm.bing.net/th/id/ODF.BvtHqZTl6qLypPDIASUGoA?w=32&h=32&qlt=90&pcl=fffffc&o=6&cb=thwsc4&pid=1.2" 
                      alt="微信公众号" 
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <span className="text-white text-sm">公众号</span>
                  </motion.div>
                </div>
                
                {/* 小黑盒 */}
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 p-4 rounded-lg text-center cursor-pointer backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300"
                    onClick={() => window.open('https://www.xiaoheihe.cn/app/user/profile/12719745', '_blank')}
                  >
                    <img 
                      src="https://ts1.tc.mm.bing.net/th/id/ODF.-e8TA2f-r4l__4eFK-hcbw?w=32&h=32&qlt=90&pcl=fffffc&o=6&cb=thwsc4&pid=1.2" 
                      alt="小黑盒" 
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <span className="text-white text-sm">小黑盒</span>
                  </motion.div>
                </div>
                
                {/* QQ群 */}
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 p-4 rounded-lg text-center cursor-pointer backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300"
                    onClick={() => setShowQQModal(true)}
                  >
                    <img 
                      src="https://ts1.tc.mm.bing.net/th/id/ODF.Tx8WuaEJFWt2hYkWzzIdiw?w=32&h=32&qlt=90&pcl=fffffa&o=6&cb=thwsc4&pid=1.2" 
                      alt="QQ群" 
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <span className="text-white text-sm">QQ群</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="text-center"
        >
          <button
            onClick={() => window.history.back()}
            className="px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-orange-500/25 flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <ArrowTrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">返回集卡市场</span>
            <span className="sm:hidden">返回</span>
          </button>
        </motion.div>
      </div>
      
      {/* 模态框 */}
      {/* 抖音模态框 */}
      {showDouyinModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowDouyinModal(false)}>
          <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">关注抖音获取最新消息</h3>
              <img src="/ad/抖音.jpg" alt="抖音二维码" className="mx-auto mb-3 sm:mb-4 max-w-full h-auto" />
              <button 
                onClick={() => setShowDouyinModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 微信公众号模态框 */}
      {showWechatModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowWechatModal(false)}>
          <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">关注微信公众号获取最新消息</h3>
              <img src="/ad/公众号.jpg" alt="微信公众号二维码" className="mx-auto mb-3 sm:mb-4 max-w-full h-auto" />
              <button 
                onClick={() => setShowWechatModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* QQ群模态框 */}
      {showQQModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowQQModal(false)}>
          <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">加入QQ群获取最新消息</h3>
              <img src="/ad/q群.jpg" alt="QQ群二维码" className="mx-auto mb-3 sm:mb-4 max-w-full h-auto" />
              <button 
                onClick={() => setShowQQModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualSummaryPage;