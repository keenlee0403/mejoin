import React, { useState, useEffect } from 'react';
import { Song, Playlist, ViewState } from './types';
import SongList from './components/SongList';
import Prompter from './components/Prompter';
import Editor from './components/Editor';
import PlaylistList from './components/PlaylistList';
import PlaylistEditor from './components/PlaylistEditor';
import PlaylistPlay from './components/PlaylistPlay';

const SONGS_KEY = 'stageflow_songs';
const PLAYLISTS_KEY = 'stageflow_playlists';

export default function App() {
  const [view, setView] = useState<ViewState>('LIST');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [playlistSongIndex, setPlaylistSongIndex] = useState(0);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  // 记住从哪个视图进入 Prompter，返回时用
  const [returnView, setReturnView] = useState<ViewState>('LIST');

  // 加载歌曲
  useEffect(() => {
    const saved = localStorage.getItem(SONGS_KEY);
    if (saved) {
      try { setSongs(JSON.parse(saved)); } catch (e) { console.error("Failed to parse songs", e); }
    }
  }, []);

  // 保存歌曲
  useEffect(() => {
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  }, [songs]);

  // 加载歌单
  useEffect(() => {
    const saved = localStorage.getItem(PLAYLISTS_KEY);
    if (saved) {
      try { setPlaylists(JSON.parse(saved)); } catch (e) { console.error("Failed to parse playlists", e); }
    }
  }, []);

  // 保存歌单
  useEffect(() => {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }, [playlists]);

  // ========== 歌曲操作 ==========

  const handleSaveSong = (song: Song) => {
    setSongs(prev => {
      const existing = prev.findIndex(s => s.id === song.id);
      if (existing >= 0) {
        const newSongs = [...prev];
        newSongs[existing] = song;
        return newSongs;
      }
      return [song, ...prev];
    });
    setView('LIST');
  };

  const handleDeleteSong = (id: string) => {
    if (window.confirm("确定要删除这首歌吗？")) {
      setSongs(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSelectSong = (id: string) => {
    setActiveSongId(id);
    setReturnView('LIST');
    setView('PROMPTER');
  };

  const handleCreateNew = () => {
    setActiveSongId(null);
    setView('EDITOR');
  };

  const handleEditSong = (id: string) => {
    setActiveSongId(id);
    setView('EDITOR');
  };

  // ========== 歌单操作 ==========

  const handleSavePlaylist = (playlist: Playlist) => {
    setPlaylists(prev => {
      const existing = prev.findIndex(p => p.id === playlist.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = playlist;
        return updated;
      }
      return [playlist, ...prev];
    });
    setView('PLAYLISTS');
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const handleSelectPlaylist = (id: string) => {
    setActivePlaylistId(id);
    setPlaylistSongIndex(0);
    setView('PLAYLIST_PLAY');
  };

  const handlePlaylistSelectSong = (songId: string, index: number) => {
    setActiveSongId(songId);
    setPlaylistSongIndex(index);
    setReturnView('PLAYLIST_PLAY');
    setView('PROMPTER');
  };

  const handleNextSong = () => {
    const playlist = playlists.find(p => p.id === activePlaylistId);
    if (!playlist) return;
    const nextIndex = playlistSongIndex + 1;
    if (nextIndex < playlist.songIds.length) {
      const nextSongId = playlist.songIds[nextIndex];
      setActiveSongId(nextSongId);
      setPlaylistSongIndex(nextIndex);
      // 保持在 PROMPTER 视图，React 会 re-render with new song
    }
  };

  // ========== 派生数据 ==========

  const activeSong = songs.find(s => s.id === activeSongId);
  const activePlaylist = playlists.find(p => p.id === activePlaylistId);

  // 在歌单模式下，获取下一首歌
  const getNextSong = (): Song | undefined => {
    if (returnView !== 'PLAYLIST_PLAY' || !activePlaylist) return undefined;
    const nextIndex = playlistSongIndex + 1;
    if (nextIndex >= activePlaylist.songIds.length) return undefined;
    return songs.find(s => s.id === activePlaylist.songIds[nextIndex]);
  };

  // ========== iOS 安装提示 ==========

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => setShowInstallHelp(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="h-full w-full relative bg-black text-white">
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center pb-8 animate-fade-in p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowInstallHelp(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-2 text-center">全屏体验更佳</h3>
            <p className="text-zinc-400 text-sm text-center mb-4">
              为了获得沉浸式提词体验，请将此页面添加到主屏幕。
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-ios-blue font-medium">
              <span>点击分享按钮</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              <span>然后选择 "添加到主屏幕"</span>
            </div>
            <button
              onClick={() => setShowInstallHelp(false)}
              className="mt-6 w-full bg-ios-card py-3 rounded-xl font-semibold text-ios-blue active:bg-zinc-800 transition-colors"
            >
              知道了
            </button>
          </div>
        </div>
      )}

      {view === 'LIST' && (
        <SongList
          songs={songs}
          onSelect={handleSelectSong}
          onEdit={handleEditSong}
          onDelete={handleDeleteSong}
          onCreate={handleCreateNew}
          onOpenPlaylists={() => setView('PLAYLISTS')}
        />
      )}

      {view === 'EDITOR' && (
        <Editor
          song={activeSong}
          onSave={handleSaveSong}
          onCancel={() => setView('LIST')}
        />
      )}

      {view === 'PROMPTER' && activeSong && (
        <Prompter
          key={activeSong.id}
          song={activeSong}
          onBack={() => setView(returnView)}
          onEdit={() => handleEditSong(activeSong.id)}
          nextSong={getNextSong()}
          onNext={handleNextSong}
        />
      )}

      {view === 'PLAYLISTS' && (
        <PlaylistList
          playlists={playlists}
          songs={songs}
          onSelect={handleSelectPlaylist}
          onCreate={() => { setActivePlaylistId(null); setView('PLAYLIST_EDIT'); }}
          onDelete={handleDeletePlaylist}
          onBack={() => setView('LIST')}
        />
      )}

      {view === 'PLAYLIST_EDIT' && (
        <PlaylistEditor
          playlist={activePlaylist}
          songs={songs}
          onSave={handleSavePlaylist}
          onCancel={() => setView('PLAYLISTS')}
        />
      )}

      {view === 'PLAYLIST_PLAY' && activePlaylist && (
        <PlaylistPlay
          playlist={activePlaylist}
          songs={songs}
          currentIndex={playlistSongIndex}
          onSelectSong={handlePlaylistSelectSong}
          onEdit={() => { setView('PLAYLIST_EDIT'); }}
          onBack={() => setView('PLAYLISTS')}
        />
      )}
    </div>
  );
}