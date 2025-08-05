'use client';

import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
import UserTemplateBrowser from './UserTemplateBrowser';
import UserTemplateUpload from './UserTemplateUpload';

interface TemplateElement {
  id: string;
  type: 'text' | 'color' | 'gradient' | 'texture';
  content?: string;
  color?: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  texture?: {
    id: string;
    imagePath: string;
    txCode: string;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  elements: TemplateElement[];
  category?: string;
  createdAt: string;
  updatedAt?: string;
  isLocal?: boolean;
}

interface TemplatesData {
  templates: Record<string, Template>;
  categories: string[];
}

interface TemplateSelectorProps {
  onTemplateApply: (elements: any[]) => Promise<void>;
  currentOverwatchCode?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onTemplateApply, currentOverwatchCode = '' }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [localTemplates, setLocalTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [activeTab, setActiveTab] = useState<'system' | 'user' | 'community'>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshCommunity, setRefreshCommunity] = useState(0);

  // 加载模板数据
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        // 加载全局模板
        const response = await fetch('/api/templates');
        if (response.ok) {
          const data: TemplatesData = await response.json();
          const templateList = Object.values(data.templates);
          setTemplates(templateList);
          
          // 加载本地模板
          const localTemplatesData = JSON.parse(localStorage.getItem('userTemplates') || '[]');
          setLocalTemplates(localTemplatesData);
          
          // 设置系统模板分类
          setCategories(['全部', ...data.categories]);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // 过滤模板
  const currentTemplates = activeTab === 'system' ? templates : localTemplates;
  const filteredTemplates = currentTemplates.filter(template => {
    // 分类过滤
    const categoryMatch = selectedCategory === '全部' || template.category === selectedCategory;
    // 搜索过滤
    const searchMatch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // 删除本地模板
  const handleDeleteLocalTemplate = (templateId: string) => {
    if (confirm('确定要删除这个本地模板吗？')) {
      const updatedLocalTemplates = localTemplates.filter(t => t.id !== templateId);
      setLocalTemplates(updatedLocalTemplates);
      localStorage.setItem('userTemplates', JSON.stringify(updatedLocalTemplates));
    }
  };

  // 颜色转换函数
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const toHex = (n: number) => {
    return n.toString(16).padStart(2, '0').toUpperCase();
  };

  const lerp = (start: number, end: number, t: number) => {
    return Math.round(start + (end - start) * t);
  };

  // 创建渐变文字
  const createGradientText = (text: string, startColor: {r: number, g: number, b: number}, endColor: {r: number, g: number, b: number}) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const t = text.length === 1 ? 0 : i / (text.length - 1);
      const r = lerp(startColor.r, endColor.r, t);
      const g = lerp(startColor.g, endColor.g, t);
      const b = lerp(startColor.b, endColor.b, t);
      result += `<FG${toHex(r)}${toHex(g)}${toHex(b)}FF>${text[i]}`;
    }
    return result;
  };

  // 生成守望先锋代码
  const generateOverwatchCode = (elements: TemplateElement[]) => {
    return elements.map(element => {
      switch (element.type) {
        case 'text':
          // 如果content已经包含守望先锋代码，直接返回
          return element.content || '';
        case 'color':
          const rgb = hexToRgb(element.color || '#ffffff');
          if (rgb && element.content) {
            return `<FG${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}FF>${element.content}`;
          }
          return element.content || '';
        case 'gradient':
          const startRgb = hexToRgb(element.gradientStartColor || '#ffffff');
          const endRgb = hexToRgb(element.gradientEndColor || '#ffffff');
          if (startRgb && endRgb && element.content) {
            return createGradientText(element.content, startRgb, endRgb);
          }
          return element.content || '';
        case 'texture':
          return element.texture?.txCode || '';
        default:
          return '';
      }
    }).filter(code => code.trim() !== '').join(' ');
  };

  const { toast, showSuccess, showError, hideToast } = useToast();

  // 复制模板内容（守望先锋代码格式）
  const handleCopyTemplate = async (template: Template) => {
    try {
      const overwatchCode = generateOverwatchCode(template.elements);
      await navigator.clipboard.writeText(overwatchCode);
      showSuccess('守望先锋代码已复制到剪贴板！');
    } catch (error) {
      console.error('复制失败:', error);
      showError('复制失败，请重试');
    }
  };

  const handleApplyTemplate = async (template: Template) => {
    await onTemplateApply(template.elements);
  };

  // 处理社区模板应用
  const handleApplyCommunityTemplate = (overwatchCode: string) => {
    // 将守望先锋代码转换为元素格式
    const elements = [{
      id: Date.now().toString(),
      type: 'text' as const,
      content: overwatchCode
    }];
    onTemplateApply(elements);
  };

  // 处理模板上传成功
  const handleUploadSuccess = () => {
    setRefreshCommunity(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-400 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
            加载模板中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-6 bg-gray-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div className="flex items-center gap-2 lg:gap-3">
          <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">模板选择</h3>
        </div>
        <div className="text-xs lg:text-sm text-gray-400 font-medium">
          共 {filteredTemplates.length} 个
        </div>
      </div>
      
      {/* 模板类型切换 */}
      <div className="flex gap-1 lg:gap-2 mb-3 lg:mb-4">
        <button
          onClick={() => {
            setActiveTab('system');
            setSelectedCategory('全部');
          }}
          className={`px-3 lg:px-6 py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
            activeTab === 'system'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">系统预设</span>
          <span className="sm:hidden">系统</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('user');
            setSelectedCategory('全部');
          }}
          className={`px-3 lg:px-6 py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
            activeTab === 'user'
              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">我的模板 ({localTemplates.length})</span>
          <span className="sm:hidden">我的({localTemplates.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('community');
            setSelectedCategory('全部');
          }}
          className={`px-3 lg:px-6 py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
            activeTab === 'community'
              ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">社区模板</span>
          <span className="sm:hidden">社区</span>
        </button>
      </div>
      
      {/* 搜索和筛选区域 - 仅在非社区模板标签下显示 */}
      {activeTab !== 'community' && (
        <div className="mb-3 lg:mb-4 space-y-2 lg:space-y-3">
          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 pl-8 lg:pl-10 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-xs lg:text-sm"
            />
            <div className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* 分类筛选和视图切换 */}
          <div className="flex items-center justify-between gap-2 lg:gap-3">
            {activeTab === 'system' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 lg:px-4 py-1 lg:py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-xs lg:text-sm flex-1"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-700 text-white">{category}</option>
                ))}
              </select>
            )}
            
            {/* 视图模式切换 */}
            <div className="flex gap-1 bg-gray-700/30 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 lg:px-3 py-1 rounded text-xs transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="列表视图"
              >
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 lg:px-3 py-1 rounded text-xs transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="网格视图"
              >
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模板列表 */}
      {activeTab === 'community' ? (
        <UserTemplateBrowser 
          key={refreshCommunity}
          onApplyTemplate={handleApplyCommunityTemplate}
          shareButton={
            <UserTemplateUpload 
              onUploadSuccess={handleUploadSuccess}
              currentOverwatchCode={currentOverwatchCode}
            />
          }
        />
      ) : (
        <div className={`max-h-[60vh] lg:max-h-[70vh] overflow-y-auto custom-scrollbar ${
          viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4' : 'space-y-2 lg:space-y-3'
        }`}>
        {filteredTemplates.length === 0 ? (
          <div className="text-center text-gray-500 py-6 lg:py-8 col-span-full">
            <div className="text-2xl lg:text-4xl mb-2">
              {searchTerm ? '🔍' : (activeTab === 'system' ? '📝' : '💾')}
            </div>
            <div className="text-sm lg:text-base">
              {searchTerm 
                ? `未找到包含 "${searchTerm}" 的模板`
                : (activeTab === 'system' ? '暂无系统模板' : '暂无本地模板')
              }
            </div>
            {!searchTerm && activeTab === 'user' && (
              <div className="text-xs lg:text-sm mt-1">
                在编辑器中点击"保存到本地"来创建模板
              </div>
            )}
            {!searchTerm && activeTab === 'system' && (
              <div className="text-xs lg:text-sm mt-1">请联系管理员添加模板</div>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 px-3 lg:px-4 py-2 text-xs lg:text-sm bg-gray-600/50 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                清除搜索
              </button>
            )}
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-gray-700/30 border border-gray-600/50 rounded-lg hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-200 group ${
                viewMode === 'grid' ? 'p-2 lg:p-4 flex flex-col h-full min-h-[140px] lg:min-h-[180px]' : 'p-3 lg:p-4'
              }`}
            >
              <div className={`flex items-start justify-between ${
                viewMode === 'grid' ? 'mb-2 lg:mb-3' : 'mb-2'
              }`}>
                <div className="flex items-center gap-1 lg:gap-2 flex-1 min-w-0">
                  <h4 className={`font-semibold text-white group-hover:text-orange-300 transition-colors ${
                    viewMode === 'grid' ? 'text-xs lg:text-sm leading-tight' : 'text-sm lg:text-lg truncate'
                  }`}>
                    {template.name}
                  </h4>
                  {activeTab === 'user' && (
                    <span className="text-xs text-green-400 bg-green-600/20 px-1 lg:px-2 py-1 rounded border border-green-500/30 flex-shrink-0">
                      本地
                    </span>
                  )}
                </div>
                {viewMode === 'list' && (
                  <span className="text-xs text-gray-400 bg-gray-600/50 px-1 lg:px-2 py-1 rounded flex-shrink-0">
                    {template.category || '其他'}
                  </span>
                )}
              </div>
              
              {viewMode === 'grid' && (
                <div className="mb-1 lg:mb-2">
                  <span className="text-xs text-gray-400 bg-gray-600/50 px-1 lg:px-2 py-1 rounded">
                    {template.category || '其他'}
                  </span>
                </div>
              )}
              
              <p className={`text-gray-300 leading-relaxed ${
                viewMode === 'grid' ? 'text-xs mb-2 lg:mb-3 flex-1 line-clamp-2 lg:line-clamp-3' : 'text-xs lg:text-sm mb-2 lg:mb-3 line-clamp-2'
              }`}>
                {template.description}
              </p>
              
              <div className={`flex items-center justify-between mt-auto ${
                viewMode === 'grid' ? 'flex-col gap-2 lg:gap-3' : ''
              }`}>
                <div className={`text-xs text-gray-400 ${
                  viewMode === 'grid' ? 'self-start' : ''
                }`}>
                  {template.elements.length} 个元素
                  {activeTab === 'user' && (
                    <div className="text-xs text-yellow-400 mt-1">
                      ⚠️ 更新后可能丢失
                    </div>
                  )}
                </div>
                <div className={`flex ${
                  viewMode === 'grid' ? 'w-full gap-1 lg:gap-2' : 'gap-1 lg:gap-2'
                }`}>
                   <button
                     onClick={() => handleCopyTemplate(template)}
                     className={`text-xs bg-gray-600/80 text-white rounded hover:bg-gray-600 transition-all duration-200 ${
                       viewMode === 'grid' ? 'px-2 lg:px-3 py-1 lg:py-2 flex-1' : 'px-2 lg:px-3 py-1'
                     }`}
                     title="复制模板内容到剪贴板"
                   >
                     复制
                   </button>
                   {activeTab === 'user' && (
                     <button
                       onClick={() => handleDeleteLocalTemplate(template.id)}
                       className={`text-xs bg-red-600/80 text-white rounded hover:bg-red-600 transition-all duration-200 ${
                         viewMode === 'grid' ? 'px-2 lg:px-3 py-1 lg:py-2 flex-1' : 'px-2 lg:px-3 py-1'
                       }`}
                     >
                       删除
                     </button>
                   )}
                   <button
                     onClick={() => handleApplyTemplate(template)}
                     className={`bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-orange-600/50 ${
                       viewMode === 'grid' ? 'px-2 lg:px-3 py-1 lg:py-2 text-xs flex-1' : 'px-3 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm'
                     }`}
                   >
                     应用
                   </button>
                 </div>
              </div>
            </div>
          ))
        )}
        </div>
      )}
      
      {/* 结果统计 */}
      {filteredTemplates.length > 0 && (
        <div className="mt-3 lg:mt-4 text-center text-xs text-gray-400">
          显示 {filteredTemplates.length} 个模板
          {searchTerm && (
            <span className="ml-2">
              搜索: "{searchTerm}"
            </span>
          )}
        </div>
      )}
      
      {/* Toast 组件 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default TemplateSelector;

// 添加自定义样式
const customStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
}