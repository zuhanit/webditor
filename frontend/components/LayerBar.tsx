interface LayerBarButtonProps {
  label: string;
}

export function LayerBarButton({ label }: LayerBarButtonProps) {
  return (
    <label className="w-full">
      <input
        type="checkbox"
        className="peer hidden"
        id={`toggle-${label.toLowerCase()}`}
        aria-label={label.toLowerCase()}
      />
      <span className="flex h-[31px] w-full items-center justify-center rounded-full transition-all hover:bg-fills-secondary peer-checked:bg-background-primary peer-checked:text-blue peer-checked:drop-shadow-md">
        {label}
      </span>
    </label>
  );
}

export function LayerBar({
  children,
}: {
  children: React.ReactElement<LayerBarButtonProps>[];
}) {
  return (
    <div className="flex w-full justify-between gap-2.5 px-2.5">{children}</div>
  );
}
