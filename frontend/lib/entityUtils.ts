import { Asset } from "@/types/asset";
import { Entity } from "@/types/schemas/entities/Entity";

export function findEntityAtPosition(
  x: number,
  y: number,
  entities: Asset<Entity>[],
): Asset<Entity> | null {
  const entitiesAtPosition = entities.filter((entity) => {
    if (!entity.data) return;
    const transform = entity.data!.transform;
    return (
      x >= transform.position.x - transform.size.left &&
      x < transform.position.x + transform.size.right &&
      y >= transform.position.y - transform.size.top &&
      y < transform.position.y + transform.size.bottom
    );
  });

  return entitiesAtPosition[entitiesAtPosition.length - 1] || null;
}
