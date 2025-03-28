import api from "@/lib/api";
import { RawMap } from "@/types/schemas/RawMap";
import { useEffect, useState } from "react";

export default function useRawMap(): RawMap | null {
  const [rawMap, setRawMap] = useState<RawMap | null>(null);

  useEffect(() => {
    (async () => {
      const response = await api.get<RawMap>("/api/v1/maps/test_map");
      setRawMap(response.data);
    })();
  }, []);

  return rawMap;
}
