import React, { useState } from 'react';
import { Song } from '../types';
import { UploadCloud, ChevronLeft } from 'lucide-react';

interface EditorProps {
  song?: Song;
  onSave: (song: Song) => void;
  onCancel: () => void;
}

export default function Editor({ song, onSave, onCancel }: EditorProps) {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [lyrics, setLyrics] = useState(song?.lyrics || '');

  const handleSave = () => {
    if (!title.trim()) {
      alert("请输入歌名");
      return;
    }

    const newSong: Song = {
      id: song?.id || crypto.randomUUID(),
      title,
      artist,
      lyrics,
      createdAt: song?.createdAt || Date.now(),
      settings: song?.settings || { speed: 1.0, fontSize: 48 }
    };

    onSave(newSong);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLyrics(content);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* 
         固定导航栏
         使用内联样式直接设置 safe-area-inset-top，确保 PWA 独立模式下正确显示
         高度缩小为 h-11 (44px)，刚好满足 iOS 最小触摸目标要求
      */}
      <div 
        className="fixed top-0 left-0 right-0 z-30 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 shadow-lg"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}
      >
        <div className="h-11 flex items-center justify-between px-2">
            
            {/* 取消按钮 */}
            <button 
                onClick={onCancel} 
                className="h-full px-3 flex items-center text-zinc-400 hover:text-white active:opacity-50 transition-all"
            >
              <ChevronLeft size={24} />
              <span className="text-base font-medium">取消</span>
            </button>
            
            {/* 标题 */}
            <span className="font-semibold text-white text-base absolute left-1/2 -translate-x-1/2 pointer-events-none">
                {song ? '编辑歌词' : '新歌词'}
            </span>
            
            {/* 保存按钮 */}
            <button 
                onClick={handleSave} 
                className="h-full px-4 text-ios-blue font-bold text-base active:opacity-50 transition-all flex items-center"
            >
              保存
            </button>
        </div>
      </div>

      {/* 占位空间，高度与固定导航栏匹配 */}
      <div style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}>
          <div className="h-11 w-full" />
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-safe-bottom">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="歌名 (必填)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-900 border-none rounded-2xl px-5 py-3.5 text-white text-lg placeholder-zinc-500 focus:ring-2 focus:ring-ios-blue outline-none transition-all appearance-none"
          />
          <input
            type="text"
            placeholder="歌手/乐队"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full bg-zinc-900 border-none rounded-2xl px-5 py-3.5 text-white text-lg placeholder-zinc-500 focus:ring-2 focus:ring-ios-blue outline-none transition-all appearance-none"
          />
        </div>

        <div className="relative">
             <label className="flex items-center justify-center gap-3 w-full py-4 border border-dashed border-zinc-700 rounded-2xl text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 cursor-pointer active:bg-zinc-800 transition-all">
                <UploadCloud size={22} />
                <span className="font-medium text-base">导入 .txt 文件</span>
                <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
             </label>
        </div>

        <div className="flex-1">
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="在此粘贴或输入歌词..."
            className="w-full min-h-[50vh] bg-transparent text-white text-xl leading-relaxed placeholder-zinc-700 resize-none outline-none font-sans p-2"
            spellCheck={false}
          />
        </div>
        
        {/* 底部留白 */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}