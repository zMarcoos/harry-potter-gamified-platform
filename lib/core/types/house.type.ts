import { z } from "zod/v4";

export const HouseIdSchema = z.enum([
  'gryffindor',
  'hufflepuff',
  'ravenclaw',
  'slytherin',
]);

export type HouseStats = {
  houseId: string;
  members: number;
  totalXp: number;
  avgXp: number;
};

export type HouseId = z.infer<typeof HouseIdSchema>;
