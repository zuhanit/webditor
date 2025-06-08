import api from "@/lib/api";
import { useUsemapStore } from "@/store/mapStore";
import { Usemap } from "@/types/schemas/project/Usemap";
import { resolveReferences } from "@/utils/resolve";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useFetchUsemap(mapName: string) {
  const setRawMap = useUsemapStore((state) => state.setUsemap);
  const rawMap = useUsemapStore((state) => state.usemap);
  const updateRawMap = useUsemapStore((state) => state.updateUsemap);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["rawMap", mapName],
    queryFn: async () => {
      const res = await api.get<Usemap>(`/api/v1/maps/${mapName}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      resolveReferences(data);
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
