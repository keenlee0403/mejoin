import React from 'react';
import { Playlist, Song } from '../types';
import { ChevronLeft, Play, Pencil, Music } from 'lucide-react';

interface PlaylistPlayProps {
    playlist: Playlist;
    songs: Song[];
    currentIndex: number;
    onSelectSong: (songId: string, index: number) => void;
    onEdit: () => void;
    onBack: () => void;
}

export default function PlaylistPlay({ playlist, songs, currentIndex, onSelectSong, onEdit, onBack }: PlaylistPlayProps) {
    // 按歌单顺序获取歌曲，过滤掉已删除的
    const orderedSongs = playlist.songIds
        .map((id, idx) => ({ song: songs.find(s => s.id === id), originalIndex: idx }))
        .filter((item): item is { song: Song; originalIndex: number } => !!item.song);

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
                    <h1 className="text-xl font-bold text-white absolute left-1/2 -translate-x-1/2 truncate max-w-[50%]">
                        {playlist.name}
                    </h1>
                    <button
                        onClick={onEdit}
                        className="p-2 text-zinc-400 hover:text-white active:opacity-50 transition-all"
                    >
                        <Pencil size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-safe-bottom">
                {orderedSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 space-y-4">
                        <Music size={64} strokeWidth={1} />
                        <p className="text-center text-lg">歌单里还没有歌<br />点右上角编辑添加</p>
                    </div>
                ) : (
                    orderedSongs.map(({ song, originalIndex }, displayIndex) => {
                        const isCurrentOrPlayed = originalIndex <= currentIndex;
                        const isCurrent = originalIndex === currentIndex;

                        return (
                            <button
                                key={song.id}
                                onClick={() => onSelectSong(song.id, originalIndex)}
                                className={`w-full rounded-2xl px-4 py-4 flex items-center gap-4 transition-all active:scale-[0.98] text-left ${isCurrent
                                        ? 'bg-ios-blue/15 border border-ios-blue/30'
                                        : 'bg-zinc-900/50 border border-zinc-800 active:bg-zinc-800'
                                    }`}
                            >
                                {/* 序号 */}
                                <span className={`text-lg font-bold w-8 text-center flex-shrink-0 ${isCurrent ? 'text-ios-blue' : isCurrentOrPlayed ? 'text-zinc-600' : 'text-zinc-500'
                                    }`}>
                                    {displayIndex + 1}
                                </span>

                                {/* 歌曲信息 */}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-lg truncate ${isCurrent ? 'text-ios-blue' : 'text-white'
                                        }`}>
                                        {song.title}
                                    </p>
                                    <p className="text-zinc-500 text-sm truncate">{song.artist || '未知歌手'}</p>
                                </div>

                                {/* 播放图标 */}
                                <div className={`flex-shrink-0 ${isCurrent ? 'text-ios-blue' : 'text-zinc-600'}`}>
                                    <Play size={20} fill={isCurrent ? '#007AFF' : 'transparent'} />
                                </div>
                            </button>
                        );
                    })
                )}
                <div className="h-20" />
            </div>

            {/* 底部信息 */}
            <div className="fixed bottom-0 left-0 right-0 pb-safe-bottom">
                <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-4 px-6">
                    <p className="text-zinc-500 text-center text-sm">
                        共 {orderedSongs.length} 首 · 点击歌曲开始演唱
                    </p>
                </div>
            </div>
        </div>
    );
}
