import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

interface RegistrationState {
  data: RegistrationData | null;
  setRegistrationData: (data: RegistrationData) => void;
  clearRegistrationData: () => void;
}

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      data: null,
      setRegistrationData: (data) => set({ data }),
      clearRegistrationData: () => set({ data: null }),
    }),
    {
      name: 'registration-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
