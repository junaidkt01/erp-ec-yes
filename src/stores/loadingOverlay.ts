// stores/loadingOverlay.ts
import { create } from "zustand";

interface OverlayState {
  open: boolean;
  statusCode?: number;
  message?: string;

  show: (status: number, message?: string) => void;
  hide: () => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  open: false,
  statusCode: undefined,
  message: "",

  show: (status, message) =>
    set({
      open: true,
      statusCode: status,
      message,
    }),

  hide: () =>
    set({
      open: false,
      statusCode: undefined,
      message: "",
    }),
}));