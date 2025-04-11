import { SideBarItem } from "@/components/placed_container/SideBar";
import { Activity } from "lucide-react";
import Image from "next/image";
import DarkTemplar from "../public/images/dark_templar.png";

const DARK_TEMPLAR: SideBarItem = {
  label: "Protoss Dark Templar",
  icon: <Image src={DarkTemplar} alt="Dark Templar" />,
  data: {
    label: "Protoss Dark Templar",
    icon: <Image src={DarkTemplar} alt="Dark Templar" />,
    properties: [{ label: "Health", value: "100" }],
  },
};

export const SELECTOR: SideBarItem = {
  label: "Selector",
};

const UNIT: SideBarItem = {
  label: "Unit",
  icon: <Activity className="text-blue" />,
  items: [{ label: "Unit 1" }, { label: "Unit 2", items: [DARK_TEMPLAR] }],
};

const TERRAIN: SideBarItem = {
  label: "Terrain",
  items: [UNIT, { label: "TEST" }],
};

export const defaultItems: SideBarItem[] = [TERRAIN];
