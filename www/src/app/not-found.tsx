import { redirect } from 'next/navigation';

export default function NotFound() {
  return redirect('/docs/404');
}
