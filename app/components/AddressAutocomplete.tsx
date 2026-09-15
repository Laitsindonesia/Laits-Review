"use client";

import { useState, useRef, useEffect } from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (data: { address: string; placeId: string }) => void;
  placeholder?: string;
  className?: string;
}

interface Prediction {
  description: string;
  place_id: string;
  main_text: string;
  secondary_text: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Cari nama atau alamat bisnis...",
  className = "",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places?input=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.predictions || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setHighlightIndex(-1);
    fetchSuggestions(val);
  };

  const handleSelect = (prediction: Prediction) => {
    onChange(prediction.description);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.blur();
    onSelect?.({ address: prediction.description, placeId: prediction.place_id });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-3 pr-10 text-sm text-navy-100 placeholder-navy-500 transition-all duration-300 outline-none focus:border-cyan-glow/50 focus:ring-2 focus:ring-cyan-glow/20 focus:bg-navy-800/80"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-glow border-t-transparent" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-navy-600/50 bg-navy-800 shadow-xl shadow-black/30">
          {suggestions.map((s, i) => (
            <li key={s.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                  i === highlightIndex
                    ? "bg-cyan-glow/10 text-cyan-glow"
                    : "text-navy-200 hover:bg-navy-700/60"
                }`}
              >
                <svg
                  className="mr-2 inline h-4 w-4 shrink-0 text-navy-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <span className="font-medium">{s.main_text}</span>
                {s.secondary_text && (
                  <span className="ml-1 text-navy-400">- {s.secondary_text}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
