import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
  
      isAuthenticated: false,
      
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, fcmToken: null }),
      
    
      

      updateUser: (userData) => set(state => ({ 
        user: { ...state.user, ...userData },
        isAuthenticated: true 
      })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;