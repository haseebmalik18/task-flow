import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "error" | "success";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center";
  const widthStyles = fullWidth ? "w-full" : "w-auto";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50",
    secondary:
      "border-2 border-primary text-primary hover:bg-primary/10 disabled:border-primary/50 disabled:text-primary/50",
    error: "bg-error text-white hover:bg-error/90 disabled:bg-error/50",
    success: "bg-success text-white hover:bg-success/90 disabled:bg-success/50",
  };

  return (
    <button
      className={twMerge(
        baseStyles,
        widthStyles,
        variants[variant],
        isLoading && "opacity-70 cursor-wait",
        disabled && "cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
