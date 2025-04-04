import { projectItems } from "@/fixtures/project_items";
import { SideBar, SideBarItem } from "./SideBar";
import { useState } from "react";
import { Resizable } from "re-resizable";

/**
 * Project component
 *
 * Project includes only directory paths. It shows directory paths as a tree structure.
 * @returns Project
 */
export function Project() {
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
      className="bg-background-secondary px-4 shadow-inner"
    >
      <SideBar
        items={projectItems}
        hideSearchbox
        onSelectItem={handleSelectItem}
        selectedItem={selectedItem}
      />
    </Resizable>
  );
}
