interface ToggleGroupItemProps {
  label: string;
}

export function ToggleGroupItem({ label }: ToggleGroupItemProps) {
  return (
    <label className="w-full">
      <input
        type="checkbox"
        className="peer hidden"
        id={`toggle-${label.toLowerCase()}`}
        aria-label={label.toLowerCase()}
      />
      <span className="hover:bg-fills-secondary peer-checked:text-blue flex h-[31px] w-full items-center justify-center rounded-lg transition-all peer-checked:bg-background-primary peer-checked:drop-shadow-md">
        {label}
      </span>
    </label>
  );
}

export function ToggleGroup({
  children,
}: {
  children: React.ReactElement<ToggleGroupItemProps>[];
}) {
  return (
    <div className="flex w-full justify-between gap-2.5 rounded-lg bg-background-secondary px-2.5 py-1">
      {children}
    </div>
  );
}
