import api from "@/lib/api";
import { useRawMapStore } from "@/store/mapStore";
import { RawMap } from "@/types/schemas/RawMap";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useFetchRawMap(mapName: string) {
  const setRawMap = useRawMapStore((state) => state.setRawMap);
  const rawMap = useRawMapStore((state) => state.rawMap);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["rawMap", mapName],
    queryFn: async () => {
      const res = await api.get<RawMap>(`/api/v1/maps/${mapName}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      setRawMap(data);
    }
  }, [isSuccess, data, setRawMap]);

  return {
    rawMap,
    isLoading,
    isSuccess,
  };
}
