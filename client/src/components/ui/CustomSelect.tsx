import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  label?: string;
  value: string | null;
  options: Array<string | Option>;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
};

function normalizeOptions(options: Array<string | Option>): Option[] {
  return options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option.replace(/_/g, " ") }
      : option
  );
}

export function CustomSelect({ label, value, options, onChange, placeholder = "Select", name }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const normalized = normalizeOptions(options);
  const selected = normalized.find((option) => option.value === value);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const index = normalized.findIndex((option) => option.value === value);
    setActiveIndex(index >= 0 ? index : 0);
  }, [value, normalized.length]);

  function choose(index: number) {
    const option = normalized[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, normalized.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) setOpen(true);
      else choose(activeIndex);
    }
    if (event.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input type="hidden" name={name} value={value ?? ""} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? id : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className="mt-1 flex w-full items-center justify-between gap-3 rounded-lg border border-neon-green/50 bg-[#111c18] px-3 py-2.5 text-left text-sm text-slate-50 outline-none transition hover:border-neon-green focus:border-neon-green focus:shadow-[0_0_0_2px_rgba(34,197,94,0.25)]"
      >
        <span className={selected ? "capitalize" : "text-slate-400"}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={17} className={`shrink-0 text-neon-green transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-activedescendant={`${id}-option-${activeIndex}`}
          className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-neon-green/40 bg-[#111c18] p-1 text-sm text-slate-50 shadow-2xl shadow-black/40"
        >
          {normalized.map((option, index) => {
            const selectedOption = option.value === value;
            const active = index === activeIndex;
            return (
              <button
                id={`${id}-option-${index}`}
                key={option.value}
                type="button"
                role="option"
                aria-selected={selectedOption}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={`w-full rounded-md px-3 py-2 text-left capitalize transition ${
                  selectedOption
                    ? "bg-neon-green text-carbon-950"
                    : active
                      ? "bg-neon-green/15 text-white"
                      : "text-slate-100 hover:bg-neon-green/15"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
