import React from "react";

interface FormErrorProps {
  error: string;
}

const FormError: React.FC<FormErrorProps> = ({ error }) => {
  return error ? (
    <div className="p-3 rounded-md bg-error/10 border border-error mb-4">
      <p className="text-sm text-error">{error}</p>
    </div>
  ) : null;
};

export default FormError;
