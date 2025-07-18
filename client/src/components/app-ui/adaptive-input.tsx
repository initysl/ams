import React, { forwardRef, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface AdaptiveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const AdaptiveInput = forwardRef<HTMLInputElement, AdaptiveInputProps>(
  (
    { className, label, error, helperText, onFocus, onBlur, id, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasAutofillValue, setHasAutofillValue] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    // Generate a unique ID if none provided
    const inputId =
      id || `adaptive-input-${Math.random().toString(36).substr(2, 9)}`;

    // Check for autofill values
    useEffect(() => {
      const checkAutofill = () => {
        const input = inputRef.current;
        if (input) {
          const hasValue = input.value.length > 0;
          const isAutofilled =
            input.matches(":-webkit-autofill") ||
            input.matches(":autofill") ||
            hasValue;
          setHasAutofillValue(isAutofilled);
        }
      };

      // Check immediately
      checkAutofill();

      // Check periodically for autofill (browsers can be slow)
      const interval = setInterval(checkAutofill, 100);

      // Cleanup
      return () => clearInterval(interval);
    }, []);

    // Also check when props.value changes
    useEffect(() => {
      const hasValue = props.value ? String(props.value).length > 0 : false;
      setHasAutofillValue(hasValue);
    }, [props.value]);

    // Get current input value - check both controlled and uncontrolled scenarios
    const getCurrentValue = () => {
      if (props.value !== undefined) {
        // Controlled component
        return String(props.value).length > 0;
      } else if (inputRef.current) {
        // Uncontrolled component
        return inputRef.current.value.length > 0;
      }
      return false;
    };

    const hasValue = getCurrentValue();

    // Fixed logic: only float label when there's actual content or focus
    const shouldFloatLabel = isFocused || hasValue || hasAutofillValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          {...props}
          value={props.value ?? ""}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full px-3 pt-5 pb-1.5 text-sm text-gray-900 bg-white border rounded-lg transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent",
            // Handle autofill styling
            "autofill:bg-white autofill:text-gray-900",
            error ? "border-red-500 focus:ring-red-600" : "border-slate-400",
            className
          )}
          style={{
            // Additional autofill styling
            WebkitBoxShadow: hasAutofillValue
              ? "0 0 0 1000px white inset"
              : undefined,
            WebkitTextFillColor: hasAutofillValue ? "#111827" : undefined,
          }}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-3 text-gray-500 transition-all duration-200 pointer-events-none",
            shouldFloatLabel
              ? "top-1 text-xs"
              : "top-1/2 text-sm transform -translate-y-1/2"
          )}
        >
          {label}
        </label>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        {helperText && !error && (
          <p className="text-gray-500 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

AdaptiveInput.displayName = "AdaptiveInput";

export { AdaptiveInput };
