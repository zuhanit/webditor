import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  SCImageBundle,
  SCImageParseSchema,
  SCImageType,
  FrameMeta,
} from "@/types/SCImage";
import axios from "axios";

export function useImage({ version, imageIndex }: SCImageType) {
  const { version: v, imageIndex: idx } = SCImageParseSchema.parse({
    version: version,
    imageIndex: imageIndex,
  });

  const base = `/static/anim/${v}/${idx}`;

  const { data, isLoading, isSuccess } = useQuery<SCImageBundle>({
    queryKey: ["scImage", v, idx],
    queryFn: async () => {
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

      const [diffuse, teamColor, meta] = await Promise.all([
        safeGet(api.get<Blob>(`${base}/diffuse.png`, { responseType: "blob" })),
        safeGet(
          api.get<Blob>(`${base}/team_color.png`, { responseType: "blob" }),
        ),
        safeGet(api.get<FrameMeta>(`${base}/meta.json`)),
      ]);

      return { diffuse, teamColor, meta };
    },
  });

  return { data, isLoading, isSuccess };
}
