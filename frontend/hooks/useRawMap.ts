import api from "@/lib/api";
import { RawMap } from "@/types/schemas/RawMap";
import { useQuery } from "@tanstack/react-query";

export default function useRawMap(mapName: string) {
  return useQuery<RawMap>({
    queryKey: ["rawMap", mapName],
    queryFn: async () => {
      const response = await api.get<RawMap>(`/api/v1/maps/${mapName}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
