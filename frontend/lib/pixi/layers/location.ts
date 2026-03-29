import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { Location } from "@/types/schemas/entities/Location";
import { Asset } from "@/types/asset";
import { Entity } from "@/types/schemas/entities/Entity";

class LocationRect extends Container {
  readonly data!: Asset<Location>;
  private bg!: Graphics;
  private border!: Graphics;
  private nameLabel!: Text;
  private selectionBorder!: Graphics;
  private _selected = false;

  constructor(data: Asset<Location>) {
    super();
    this.data = data;

    const loc = data.data!;
    const { left, top, right, bottom } = loc.transform.size;
    const width = left + right;
    const height = top + bottom;

    this.position.set(loc.transform.position.x, loc.transform.position.y);

    // Semi-transparent blue fill
    this.bg = new Graphics();
    this.bg.rect(0, 0, width, height);
    this.bg.fill({ color: 0x0000ff, alpha: 0.15 });
    this.addChild(this.bg);

    // Border
    this.border = new Graphics();
    this.border.setStrokeStyle({ width: 3, color: 0x000000, alpha: 0.15 });
    this.border.rect(0, 0, width + 3, height + 3);
    this.border.stroke();
    this.addChild(this.border);

    // Label
    this.nameLabel = new Text({
      text: loc.name,
      style: new TextStyle({
        fontSize: 40,
        fontFamily: "serif",
        fill: 0xffffff,
      }),
    });
    this.addChild(this.nameLabel);

    // Selection highlight
    this.selectionBorder = new Graphics();
    this.selectionBorder.visible = false;
    this.addChild(this.selectionBorder);

    this.eventMode = "static";
    this.cursor = "pointer";
  }

  set selected(value: boolean) {
    if (this._selected === value) return;
    this._selected = value;
    this.selectionBorder.visible = value;

    if (value) {
      const loc = this.data.data!;
      const { left, top, right, bottom } = loc.transform.size;
      const width = left + right;
      const height = top + bottom;

      this.selectionBorder.clear();
      this.selectionBorder.setStrokeStyle({ width: 2, color: 0x00ff00 });
      this.selectionBorder.rect(0, 0, width, height);
      this.selectionBorder.stroke();
    }
  }

  get selected() {
    return this._selected;
  }
}

export class LocationLayer extends Container {
  private locationMap = new Map<number, LocationRect>();
  private _locations: Asset<Location>[] = [];
  private _selectedId: number | null = null;
  private _onSelect: ((entity: Asset<Entity>) => void) | null = null;

  set locations(value: Asset<Location>[]) {
    this._locations = value;
    if (this.locationMap) this.syncLocations();
  }

  set selectedId(value: number | null) {
    this._selectedId = value;
    this.locationMap?.forEach((rect, id) => {
      rect.selected = id === value;
    });
  }

  set onSelect(value: ((entity: Asset<Entity>) => void) | null) {
    this._onSelect = value;
  }

  private syncLocations() {
    const currentIds = new Set<number>();

    for (const asset of this._locations) {
      const loc = asset.data!;
      // Skip special location 63
      if (loc.id === 63) continue;
      currentIds.add(loc.id);
    }

    // Remove locations that no longer exist
    for (const [id, rect] of this.locationMap) {
      if (!currentIds.has(id)) {
        this.removeChild(rect);
        rect.destroy({ children: true });
        this.locationMap.delete(id);
      }
    }

    // Add or update locations
    for (const asset of this._locations) {
      const loc = asset.data!;
      if (loc.id === 63) continue;

      const existing = this.locationMap.get(loc.id);
      if (existing) {
        existing.position.set(
          loc.transform.position.x,
          loc.transform.position.y,
        );
        existing.selected = loc.id === this._selectedId;
        continue;
      }

      const rect = new LocationRect(asset);

      rect.on("pointertap", () => {
        if (this._onSelect) {
          this._onSelect(asset);
        }
      });

      rect.selected = loc.id === this._selectedId;
      this.locationMap.set(loc.id, rect);
      this.addChild(rect);
    }
  }
}
