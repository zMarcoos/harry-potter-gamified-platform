'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthActions } from '@/lib/client/contexts/auth-context';
import { useRegistrationStore } from '@/lib/client/store/registration-store';
import type { HouseId } from '@/lib/core/domain/house';
import { housesData } from '@/lib/core/domain/house';
import {
  calculateWinningHouse,
  sortingQuestions,
} from '@/lib/core/domain/sorting-hat';

export const useSortingHat = () => {
  const { register, isPendingRegister } = useAuthActions();
  const router = useRouter();
  const { data: registrationData, clearRegistrationData } =
    useRegistrationStore();

  const [sortingStep, setSortingStep] = useState(0);
  const [answers, setAnswers] = useState<HouseId[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<HouseId | null>(null);
  const [error, setError] = useState('');

  const finishRegistration = async (house: HouseId) => {
    if (!registrationData) {
      setError(
        'Dados de registro não encontrados. Por favor, tente novamente.',
      );
      return;
    }

    try {
      await register({
        email: registrationData.email,
        house: house,
        name: registrationData.name,
        password: registrationData.password,
        role: 'student',
      });

      const houseInfo = housesData[house];
      toast.success(`Bem-vindo à ${houseInfo.name}!`, {
        description: houseInfo.description,
        duration: 5000,
      });

      setTimeout(() => {
        clearRegistrationData();
        router.push('/select-class');
      }, 10_000);
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
    }
  };

  const handleSortingAnswer = (house: HouseId) => {
    const newAnswers = [...answers, house];
    setAnswers(newAnswers);

    const isLastStep = sortingStep === sortingQuestions.length - 1;

    if (isLastStep) {
      const winningHouse = calculateWinningHouse(newAnswers);
      setSelectedHouse(winningHouse);
      finishRegistration(winningHouse);
    } else {
      setSortingStep(sortingStep + 1);
    }
  };

  return {
    isLoading: isPendingRegister,
    sortingStep,
    selectedHouse,
    error,
    registrationData,
    handleSortingAnswer,
  };
};

