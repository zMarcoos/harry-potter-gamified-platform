import { z } from "zod/v4";

export const ShopItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  price: z.number().int().nonnegative(),
  category: z.string(),
  stock: z.number().int().nonnegative(),
});

export const CreateShopItemInputSchema = ShopItemSchema.omit({ id: true });
export const UpdateShopItemInputSchema = ShopItemSchema.omit({ id: true }).partial();

export type ShopItem = z.infer<typeof ShopItemSchema>;
export type CreateShopItemInput = z.infer<typeof CreateShopItemInputSchema>;
export type UpdateShopItemInput = z.infer<typeof UpdateShopItemInputSchema>;
