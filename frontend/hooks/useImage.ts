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
import { fetchFrameImage } from "@/lib/scimage";
import { useMemo } from "react";

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

  console.log(imageIDs);
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
        console.log(id, idx);
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
