"use client";

export default function FormField({ label, htmlFor, required = false, children, className = "" }) {
  return (
    <div className={`min-w-0 space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}{required && <span aria-hidden="true" className="ml-1 text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}
