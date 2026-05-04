interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export default function Loader({ size = 'md', fullPage = false }: LoaderProps) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const spinner = (
    <div
      className={`${sizes[size]} border-primary-600 border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="aspect-square skeleton" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-1/3 skeleton rounded" />
            <div className="h-4 w-3/4 skeleton rounded" />
            <div className="h-4 w-1/2 skeleton rounded" />
            <div className="h-6 w-1/3 skeleton rounded mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
