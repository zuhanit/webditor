import Image from "next/image";
import mapImageSample from "../public/images/test_map_image.bmp";

export const MapImage = () => {
  return (
    <div className="w-full">
      <Image src={mapImageSample} alt="map" />
    </div>
  );
};
