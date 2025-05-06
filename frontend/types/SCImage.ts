import { z } from "zod";

export const ImageVersionSchema = z.enum(["sd", "hd"]);
export type ImageVersion = z.infer<typeof ImageVersionSchema>;

export const SCImageParseSchema = z.object({
  version: ImageVersionSchema,
  imageIndex: z.number().gte(0).lte(998),
});

export type SCImage = z.infer<typeof SCImageParseSchema>;

export interface SCImageBundle {
  diffuse: Blob;
  teamColor?: Blob;
  meta: FrameMeta;
}

export interface FrameRect {
  x: number;
  y: number;
  x_offset: number;
  y_offset: number;
  width: number;
  height: number;
  unknown1: number;
  unknown2: number;
}

export type SCImageWithFrame = SCImage & { frame: number };

export type FrameMeta = Record<number, FrameRect>;
