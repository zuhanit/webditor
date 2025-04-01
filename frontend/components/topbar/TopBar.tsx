import { Minus, Square, Squirrel, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TopBarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  dropdownItems?: string[];
}

export function TopBarButton({
  label,
  onClick,
  dropdownItems,
}: TopBarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={buttonRef} className="relative">
      <button
        className="rounded-md transition-all hover:text-labels-primary"
        onClick={(e) => {
          if (dropdownItems && dropdownItems.length > 0) {
            handleToggle();
          }
          onClick?.(e);
        }}
      >
        {label}
      </button>
      {isOpen && dropdownItems && (
        <ul className="bg-white border-gray-200 absolute left-0 z-10 mt-1 w-40 rounded-md border shadow-md">
          {dropdownItems.map((item, index) => (
            <li
              key={index}
              className="hover:bg-gray-100 cursor-pointer px-4 py-2"
              onClick={() => {
                setIsOpen(false);
                // Add additional item-specific action if needed
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
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
