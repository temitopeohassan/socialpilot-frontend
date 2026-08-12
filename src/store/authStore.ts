import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  avatar_url?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  workspaceId: number | null;
  setAuth: (token: string, user: User) => void;
  setWorkspace: (id: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      workspaceId: null,
      setAuth: (token, user) => set({ token, user }),
      setWorkspace: (workspaceId) => set({ workspaceId }),
      logout: () => set({ token: null, user: null, workspaceId: null }),
    }),
    { name: "socialpilot-auth" }
  )
);
