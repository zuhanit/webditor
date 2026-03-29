import { Container, Texture, Sprite as PixiSprite, Graphics } from "pixi.js";
import { Unit } from "@/types/schemas/entities/Unit";
import { SCImageBundle } from "@/types/SCImage";
import { Asset } from "@/types/asset";
import { Entity } from "@/types/schemas/entities/Entity";

class UnitSprite extends Container {
  readonly data: Asset<Unit>;
  private sprite: PixiSprite;
  private selectionBorder: Graphics;
  private _selected = false;

  constructor(texture: Texture, data: Asset<Unit>) {
    super();
    this.data = data;

    this.sprite = new PixiSprite(texture);
    this.sprite.anchor.set(0.5);
    this.addChild(this.sprite);

    this.selectionBorder = new Graphics();
    this.selectionBorder.visible = false;
    this.addChild(this.selectionBorder);

    const unit = data.data!;
    this.position.set(unit.transform.position.x, unit.transform.position.y);

    this.eventMode = "static";
    this.cursor = "pointer";
  }

  set selected(value: boolean) {
    if (this._selected === value) return;
    this._selected = value;
    this.selectionBorder.visible = value;

    if (value) {
      const unit = this.data.data!;
      const { left, top, right, bottom } = unit.transform.size;
      const [radiusX, radiusY] = [
        unit.unit_definition.size.placement_box_size.width,
        unit.unit_definition.size.placement_box_size.height,
      ];

      console.log(
        unit.transform.position.x,
        unit.transform.position.y,
        radiusX,
        radiusY,
      );
      this.selectionBorder
        .clear()
        .setStrokeStyle({ width: 2, color: 0x00ff00 })
        .ellipse(0, 0, radiusX, radiusY)
        .stroke();
      // this.selectionBorder.rect(-left, -top, left + right, top + bottom);
    }
  }

  get selected() {
    return this._selected;
  }

  updateTexture(texture: Texture) {
    this.sprite.texture = texture;
  }
}

async function createTextureFromBundle(
  bundle: SCImageBundle,
  teamColor?: [number, number, number],
): Promise<Texture> {
  const frame0 = bundle.meta[0];
  if (!frame0) throw new Error("Frame 0 not found in bundle meta");

  const diffuseBitmap = await createImageBitmap(bundle.diffuse);
  const frameBitmap = await createImageBitmap(
    diffuseBitmap,
    frame0.x,
    frame0.y,
    frame0.width,
    frame0.height,
  );

  if (bundle.teamColor && teamColor) {
    const tcBitmap = await createImageBitmap(bundle.teamColor);
    const tcFrameBitmap = await createImageBitmap(
      tcBitmap,
      frame0.x,
      frame0.y,
      frame0.width,
      frame0.height,
    );

    const canvas = new OffscreenCanvas(frame0.width, frame0.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(frameBitmap, 0, 0);

    const tcCanvas = new OffscreenCanvas(frame0.width, frame0.height);
    const tcCtx = tcCanvas.getContext("2d")!;
    tcCtx.drawImage(tcFrameBitmap, 0, 0);

    const imageData = ctx.getImageData(0, 0, frame0.width, frame0.height);
    const tcData = tcCtx.getImageData(0, 0, frame0.width, frame0.height);
    const pixels = imageData.data;
    const tcPixels = tcData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const tcR = tcPixels[i];
      const tcG = tcPixels[i + 1];
      const tcB = tcPixels[i + 2];
      const tcA = tcPixels[i + 3];

      if (tcR > 127 && tcG > 127 && tcB > 127 && tcA > 0) {
        const wR = pixels[i] / 255;
        const wG = pixels[i + 1] / 255;
        const wB = pixels[i + 2] / 255;

        pixels[i] = Math.round(teamColor[0] * wR);
        pixels[i + 1] = Math.round(teamColor[1] * wG);
        pixels[i + 2] = Math.round(teamColor[2] * wB);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const result = canvas.transferToImageBitmap();
    return Texture.from({
      resource: result,
      alphaMode: "premultiply-alpha-on-upload",
    });
  }

  return Texture.from({
    resource: frameBitmap,
    alphaMode: "premultiply-alpha-on-upload",
  });
}

export class UnitLayer extends Container {
  private unitMap = new Map<number, UnitSprite>();
  private _units: Asset<Unit>[] = [];
  private _images: Map<number, SCImageBundle> = new Map();
  private _selectedId: number | null = null;
  private _onSelect: ((entity: Asset<Entity>) => void) | null = null;

  set units(value: Asset<Unit>[]) {
    this._units = value;
    if (this.unitMap) this.syncUnits();
  }

  set images(value: Map<number, SCImageBundle>) {
    this._images = value;
    if (this.unitMap) this.syncUnits();
  }

  set selectedId(value: number | null) {
    this._selectedId = value;
    this.unitMap?.forEach((sprite, id) => {
      sprite.selected = id === value;
    });
  }

  set onSelect(value: ((entity: Asset<Entity>) => void) | null) {
    this._onSelect = value;
  }

  private async syncUnits() {
    if (!this._units.length && this.unitMap.size === 0) return;

    const currentIds = new Set(this._units.map((u) => u.data!.id));

    // Remove units that no longer exist
    for (const [id, sprite] of this.unitMap) {
      if (!currentIds.has(id)) {
        this.removeChild(sprite);
        sprite.destroy({ children: true });
        this.unitMap.delete(id);
      }
    }

    // Add or update units
    for (const asset of this._units) {
      const unit = asset.data!;
      const imageID =
        unit.unit_definition.specification.graphics.sprite.image.id;
      const bundle = this._images.get(imageID);
      if (!bundle) continue;

      const existing = this.unitMap.get(unit.id);
      if (existing) {
        // Update position
        existing.position.set(
          unit.transform.position.x,
          unit.transform.position.y,
        );
        existing.selected = unit.id === this._selectedId;
        continue;
      }

      // Create new unit sprite
      try {
        const color = unit.owner?.rgb_color as
          | [number, number, number]
          | undefined;
        const texture = await createTextureFromBundle(bundle, color);
        const sprite = new UnitSprite(texture, asset);

        sprite.on("pointertap", () => {
          if (this._onSelect) {
            this._onSelect(asset);
          }
        });

        sprite.selected = unit.id === this._selectedId;
        this.unitMap.set(unit.id, sprite);
        this.addChild(sprite);
      } catch (e) {
        console.warn(`Failed to create unit sprite for ${unit.name}:`, e);
      }
    }
  }
}
