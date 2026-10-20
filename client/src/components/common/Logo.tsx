import { Link } from 'react-router';
import { SITE } from '../../config/site';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-full font-semibold tracking-[-0.01em] text-fg">
      <img src="/favicon.svg" alt="" className="size-7" />
      <span className="text-[17px]">{SITE.name}</span>
    </Link>
  );
}
