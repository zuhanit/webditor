import { Button } from "@/components/ui/button";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  component: Button,
  title: "Components/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Click Here",
  },
};
