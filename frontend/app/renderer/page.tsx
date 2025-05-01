"use client";

import { SCImageRenderer } from "@/components/Renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChangeEvent, ChangeEventHandler, useState } from "react";

const client = new QueryClient();

export default function RendererTest() {
  const [version, setVersion] = useState<"sd" | "hd">("hd");
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [frame, setFrame] = useState<number>(0);

  const onChangeSDButton = (e: ChangeEvent<HTMLInputElement>) => {
    setVersion(e.currentTarget.checked ? "sd" : "hd");
  };
  const onChangeUnitIndex = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.currentTarget.value);
    setImageIndex(newValue);
  };
  const onChangeFrame = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.currentTarget.value);
    setFrame(newValue);
  };

  return (
    <QueryClientProvider client={client}>
      <div>
        <div className="m-4 p-4">
          Is SD?
          <input
            className="h-4 w-4"
            type="checkbox"
            onChange={onChangeSDButton}
          />
        </div>
        Image Index{" "}
        <input
          className="h-10 w-10 border"
          type="number"
          min={0}
          max={998}
          defaultValue={0}
          onChange={onChangeUnitIndex}
        />
        Frame
        <input
          className="h-10 w-10 border"
          type="number"
          defaultValue={0}
          min={0}
          onChange={onChangeFrame}
        />
        <SCImageRenderer
          imageIndex={imageIndex}
          version={version}
          frame={frame}
        />
      </div>
    </QueryClientProvider>
  );
}
