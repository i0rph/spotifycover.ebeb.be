import { create } from 'zustand';

interface State {
  type: 'playlist' | 'track' | null;
  size: number | null;
  resolution: number | null;
  urls: string[];
}

interface Actions {
  setType: (type: 'playlist' | 'track' | null) => void;
  setSize: (size: number | null) => void;
  setResolution: (resolution: number | null) => void;
  setUrls: (urls: string[]) => void;
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
  setUrls: urls => set({ urls }),
  reset: () => set(initialState),
}));
