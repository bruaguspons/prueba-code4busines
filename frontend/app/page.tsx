import { Suspense } from 'react';
import { getSales } from '@/lib/api';
import SalesTable from '@/components/SalesTable';
import SalesTableSkeleton from '@/components/SalesTableSkeleton';

export default function Home() {
  const salesPromise = getSales();
  return (
    <Suspense fallback={<SalesTableSkeleton />}>
      <SalesTable salesPromise={salesPromise} />
    </Suspense>
  );
}
