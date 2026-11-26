import { PricingPage } from '@www/components/PricingPage';
import { asMeta } from '@www/utils/asMeta';

export const metadata = asMeta({
  title:
    'Infinite Table DataGrid for React, Vue and Angular — One License — Infinite Applications.',
  description:
    'One License - Infinite Applications. Infinite Table is the modern DataGrid for building React, Vue and Angular apps with a straightforward licensing model.',
}, 'pricing');
export default function Pricing() {
  return <PricingPage />;
}
