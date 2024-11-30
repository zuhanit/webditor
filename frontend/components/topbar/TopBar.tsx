import { Minus, Square, Squirrel, X } from "lucide-react";

interface TopBarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function TopBarButton({ label }: TopBarButtonProps) {
  return (
    <button className="rounded-md transition-all hover:text-labels-primary">
      {label}
    </button>
  );
}

interface TopBarProps {
  children:
    | React.ReactElement<TopBarButtonProps>
    | React.ReactElement<TopBarButtonProps>[];
}

export function TopBar({ children }: TopBarProps) {
  return (
    <div className="flex justify-center px-4 py-3">
      <div className="flex items-center gap-2 text-grays-gray">
        <Squirrel />
        {children}
      </div>
      <div className="w-full text-center">any-starcraft-map</div>
      <div className="flex items-center gap-2.5">
        <Minus />
        <Square />
        <X />
      </div>
    </div>
  );
}
