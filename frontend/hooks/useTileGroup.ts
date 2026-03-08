import { globalConfig } from "@/utils/globalConfig";
import axios from "axios";
import { useEffect, useState } from "react";

type TileGroup = number[][];

export default function useTileGroup(): TileGroup | null {
  const [tileGroup, setTileGroup] = useState<TileGroup | null>(null);

    useEffect(() => {
      (async () => {
      const response = await axios.get<TileGroup>(`${globalConfig.STATIC_BASE_URL}/terrain/badlands/cv5_group.json`);
      setTileGroup(response.data);
    })();
  }, []);

  return tileGroup;
}