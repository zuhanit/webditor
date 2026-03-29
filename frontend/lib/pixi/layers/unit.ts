import {
  Container,
  Texture,
  Graphics,
  AnimatedSprite,
  Rectangle,
  TextureSource,
  Filter,
  GlProgram,
  UniformGroup,
} from "pixi.js";
import { Unit } from "@/types/schemas/entities/Unit";
import { SCImageBundle, FrameRect } from "@/types/SCImage";
import { Asset } from "@/types/asset";
import { Entity } from "@/types/schemas/entities/Entity";

// Those shader code are generate by AI. But I think it can be simplified.
// See https://github.com/saintofidiocy/SCR-Graphics. It will be helpful.
// Also we need to deal with another states(like Cloack, Hallucinated, etc).

const TEAM_COLOR_VERT = `
in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vFilterCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vFilterCoord = aPosition;
}
`;

const TEAM_COLOR_FRAG = `
in vec2 vTextureCoord;
in vec2 vFilterCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;
uniform vec3 uTeamColor;
uniform vec4 uMaskFrame;

void main() {
    vec4 diffuse = texture(uTexture, vTextureCoord);
    vec2 maskUV = uMaskFrame.xy + vFilterCoord * uMaskFrame.zw;
    vec4 mask = texture(uMaskTexture, maskUV);

    bool applyTeamColor = mask.r > 0.5;

    if (applyTeamColor) {
        finalColor = vec4(uTeamColor * diffuse.rgb, diffuse.a);
    } else {
        finalColor = diffuse;
    }
}
`;

class TeamColorFilter extends Filter {
  private maskFrameRects: FrameRect[];
  private maskWidth: number;
  private maskHeight: number;

  constructor(
    teamColor: [number, number, number],
    maskSource: TextureSource,
    maskFrameRects: FrameRect[],
  ) {
    const glProgram = GlProgram.from({
      vertex: TEAM_COLOR_VERT,
      fragment: TEAM_COLOR_FRAG,
      name: "team-color-filter",
    });

    const teamUniforms = new UniformGroup({
      uTeamColor: {
        value: new Float32Array([
          teamColor[0] / 255,
          teamColor[1] / 255,
          teamColor[2] / 255,
        ]),
        type: "vec3<f32>",
      },
      uMaskFrame: {
        value: new Float32Array([0, 0, 1, 1]),
        type: "vec4<f32>",
      },
    });

    super({
      glProgram,
      resources: {
        teamUniforms,
        uMaskTexture: maskSource,
        uMaskSampler: maskSource.style,
      },
      padding: 0,
    });

    this.maskFrameRects = maskFrameRects;
    this.maskWidth = maskSource.width;
    this.maskHeight = maskSource.height;
    this.updateFrame(0);
  }

  updateFrame(index: number) {
    const rect = this.maskFrameRects[index];
    if (!rect) return;
    const maskFrame = this.resources.teamUniforms.uniforms
      .uMaskFrame as Float32Array;
    maskFrame[0] = rect.x / this.maskWidth;
    maskFrame[1] = rect.y / this.maskHeight;
    maskFrame[2] = rect.width / this.maskWidth;
    maskFrame[3] = rect.height / this.maskHeight;
  }
}

class UnitSprite extends Container {
  readonly data: Asset<Unit>;
  private sprite: AnimatedSprite;
  private selectionBorder: Graphics;
  private _selected = false;

  constructor(
    textures: Texture[],
    data: Asset<Unit>,
    teamColorFilter?: TeamColorFilter,
  ) {
    super();
    this.data = data;

    this.sprite = new AnimatedSprite(textures, true);
    this.sprite.animationSpeed = 0.4; // 24 / 60
    this.sprite.play();
    this.sprite.anchor.set(0.5);

    if (teamColorFilter) {
      this.sprite.filters = [teamColorFilter];
      this.sprite.onFrameChange = (frame: number) => {
        teamColorFilter.updateFrame(frame);
      };
    }

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

      // FIXME: Use selection circle image instead of drawing rect. This can referenced by:
      // unit.unit_definition.specification.graphics.sprite.selection_circle_image_id
      this.selectionBorder
        .clear()
        .setStrokeStyle({ width: 2, color: 0x00ff00 })
        .rect(-left, -top, left + right, top + bottom)
        .stroke();
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
): Promise<Texture[]> {
  const diffuseBitmap = await createImageBitmap(bundle.diffuse);
  const diffuseSource = TextureSource.from(diffuseBitmap);

  const frameTextures: Texture[] = [];
  for (const rect of Object.values(bundle.meta)) {
    const frame = new Rectangle(rect.x, rect.y, rect.width, rect.height);
    frameTextures.push(new Texture({ source: diffuseSource, frame }));
  }

  if (frameTextures.length === 0)
    throw new Error("Cannot find frame image in bundle.");

  return frameTextures;
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
        const textures = await createTextureFromBundle(bundle);

        let filter: TeamColorFilter | undefined;
        if (bundle.teamColor) {
          const color = (unit.owner?.rgb_color as
            | [number, number, number]
            | undefined) ?? [255, 255, 255];
          const teamColorBitmap = await createImageBitmap(bundle.teamColor);
          const teamColorSource = TextureSource.from(teamColorBitmap);
          const maskFrameRects = Object.values(bundle.meta);
          filter = new TeamColorFilter(color, teamColorSource, maskFrameRects);
        }

        const sprite = new UnitSprite(textures, asset, filter);

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
