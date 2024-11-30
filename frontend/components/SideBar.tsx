import { Aperture, ChevronRight } from "lucide-react";
import { SearchBox } from "./SearchBox";
import { useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const SideBarRowStyle = cva(
  "rounded-md transition-all hover:bg-background-secondary px-1 py-1",
  {
    variants: {
      isClicked: {
        true: "rounded-md shadow-md text-blue font-medium",
      },
    },
  },
);

export interface SideBarItem<T> {
  label: string;
  icon?: React.ReactNode;
  items?: SideBarItem<T>[];
  depth?: number;
  data?: T;
}

interface SideBarRowProps<T> {
  item: SideBarItem<T>;
  depth?: number;
  onSelectItem: (item: SideBarItem<T>) => void;
  selectedItem: SideBarItem<T> | null;
}

/**
 * SideBarRow component
 *
 * SideBarRow shows a single item in the SideBar.
 * @param item - The item to be shown.
 * @param depth - The depth of the item.
 * @param onSelectItem - A function to be called when an item is selected.
 * @param selectedItem - The currently selected item.
 * @returns SideBarRow
 */
function SideBarRow<T>({
  item,
  depth,
  onSelectItem,
  selectedItem,
}: SideBarRowProps<T>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleClick = () => {
    if (!item.items || selectedItem?.label === item.label) {
      onSelectItem(item);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };
  const paddingStyle = depth
    ? { width: `${depth * 10}px`, height: "100%", display: "block" }
    : {};
  const depthValue = depth ?? 0;
  const isClicked = selectedItem?.label === item.label;

  return (
    <>
      <div className={SideBarRowStyle({ isClicked })} onClick={handleClick}>
        <span className="flex items-center gap-1 rounded-md px-2 transition-all hover:bg-background-secondary">
          <span style={paddingStyle}></span>
          <span className="flex h-4 w-4 items-center justify-center">
            {item.items && <ChevronRight strokeWidth={2} />}
          </span>
          <span className="flex h-4 w-4 items-center justify-center">
            {item.icon ? item.icon : <Aperture />}
          </span>
          <p className="">{item.label}</p>
        </span>
      </div>
      {item.items &&
        !isCollapsed &&
        item.items.map((subItem) => (
          <SideBarRow
            key={subItem.label}
            item={subItem}
            depth={depthValue + 1}
            onSelectItem={onSelectItem}
            selectedItem={selectedItem}
          />
        ))}
    </>
  );
}

interface SideBarProps<T> {
  items: SideBarItem<T>[];
  hideSearchbox?: boolean;
  onSelectItem: (item: SideBarItem<T>) => void;
  selectedItem: SideBarItem<T> | null;
  className?: string;
}

/**
 * SideBar component
 *
 * SideBar shows a list of items as a tree structure.
 * @param items - A list of items to be shown.
 * @param hideSearchbox - Whether to hide the searchbox.
 * @param onSelectItem - A function to be called when an item is selected.
 * @param selectedItem - The currently selected item.
 * @param className - Additional CSS classes to be applied to the SideBar.
 * @returns SideBar
 */
export function SideBar<T>({
  items,
  hideSearchbox,
  onSelectItem,
  selectedItem,
  className,
}: SideBarProps<T>) {
  return (
    <div className={twMerge("flex flex-col gap-0.5", className)}>
      {!hideSearchbox && <SearchBox />}
      {items.map((item) => (
        <SideBarRow
          key={item.label}
          item={item}
          onSelectItem={onSelectItem}
          selectedItem={selectedItem}
        />
      ))}
    </div>
  );
}
