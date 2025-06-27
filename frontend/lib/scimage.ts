import { RawTerrain } from "@/types/schemas/terrain/RawTerrain";
import { Unit } from "@/types/schemas/entities/Unit";
import { Sprite } from "@/types/schemas/entities/Sprite";
import { FrameMeta, SCImageBundle } from "@/types/SCImage";
import { Location } from "@/types/schemas/entities/Location";
import { TILE_SIZE } from "./scterrain";
import { Asset } from "@/types/asset";
import { Entity } from "@/types/schemas/entities/Entity";

type props = { image: Blob; frame: number; meta: FrameMeta };
export async function fetchFrameImage({ image, frame, meta }: props) {
  const rect = meta[frame];
  if (!rect) throw new Error(`frame ${frame} not found.`);

  const bitmap = await createImageBitmap(image);
  const frameImage = await createImageBitmap(
    bitmap,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
  );

  // x_offset, y_offset을 고려해서 중심 정렬된 이미지 생성
  const canvas = new OffscreenCanvas(
    rect.width + Math.abs(rect.x_offset) * 2,
    rect.height + Math.abs(rect.y_offset) * 2,
  );
  const ctx = canvas.getContext("2d")!;

  // 캔버스 중앙에 이미지를 그려서 offset 효과 적용
  ctx.drawImage(frameImage, Math.abs(rect.x_offset), Math.abs(rect.y_offset));

  return canvas.transferToImageBitmap();
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
  terrain: RawTerrain,
  placedUnit: Unit[],
  SCImages: Map<number, SCImageBundle>,
): Promise<ImageBitmap> {
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;

  const tasks = placedUnit.map(async (unit) => {
    const imageID = unit.unit_definition.specification.graphics.sprite.image.id;
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
        unit.transform!.position.x - colored.width / 2,
        unit.transform!.position.y - colored.height / 2,
      );
    } else {
      const unitImage = await fetchFrameImage({
        image: image.diffuse,
        frame: 0,
        meta: image.meta,
      });
      ctx.drawImage(
        unitImage,
        unit.transform!.position.x - unitImage.width / 2,
        unit.transform!.position.y - unitImage.height / 2,
      );
    }
  });

  await Promise.all(tasks);

  return canvas.transferToImageBitmap();
}

export async function getPlacedSpriteImages(
  terrain: RawTerrain,
  placedSprite: Sprite[],
  SCImages: Map<number, SCImageBundle>,
) {
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;

  const tasks = placedSprite.map(async (sprite) => {
    const imageID = sprite.definition.image.id;
    const image = SCImages.get(imageID);

    if (!image) return;
    const spriteFrameImage = await fetchFrameImage({
      image: image.diffuse,
      frame: 0,
      meta: image.meta,
    });
    ctx.drawImage(
      spriteFrameImage,
      sprite.transform!.position.x - spriteFrameImage.width / 2,
      sprite.transform!.position.y - spriteFrameImage.height / 2,
    );
  });

  await Promise.all(tasks);

  return canvas.transferToImageBitmap();
}

export function getLocationImage(terrain: RawTerrain, locations: Location[]) {
  const thickness = 3;
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;

  locations.forEach((location) => {
    if (location.id != 63) {
      const width =
        location.transform.size.left + location.transform.size.right;
      const height =
        location.transform.size.top + location.transform.size.bottom;
      ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
      ctx.fillRect(
        location.transform.position.x,
        location.transform.position.y,
        width,
        height,
      );
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.strokeRect(
        location.transform.position.x,
        location.transform.position.y,
        width + thickness,
        height + thickness,
      );
      ctx.font = "40px serif";
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillText(
        location.name,
        location.transform.position.x,
        location.transform.position.y,
      );
    }
  });

  return canvas.transferToImageBitmap();
}

export function getSelectionHighlightImage(
  terrain: RawTerrain,
  selectedEntity?: Asset<Entity>,
) {
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;

  if (!selectedEntity || !selectedEntity.data) {
    ctx.clearRect(
      0,
      0,
      terrain.size.width * TILE_SIZE,
      terrain.size.height * TILE_SIZE,
    );
    return canvas.transferToImageBitmap();
  }
  const transform = selectedEntity.data?.transform;
  ctx.strokeStyle = "rgb(0, 255, 0)";
  ctx.lineWidth = 2;
  const x = transform.position.x - transform.size.left;
  const y = transform.position.y - transform.size.top;
  const width = transform.size.left + transform.size.right;
  const height = transform.size.top + transform.size.bottom;

  ctx.strokeRect(x, y, width, height);

  return canvas.transferToImageBitmap();
}
