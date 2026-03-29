import { type Key, type Ref } from "react";
import { Viewport } from "pixi-viewport";
import { Tile } from "@/types/schemas/entities/Tile";
import { Unit } from "@/types/schemas/entities/Unit";
import { Sprite } from "@/types/schemas/entities/Sprite";
import { Location as SCLocation } from "@/types/schemas/entities/Location";
import { SCImageBundle } from "@/types/SCImage";
import { Asset } from "@/types/asset";
import { Entity } from "@/types/schemas/entities/Entity";
import { TerrainLayer } from "./layers/terrain";
import { UnitLayer } from "./layers/unit";
import { SpriteLayer } from "./layers/sprite";
import { LocationLayer } from "./layers/location";

type ViewportProps = {
  key?: Key;
  ref?: Ref<Viewport>;
  children?: React.ReactNode;
  events: any;
  screenWidth: number;
  screenHeight: number;
  worldWidth: number;
  worldHeight: number;
};

type TerrainLayerProps = {
  key?: Key;
  ref?: Ref<TerrainLayer>;
  tiles: Tile[];
  tileGroup: number[][];
  tilesetData: Uint8Array | null;
};

type UnitLayerProps = {
  key?: Key;
  ref?: Ref<UnitLayer>;
  units: Asset<Unit>[];
  images: Map<number, SCImageBundle>;
  selectedId: number | null;
  onSelect: (entity: Asset<Entity>) => void;
};

type SpriteLayerProps = {
  key?: Key;
  ref?: Ref<SpriteLayer>;
  sprites: Asset<Sprite>[];
  images: Map<number, SCImageBundle>;
  selectedId: number | null;
  onSelect: (entity: Asset<Entity>) => void;
};

type LocationLayerProps = {
  key?: Key;
  ref?: Ref<LocationLayer>;
  locations: Asset<SCLocation>[];
  selectedId: number | null;
  onSelect: (entity: Asset<Entity>) => void;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      pixiViewport: ViewportProps;
      terrainLayer: TerrainLayerProps;
      unitLayer: UnitLayerProps;
      spriteLayer: SpriteLayerProps;
      locationLayer: LocationLayerProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      pixiViewport: ViewportProps;
      terrainLayer: TerrainLayerProps;
      unitLayer: UnitLayerProps;
      spriteLayer: SpriteLayerProps;
      locationLayer: LocationLayerProps;
    }
  }
}
