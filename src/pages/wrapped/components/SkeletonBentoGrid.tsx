import { SkeletonCard } from './SkeletonCard';

export function SkeletonBentoGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
      {/* Large release card - 2x2 */}
      <div className="col-span-1 md:col-span-2 row-span-2">
        <SkeletonCard size="large" hasImage className="h-full" />
      </div>

      {/* Small cards */}
      <div className="col-span-1">
        <SkeletonCard size="small" />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" />
      </div>

      {/* Medium artist card - 1x2 */}
      <div className="col-span-1 row-span-2">
        <SkeletonCard size="medium" hasImage className="h-full" />
      </div>

      {/* Medium release cards */}
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>

      {/* Large genre distribution - 2x2 */}
      <div className="col-span-1 md:col-span-2 row-span-2">
        <SkeletonCard size="large" className="h-full" />
      </div>

      {/* Small cards */}
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>

      {/* Wide artist card - 2x1 */}
      <div className="col-span-1 md:col-span-2">
        <SkeletonCard size="wide" hasImage />
      </div>

      {/* More small cards */}
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" />
      </div>

      {/* Wide timeline card - 2x1 */}
      <div className="col-span-1 md:col-span-2">
        <SkeletonCard size="wide" />
      </div>

      {/* Final row of small cards */}
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>
      <div className="col-span-1">
        <SkeletonCard size="small" hasImage />
      </div>
    </div>
  );
}