import api from "@/lib/api";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  SCImageBundle,
  SCImageParseSchema,
  SCImage,
  FrameMeta,
  ImageVersion,
} from "@/types/SCImage";
import axios from "axios";
import { useUsemapStore } from "@/store/mapStore";
import useTileGroup from "./useTileGroup";
import useTilesetData from "./useTilesetData";
import { useEffect, useMemo, useRef, useState } from "react";
import { getTerrainImage, TILE_SIZE } from "@/lib/scterrain";
import {
  getLocationImage,
  getPlacedSpriteImages,
  getPlacedUnitImage,
} from "@/lib/scimage";

const safeGet = async <T>(promise: Promise<{ data: T }>) => {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return undefined;
    }
    throw err;
  }
};

export function useImage({ version, imageIndex }: SCImage) {
  const { version: v, imageIndex: idx } = SCImageParseSchema.parse({
    version: version,
    imageIndex: imageIndex,
  });

  const base = `/static/anim/${v}/${idx}`;

  const { data, isLoading, isSuccess } = useQuery<SCImageBundle>({
    queryKey: ["scImage", v, idx],
    queryFn: async () => {
      const [diffuse, teamColor, meta] = await Promise.all([
        (await api.get<Blob>(`${base}/diffuse.png`, { responseType: "blob" }))
          .data,
        safeGet(
          api.get<Blob>(`${base}/team_color.png`, { responseType: "blob" }),
        ),
        (await api.get<FrameMeta>(`${base}/meta.json`)).data,
      ]);

      return { diffuse, teamColor, meta };
    },
  });

  return { data, isLoading, isSuccess };
}

type Manifest = Map<number, { diffuse: boolean; team_color: boolean }>;

export function useImageManifest(version: ImageVersion) {
  return useQuery<Manifest>({
    queryKey: [version, "manifest"],
    queryFn: async () => {
      const res = await api.get<
        Record<string, { diffuse: boolean; team_color: boolean }>
      >(`/static/anim/${version}/manifest.json`);
      const obj = res.data; // already parsed JSON

      return new Map(
        Object.entries(obj).map(([k, v]) => [Number(k), v]),
      ) as Manifest;
    },
    staleTime: 24 * 60 * 60 * 1e3,
  });
}

export function useImages(imageIDs: Set<number>, version: ImageVersion) {
  const { data: manifest } = useImageManifest(version);

  const imageQueries = useQueries({
    queries: [...imageIDs].map((id) => ({
      enabled: !!manifest?.get(id)?.diffuse, // skip if diffuse missing
      queryKey: ["unitImage", version, id],
      queryFn: async () => {
        const base = `/static/anim/${version}/${id}`;

        // ① diffuse + meta (필수)
        const [diffuse, meta] = await Promise.all([
          (await api.get<Blob>(`${base}/diffuse.png`, { responseType: "blob" }))
            .data,
          (await api.get<FrameMeta>(`${base}/meta.json`)).data,
        ]);

        // ② team_color (선택)
        let teamColor: Blob | undefined;
        if (manifest?.get(id)?.team_color) {
          teamColor = await safeGet(
            api.get<Blob>(`${base}/team_color.png`, { responseType: "blob" }),
          );
        }

        return { diffuse, teamColor, meta } as SCImageBundle;
      },
      staleTime: Infinity,
    })),
    combine: (results) => {
      const dataMap = new Map<number, SCImageBundle>();

      [...imageIDs].forEach((id, idx) => {
        const r = results[idx];
        if (r.data) dataMap.set(id, r.data);
      });

      return {
        loading: results.some((r) => r.isLoading),
        pending: results.some((r) => r.isPending),
        data: dataMap,
      };
    },
  });

  return imageQueries;
}

interface ViewportImageBundle {
  terrain?: ImageBitmap;
  unit?: ImageBitmap;
  location?: ImageBitmap;
  sprite?: ImageBitmap;
}

export function useViewportImage(): ViewportImageBundle {
  const usemap = useRawMapStore((store) => store.rawMap);
  const tileGroup = useTileGroup();
  const tilesetData = useTilesetData();

  const terrainImage = useRef<ImageBitmap>();
  const [unitImage, setUnitImage] = useState<ImageBitmap>();
  const [spriteImage, setSpriteImage] = useState<ImageBitmap>();
  const locationImage = useRef<ImageBitmap>();

  /** Create terrain image */
  useEffect(() => {
    if (!usemap || !tileGroup || !tilesetData) return;

    terrainImage.current = getTerrainImage(
      usemap.terrain,
      tileGroup,
      tilesetData,
    );
  }, [usemap?.terrain]);

  const requiredImageIDs = useMemo(() => {
    const result = new Set<number>();
    if (usemap) {
      usemap.placed_unit.forEach((unit) => {
        const flingyID = unit.unit_definition.specification.graphics;
        const spriteID = usemap.flingy[flingyID].sprite;
        const imageID = usemap.sprite[spriteID].image;

        result.add(imageID);
      });

      usemap.placed_sprite.forEach((sprite) => result.add(sprite.image));
    }
    return result;
  }, [usemap?.placed_unit]);
  const { data: imagesData, loading } = useImages(requiredImageIDs, "sd");

  /** Create placed unit image */
  useEffect(() => {
    if (!usemap) return;
    (async () => {
      const bmp = await getPlacedUnitImage(
        usemap.terrain,
        usemap.placed_unit,
        usemap.flingy,
        usemap.sprite,
        imagesData,
      );
      setUnitImage(bmp);
    })();
  }, [usemap?.placed_unit, usemap?.flingy, usemap?.sprite, loading]);

  /** Create sprite image */
  useEffect(() => {
    if (!usemap) return;
    (async () => {
      const bmp = await getPlacedSpriteImages(
        usemap.terrain,
        usemap.placed_sprite,
        imagesData,
      );
      setSpriteImage(bmp);
    })();
  }, [usemap?.placed_sprite, loading]);

  useEffect(() => {
    if (!usemap) return;
    locationImage.current = getLocationImage(usemap.terrain, usemap.location);
  }, [usemap?.location]);

  return {
    terrain: terrainImage.current,
    unit: unitImage,
    sprite: spriteImage,
    location: locationImage.current,
  };
}

export function useEntireCanvas() {
  const usemap = useUsemapStore((state) => state.usemap);
  const { terrain, unit, sprite, location } = useViewportImage();

  const [bitmap, setBitmap] = useState<ImageBitmap>();

  useEffect(() => {
    if (!usemap) return;

    const w = usemap.terrain.size.width * TILE_SIZE;
    const h = usemap.terrain.size.height * TILE_SIZE;
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, w, h);
    if (terrain) ctx.drawImage(terrain, 0, 0);
    if (unit) ctx.drawImage(unit, 0, 0);
    if (sprite) ctx.drawImage(sprite, 0, 0);
    if (location) ctx.drawImage(location, 0, 0);

    setBitmap(canvas.transferToImageBitmap());
  }, [
    usemap?.terrain, // 맵 크기 변할 때
    terrain,
    unit,
    sprite,
    location,
  ]);

  return { image: bitmap };
}
