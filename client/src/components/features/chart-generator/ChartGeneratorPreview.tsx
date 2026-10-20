/** Mini grafico a barre decorativo per il box della home. */
const BARS = [
  { height: 46, className: 'fill-primary' },
  { height: 72, className: 'fill-accent' },
  { height: 58, className: 'fill-success' },
  { height: 88, className: 'fill-primary' },
  { height: 64, className: 'fill-accent' },
];

export function ChartGeneratorPreview() {
  return (
    <svg viewBox="0 0 160 104" className="h-28 w-auto" aria-hidden>
      <line x1="4" y1="100" x2="156" y2="100" className="stroke-border-strong" strokeWidth="1.5" />
      {BARS.map((bar, index) => (
        <rect key={index} x={10 + index * 30} y={98 - bar.height} width="20" height={bar.height} rx="3" className={bar.className} />
      ))}
    </svg>
  );
}
