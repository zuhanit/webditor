import { Usemap } from "@/types/schemas/project/Usemap";

export function resolveReferences(rawUsemap: Usemap) {
  console.log("Resolving References...");
  for (const unit of rawUsemap.placed_unit) {
    const unitDefID = unit.unit_definition.id;
    const unitDef = rawUsemap.unit_definitions[unitDefID];
    unit.unit_definition = unitDef;
  }
}
