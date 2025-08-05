'use client';

import React, { useState } from 'react';
import { countTexturesInCode, validateOverwatchCodeLimits } from '@/utils/validation';

interface Element {
  id: string;
  type: 'text' | 'color' | 'gradient' | 'texture';
  content?: string;
  color?: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientOpacity?: number;
  texture?: {
    id: string;
    imagePath: string;
    txCode: string;
  };
}

interface CodeGeneratorProps {
  elements: Element[];
  onClearAll: () => void;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ elements, onClearAll }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  const generateTxExpression = () => {
    return elements.map(element => {
      switch (element.type) {
        case 'text':
          return element.content;
        case 'color':
          const rgb = hexToRgb(element.color || '#ffffff');
          if (rgb && element.content) {
            return `<FG${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}FF>${element.content}`;
          }
          return element.content;
        case 'gradient':
          const startRgb = hexToRgb(element.gradientStartColor || '#ffffff');
          const endRgb = hexToRgb(element.gradientEndColor || '#ffffff');
          if (startRgb && endRgb && element.content) {
            return createGradientText(element.content, startRgb, endRgb);
          }
          return element.content;
        case 'texture':
          return `${element.texture?.txCode}`;
        default:
          return '';
      }
    }).join(' ');
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const copyToClipboard = async () => {
    const code = generateTxExpression();
    try {
      await navigator.clipboard.writeText(code);
      showToastMessage('聊天代码已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
      showToastMessage('复制失败，请手动复制');
    }
  };

  const txExpression = generateTxExpression();

  return (
    <>
      {/* Toast 通知 */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
      
      <div className="p-3 lg:p-6 bg-gray-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 lg:mb-6 gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">聊天代码输出</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-3 w-full sm:w-auto">
            <div className="text-xs lg:text-sm text-gray-400 font-medium">
              {elements.length > 0 ? (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                  已生成 {elements.length} 个元素的代码
                </span>
              ) : (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                  暂无元素
                </span>
              )}
            </div>
            {elements.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-orange-600/50"
                >
                  复制代码
                </button>
                <button
                  onClick={onClearAll}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-red-600/50"
                >
                  清空所有
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
          {/* 代码头部 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 lg:px-4 py-2 lg:py-3 bg-gray-800/50 border-b border-gray-700/50 gap-2">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 bg-red-500 rounded-full"></div>
                <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs lg:text-sm text-gray-400 font-medium ml-2">守望先锋聊天代码</span>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-4">
                <div className={`text-xs lg:text-sm ${
                  txExpression && txExpression.length > 165 
                    ? 'text-red-400' 
                    : txExpression && txExpression.length > 132 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}>
                  {txExpression ? `${txExpression.length}` : '0'} / 165 字符
                </div>
                <div className={`text-xs lg:text-sm ${
                  txExpression && countTexturesInCode(txExpression) > 4 
                    ? 'text-red-400' 
                    : txExpression && countTexturesInCode(txExpression) > 3 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}>
                  {txExpression ? countTexturesInCode(txExpression) : 0} / 4 纹理
                </div>
              </div>
              {txExpression && (txExpression.length > 165 || countTexturesInCode(txExpression) > 4) && (
                <div className="text-xs text-red-400">
                  ⚠️ 超出游戏限制，可能无法在游戏中正常显示
                </div>
              )}
            </div>
          </div>
          
          {/* 代码内容 */}
          <div className="relative min-h-[120px] lg:min-h-[150px]">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50"></div>
            
            <div className="relative z-10 p-3 lg:p-6">
              {elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-3 lg:py-4">
                  <div className="text-lg lg:text-xl mb-2">📝</div>
                  <div className="text-center font-mono text-xs lg:text-sm leading-relaxed">
                    <div>{`// 守望先锋聊天代码将在此显示`}</div>
                    <div>{`// 请添加文字或纹理元素开始创作`}</div>
                    <div>{`//`}</div>
                    <div>{`// 支持的元素类型:`}</div>
                    <div>{`// - 普通文字`}</div>
                    <div>{`// - 彩色文字`}</div>
                    <div>{`// - 渐变文字`}</div>
                    <div>{`// - 纹理图案`}</div>
                  </div>
                </div>
              ) : (
                <pre className="text-orange-300 font-mono text-xs lg:text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {txExpression}
                </pre>
              )}
            </div>
          </div>
        </div>
        
        {elements.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            生成的代码包含 {elements.length} 个元素，可直接在守望先锋聊天中使用
          </div>
        )}
      </div>
    </>
  );
};

export default CodeGenerator;