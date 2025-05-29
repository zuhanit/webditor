import { Toolbar, ToolbarToggleItem } from "../ui/toolbar";
import { AppMenu } from "./app-menu";
import { PanelBottom, PanelLeft, PanelRight, Settings } from "lucide-react";
import { Button } from "../ui/button";

export function AppToolbar() {
  return (
    <Toolbar className="items-center">
      <AppMenu />
      <span className="ml-auto text-lg font-medium">any-starcraft-map</span>
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
