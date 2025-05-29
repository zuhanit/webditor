import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "../ui/menubar";
import { useUsemapStore } from "@/store/mapStore";
import api from "@/lib/api";
import { Usemap } from "@/types/schemas/Usemap";

async function onClickBuild(usemap: Usemap | null) {
  if (!usemap) return;

  try {
    console.log("Compiling map", usemap);
    const response = await api.post("/api/v1/maps/build", usemap, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/octet-stream",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compiled_map.scx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to compile map:", error);
  }
}

export function AppMenu() {
  const rawMap = useUsemapStore((state) => state.usemap);

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Project</MenubarItem>
          <MenubarItem onClick={() => onClickBuild(rawMap)}>
            Download
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Open</MenubarItem>
          <MenubarItem>Open Recents</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Selection</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
