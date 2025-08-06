'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  const handleGoToMemorial = () => {
    router.push('/memorial');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-center max-w-2xl mx-auto"
      >
        {/* 停止服务通知 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-8 mb-8 backdrop-blur-sm"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold text-red-400 mb-4">服务已停止</h1>
          <p className="text-xl text-gray-300 mb-6">
            守望先锋聊天编辑器已于 2025年8月6日 正式停止服务
          </p>
          <p className="text-lg text-gray-400 mb-8">
            感谢您一直以来的支持与陪伴，所有功能已迁移至纪念页面
          </p>
        </motion.div>

        {/* 跳转按钮 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onClick={handleGoToMemorial}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          前往纪念页面 →
        </motion.button>

        {/* 项目信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-gray-500 text-sm"
        >
          <p>项目运行时间：2025年7月25日 - 2025年8月6日</p>
          <p className="mt-2">感谢所有用户的支持与贡献</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
