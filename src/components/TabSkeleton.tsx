import { Skeleton } from "@/components/ui/skeleton";

const TabSkeleton = () => {
  return (
    <div className="container mx-auto px-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <Skeleton className="h-36 w-full rounded-2xl" />
    </div>
  );
};

export default TabSkeleton;
