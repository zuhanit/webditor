import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "../ui/menubar";
import { useUsemapStore } from "@/components/pages/editor-page";
import api from "@/lib/api";
import { UsemapActions } from "@/store/mapStore";
import { Usemap } from "@/types/schemas/project/Usemap";
import { useRef } from "react";

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

async function onClickOpenUsemap(
  file: File,
  openUsemap: UsemapActions["openUsemap"],
) {
  try {
    openUsemap(file);
  } catch (error) {
    console.error("Failed to upload map:", error);
    alert("Failed to load map file. Please try again.");
  }
}

async function onClickSave(usemap: Usemap) {
  const a = document.createElement("a");
  const blob = new Blob([JSON.stringify(usemap)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  a.download = `${usemap.scenario_property.name.content}.wproject`;
  a.href = url;

  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function AppMenu() {
  const rawMap = useUsemapStore((state) => state.usemap);
  const openUsemap = useUsemapStore((state) => state.openUsemap);

  const usemapInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await onClickOpenUsemap(file, openUsemap);
      event.target.value = "";
    }
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Project</MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => usemapInputRef.current?.click()}>
            Open
          </MenubarItem>
          <MenubarItem>Open Recents</MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => rawMap && onClickSave(rawMap)}>
            Save
          </MenubarItem>
          <MenubarItem onClick={() => onClickBuild(rawMap)}>Build</MenubarItem>
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

      <input
        ref={usemapInputRef}
        type="file"
        accept=".chk,.scx,.scm,.wproject"
        className="hidden"
        onChange={handleFileSelect}
      />
    </Menubar>
  );
}
