import { SideBar, SideBarItem } from "./placed_container/SideBar";
import { useState } from "react";
import { Resizable } from "re-resizable";
import { twMerge } from "tailwind-merge";

interface ProjectProps {
  className?: string;
}

/**
 * Project component
 *
 * Project includes only directory paths. It shows directory paths as a tree structure.
 * @returns Project
 */
export function Project({ className }: ProjectProps) {
  const [selectedItem, setSelectedItem] = useState<SideBarItem<string> | null>(
    null,
  );
  const handleSelectItem = (item: SideBarItem<string>) => {
    setSelectedItem(item);
  };

  return (
    <Resizable
      defaultSize={{ width: "25%" }}
      enable={{ right: true }}
      className={twMerge("bg-background-secondary shadow-inner", className)}
    >
      <SideBar
        hideSearchbox
        onSelectItem={handleSelectItem}
        selectedItem={selectedItem}
        className="px-4"
      />
    </Resizable>
  );
}
