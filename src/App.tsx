import React, { useState, useEffect } from 'react';
import { Song, ViewState } from './types';
import SongList from './components/SongList';
import Prompter from './components/Prompter';
import Editor from './components/Editor';

const STORAGE_KEY = 'stageflow_songs';

export default function App() {
  const [view, setView] = useState<ViewState>('LIST');
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSongs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse songs", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  }, [songs]);

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

  const activeSong = songs.find(s => s.id === activeSongId);

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
          song={activeSong}
          onBack={() => setView('LIST')}
          onEdit={() => handleEditSong(activeSong.id)}
        />
      )}
    </div>
  );
}