import { Button } from "@/components/ui/button";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Sidebar,
} from "@/components/ui/sidebar";
import type { Meta, StoryObj } from "@storybook/react";
import { GalleryVerticalEnd } from "lucide-react";

const meta = {
  component: Sidebar,
  title: "Components/Sidebar",
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div style={{ height: "100vh", width: "50vh" }}>
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = {
  project: "(4) Fighting Spirit",
  entities: {
    Locations: [
      {
        id: 0,
        name: "Start Location 0",
      },
      {
        id: 1,
        name: "Start Location 1",
      },
      {
        id: 2,
        name: "Start Location 2",
      },
      {
        id: 3,
        name: "Start Location 3",
      },
    ],
    Units: [
      {
        id: 0,
        name: "Start Location",
      },
      {
        id: 1,
        name: "Terran Marine",
      },
      {
        id: 2,
        name: "Terran Ghost",
      },
    ],
  },
};

export const Default: Story = {
  args: {
    children: (
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <div className="bg-fills-primary flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <p className="text-labels-primary">{data.project}</p>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Locations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.entities.Locations.map((location) => (
                  <SidebarMenuItem key={location.id}>
                    <SidebarMenuButton>{location.name}</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Units</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.entities.Units.map((unit) => (
                  <SidebarMenuItem key={unit.id}>
                    <SidebarMenuButton>{unit.name}</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarFooter>
            <div className="flex flex-col items-start justify-start gap-2 bg-background-primary p-2">
              <h1>Subscribe to our newsletter</h1>
              <p>Opt-in to receive updates and news about the sidebar.</p>
              <SidebarInput placeholder="Enter your email" />
              <Button className="rounded-md bg-background-secondary px-2 py-1 text-background-primary">
                Subscribe
              </Button>
            </div>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    ),

    side: "left",
    collapsible: "offcanvas",
  },
};
