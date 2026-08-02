import { create } from "zustand";

interface ToastState {
  message: string | null;
  id: number;
  show: (message: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  id: 0,
  show: (message) => set((state) => ({ message, id: state.id + 1 })),
}));
