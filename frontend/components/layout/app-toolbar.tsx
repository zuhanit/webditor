import { Toolbar, ToolbarToggleItem } from "../ui/toolbar";
import { AppMenu } from "./app-menu";
import { PanelBottom, PanelLeft, PanelRight, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { UserAvatar } from "../core/user-avatar";

export function AppToolbar() {
  return (
    <Toolbar className="items-center bg-background-tertiary py-1.5">
      <UserAvatar />
      <AppMenu />
      <div className="flex w-full justify-center">
        <div className="bg-fills-primary flex w-[588px] items-center gap-2.5 rounded-[10px] text-lg font-medium">
          <ToggleGroup>
            <ToggleGroupItem label="Terrain" />
            <ToggleGroupItem label="Unit" />
            <ToggleGroupItem label="Location" />
            <ToggleGroupItem label="Sprite" />
            <ToggleGroupItem label="Doodads" />
          </ToggleGroup>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ToolbarToggleItem
          value="panel-bottom"
          aria-label="Toggle Bottom Panel"
        >
          <PanelBottom />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="panel-right" aria-label="Toggle Right Panel">
          <PanelRight />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="panel-left" aria-label="Toggle Left Panel">
          <PanelLeft />
        </ToolbarToggleItem>
        <Button variant="ghost">
          <Settings />
        </Button>
      </div>
    </Toolbar>
  );
}
