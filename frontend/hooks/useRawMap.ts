import api from "@/lib/api";
import { useRawMapStore } from "@/store/mapStore";
import { Usemap } from "@/types/schemas/Usemap";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";

export default function useFetchRawMap(mapName: string) {
  const setRawMap = useRawMapStore((state) => state.setRawMap);
  const rawMap = useRawMapStore((state) => state.rawMap);
  const updateRawMap = useRawMapStore((state) => state.updateRawMap);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["rawMap", mapName],
    queryFn: async () => {
      const res = await api.get<Usemap>(`/api/v1/maps/${mapName}`);
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
    updateRawMap,
    isLoading,
    isSuccess,
  };
}
