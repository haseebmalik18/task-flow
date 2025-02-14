import React from "react";
import { UseFormRegister, RegisterOptions } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  register?: UseFormRegister<any>;
  rules?: RegisterOptions;
}

const Input = ({
  label,
  name,
  error,
  register,
  rules,
  type = "text",
  ...props
}: InputProps) => {
  return (
    <div className="w-full">
      <label className="block text-textColor text-sm font-medium mb-1">
        {label}
      </label>
      <input
        {...(register && register(name, rules))}
        type={type}
        className={`
          w-full px-3 py-2 rounded-md border
          focus:outline-none focus:ring-2 focus:ring-primary/20
          ${error ? "border-error" : "border-gray-300"}
          ${error ? "focus:border-error" : "focus:border-primary"}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
