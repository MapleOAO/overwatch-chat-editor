'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { getTextureName } from '@/data/textureNames';
import { getTextureCategory } from '@/data/textureCategories';
import TextureContributionForm from './TextureContributionForm';

// 添加自定义样式
const customStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(249, 115, 22, 0.5) rgba(55, 65, 81, 0.3);
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(55, 65, 81, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(249, 115, 22, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(249, 115, 22, 0.7);
  }
`;

// 注入样式到文档头部
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  if (!document.head.querySelector('style[data-texture-selector]')) {
    styleElement.setAttribute('data-texture-selector', 'true');
    document.head.appendChild(styleElement);
  }
}

interface Texture {
  id: string;
  fileName: string;
  imagePath: string;
  txCode: string;
  name: string;
  category: string;
}

interface TextureSelectorProps {
  onTextureSelect: (textureId: string) => void;
  textures: Texture[];
}

const TextureSelector: React.FC<TextureSelectorProps> = ({ onTextureSelect, textures }) => {
  const [filteredTextures, setFilteredTextures] = useState<Texture[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('英雄头像');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [jumpToPage, setJumpToPage] = useState('');
  const [showContributionForm, setShowContributionForm] = useState(false);
  
  const itemsPerPage = 30; // 响应式布局：移动端3列×10行=30，PC端8列×4行=32，取平衡值30
  const totalPages = Math.ceil(filteredTextures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTextures = filteredTextures.slice(startIndex, startIndex + itemsPerPage);

  // 获取所有分类
  const categories = ['全部', ...Array.from(new Set(textures.map(texture => texture.category)))];

  // 当纹理数据变化时更新筛选结果
  useEffect(() => {
    setFilteredTextures(textures);
    if (textures.length > 0) {
      setIsLoading(false);
    }
  }, [textures]);

  // 过滤纹理
  useEffect(() => {
    let filtered = textures;

    // 按分类过滤
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(texture => texture.category === selectedCategory);
    }

    // 按搜索词过滤
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(texture => {
        return texture.name.toLowerCase().includes(searchLower) || 
               texture.id.toLowerCase().includes(searchLower) || 
               texture.txCode.toLowerCase().includes(searchLower);
      });
    }

    setFilteredTextures(filtered);
    setCurrentPage(1); // 重置到第一页
  }, [textures, selectedCategory, searchTerm]);

  const handleTextureClick = (textureId: string) => {
    onTextureSelect(textureId);
  };

  // 处理页面跳转
  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpToPage('');
    }
  };

  // 处理输入框回车键
  const handleJumpInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500/30 border-t-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-300 text-sm">加载纹理数据中...</p>
            <p className="text-gray-500 text-xs mt-2">请稍候，正在获取纹理信息</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">纹理选择</h3>
          <button
            onClick={() => setShowContributionForm(true)}
            className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg shadow-green-500/25 flex items-center gap-1.5"
            title="贡献未收录的纹理"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            贡献纹理
          </button>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          共 {filteredTextures.length} 个纹理
        </div>
      </div>
      
      {/* 分类筛选和搜索 */}
      <div className="flex gap-3 mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm"
        >
          {categories.map(category => (
            <option key={category} value={category} className="bg-gray-700 text-white">{category}</option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="搜索纹理名称、ID或TXC代码..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm"
        />
      </div>

      {/* 纹理网格 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        {currentTextures.map((texture) => (
          <button
            key={texture.id}
            onClick={() => handleTextureClick(texture.id)}
            className="p-2 bg-gray-700/30 border border-gray-600/50 rounded-lg hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-200 group transform hover:scale-105 flex flex-col items-center min-h-[100px] sm:min-h-[110px] md:min-h-[100px] break-all"
            title={texture.name}
          >
            <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-10 md:h-10 mx-auto mb-1 bg-gray-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Image
                src={texture.imagePath}
                alt={texture.name}
                width={48}
                height={48}
                className="object-contain rounded w-full h-full"
              />
            </div>
            <div className="text-xs text-gray-300 group-hover:text-orange-300 transition-colors text-center leading-tight px-1 overflow-hidden">
              <div className="line-clamp-2 break-words">
                {texture.name}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-xs bg-gray-700/50 border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all duration-200"
          >
            上一页
          </button>
          
          <div className="flex items-center gap-2">
            {/* 页码按钮 */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 text-xs rounded-lg transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                        : 'bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            {/* 页面跳转输入框 */}
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-gray-400">跳转到</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyPress={handleJumpInputKeyPress}
                placeholder={currentPage.toString()}
                className="w-12 h-8 px-2 text-xs bg-gray-700/50 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
              <span className="text-xs text-gray-400">页</span>
              <button
                onClick={handleJumpToPage}
                disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
                className="px-2 py-1 text-xs bg-orange-500/80 text-white rounded hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                跳转
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-xs bg-gray-700/50 border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all duration-200"
          >
            下一页
          </button>
        </div>
      )}
      
      {/* 纹理贡献表单 - 使用Portal渲染到全局 */}
      {showContributionForm && typeof document !== 'undefined' && createPortal(
        <TextureContributionForm
          onClose={() => setShowContributionForm(false)}
        />,
        document.body
      )}
    </div>
  );
};

export default TextureSelector;