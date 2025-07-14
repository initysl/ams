import React, { forwardRef, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface AdaptiveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  // Added an explicit 'id' prop, though 'name' will often be used if 'id' isn't provided
  id?: string;
}

const AdaptiveInput = forwardRef<HTMLInputElement, AdaptiveInputProps>(
  (
    { className, label, error, helperText, onFocus, onBlur, id, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasAutofillValue, setHasAutofillValue] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    // Use the passed ref if available, otherwise use internalRef
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    // --- Start of Fix ---
    // Generate a unique ID for the input if not explicitly provided.
    // Prioritize passed 'id', then 'name', then a fallback generated ID.
    // For react-hook-form's Controller, 'name' will be provided via {...props}.
    const uniqueId =
      id ||
      props.name ||
      `adaptive-input-${Math.random().toString(36).substr(2, 9)}`;
    // --- End of Fix ---

    // Check for autofill values
    useEffect(() => {
      const checkAutofill = () => {
        const input = inputRef.current;
        if (input) {
          const hasValue = input.value.length > 0;
          const isAutofilled =
            input.matches(":-webkit-autofill") ||
            input.matches(":autofill") ||
            hasValue; // Also consider if it just has a value upon mount
          setHasAutofillValue(isAutofilled);
        }
      };

      // Check immediately on mount
      checkAutofill();

      // Check periodically for autofill (browsers can be slow to apply autofill styles)
      const interval = setInterval(checkAutofill, 100);

      // Cleanup
      return () => clearInterval(interval);
    }, [inputRef]); // Added inputRef to dependency array

    // Also check when props.value changes (for controlled components)
    useEffect(() => {
      // Ensure inputRef.current exists before trying to access its value for autofill check
      if (inputRef.current) {
        const hasValue =
          props.value !== undefined
            ? String(props.value).length > 0
            : inputRef.current.value.length > 0;
        setHasAutofillValue(hasValue);
      }
    }, [props.value, inputRef]);

    // Get current input value - check both controlled and uncontrolled scenarios
    const getCurrentValue = () => {
      if (props.value !== undefined) {
        // Controlled component: check the value prop
        return String(props.value).length > 0;
      } else if (inputRef.current) {
        // Uncontrolled component: check the ref's current value
        return inputRef.current.value.length > 0;
      }
      return false;
    };

    const hasValue = getCurrentValue();

    // Logic for floating the label: based on focus, value, or detected autofill
    const shouldFloatLabel = isFocused || hasValue || hasAutofillValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e); // Call original onFocus if provided
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e); // Call original onBlur if provided
      // Re-check autofill state on blur in case something changed
      const input = inputRef.current;
      if (input) {
        setHasAutofillValue(
          input.value.length > 0 ||
            input.matches(":-webkit-autofill") ||
            input.matches(":autofill")
        );
      }
    };

    return (
      <div className="relative">
        <input
          ref={inputRef}
          {...props}
          id={uniqueId} // <-- FIX: Assign the unique ID to the input
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full px-3 pt-5 pb-1.5 text-sm text-gray-900 bg-white border rounded-lg transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent",
            // Handle autofill styling (using standard N-th child selectors for better compatibility)
            // Note: 'autofill' pseudo-class styling is often better handled directly in CSS with :autofill
            "autofill:bg-white autofill:text-gray-900", // Tailwind JIT/v3+ supports this
            error ? "border-red-500 focus:ring-red-600" : "border-slate-400",
            className
          )}
          style={{
            // Additional autofill styling for Webkit browsers (e.g., Chrome)
            WebkitBoxShadow: hasAutofillValue
              ? "0 0 0 1000px white inset"
              : undefined,
            WebkitTextFillColor: hasAutofillValue ? "#111827" : undefined,
          }}
        />
        <label
          htmlFor={uniqueId} // <-- FIX: Link label to input using htmlFor
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
