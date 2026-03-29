import { extend } from "@pixi/react";
import { Container, Graphics, Sprite, AnimatedSprite } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { TerrainLayer } from "./layers/terrain";
import { UnitLayer } from "./layers/unit";
import { SpriteLayer } from "./layers/sprite";
import { LocationLayer } from "./layers/location";

extend({
  Container,
  Graphics,
  Sprite,
  AnimatedSprite,
  Viewport,
  TerrainLayer,
  UnitLayer,
  SpriteLayer,
  LocationLayer,
});
