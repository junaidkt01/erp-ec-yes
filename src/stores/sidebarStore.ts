import { create } from "zustand";

interface SidebarState {
  isMobileOpen: boolean;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isMobileOpen: false,

  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  openMobile: () => set({ isMobileOpen: true }),
  closeMobile: () => set({ isMobileOpen: false }),
}));
