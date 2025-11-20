'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useRegistrationStore } from '@/lib/client/store/registration-store';
import { housesData } from '@/lib/core/domain/house';
import { sortingQuestions } from '@/lib/core/domain/sorting-hat';
import { useSortingHat } from '@/lib/client/hooks/sorting-hat/use-sorting-hat';
import SortingHatQuestionScreen from '@/lib/client/components/sorting-hat/sorting-hat-question-screen';
import SortingHatResultScreen from '@/lib/client/components/sorting-hat/sorting-hat-result-screen';

export default function SortingHatPage() {
  const router = useRouter();
  const { data: registrationData } = useRegistrationStore();

  const { isLoading, sortingStep, selectedHouse, error, handleSortingAnswer } =
    useSortingHat();

  useEffect(() => {
    if (!registrationData) router.replace('/login');
  }, [registrationData, router]);

  if (!registrationData) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    );
  }

  if (selectedHouse) {
    const houseInfo = housesData[selectedHouse];
    return (
      <SortingHatResultScreen
        houseId={selectedHouse}
        house={{ id: selectedHouse, ...houseInfo }}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <SortingHatQuestionScreen
      step={sortingStep}
      totalSteps={sortingQuestions.length}
      question={sortingQuestions[sortingStep]}
      userName={registrationData.name}
      onAnswer={handleSortingAnswer}
    />
  );
}
