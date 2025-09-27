import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  accessToken?: string;
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  display_name?: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface UserState {
  user: User | null;
  setCredentials: (user: any) => void;
  removeCredentials: () => void;
}

const userStoreSlice: StateCreator<UserState> = (set) => ({
  user: null,
  setCredentials: (user) => set({ user }),
  removeCredentials: () => set({ user: null }),
});

const persistedUserStore = persist<UserState>(userStoreSlice, {
  name: "user",
});

export const useUserStore = create(persistedUserStore);
