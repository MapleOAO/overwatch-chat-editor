'use client';
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGlobalToast } from '@/contexts/ToastContext';
import { createSubmitDebounce } from '@/utils/debounceThrottle';
import Preview from './Preview';
import { parseOverwatchCode } from '@/utils/overwatchCodeParser';
import { loadTexturesWithCache } from '@/utils/textureCache';
import { countTexturesInCode, validateOverwatchCodeLimits } from '@/utils/validation';

interface UserTemplateUploadProps {
  onUploadSuccess?: () => void;
  currentOverwatchCode?: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const UserTemplateUpload: React.FC<UserTemplateUploadProps> = ({
  onUploadSuccess,
  currentOverwatchCode = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    overwatchCode: currentOverwatchCode,
    categoryId: '',
  });
  const [textures, setTextures] = useState<any[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  
  const MAX_CHARACTERS = 300;
  const MAX_NAME_CHARACTERS = 30;
  const MAX_DESCRIPTION_CHARACTERS = 100;
  const { showToast } = useGlobalToast();
  
  // 防抖提交引用
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 加载纹理数据
  useEffect(() => {
    const loadTextures = async () => {
      try {
        const texturesData = await loadTexturesWithCache();
        setTextures(texturesData);
      } catch (error) {
        console.error('Failed to load textures:', error);
      }
    };

    const loadCategories = async () => {
      try {
        const response = await fetch('/api/template-categories');
        if (response.ok) {
          const data = await response.json();
          // 将层级结构转换为扁平数组
          const flatCategories: TemplateCategory[] = [];
          if (data.categories && Array.isArray(data.categories)) {
            data.categories.forEach((parent: any) => {
              // 添加父分类
              flatCategories.push({
                id: parent.id,
                name: parent.name,
                parentId: parent.parentId,
                displayOrder: parent.displayOrder,
                isActive: true,
                createdAt: '',
                updatedAt: ''
              });
              // 添加子分类
              if (parent.children && Array.isArray(parent.children)) {
                parent.children.forEach((child: any) => {
                  flatCategories.push({
                    id: child.id,
                    name: child.name,
                    parentId: child.parentId,
                    displayOrder: child.displayOrder,
                    isActive: true,
                    createdAt: '',
                    updatedAt: ''
                  });
                });
              }
            });
          }
           setCategories(flatCategories);
           console.log('Loaded categories:', flatCategories);
         }
       } catch (error) {
         console.error('Failed to load categories:', error);
         setCategories([]);
       }
     };

    loadTextures();
    loadCategories();
  }, []);

  // 解析当前代码为预览元素
  const [previewElements, setPreviewElements] = useState<any[]>([]);

  // 当代码或纹理数据变化时重新解析
  useEffect(() => {
    const parseCode = async () => {
      if (!formData.overwatchCode.trim()) {
        setPreviewElements([]);
        return;
      }
      
      try {
        const elements = await parseOverwatchCode(formData.overwatchCode, textures);
        setPreviewElements(elements);
      } catch (error) {
        console.error('Failed to parse Overwatch code:', error);
        setPreviewElements([]);
      }
    };
    
    parseCode();
  }, [formData.overwatchCode, textures]);

  // 实际提交函数
  const performSubmit = useCallback(async (data: { name: string; description: string; overwatchCode: string; categoryId: string }) => {
    setIsLoading(true);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/user-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = '上传失败，请稍后重试';
        
        try {
          const error = await response.json();
          // 处理不同类型的错误
          if (response.status === 429) {
            errorMessage = error.error || '请求过于频繁，请稍后再试';
          } else if (response.status === 403) {
            errorMessage = '请求被拒绝，请检查网络环境';
          } else if (response.status === 400) {
            errorMessage = error.error || '请求参数错误，请检查输入内容';
          } else if (response.status === 500) {
            errorMessage = '服务器内部错误，请稍后重试';
          } else if (response.status >= 500) {
            errorMessage = '服务器暂时不可用，请稍后重试';
          } else {
            errorMessage = error.error || '上传失败，请稍后重试';
          }
        } catch (parseError) {
          // 如果无法解析错误响应，使用默认错误消息
          console.error('解析错误响应失败:', parseError);
          if (response.status === 429) {
            errorMessage = '请求过于频繁，请稍后再试';
          } else if (response.status >= 500) {
            errorMessage = '服务器暂时不可用，请稍后重试';
          } else if (response.status >= 400) {
            errorMessage = '请求失败，请检查输入内容';
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('API响应结果:', result);
      
      // 显示审核提示信息
      if (result.needsApproval && result.message) {
        console.log('显示审核提示:', result.message);
        showToast(result.message, 'warning');
      } else {
        console.log('显示成功提示');
        showToast('模板上传成功！', 'success');
      }
      
      setFormData({ name: '', description: '', overwatchCode: '', categoryId: '' });
      setSelectedParentCategory('');
      setIsOpen(false);
      onUploadSuccess?.();
    } catch (error) {
      console.error('上传模板失败:', error);
      
      // 处理网络错误和其他异常
      let errorMessage = '上传失败，请稍后重试';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '网络连接失败，请检查网络连接后重试';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  }, [showToast, onUploadSuccess]);

  // 防抖提交函数
  const debouncedSubmit = useCallback(createSubmitDebounce(performSubmit, 2000), [performSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 基本验证
    if (!formData.name.trim() || !formData.description.trim() || !formData.overwatchCode.trim() || !formData.categoryId.trim()) {
      showToast('请填写所有必填字段（模板名称、描述、分类和守望先锋代码）', 'error');
      return;
    }

    // 游戏限制验证（强制）
    const validation = validateOverwatchCodeLimits(formData.overwatchCode);
    if (!validation.isValid) {
      showToast(`无法上传：${validation.errors.join('，')}`, 'error');
      return;
    }

    // 防止重复提交
    if (isSubmitting) {
      showToast('正在提交中，请稍候...', 'warning');
      return;
    }

    // 清除之前的定时器
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    // 防抖提交
     debouncedSubmit({ ...formData });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 字符限制检查
    if (name === 'overwatchCode' && value.length > MAX_CHARACTERS) {
      return;
    }
    if (name === 'name' && value.length > MAX_NAME_CHARACTERS) {
      return;
    }
    if (name === 'description' && value.length > MAX_DESCRIPTION_CHARACTERS) {
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleParentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    setSelectedParentCategory(parentId);
    setFormData(prev => ({ ...prev, categoryId: '' }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setFormData(prev => ({ ...prev, categoryId }));
  };

  const getChildCategories = (parentId: string) => {
    return Array.isArray(categories) ? categories.filter(cat => cat.parentId === parentId) : [];
  };

  const getParentCategories = () => {
    return Array.isArray(categories) ? categories.filter(cat => cat.parentId === null) : [];
  };

  const openModal = () => {
    setFormData(prev => ({ ...prev, overwatchCode: currentOverwatchCode }));
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-orange-600/50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        分享你的模板
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4" style={{zIndex: 99999}}>
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] border border-gray-700 relative z-[100000] flex flex-col" style={{zIndex: 100000}}>
            <div className="flex flex-1 min-h-0">
              {/* 左侧表单区域 */}
              <div className="flex-1 flex flex-col">
                <div className="p-6 pb-0 flex-shrink-0">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">上传模板</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* 上传须知 */}
                  <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="text-yellow-400 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-yellow-400 font-semibold mb-1 text-sm">上传须知</h3>
                        <ul className="text-xs text-yellow-200 space-y-0.5">
                          <li>• 模板名称限制30字符，描述限制100字符</li>
                          <li>• 守望先锋代码限制300字符</li>
                          <li>• <span className="text-red-300 font-semibold">游戏限制：最多165字符和4个纹理</span></li>
                          <li>• 1小时内最多允许2次上传</li>
                          <li>• 禁止上传侵权、违法或暴力血腥内容</li>
                          <li>• 不得包含第三方广告或商业推广信息</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-6 overflow-y-auto min-h-0">

                  <form id="template-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        模板名称 *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="请输入模板名称"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.name.length}/{MAX_NAME_CHARACTERS} 字符
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                        模板描述 *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="请输入模板描述"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.description.length}/{MAX_DESCRIPTION_CHARACTERS} 字符
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        分类选择 *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <select
                            value={selectedParentCategory}
                            onChange={handleParentCategoryChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                          >
                            <option value="">选择主分类</option>
                            {getParentCategories().map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <select
                            value={formData.categoryId}
                            onChange={handleCategoryChange}
                            disabled={!selectedParentCategory}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                          >
                            <option value="">选择子分类</option>
                            {selectedParentCategory && getChildCategories(selectedParentCategory).map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="overwatchCode" className="block text-sm font-medium text-gray-300 mb-2">
                        守望先锋代码 *
                      </label>
                      <textarea
                        id="overwatchCode"
                        name="overwatchCode"
                        value={formData.overwatchCode}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none font-mono text-sm"
                        placeholder="请输入守望先锋代码"
                        required
                      />
                      <div className="mt-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className={`text-xs ${
                              formData.overwatchCode.length > 165 
                                ? 'text-red-400' 
                                : formData.overwatchCode.length > 132 
                                ? 'text-yellow-400' 
                                : 'text-gray-500'
                            }`}>
                              {formData.overwatchCode.length}/165 字符（游戏限制）
                            </div>
                            <div className={`text-xs ${
                              countTexturesInCode(formData.overwatchCode) > 4 
                                ? 'text-red-400' 
                                : countTexturesInCode(formData.overwatchCode) > 3 
                                ? 'text-yellow-400' 
                                : 'text-gray-500'
                            }`}>
                              {countTexturesInCode(formData.overwatchCode)}/4 纹理（游戏限制）
                            </div>
                          </div>
                          <div className={`text-xs ${
                            formData.overwatchCode.length > MAX_CHARACTERS * 0.9 
                              ? 'text-red-400' 
                              : formData.overwatchCode.length > MAX_CHARACTERS * 0.8 
                              ? 'text-yellow-400' 
                              : 'text-gray-500'
                          }`}>
                            {formData.overwatchCode.length}/{MAX_CHARACTERS} 字符（上传限制）
                          </div>
                        </div>
                        {(formData.overwatchCode.length > 165 || countTexturesInCode(formData.overwatchCode) > 4) && (
                          <div className="text-xs text-red-400">
                            ⚠️ 超出游戏限制，无法上传到社区模板
                          </div>
                        )}
                        {formData.overwatchCode.length >= MAX_CHARACTERS && (
                          <div className="text-xs text-red-400">
                            已达到上传字符上限
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                <div className="p-6 pt-4 flex-shrink-0 border-t border-gray-700">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors duration-200"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      form="template-form"
                      disabled={isLoading || isSubmitting}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isSubmitting ? '提交中...' : isLoading ? '上传中...' : '上传'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 右侧预览区域 */}
              <div className="flex-1 border-l border-gray-700 bg-gray-900/50 overflow-y-auto">
                <Preview 
                  elements={previewElements}
                  onMoveElement={() => {}} // 上传模态框中不需要移动功能
                  onRemoveElement={() => {}} // 上传模态框中不需要删除功能
                  onClearAll={() => {}} // 上传模态框中不需要清空功能
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default UserTemplateUpload;