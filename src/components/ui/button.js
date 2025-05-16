import React from "react";

export function Button({ children, variant, type, disabled, onClick, className, ...props }) {
  const baseStyles = "px-4 py-2 rounded-md font-medium text-sm transition-colors";
  
  const variantStyles = {
    default: "bg-primary text-white hover:opacity-90",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };
  
  const selectedVariant = variant || "default";
  
  return (
    <button
      type={type || "button"}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[selectedVariant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
} 