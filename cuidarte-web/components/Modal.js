'use client';

import { useEffect, useId, useRef } from 'react';

export default function Modal({ title, children, onClose, size = 'max-w-lg', bodyClassName = 'px-6 py-5', closeOnEscape = true, showCloseButton = true, zIndexClass = 'z-50' }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    (closeRef.current || dialogRef.current?.querySelector('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'))?.focus();

    const handleKeyDown = (event) => {
      const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if (dialogs[dialogs.length - 1] !== dialogRef.current) return;

      if (closeOnEscape && event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [closeOnEscape]);

  return (
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-6`}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`
          my-auto flex max-h-[min(90dvh,56rem)] w-full flex-col
          bg-white
          rounded-2xl
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)]
          border border-gray-200
          motion-safe:animate-[fadeIn_0.25s_ease-out]
          ${size}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 id={titleId} className="text-lg font-semibold text-[#1D4A74]">
            {title}
          </h2>
          {showCloseButton && <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar diálogo"
            className="
              h-9 w-9 rounded-full
              flex items-center justify-center
              text-gray-500
              hover:bg-gray-100
              hover:text-black
              transition
            "
          >
            ✕
          </button>}
        </div>

        {/* Content */}
        <div className={`min-h-0 overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
