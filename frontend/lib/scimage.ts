import { RawTerrain } from "@/types/schemas/terrain/RawTerrain";
import { Unit } from "@/types/schemas/entities/Unit";
import { Sprite } from "@/types/schemas/entities/Sprite";
import { FrameMeta, SCImageBundle } from "@/types/SCImage";
import { Location } from "@/types/schemas/entities/Location";
import { TILE_SIZE } from "./scterrain";

type props = { image: Blob; frame: number; meta: FrameMeta };
export async function fetchFrameImage({ image, frame, meta }: props) {
  const rect = meta[frame];
  if (!rect) throw new Error(`frame ${frame} not found.`);

  const bitmap = await createImageBitmap(image);

  return createImageBitmap(bitmap, rect.x, rect.y, rect.width, rect.height);
}

export function createTeamColorUnitImage(
  diffuse: ImageBitmap,
  teamColor: ImageBitmap,
  color: [number, number, number],
) {
  const unitCanvas = new OffscreenCanvas(diffuse.width, diffuse.height);
  const teamColorCanvas = new OffscreenCanvas(
    teamColor.width,
    teamColor.height,
  );

  const uCtx = unitCanvas.getContext("2d")!;
  uCtx.drawImage(diffuse, 0, 0);
  const tCtx = teamColorCanvas.getContext("2d")!;
  tCtx.drawImage(teamColor, 0, 0);

  for (let y = 0; y < teamColor.height; y++) {
    for (let x = 0; x < teamColor.width; x++) {
      const tcPixel = tCtx.getImageData(x, y, 1, 1).data;
      const [tcR, tcG, tcB, tcA] = tcPixel;

      // Treat the teamColor layer as 1-bit mask: white applies team color, black does nothing
      const applyTeamColor = tcR > 127 && tcG > 127 && tcB > 127 && tcA > 0;
      if (!applyTeamColor) continue;

      // From the diffuse image, we read the pixel and use its RGB as a weight mask for blending
      const [dR, dG, dB] = uCtx.getImageData(x, y, 1, 1).data;
      const weightR = dR / 255;
      const weightG = dG / 255;
      const weightB = dB / 255;

      // Apply weighted team color to each channel
      const resultR = Math.round(color[0] * weightR);
      const resultG = Math.round(color[1] * weightG);
      const resultB = Math.round(color[2] * weightB);

      uCtx.fillStyle = `rgb(${resultR}, ${resultG}, ${resultB})`;
      uCtx.fillRect(x, y, 1, 1);
    }
  }

  return unitCanvas;
}

export async function getPlacedUnitImage(
  terrain: Terrain,
  placedUnit: Unit[],
  flingy: Flingy[],
  sprite: Sprite[],
  SCImages: Map<number, SCImageBundle>,
): Promise<ImageBitmap> {
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;

  const tasks = placedUnit.map(async (unit) => {
    const flingyID = unit.unit_definition.specification.graphics;
    const spriteID = flingy[flingyID].sprite;
    const imageID = sprite[spriteID].image;
    const image = SCImages.get(imageID);

    if (!image || !image.diffuse) return;

    if (image.teamColor) {
      const playerColor = unit.owner ? unit.owner.rgb_color : [255, 255, 0];
      const diffuse = await fetchFrameImage({
        image: image.diffuse,
        frame: 0,
        meta: image.meta,
      });
      const teamColor = await fetchFrameImage({
        image: image.teamColor,
        frame: 0,
        meta: image.meta,
      });
      const colored = createTeamColorUnitImage(
        diffuse,
        teamColor,
        playerColor as [number, number, number],
      );

      ctx.drawImage(
        colored,
        unit.transform!.position.x,
        unit.transform!.position.y,
      );
    } else {
      ctx.drawImage(
        await fetchFrameImage({
          image: image.diffuse,
          frame: 0,
          meta: image.meta,
        }),
        unit.transform!.position.x,
        unit.transform!.position.y,
      );
    }
  });

  await Promise.all(tasks);

  return canvas.transferToImageBitmap();
}

export async function getPlacedSpriteImages(
  terrain: Terrain,
  placedSprite: Sprite[],
  SCImages: Map<number, SCImageBundle>,
) {
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;

  const tasks = placedSprite.map(async (sprite) => {
    const imageID = sprite.image;
    const image = SCImages.get(imageID);

    if (!image) return;
    ctx.drawImage(
      await fetchFrameImage({
        image: image.diffuse,
        frame: 0,
        meta: image.meta,
      }),
      sprite.transform!.position.x,
      sprite.transform!.position.y,
    );
  });

  await Promise.all(tasks);

  return canvas.transferToImageBitmap();
}

export function getLocationImage(terrain: Terrain, locations: Location[]) {
  const thickness = 3;
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;

  locations.forEach((location) => {
    if (location.id != 63) {
      const width = location.position.right - location.position.left;
      const height = location.position.bottom - location.position.top;
      ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
      ctx.fillRect(
        location.position.left,
        location.position.top,
        width,
        height,
      );
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.strokeRect(
        location.position.left,
        location.position.top,
        width + thickness,
        height + thickness,
      );
      ctx.font = "40px serif";
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillText(
        location.name,
        location.position.left,
        location.position.top,
      );
    }
  });

  return canvas.transferToImageBitmap();
}
