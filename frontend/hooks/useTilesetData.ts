import api from "@/lib/api";
import { decompressSync } from "fflate";
import { useEffect, useState } from "react";

export default function useTilesetData(): Uint8Array | null {
  const [tilesetData, setTilesetData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(
          "/static/terrain/badlands/megatile_color.gz",
          {
            responseType: "arraybuffer",
          },
        );

        const compressed = new Uint8Array(response.data);
        const decompressed = decompressSync(compressed);

        console.log(
          `Succesfully decompress tileset data. Length: ${decompressed.length}`,
        );
        setTilesetData(decompressed);
      } catch (err) {
        console.error("Failed to fetch tileset data:", err);
      }
    })();
  }, []);

  return tilesetData;
}
