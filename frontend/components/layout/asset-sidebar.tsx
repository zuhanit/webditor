import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarProvider,
} from "../ui/sidebar";
import { useUsemapStore } from "@/components/pages/editor-page";
import { Folder, Minus, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useAssetExplorerStore } from "@/store/assetExplorerStore";
import { Asset } from "@/types/schemas/asset/Asset";
import { useAssetTree } from "@/hooks/useAssetTree";

export function AssetSidebarItem({
  asset,
}: {
  asset: Asset & { children?: Asset[] };
}) {
  const { setCurrentAsset } = useAssetExplorerStore();

  if (asset.type === "folder") {
    if (asset.children && asset.children.length > 0) {
      const isAllFiles = asset.children.every((child) => child.type === "file");
      if (isAllFiles) {
        return (
          <SidebarMenuButton
            className="flex items-center gap-2"
            onClick={() => setCurrentAsset(asset)}
          >
            <Folder className="size-4 text-blue" strokeWidth={3} />
            {asset.name}
          </SidebarMenuButton>
        );
      }

      const folderChildren = asset.children.filter(
        (child) => child.type === "folder",
      );
      return (
        <Collapsible key={asset.name} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="flex items-center gap-2">
                <Folder className="size-4 text-blue" strokeWidth={3} />
                {asset.name}
                <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenuSub>
                  {folderChildren.map((child) => (
                    <AssetSidebarItem key={child.name} asset={child} />
                  ))}
                </SidebarMenuSub>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    } else if (asset.children && asset.children.length === 0) {
      return (
        <SidebarMenuButton
          className="flex items-center gap-2"
          onClick={() => setCurrentAsset(asset)}
        >
          <Folder className="size-4 text-blue" strokeWidth={3} />
          {asset.name}
        </SidebarMenuButton>
      );
    }
  }
}
/**
 * Project component
 *
 * Project includes only directory paths. It shows directory paths as a tree structure.
 * @returns Project
 */
export function AssetSidebar() {
  const usemap = useUsemapStore((state) => state.usemap);
  const tree = useAssetTree(usemap?.assets || []);

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="rounded-l-md">
        <SidebarHeader>Project</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {tree?.map((asset) => (
                <AssetSidebarItem key={asset.id} asset={asset} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
