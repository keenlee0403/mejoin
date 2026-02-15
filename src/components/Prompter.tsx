import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song } from '../types';
import { Play, Pause, ChevronLeft, Settings2, ChevronDown, Minus, Plus, Turtle, Rabbit } from 'lucide-react';

interface PrompterProps {
  song: Song;
  onBack: () => void;
  onEdit: () => void;
}

export default function Prompter({ song, onBack }: PrompterProps) {
  // UI 状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(song.settings?.speed ?? 1.0);
  const [fontSize, setFontSize] = useState(song.settings?.fontSize || 48);
  const [showControls, setShowControls] = useState(true);

  // 使用 ref 存储动画相关值，避免闭包陷阱
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(speed);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const scrollAccRef = useRef<number>(0); // 像素累加器，解决 iOS 亚像素滚动问题

  // 同步 state 到 ref
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // 动画循环 — 使用 useCallback + 空依赖，函数永远稳定
  // 所有动态值都从 ref 读取
  const animate = useCallback((time: number) => {
    if (!isPlayingRef.current || !containerRef.current) {
      lastTimeRef.current = 0;
      scrollAccRef.current = 0;
      return; // 停止时不再递归
    }

    if (lastTimeRef.current !== 0) {
      const deltaTime = time - lastTimeRef.current;
      // 基础速度 10px/s + 滑块值 × 15px/s
      // 最慢(0.5): 17.5px/s  默认(1.0): 25px/s  最快(3.0): 55px/s
      const pixelsPerSecond = 10 + speedRef.current * 15;

      // 累加亚像素量，攒够 1 像素才滚动（iOS scrollTop 只接受整数）
      scrollAccRef.current += (pixelsPerSecond * deltaTime) / 1000;

      if (scrollAccRef.current >= 1) {
        const px = Math.floor(scrollAccRef.current);
        containerRef.current.scrollTop += px;
        scrollAccRef.current -= px;
      }

      // 到底部自动停止（scrollTop > 10 防止还没开始滚动就触发）
      const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
      if (scrollTop > 10 && scrollTop + clientHeight >= scrollHeight - 2) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        lastTimeRef.current = 0;
        scrollAccRef.current = 0;
        return;
      }
    }

    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  // 启动/停止动画循环
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = 0;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, animate]);

  const togglePlay = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setIsPlaying(prev => !prev);
  };

  const getSliderStyle = (value: number, min: number, max: number, activeColor: string) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(to right, ${activeColor} ${percentage}%, rgba(255,255,255,0.15) ${percentage}%)`
    };
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none z-10">

      {/* 返回按钮 */}
      <div
        className={`fixed top-0 left-0 z-30 pt-safe-top pl-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
      >
        <button
          onClick={onBack}
          className="mt-4 p-3 bg-zinc-800/80 backdrop-blur-md rounded-full text-white hover:bg-zinc-700 border border-white/10 active:scale-90 shadow-lg"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* 歌词滚动区域 */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto no-scrollbar"
        onClick={togglePlay}
        style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        <div
          className="px-6 text-center font-bold leading-relaxed whitespace-pre-wrap text-white tracking-wide flex flex-col items-center"
          style={{
            fontSize: `${fontSize}px`,
            paddingTop: '50vh',
            paddingBottom: '80vh'
          }}
        >
          {song.lyrics || "点击开始滚动..."}
        </div>
      </div>

      {/* 设置按钮（控制面板隐藏时显示） */}
      {!showControls && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowControls(true); }}
          className="fixed bottom-10 right-6 z-20 bg-zinc-800/90 backdrop-blur-xl text-white p-4 rounded-full shadow-2xl border border-white/10 animate-fade-in active:scale-90 transition-transform"
        >
          <Settings2 size={24} strokeWidth={2} />
        </button>
      )}

      {/* 控制面板 */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 transform transition-transform duration-500 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div
          className="bg-[#1C1C1E]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[2.5rem] p-6 pb-safe-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 拖动指示条 */}
          <div className="w-full flex justify-center pb-8 pt-2" onClick={() => setShowControls(false)}>
            <div className="w-12 h-1.5 bg-zinc-600 rounded-full" />
          </div>

          <div className="flex flex-col gap-6 mb-2">

            {/* 滑块控制 */}
            <div className="space-y-8 px-1">
              {/* 字体大小 */}
              <div className="flex items-center gap-4">
                <Minus size={20} className="text-zinc-500" strokeWidth={2.5} />
                <div className="flex-1 h-8 flex items-center relative" style={{ touchAction: 'none' }}>
                  <input
                    type="range"
                    min="24"
                    max="120"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseFloat(e.target.value))}
                    style={getSliderStyle(fontSize, 24, 120, 'white')}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none 
                                [&::-webkit-slider-thumb]:appearance-none 
                                [&::-webkit-slider-thumb]:w-8 
                                [&::-webkit-slider-thumb]:h-8 
                                [&::-webkit-slider-thumb]:bg-white 
                                [&::-webkit-slider-thumb]:rounded-full 
                                [&::-webkit-slider-thumb]:shadow-lg
                                active:[&::-webkit-slider-thumb]:scale-110 
                                [&::-webkit-slider-thumb]:transition-transform"
                  />
                </div>
                <Plus size={24} className="text-white" strokeWidth={2.5} />
              </div>

              {/* 速度 */}
              <div className="flex items-center gap-4">
                <Turtle size={20} className="text-zinc-500" strokeWidth={2.5} />
                <div className="flex-1 h-8 flex items-center relative" style={{ touchAction: 'none' }}>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    style={getSliderStyle(speed, 0.5, 3, '#007AFF')}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none
                                [&::-webkit-slider-thumb]:appearance-none 
                                [&::-webkit-slider-thumb]:w-8 
                                [&::-webkit-slider-thumb]:h-8 
                                [&::-webkit-slider-thumb]:bg-white 
                                [&::-webkit-slider-thumb]:rounded-full 
                                [&::-webkit-slider-thumb]:shadow-lg
                                active:[&::-webkit-slider-thumb]:scale-110 
                                [&::-webkit-slider-thumb]:transition-transform"
                  />
                </div>
                <Rabbit size={24} className="text-ios-blue" strokeWidth={2.5} />
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="w-16" /> {/* 左侧占位 */}

              <button
                onClick={togglePlay}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl ${isPlaying
                  ? 'bg-zinc-800 text-white border border-white/10'
                  : 'bg-white text-black'
                  }`}
              >
                {isPlaying ? (
                  <Pause size={36} fill="currentColor" className="opacity-100" />
                ) : (
                  <Play size={36} fill="currentColor" className="ml-1 opacity-100" />
                )}
              </button>

              <button
                onClick={() => setShowControls(false)}
                className="w-16 h-16 flex items-center justify-center text-zinc-500 hover:text-white transition-colors bg-zinc-800/30 rounded-full active:bg-zinc-800"
              >
                <ChevronDown size={32} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}