import { SideBarItem } from "@/components/placed_container/SideBar";
import { Clock, Dock, File } from "lucide-react";

const RECENT_PROJECT: SideBarItem = {
  label: "Recents",
  icon: <Clock className="text-blue" />,
};

const DESKTOP: SideBarItem = {
  label: "Desktop",
  icon: <Dock className="text-blue" />,
};

const DOCUMENTS: SideBarItem = {
  label: "Documents",
  icon: <File className="text-blue" />,
};

export const projectItems: SideBarItem[] = [RECENT_PROJECT, DESKTOP, DOCUMENTS];
