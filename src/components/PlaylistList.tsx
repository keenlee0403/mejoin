import React from 'react';
import { Playlist, Song } from '../types';
import { Plus, Trash2, ChevronLeft, ListMusic, Music } from 'lucide-react';

interface PlaylistListProps {
    playlists: Playlist[];
    songs: Song[];
    onSelect: (id: string) => void;
    onCreate: () => void;
    onDelete: (id: string) => void;
    onBack: () => void;
}

export default function PlaylistList({ playlists, songs, onSelect, onCreate, onDelete, onBack }: PlaylistListProps) {
    const getSongCount = (playlist: Playlist) => {
        return playlist.songIds.filter(id => songs.some(s => s.id === id)).length;
    };

    return (
        <div className="flex flex-col h-full bg-black">
            <div className="bg-black/80 backdrop-blur-xl sticky top-0 z-10 border-b border-zinc-800 pt-safe-top">
                <div className="px-4 h-16 flex justify-between items-center">
                    <button
                        onClick={onBack}
                        className="flex items-center text-ios-blue active:opacity-50 transition-all"
                    >
                        <ChevronLeft size={24} />
                        <span className="text-base font-medium">返回</span>
                    </button>
                    <h1 className="text-xl font-bold text-white absolute left-1/2 -translate-x-1/2">歌单</h1>
                    <button
                        onClick={onCreate}
                        className="bg-white text-black w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 active:scale-95 duration-200"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-safe-bottom">
                {playlists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 space-y-4">
                        <ListMusic size={64} strokeWidth={1} />
                        <p className="text-center text-lg">还没有歌单<br />点击右上角 + 号创建</p>
                    </div>
                ) : (
                    playlists.map(playlist => (
                        <div
                            key={playlist.id}
                            className="group relative bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl pl-5 pr-2 py-5 active:bg-zinc-800 transition-colors overflow-hidden flex items-center"
                        >
                            <div
                                className="flex-1 min-w-0 pr-4 cursor-pointer"
                                onClick={() => onSelect(playlist.id)}
                            >
                                <h3 className="text-white font-bold text-xl truncate mb-1">{playlist.name}</h3>
                                <p className="text-zinc-500 text-base">{getSongCount(playlist)} 首歌</p>
                            </div>

                            <div className="flex items-center gap-1">
                                <div className="text-zinc-600 cursor-pointer" onClick={() => onSelect(playlist.id)}>
                                    <Music size={20} />
                                </div>
                                <div className="w-[1px] h-10 bg-zinc-800 mx-1" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`确定要删除歌单「${playlist.name}」吗？\n（不会删除歌曲本身）`)) {
                                            onDelete(playlist.id);
                                        }
                                    }}
                                    className="p-4 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors active:scale-95"
                                >
                                    <Trash2 size={22} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
                <div className="h-20" />
            </div>

            <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
}
