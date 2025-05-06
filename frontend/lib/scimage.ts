import { FrameMeta } from "@/types/SCImage";
import { ucs2 } from "punycode";

type props = { image: Blob; frame: number; meta: FrameMeta };
export async function fetchFrameImage({ image, frame, meta }: props) {
  const rect = meta[frame];
  if (!rect) throw new Error(`frame ${frame} not found.`);

  const bitmap = await createImageBitmap(image);

  return createImageBitmap(bitmap, rect.x, rect.y, rect.width, rect.height);
}

export function createTeamColorUnitImage(
  diffuse: ImageBitmap,
  teamColor: ImageBitmap,
  color: [number, number, number],
) {
  const unitCanvas = new OffscreenCanvas(diffuse.width, diffuse.height);
  const teamColorCanvas = new OffscreenCanvas(
    teamColor.width,
    teamColor.height,
  );

  const uCtx = unitCanvas.getContext("2d")!;
  uCtx.drawImage(diffuse, 0, 0);
  const tCtx = teamColorCanvas.getContext("2d")!;
  tCtx.drawImage(teamColor, 0, 0);

  for (let y = 0; y < teamColor.height; y++) {
    for (let x = 0; x < teamColor.width; x++) {
      const tcPixel = tCtx.getImageData(x, y, 1, 1).data;
      const [tcR, tcG, tcB, tcA] = tcPixel;

      // Treat the teamColor layer as 1-bit mask: white applies team color, black does nothing
      const applyTeamColor = tcR > 127 && tcG > 127 && tcB > 127 && tcA > 0;
      if (!applyTeamColor) continue;

      // From the diffuse image, we read the pixel and use its RGB as a weight mask for blending
      const [dR, dG, dB, dA] = uCtx.getImageData(x, y, 1, 1).data;
      const weightR = dR / 255;
      const weightG = dG / 255;
      const weightB = dB / 255;

      // Apply weighted team color to each channel
      const resultR = Math.round(color[0] * weightR);
      const resultG = Math.round(color[1] * weightG);
      const resultB = Math.round(color[2] * weightB);

      uCtx.fillStyle = `rgb(${resultR}, ${resultG}, ${resultB})`;
      uCtx.fillRect(x, y, 1, 1);
    }
  }

  return unitCanvas;
}
