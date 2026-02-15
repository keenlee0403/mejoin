import React from 'react';
import { Song } from '../types';
import { Plus, Trash2, ChevronRight, Music, Pencil } from 'lucide-react';

interface SongListProps {
  songs: Song[];
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export default function SongList({ songs, onSelect, onEdit, onDelete, onCreate }: SongListProps) {
  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header with Safe Area */}
      <div className="bg-black/80 backdrop-blur-xl sticky top-0 z-10 border-b border-zinc-800 pt-safe-top">
        <div className="px-6 h-16 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Mejoin</h1>
          <button
            onClick={onCreate}
            className="bg-white text-black w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 active:scale-95 duration-200"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-safe-bottom">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 space-y-4">
            <Music size={64} strokeWidth={1} />
            <p className="text-center text-lg">还没有歌词<br />点击右上角 + 号添加</p>
          </div>
        ) : (
          songs.map(song => (
            <div
              key={song.id}
              className="group relative bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl pl-5 pr-2 py-5 active:bg-zinc-800 transition-colors overflow-hidden flex items-center"
            >
              {/* 点击进入提词器 */}
              <div
                className="flex-1 min-w-0 pr-4 cursor-pointer"
                onClick={() => onSelect(song.id)}
              >
                <h3 className="text-white font-bold text-xl truncate mb-1">{song.title}</h3>
                <p className="text-zinc-500 text-base truncate">{song.artist || 'Unknown Artist'}</p>
              </div>

              <div className="mr-3 text-zinc-600" onClick={() => onSelect(song.id)}>
                <ChevronRight size={24} />
              </div>

              <div className="w-[1px] h-10 bg-zinc-800 mx-1" />

              {/* 编辑按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(song.id);
                }}
                className="p-4 text-zinc-500 hover:text-ios-blue hover:bg-ios-blue/10 rounded-xl transition-colors active:scale-95"
              >
                <Pencil size={20} />
              </button>

              {/* 删除按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(song.id);
                }}
                className="p-4 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors active:scale-95"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))
        )}

        <div className="h-20" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}