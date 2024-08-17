import { z } from "zod";
import { PaymentMethod, VerificationMethod, } from "./types";
import { getMinutes24hTime } from "@/util/dates";


const price = z.string().transform((val, ctx) => {
  const parsed = parseFloat(val);
  if (isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not a number"
    });
    return z.NEVER
  }
  return parsed
}).pipe(z.number().min(0)).or(z.number().min(0))

const HHMMTime = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)

// Types
export const itemOverviewSchema = z.object({
  name: z.string().min(1),
  base_price: price,
  id: z.number().min(1)
})

export const substitutionGroupSchema = z.object({
  name: z.string().min(1),
  id: z.number().min(1),
  substitutions: z.array(itemOverviewSchema)
})

export const categoryOverviewSchema = z.object({
  id: z.number().min(1),
  shop_id: z.number().min(1),
  name: z.string().min(1),
  item_ids: z.array(z.number().min(1))
})

// Create/Update Schemas
export const userUpdateSchema = z.object({
  preferred_name: z.string().min(2).max(64).optional()
})

export type UserUpdate = z.infer<typeof userUpdateSchema>

export const shopCreateSchema = z.object({
  name: z.string().min(1).max(64),
  payment_methods: z.array(z.nativeEnum(PaymentMethod))
})

export type ShopCreateInput = z.input<typeof shopCreateSchema>
export type ShopCreate = z.infer<typeof shopCreateSchema>


export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(64),
  index: z.number(),
  item_ids: z.array(itemOverviewSchema.transform(i => i.id))
})

export type CategoryCreateRaw = z.input<typeof categoryCreateSchema>
export type CategoryCreate = z.infer<typeof categoryCreateSchema>

export const substitutionGroupCreateSchema = z.object({
  name: z.string().min(1).max(64),
  substitution_item_ids: z.array(itemOverviewSchema.transform(i => i.id))
})

export type SubstitutionGroupCreateInput = z.input<typeof substitutionGroupCreateSchema>
export type SubstitutionGroupCreate = z.infer<typeof substitutionGroupCreateSchema>

export const itemVariantCreateSchema = z.object({
  name: z.string().min(1).max(64),
  price: price,
  index: z.number()
})

export type ItemVariantCreateInput = z.input<typeof itemVariantCreateSchema>
export type ItemVariantCreate = z.infer<typeof itemVariantCreateSchema>

export const itemCreateSchema = z.object({
  name: z.string().min(1).max(64),
  base_price: price,
  category_ids: z.array(categoryOverviewSchema.transform(c => c.id)),
  substitution_group_ids: z.array(substitutionGroupSchema.transform(g => g.id)),
  addon_ids: z.array(itemOverviewSchema.transform(a => a.id))
})

export type ItemCreateInput = z.input<typeof itemCreateSchema>
export type ItemCreate = z.infer<typeof itemCreateSchema>

const baseOrderSchema = z.object({
  quantity: z.number().min(0),
  id: z.number().min(1),
})
type BaseOrder = z.infer<typeof baseOrderSchema>

export const orderCreateSchema = z.object({
  item: z.object({
    id: z.number().min(1),
    variantId: z.number().min(1).optional()
  }),
  substitutions: z.array(z.object({
    id: z.number().min(1),
    itemId: z.number().min(1)
  })),
  addons: z.array(baseOrderSchema)
}).transform(({ item, substitutions, addons }) => {
  const totals = new Map<number, { quantity: number, variants: BaseOrder[] }>();


  // Count substitution items
  substitutions.forEach(sub => {
    const prevQuantity = totals.get(sub.itemId)?.quantity ?? 0
    totals.set(sub.itemId, { quantity: prevQuantity + 1, variants: [] })
  })

  // Count addon items
  addons.forEach(addon => {
    const prevQuantity = totals.get(addon.id)?.quantity ?? 0
    totals.set(addon.id, { quantity: prevQuantity + addon.quantity, variants: [] })
  })

  // Count the original item - it is the only one with variants
  const prevQuantity = totals.get(item.id)?.quantity ?? 0
  totals.set(item.id, { quantity: prevQuantity + 1, variants: item.variantId ? [{ id: item.variantId, quantity: 1 }] : [] })

  return { items: Array.from(totals, ([id, value]) => ({ id, ...value })) }

})

export type OrderCreateRaw = z.input<typeof orderCreateSchema>
export type OrderCreate = z.output<typeof orderCreateSchema>

const chartstring = z.string().regex(/^([A-z0-9]{5})[ |-]?([A-z0-9]{5})(?:(?:-|\s)([A-z0-9]{5})|([A-z0-9]{5}))?$/)


export const tabCreateSchema = z.object({
  display_name: z.string({ description: "Tab Name" }).min(2),
  payment_method: z.nativeEnum(PaymentMethod),
  organization: z.string().min(2),
  dates: z.object({
    from: z.string().date(),
    to: z.string().date()
  }),
  daily_start_time: HHMMTime,
  daily_end_time: HHMMTime,
  billing_interval_days: z.number().min(1).max(365),
  payment_details: z.union([z.string().length(0), chartstring.optional()]),
  verification_list: z.string().transform(s => s.split(',').filter(entry => entry !== "")).pipe(z.array(z.string().email())),
  verification_method: z.nativeEnum(VerificationMethod),
  dollar_limit_per_order: price
}).refine(input => {
  if (input.payment_method === PaymentMethod.chartstring && !input.payment_method) return false
  if (getMinutes24hTime(input.daily_start_time) >= getMinutes24hTime(input.daily_end_time)) return false

  return true
}).transform(({ dates, ...rest }) => ({ ...rest, start_date: dates.from, end_date: dates.to }))

export type TabCreateInput = z.input<typeof tabCreateSchema>
export type TabCreate = z.output<typeof tabCreateSchema>




