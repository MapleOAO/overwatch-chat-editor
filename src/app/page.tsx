'use client';

import { useRouter } from 'next/navigation';
import ChatEditor from '@/components/ChatEditor';

export default function Home() {
  const router = useRouter();

  const handleGoToMemorial = () => {
    router.push('/memorial');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 停止服务横幅 */}
      <div className="bg-red-500/90 text-white p-4 text-center relative">
        <div className="flex items-center justify-center gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <span className="font-bold">服务已停止</span>
            <span className="mx-2">|</span>
            <span>守望先锋聊天编辑器已于 2025年8月6日 正式停止服务</span>
          </div>
          <button
            onClick={handleGoToMemorial}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            前往纪念页面
          </button>
        </div>
      </div>
      
      {/* 聊天编辑器 */}
      <ChatEditor />
    </div>
  );
}
