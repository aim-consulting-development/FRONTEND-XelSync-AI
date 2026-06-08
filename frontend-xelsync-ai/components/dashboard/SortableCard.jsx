"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableCard({ card }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-grab active:cursor-grabbing ${
        isDragging ? "ring-2 ring-blue-500 scale-105" : ""
      }`}
    >
      <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-wide uppercase flex justify-between items-center select-none">
        {card.title}
        <span className="text-gray-300 dark:text-gray-600">⠿</span>
      </h3>

      <p className="text-3xl font-extrabold mt-3 bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 group-hover:from-blue-600 group-hover:to-indigo-500 transition-colors duration-300 select-none">
        {card.value}
      </p>
    </div>
  );
}
