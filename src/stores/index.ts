import { create } from 'zustand';

export interface ICellData {
  type: 'url' | 'file';
  value: string;
  fileName?: string;
}

interface State {
  type: 'playlist' | 'track' | null;
  size: number | null;
  resolution: number | null;
  urls: ICellData[][];
}

interface Actions {
  setType: (_type: 'playlist' | 'track' | null) => void;
  setSize: (_size: number | null) => void;
  setResolution: (_resolution: number | null) => void;
  setUrls: (_urls: ICellData[][]) => void;
  reset: () => void;
}

const initialState: State = {
  type: null,
  size: null,
  resolution: null,
  urls: [],
};

export const useStore = create<State & Actions>()(set => ({
  type: null,
  size: null,
  resolution: null,
  urls: [],
  setType: type => set({ type }),
  setSize: size => set({ size }),
  setResolution: resolution => set({ resolution }),
  setUrls: (urls: ICellData[][]) => set({ urls }),
  reset: () => set(initialState),
}));
