import { AssetSidebar } from "./asset-sidebar";
import { AssetExplorer } from "./asset-explorer";
import { SidebarProvider } from "../ui/sidebar";

export function AssetContainer() {
  return (
    <div className="absolute bottom-0 flex h-1/3 w-full overflow-hidden rounded-md p-2">
      <SidebarProvider>
        <AssetSidebar />
      </SidebarProvider>
      <AssetExplorer />
    </div>
  );
}
