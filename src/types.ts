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

export type ViewState = 'LIST' | 'PROMPTER' | 'EDITOR';