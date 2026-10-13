import { Check, ChevronDown } from "lucide-react";
import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";

export interface SelectOption<T extends string = string> {
  value: T;
  label: ReactNode;
}

export interface SelectProps<T extends string = string> {
  id: string;
  label?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Select = <T extends string = string>({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];

  const openMenu = () => {
    setActiveIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  };

  const selectOption = (index: number) => {
    onChange(options[index].value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Enter/Space are handled natively by the buttons' onClick.
  const handleKeyDown = (event: KeyboardEvent) => {
    const last = options.length - 1;
    const target: Record<string, number> = {
      ArrowDown: activeIndex >= last ? 0 : activeIndex + 1,
      ArrowUp: activeIndex <= 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    };

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (event.key in target) {
      event.preventDefault();
      if (isOpen) setActiveIndex(target[event.key]);
      else openMenu();
    }
  };

  // Closes on outside click and on Tab when focus leaves the component.
  const handleBlur = (event: FocusEvent) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          id={`${id}-label`}
          htmlFor={id}
          className="text-xs font-medium tracking-wide text-zinc-400"
        >
          {label}
        </label>
      )}

      <div className="relative w-fit min-w-48">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={label ? `${id}-label` : undefined}
          onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex w-full min-w-48 items-center cursor-pointer justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 py-2.5 pl-3 pr-3 text-left text-sm font-semibold text-zinc-100 shadow-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 focus-visible:border-lime-500/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="min-w-0 flex-1 truncate">
            {selectedOption?.label ?? placeholder}
          </span>

          <ChevronDown
            aria-hidden="true"
            size={16}
            strokeWidth={1.8}
            className={`shrink-0 text-zinc-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <ul
            id={listboxId}
            aria-labelledby={label ? `${id}-label` : undefined}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="absolute left-0 top-full z-50 mt-2 max-h-64 w-full min-w-48 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-xl shadow-black/40"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <li key={option.value} role="presentation">
                  <button
                    ref={(element) => {
                      if (isActive) element?.focus();
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => selectOption(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors cursor-pointer ${
                      isActive
                        ? "bg-lime-400/10 text-lime-100"
                        : "text-zinc-300 hover:bg-lime-400/10 hover:text-lime-100"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>

                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {isSelected && (
                        <Check
                          aria-hidden="true"
                          size={15}
                          strokeWidth={2.5}
                          className="text-lime-400"
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
