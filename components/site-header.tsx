import Link from "next/link";

export function SiteHeader() {
  return <header className="site-header">
    <Link href="/" className="brand" aria-label="#30DayMapChallenge home">
      <span className="brand-mark">30</span>
      <span className="brand-word"><i>#</i>30 Day Map Challenge</span>
    </Link>
    <span className="edition">JOSHUA<br />DE LEON</span>
  </header>;
}
