'use client';

import React from 'react';
import Image from 'next/image';
import { getTextureName } from '@/data/textureNames';

interface Texture {
  id: string;
  fileName: string;
  imagePath: string;
  txCode: string;
  name: string;
  category: string;
}

interface Element {
  id: string;
  type: 'text' | 'color' | 'gradient' | 'texture';
  content?: string;
  color?: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientOpacity?: number;
  texture?: Texture;
}

interface PreviewProps {
  elements: Element[];
  onMoveElement: (fromIndex: number, toIndex: number) => void;
  onRemoveElement: (index: number) => void;
  onClearAll: () => void;
}

const Preview: React.FC<PreviewProps> = ({ elements, onMoveElement, onRemoveElement, onClearAll }) => {
  return (
    <div className="p-3 lg:p-6 bg-gray-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 lg:mb-4 gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">实时预览</h3>
        </div>
        {elements.length > 0 && (
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="text-xs lg:text-sm text-gray-400 font-medium">{elements.length} 个元素</span>
            <button
              onClick={onClearAll}
              className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-red-600/50"
            >
              清空所有
            </button>
          </div>
        )}
      </div>
      
      <div className="min-h-[200px] lg:min-h-[300px] p-3 lg:p-6 bg-gray-900/80 rounded-xl text-white font-mono relative overflow-hidden border border-orange-500/20 backdrop-blur-sm">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-blue-500/5"></div>
        
        <div className="relative z-10">
          {elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 lg:py-12">
              <div className="text-4xl lg:text-6xl mb-3 lg:mb-4 opacity-30">📝</div>
              <div className="text-center">
                <div className="text-base lg:text-lg font-medium text-orange-400">预览区域</div>
                <div className="text-xs lg:text-sm mt-2 text-gray-500">添加文字或纹理开始创作</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
              {elements.map((element, index) => (
                <span key={index} className="relative group inline-block draggable-element" draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', index.toString());
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    if (fromIndex !== index) {
                      onMoveElement(fromIndex, index);
                    }
                  }}
                >
                  {element.type === 'text' && (
                    <span className="bg-gray-800/60 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border border-gray-600/50 cursor-move hover:border-orange-500/30 transition-all duration-200 text-sm lg:text-base">
                      {element.content}
                    </span>
                  )}
                  {element.type === 'color' && (
                    <span 
                      className="px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border border-gray-600/50 cursor-move hover:border-orange-500/30 transition-all duration-200 text-sm lg:text-base"
                      style={{ 
                        color: element.color,
                        backgroundColor: 'rgba(0,0,0,0.4)'
                      }}
                    >
                      {element.content}
                    </span>
                  )}
                  {element.type === 'gradient' && (
                    <span 
                      className="px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border border-gray-600/50 cursor-move hover:border-orange-500/30 transition-all duration-200 text-sm lg:text-base"
                      style={{
                        background: `linear-gradient(to right, ${element.gradientStartColor}, ${element.gradientEndColor})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundColor: 'rgba(0,0,0,0.4)'
                      }}
                    >
                      {element.content}
                    </span>
                  )}
                  {element.type === 'texture' && element.texture && (
                    <span className="inline-flex items-center bg-gray-800/60 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border border-gray-600/50 cursor-move hover:border-orange-500/30 transition-all duration-200">
                      <Image
                        src={element.texture.imagePath}
                        alt={element.texture.name || element.texture.id}
                        width={16}
                        height={16}
                        className="mr-1.5 lg:mr-2 rounded lg:w-5 lg:h-5"
                      />
                      <span className="text-xs lg:text-sm font-medium">{element.texture.name || element.texture.id}</span>
                    </span>
                  )}
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={() => onRemoveElement(index)}
                    className="absolute -top-1.5 lg:-top-2 -right-1.5 lg:-right-2 w-5 h-5 lg:w-6 lg:h-6 bg-red-500/90 text-white rounded-full text-xs lg:text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-lg"
                    title="删除"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;