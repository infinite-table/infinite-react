import { PricingPage } from '@www/components/PricingPage';
import { asMeta } from '@www/utils/asMeta';

export const metadata = asMeta({
  title:
    'Infinite Table DataGrid for React — One License — Infinite Applications.',
  description:
    'One License - Infinite Applications. Infinite Table is the modern DataGrid for building React apps with a straightforward licensing model.',
});
export default function Pricing() {
  return <PricingPage />;
}
