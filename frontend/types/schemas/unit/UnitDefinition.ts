import { z } from "zod";

export const UnitDefinitionSchema = z
  .object({
    id: z.number().int().default(0),
    name: z.string().default("Definition"),
    ref_type: z.literal("Definition").default("Definition"),
    use_default: z.boolean().default(true),
    specification: z.object({
      name: z.string().default("Unit Specification"),
      graphics: z.number().int(),
      subunit1: z.number().int(),
      subunit2: z.number().int(),
      infestation: z.union([z.number().int(), z.null()]),
      construction_animation: z.number().int(),
      unit_direction: z.number().int(),
      portrait: z.number().int(),
      label: z.number().int(),
    }),
    stats: z.object({
      name: z.string().default("Unit Status"),
      hit_points: z.object({
        current: z.number().int().gte(0).default(0),
        max: z.number().int().gte(0).default(0),
      }),
      shield_enable: z.boolean(),
      shield_points: z.object({
        current: z.number().int().gte(0).default(0),
        max: z.number().int().gte(0).default(0),
      }),
      energy_points: z.object({
        current: z.number().int().gte(0).default(0),
        max: z.number().int().gte(0).default(0),
      }),
      armor_points: z.number().int().lt(256).default(0),
      armor_upgrade: z.number().int(),
      rank: z.number().int(),
      elevation_level: z.number().int(),
    }),
    weapons: z.object({
      ground_weapon: z.union([
        z.object({
          id: z.number().int().default(0),
          name: z.string().default("Definition"),
          ref_type: z.literal("Definition").default("Definition"),
          damage: z.object({
            amount: z.number().int().gte(0).lte(65536),
            bonus: z.number().int().gte(0).lte(65536),
            factor: z.number().int(),
          }),
          bullet: z.object({
            behaviour: z.number().int(),
            remove_after: z.number().int(),
            attack_angle: z.number().int(),
            launch_spin: z.number().int(),
            x_offset: z.number().int(),
            y_offset: z.number().int(),
          }),
          splash: z.object({
            inner: z.number().int(),
            medium: z.number().int(),
            outer: z.number().int(),
          }),
          cooldown: z.number().int(),
          upgrade: z.number().int(),
          weapon_type: z.number().int(),
          explosion_type: z.number().int(),
          target_flags: z.number().int(),
          error_message: z.number().int(),
          icon: z.number().int(),
          graphics: z.number().int(),
        }),
        z.null(),
      ]),
      max_ground_hits: z.number().int(),
      air_weapon: z.union([
        z.object({
          id: z.number().int().default(0),
          name: z.string().default("Definition"),
          ref_type: z.literal("Definition").default("Definition"),
          damage: z.object({
            amount: z.number().int().gte(0).lte(65536),
            bonus: z.number().int().gte(0).lte(65536),
            factor: z.number().int(),
          }),
          bullet: z.object({
            behaviour: z.number().int(),
            remove_after: z.number().int(),
            attack_angle: z.number().int(),
            launch_spin: z.number().int(),
            x_offset: z.number().int(),
            y_offset: z.number().int(),
          }),
          splash: z.object({
            inner: z.number().int(),
            medium: z.number().int(),
            outer: z.number().int(),
          }),
          cooldown: z.number().int(),
          upgrade: z.number().int(),
          weapon_type: z.number().int(),
          explosion_type: z.number().int(),
          target_flags: z.number().int(),
          error_message: z.number().int(),
          icon: z.number().int(),
          graphics: z.number().int(),
        }),
        z.null(),
      ]),
      max_air_hits: z.number().int(),
      target_acquisition_range: z.number().int(),
      sight_range: z.number().int(),
      special_ability_flags: z.number().int(),
    }),
    ai: z.object({
      name: z.string().default("Unit AI"),
      computer_idle: z.number().int(),
      human_idle: z.number().int(),
      return_to_idle: z.number().int(),
      attack_unit: z.number().int(),
      attack_and_move: z.number().int(),
      internal: z.number().int(),
      right_click: z.number().int(),
    }),
    sound: z.object({
      name: z.string().default("Unit Sound"),
      ready: z.union([z.number().int(), z.null()]),
      what_start: z.number().int(),
      what_end: z.number().int(),
      piss_start: z.union([z.number().int(), z.null()]),
      piss_end: z.union([z.number().int(), z.null()]),
      yes_start: z.union([z.number().int(), z.null()]),
      yes_end: z.union([z.number().int(), z.null()]),
    }),
    size: z.object({
      name: z.string().default("Unit Size"),
      size_type: z.number().int(),
      placement_box_size: z.object({
        height: z.number().int(),
        width: z.number().int(),
      }),
      bounds: z.object({
        left: z.number().int(),
        top: z.number().int(),
        right: z.number().int(),
        bottom: z.number().int(),
      }),
      addon_position: z.union([
        z.object({
          x: z.number().int().default(0),
          y: z.number().int().default(0),
        }),
        z.null(),
      ]),
    }),
    cost: z.object({
      name: z.string().default("Unit Cost"),
      cost: z.object({
        mineral: z.number().int().gte(0).default(0),
        gas: z.number().int().gte(0).default(0),
        time: z.number().int().gte(0).default(0),
      }),
      build_score: z.number().int(),
      destroy_score: z.number().int(),
      is_broodwar: z.boolean(),
      supply: z.object({
        required: z.number().int(),
        provided: z.number().int(),
      }),
      space: z.object({
        required: z.number().int(),
        provided: z.number().int(),
      }),
    }),
  })
  .describe("Definition of unit specification.");
export type UnitDefinition = z.infer<typeof UnitDefinitionSchema>;
