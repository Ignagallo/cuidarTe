'use client';

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="
          w-full max-w-lg
          bg-white
          rounded-2xl
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)]
          border border-gray-200
          animate-[fadeIn_0.25s_ease-out]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-[#1D4A74]">
            {title}
          </h2>
          <button
            onClick={onClose}
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
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
