import api from "@/lib/api";
import { useEffect, useState } from "react";

type TileGroup = number[][];

export default function useTileGroup(): TileGroup | null { 
  const [tileGroup, setTileGroup] = useState<TileGroup | null>(null);
  
    useEffect(() => {
      (async () => {
      const response = await api.get<TileGroup>("/api/v1/tileset/cv5/badlands");
      setTileGroup(response.data);
    })();
  }, []);
  
  return tileGroup;
}