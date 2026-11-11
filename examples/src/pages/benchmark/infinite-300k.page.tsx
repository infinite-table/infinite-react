// Infinite Table, 300,000 rows - see src/benchmark/README.md
import { InfiniteBenchmark } from '../../benchmark/InfiniteBenchmark';
import { BENCH_SIZES } from '../../benchmark/data';

export default function Page() {
  return <InfiniteBenchmark rowCount={BENCH_SIZES['300k']} />;
}
