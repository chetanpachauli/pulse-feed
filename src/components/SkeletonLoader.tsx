export function SkeletonLoader() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Title skeleton */}
      <div className="skeleton h-4 w-3/4" />
      
      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
      </div>
      
      {/* Meta info skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-16" />
        </div>
        <div className="skeleton h-8 w-20" />
      </div>
      
      {/* Content type indicator skeleton */}
      <div className="flex items-center space-x-2">
        <div className="skeleton h-6 w-6" />
        <div className="skeleton h-3 w-12" />
      </div>
    </div>
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header skeleton */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-24" />
            </div>
          </div>
          <div className="skeleton h-6 w-16" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-4/5" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
      
      {/* Actions skeleton */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="skeleton h-8 w-20" />
          <div className="skeleton h-8 w-20" />
          <div className="skeleton h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
