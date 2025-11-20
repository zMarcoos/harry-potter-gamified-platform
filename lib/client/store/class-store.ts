import { toast } from 'sonner';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { jsonFetch } from '@/lib/core/utils/api';
import type { EnrichedClass } from '@/lib/core/types/class.type';
import type { ClassUser } from '@/lib/core/types/user.type';

type ClassState = {
  selectedClassId: string | null;
  classInfo: EnrichedClass | null;
  currentUserClassData: ClassUser | null;
  selectClass: (
    classId: string | null,
    userId: string | null,
  ) => Promise<boolean>;
  clearClass: () => void;
  _hasHydrated: boolean;
  setHydrated: () => void;
};

export const useClassStore = create<ClassState>()(
  persist(
    (set, get) => ({
      selectedClassId: null,
      classInfo: null,
      currentUserClassData: null,
      _hasHydrated: false,

      clearClass: () => {
        set({
          classInfo: null,
          selectedClassId: null,
          currentUserClassData: null,
        });
      },

      selectClass: async (classId: string | null, userId: string | null) => {
        if (!classId || !userId) {
          get().clearClass();
          return true;
        }

        try {
          const fetchedClassInfo = await jsonFetch<EnrichedClass>(
            `/api/classes/me?id=${classId}`,
          );

          const userData = fetchedClassInfo.users?.[userId] || null;

          set({
            classInfo: fetchedClassInfo,
            selectedClassId: classId,
            currentUserClassData: userData,
          });

          toast.success(`Entrando na turma: ${fetchedClassInfo.name}!`);
          return true;
        } catch (error) {
          toast.error('Não foi possível carregar os dados da turma.');
          get().clearClass();
          return false;
        }
      },

      setHydrated: () => {
        set({ _hasHydrated: true });
      },
    }),
    {
      name: 'class-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedClassId: state.selectedClassId }),
      onRehydrateStorage: () => () => {
        useClassStore.getState().setHydrated();
      },
    },
  ),
);
