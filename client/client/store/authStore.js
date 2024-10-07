import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  updateCurrentUser: async (userData) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
   

        set({ currentUser: userData });
      } else {
        await AsyncStorage.removeItem('user');
        set({ currentUser: null });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  loadUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        set({ currentUser: JSON.parse(user) });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Exporting the entire store
export const authStore = useAuthStore.getState();

export default useAuthStore;
