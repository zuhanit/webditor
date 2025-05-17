import { Aperture, ChevronRight } from "lucide-react";
import { SearchBox } from "../SearchBox";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { usePlacedEntities } from "@/hooks/usePlacedEntities";
import { Item } from "@/types/InspectorItem";
import { Resizable } from "re-resizable";

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
  id: string;
  icon?: React.ReactNode;
  items?: SideBarItem<T>[];
  depth?: number;
  data?: Item;
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
    if (!item.items || selectedItem?.id === item.id) {
      console.log("SideBar Clicking", item);
      onSelectItem(item);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };
  const paddingStyle = depth
    ? { width: `${depth * 10}px`, height: "100%", display: "block" }
    : {};
  const depthValue = depth ?? 0;
  const isClicked = selectedItem?.id === item.id;

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
            key={subItem.id}
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
  hideSearchbox,
  onSelectItem,
  selectedItem,
  className,
}: SideBarProps<T>) {
  const placedEntities = usePlacedEntities();

  return (
    <div className={twMerge("flex flex-col gap-0.5", className)}>
      {!hideSearchbox && <SearchBox />}
      {placedEntities.map((item, index) => (
        <SideBarRow
          key={"row" + index}
          item={item}
          onSelectItem={onSelectItem}
          selectedItem={selectedItem}
        />
      ))}
    </div>
  );
}

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

interface SidebarContextProps {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used withn a SidebarProvider.");
  }

  return context;
}

interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  children,
  ...props
}: SidebarProviderProps) {
  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = useCallback(() => {
    return setOpen((open) => !open);
  }, [setOpen]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      toggleSidebar,
    }),
    [state, open, setOpen, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className={className} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function TSidebar({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="flex h-full flex-col">
      <Resizable>{children}</Resizable>
    </div>
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={`${className}`} {...props} />;
}

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={`${className}`} {...props} />;
}

export function SidebarGroup() {}

export function SidebarTrigger({ ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return <button onClick={() => toggleSidebar()} {...props}></button>;
}
