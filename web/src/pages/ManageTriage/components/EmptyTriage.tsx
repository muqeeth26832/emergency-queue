import { useState } from "react";

interface Props {
  onClick: () => void;
}

export function EmptyTriage({ onClick }: Props) {
  const [visible, setVisible] = useState(true);

  const handleClick = () => {
    // Start animation
    setVisible(false);
    // Trigger action after animation
    setTimeout(() => {
      onClick();
    }, 300); // match animation duration
  };

  return (
    <div
      className={`flex justify-center items-center w-full h-[80vh] bg-white transition-all duration-300 ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-3 px-4 py-2 bg-red-400 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-red-500 active:bg-red-400/90 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        <span className="text-2xl">➕</span>
        <span className="text-lg tracking-wide font-bold text-white">
          Create Triage Flow
        </span>
      </button>
    </div>
  );
}

