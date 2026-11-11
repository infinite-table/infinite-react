// AG Grid, 300,000 rows - see src/benchmark/README.md
import { AgGridBenchmark } from '../../benchmark/AgGridBenchmark';
import { BENCH_SIZES } from '../../benchmark/data';

export default function Page() {
  return <AgGridBenchmark rowCount={BENCH_SIZES['300k']} />;
}
