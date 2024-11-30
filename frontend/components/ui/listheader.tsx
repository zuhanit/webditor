import { LucideAArrowDown } from "lucide-react";

interface ListHeaderProps {
  icon?: React.ReactNode;
  label: string;
}

export function ListHeader({ icon, label }: ListHeaderProps) {
  return (
    <div className="border-seperator-opaque border-seperator-large flex w-full items-center justify-center gap-2.5 border-b-8 px-4 py-3">
      {icon ? icon : <LucideAArrowDown />}
      <p className="font-medium">{label}</p>
    </div>
  );
}
