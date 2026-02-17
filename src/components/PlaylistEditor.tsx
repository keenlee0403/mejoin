import React, { useState } from 'react';
import { Song, Playlist } from '../types';
import { ChevronLeft, Check, ChevronUp, ChevronDown, X } from 'lucide-react';

interface PlaylistEditorProps {
    playlist?: Playlist;
    songs: Song[];
    onSave: (playlist: Playlist) => void;
    onCancel: () => void;
}

export default function PlaylistEditor({ playlist, songs, onSave, onCancel }: PlaylistEditorProps) {
    const [name, setName] = useState(playlist?.name || '');
    const [selectedIds, setSelectedIds] = useState<string[]>(playlist?.songIds || []);

    const handleToggleSong = (songId: string) => {
        setSelectedIds(prev => {
            if (prev.includes(songId)) {
                return prev.filter(id => id !== songId);
            }
            return [...prev, songId];
        });
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        setSelectedIds(prev => {
            const next = [...prev];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
    };

    const handleMoveDown = (index: number) => {
        if (index >= selectedIds.length - 1) return;
        setSelectedIds(prev => {
            const next = [...prev];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            return next;
        });
    };

    const handleRemove = (songId: string) => {
        setSelectedIds(prev => prev.filter(id => id !== songId));
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert('请输入歌单名称');
            return;
        }
        if (selectedIds.length === 0) {
            alert('请至少选择一首歌');
            return;
        }
        onSave({
            id: playlist?.id || crypto.randomUUID(),
            name: name.trim(),
            songIds: selectedIds,
            createdAt: playlist?.createdAt || Date.now(),
        });
    };

    // 未选中的歌曲（可供添加）
    const unselectedSongs = songs.filter(s => !selectedIds.includes(s.id));
    // 已选中的歌曲（按 selectedIds 顺序）
    const orderedSelected = selectedIds
        .map(id => songs.find(s => s.id === id))
        .filter((s): s is Song => !!s);

    return (
        <div className="flex flex-col h-full bg-black">
            {/* 导航栏 */}
            <div
                className="fixed top-0 left-0 right-0 z-30 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 shadow-lg"
                style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}
            >
                <div className="h-11 flex items-center justify-between px-2">
                    <button
                        onClick={onCancel}
                        className="h-full px-3 flex items-center text-zinc-400 hover:text-white active:opacity-50 transition-all"
                    >
                        <ChevronLeft size={24} />
                        <span className="text-base font-medium">取消</span>
                    </button>
                    <span className="font-semibold text-white text-base absolute left-1/2 -translate-x-1/2 pointer-events-none">
                        {playlist ? '编辑歌单' : '新建歌单'}
                    </span>
                    <button
                        onClick={handleSave}
                        className="h-full px-4 text-ios-blue font-bold text-base active:opacity-50 transition-all flex items-center"
                    >
                        保存
                    </button>
                </div>
            </div>

            {/* 占位 */}
            <div style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}>
                <div className="h-11 w-full" />
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-safe-bottom">
                {/* 歌单名称 */}
                <input
                    type="text"
                    placeholder="歌单名称（如：今晚演出）"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border-none rounded-2xl px-5 py-3.5 text-white text-lg placeholder-zinc-500 focus:ring-2 focus:ring-ios-blue outline-none transition-all appearance-none"
                />

                {/* 已选歌曲 - 可排序 */}
                {orderedSelected.length > 0 && (
                    <div>
                        <h3 className="text-zinc-400 text-sm font-medium mb-3 px-1">
                            已选歌曲（{orderedSelected.length} 首 · 可排序）
                        </h3>
                        <div className="space-y-2">
                            {orderedSelected.map((song, index) => (
                                <div
                                    key={song.id}
                                    className="bg-zinc-900 rounded-2xl px-4 py-3 flex items-center gap-3"
                                >
                                    {/* 序号 */}
                                    <span className="text-ios-blue font-bold text-lg w-7 text-center flex-shrink-0">
                                        {index + 1}
                                    </span>

                                    {/* 歌曲信息 */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{song.title}</p>
                                        <p className="text-zinc-500 text-sm truncate">{song.artist || '未知歌手'}</p>
                                    </div>

                                    {/* 上移 */}
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className={`p-2 rounded-lg transition-colors active:scale-90 ${index === 0 ? 'text-zinc-700' : 'text-zinc-400 active:bg-zinc-800'
                                            }`}
                                    >
                                        <ChevronUp size={20} />
                                    </button>

                                    {/* 下移 */}
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === orderedSelected.length - 1}
                                        className={`p-2 rounded-lg transition-colors active:scale-90 ${index === orderedSelected.length - 1 ? 'text-zinc-700' : 'text-zinc-400 active:bg-zinc-800'
                                            }`}
                                    >
                                        <ChevronDown size={20} />
                                    </button>

                                    {/* 移除 */}
                                    <button
                                        onClick={() => handleRemove(song.id)}
                                        className="p-2 text-zinc-500 hover:text-red-500 rounded-lg transition-colors active:scale-90"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 可选歌曲列表 */}
                <div>
                    <h3 className="text-zinc-400 text-sm font-medium mb-3 px-1">
                        {unselectedSongs.length > 0 ? '点击添加歌曲' : '所有歌曲已添加'}
                    </h3>
                    <div className="space-y-2">
                        {unselectedSongs.map(song => (
                            <button
                                key={song.id}
                                onClick={() => handleToggleSong(song.id)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-3 active:bg-zinc-800 transition-colors text-left"
                            >
                                <div className="w-7 h-7 rounded-full border-2 border-zinc-600 flex items-center justify-center flex-shrink-0">
                                    <Check size={14} className="text-transparent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-zinc-300 font-medium truncate">{song.title}</p>
                                    <p className="text-zinc-600 text-sm truncate">{song.artist || '未知歌手'}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-20" />
            </div>
        </div>
    );
}
