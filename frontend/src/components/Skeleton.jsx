export function SkeletonCard() {
  return (
    <div className="card p-5 border border-gray-100 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = '100%' }) {
  return <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width }} />;
}

export function SkeletonButton() {
  return <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full" />;
}

export function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex justify-center py-16 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#003366]" />
    </div>
  );
}