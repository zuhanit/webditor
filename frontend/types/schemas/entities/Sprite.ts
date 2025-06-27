import { z } from "zod";

export const SpriteSchema = z
  .object({
    id: z.number().int().default(0),
    name: z.string().default("Object"),
    transform: z
      .object({
        id: z.number().int().default(0),
        name: z.string().default("Object"),
        position: z.object({
          x: z.number().int().default(0),
          y: z.number().int().default(0),
        }),
        size: z.object({
          left: z.number().int(),
          top: z.number().int(),
          right: z.number().int(),
          bottom: z.number().int(),
        }),
      })
      .describe("An entity component can have spatial data."),
    kind: z
      .enum(["Unit", "Sprite", "Location", "Tile", "Mask"])
      .default("Sprite"),
    owner: z.object({
      id: z.number().int().default(0),
      name: z.string().default("Object"),
      color: z.number().int(),
      rgb_color: z.array(z.any()).min(3).max(3),
      player_type: z.enum([
        "Inactive",
        "Computer (game)",
        "Occupied By Human Player",
        "Rescue",
        "Unused",
        "Computer",
        "Human (Open Slot)",
        "Neutral",
        "Closed Slot",
      ]),
      race: z.enum([
        "Zerg",
        "Terran",
        "Protoss",
        "Invalid (Independant)",
        "Invalid (Neutral)",
        "User Selectable",
        "Random",
        "Inactive",
      ]),
      force: z.number().int().gte(0).lt(4).default(0),
    }),
    flags: z.number().int(),
    definition: z.object({
      id: z.number().int().default(0),
      name: z.string().default("Definition"),
      ref_type: z.literal("Definition").default("Definition"),
      image: z.object({
        id: z.number().int().default(0),
        name: z.string().default("Definition"),
        ref_type: z.literal("Definition").default("Definition"),
        graphic: z.number().int(),
        turnable: z.boolean(),
        clickable: z.boolean(),
        use_full_iscript: z.boolean(),
        draw_if_cloaked: z.boolean(),
        draw_function: z.number().int(),
        remapping: z.number().int(),
        iscript_id: z.number().int(),
        shield_overlay: z.number().int(),
        attack_overlay: z.number().int(),
        damage_overlay: z.number().int(),
        special_overlay: z.number().int(),
        landing_dust_overlay: z.number().int(),
        lift_off_overlay: z.number().int(),
      }),
      health_bar_id: z.union([z.number().int(), z.null()]),
      selection_circle_image_id: z.union([z.number().int(), z.null()]),
      selection_circle_offset: z.union([z.number().int(), z.null()]),
    }),
  })
  .describe("Placed Sprite Entity.");
export type Sprite = z.infer<typeof SpriteSchema>;
