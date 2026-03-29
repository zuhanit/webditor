import {
  Container,
  Texture,
  Sprite as PixiSprite,
  Graphics,
} from "pixi.js";
import { Sprite } from "@/types/schemas/entities/Sprite";
import { SCImageBundle } from "@/types/SCImage";
import { Asset } from "@/types/asset";
import { Entity } from "@/types/schemas/entities/Entity";

class SCSpriteDisplay extends Container {
  readonly data: Asset<Sprite>;
  private sprite: PixiSprite;
  private selectionBorder: Graphics;
  private _selected = false;

  constructor(texture: Texture, data: Asset<Sprite>) {
    super();
    this.data = data;

    this.sprite = new PixiSprite(texture);
    this.sprite.anchor.set(0.5);
    this.addChild(this.sprite);

    this.selectionBorder = new Graphics();
    this.selectionBorder.visible = false;
    this.addChild(this.selectionBorder);

    const spriteData = data.data!;
    this.position.set(
      spriteData.transform.position.x,
      spriteData.transform.position.y,
    );

    this.eventMode = "static";
    this.cursor = "pointer";
  }

  set selected(value: boolean) {
    if (this._selected === value) return;
    this._selected = value;
    this.selectionBorder.visible = value;

    if (value) {
      const s = this.data.data!;
      const { left, top, right, bottom } = s.transform.size;

      this.selectionBorder.clear();
      this.selectionBorder.setStrokeStyle({ width: 2, color: 0x00ff00 });
      this.selectionBorder.rect(-left, -top, left + right, top + bottom);
      this.selectionBorder.stroke();
    }
  }

  get selected() {
    return this._selected;
  }
}

async function createTextureFromBundle(
  bundle: SCImageBundle,
): Promise<Texture> {
  const frame0 = bundle.meta[0];
  if (!frame0) throw new Error("Frame 0 not found in bundle meta");

  const bitmap = await createImageBitmap(bundle.diffuse);
  const frameBitmap = await createImageBitmap(
    bitmap,
    frame0.x,
    frame0.y,
    frame0.width,
    frame0.height,
  );

  return Texture.from({ resource: frameBitmap, alphaMode: "premultiply-alpha-on-upload" });
}

export class SpriteLayer extends Container {
  private spriteMap = new Map<number, SCSpriteDisplay>();
  private _sprites: Asset<Sprite>[] = [];
  private _images: Map<number, SCImageBundle> = new Map();
  private _selectedId: number | null = null;
  private _onSelect: ((entity: Asset<Entity>) => void) | null = null;

  set sprites(value: Asset<Sprite>[]) {
    this._sprites = value;
    if (this.spriteMap) this.syncSprites();
  }

  set images(value: Map<number, SCImageBundle>) {
    this._images = value;
    if (this.spriteMap) this.syncSprites();
  }

  set selectedId(value: number | null) {
    this._selectedId = value;
    this.spriteMap?.forEach((display, id) => {
      display.selected = id === value;
    });
  }

  set onSelect(value: ((entity: Asset<Entity>) => void) | null) {
    this._onSelect = value;
  }

  private async syncSprites() {
    if (!this._sprites.length && this.spriteMap.size === 0) return;

    const currentIds = new Set(this._sprites.map((s) => s.data!.id));

    // Remove sprites that no longer exist
    for (const [id, display] of this.spriteMap) {
      if (!currentIds.has(id)) {
        this.removeChild(display);
        display.destroy({ children: true });
        this.spriteMap.delete(id);
      }
    }

    // Add or update sprites
    for (const asset of this._sprites) {
      const spriteData = asset.data!;
      const imageID = spriteData.definition.image.id;
      const bundle = this._images.get(imageID);
      if (!bundle) continue;

      const existing = this.spriteMap.get(spriteData.id);
      if (existing) {
        existing.position.set(
          spriteData.transform.position.x,
          spriteData.transform.position.y,
        );
        existing.selected = spriteData.id === this._selectedId;
        continue;
      }

      try {
        const texture = await createTextureFromBundle(bundle);
        const display = new SCSpriteDisplay(texture, asset);

        display.on("pointertap", () => {
          if (this._onSelect) {
            this._onSelect(asset);
          }
        });

        display.selected = spriteData.id === this._selectedId;
        this.spriteMap.set(spriteData.id, display);
        this.addChild(display);
      } catch (e) {
        console.warn(
          `Failed to create sprite display for ${spriteData.name}:`,
          e,
        );
      }
    }
  }
}
