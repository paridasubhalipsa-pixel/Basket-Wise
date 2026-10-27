import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-4 flex flex-col gap-3 animate-pulse">
      <div className="w-full aspect-4/3 bg-slate-200 rounded-lg" />
      <div className="w-24 h-3 bg-slate-200 rounded" />
      <div className="w-full h-5 bg-slate-200 rounded" />
      <div className="w-3/4 h-5 bg-slate-200 rounded" />
      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="w-24 h-6 bg-slate-200 rounded" />
        <div className="w-16 h-4 bg-slate-200 rounded" />
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-slate-200 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};
