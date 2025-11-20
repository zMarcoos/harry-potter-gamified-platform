'use client';

import { useMemo } from 'react';
import type { EnrichedUserRanking } from '@/lib/core/types/user.type';
import type { HouseStats, HouseId } from '@/lib/core/types/house.type';
import { housesData } from '@/lib/core/domain/house';

export type EnrichedHouseStats = HouseStats & {
  name: string;
  icon: string;
};

export function useRankingData(
  students: EnrichedUserRanking[],
  houseStats: HouseStats[],
) {
  const topStudents = useMemo(() => {
    if (!students) return [];
    return [...students].sort((a, b) => b.xp - a.xp);
  }, [students]);

  const enrichedHouseStats = useMemo(() => {
    if (!houseStats) return [];
    return [...houseStats]
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((stat) => {
        const houseId = stat.houseId as HouseId;
        const houseInfo = housesData[houseId];
        return {
          ...stat,
          name: houseInfo?.name || stat.houseId,
          icon: houseInfo?.icon || '❓',
        };
      });
  }, [houseStats]);

  return { topStudents, enrichedHouseStats };
}
