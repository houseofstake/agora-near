import { create } from "zustand";

interface DelegateStatementStore {
  showSaveSuccess: boolean;
  showNearSocialSaveSuccess: boolean;
  setSaveSuccess: (show: boolean) => void;
  setNearSocialSaveSuccess: (show: boolean) => void;
}

export const useDelegateStatementStore = create<DelegateStatementStore>(
  (set) => ({
    showSaveSuccess: false,
    showNearSocialSaveSuccess: false,
    setSaveSuccess: (show) => set({ showSaveSuccess: show }),
    setNearSocialSaveSuccess: (show) =>
      set({ showNearSocialSaveSuccess: show }),
  })
);
