import { MapImage } from "@/components/layout/viewport";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  component: MapImage,
  title: "Map Image",
} satisfies Meta<typeof MapImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
