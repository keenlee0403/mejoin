export interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  createdAt: number;
  settings?: {
    speed: number;
    fontSize: number;
  }
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
}

export type ViewState = 'LIST' | 'PROMPTER' | 'EDITOR' | 'PLAYLISTS' | 'PLAYLIST_EDIT' | 'PLAYLIST_PLAY';