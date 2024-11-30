import { Collapsible, CollapsibleContent } from "./ui/collapsible";
import { ListHeader } from "./ui/listheader";
import Image from "next/image";
import DarkTemplar from "../public/images/dark_templar.png";
import { Square } from "lucide-react";
import { SquareCheck, SquareDashed } from "lucide-react";
import { useState } from "react";
import { Item } from "@/types/InspectorItem";
import { Resizable } from "re-resizable";

function InspectorHeader({ label }: { label: string }) {
  const [isChecked, setIsChecked] = useState(false);

  function onClickCheck(e: React.MouseEvent<HTMLInputElement>) {
    setIsChecked(!isChecked);
  }

  return (
    <div className="flex h-11 w-full items-center justify-between">
      {label}
      <label htmlFor={`${label}-checkbox`}>
        <input
          type="checkbox"
          id={`${label}-checkbox`}
          onClick={(e) => onClickCheck(e)}
          className="hidden"
        />
        {isChecked ? (
          <SquareCheck strokeWidth={1} className="text-blue" />
        ) : (
          <Square strokeWidth={1} className="" />
        )}
      </label>
    </div>
  );
}

interface InspectorProps {
  item: Item | undefined;
}

export const Inspector = ({ item }: InspectorProps) => {
  const collapsibleClasses =
    "border-seperator-opaque w-full border-b pl-2 pr-4";

  if (!item)
    return (
      <Resizable
        defaultSize={{ width: "25%" }}
        minWidth={"25%"}
        enable={{ left: true }}
      >
        <div></div>
      </Resizable>
    );

  return (
    <Resizable minWidth={"25%"} enable={{ left: true }}>
      <div>
        <ListHeader icon={item.icon} label={item.label} />
        {item.properties &&
          item.properties.map((property) => (
            <Collapsible className={collapsibleClasses} key={property.label}>
              <InspectorHeader label={property.label} />
              <CollapsibleContent>{property.value}</CollapsibleContent>
            </Collapsible>
          ))}
      </div>
    </Resizable>
  );
};
