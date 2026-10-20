/** Mini QR decorativo (statico) per il box della home. */
const CELLS = [
  '1111111010111111',
  '1000001001100001',
  '1011101011101101',
  '1011101000101101',
  '1000001010100001',
  '1111111010111111',
  '0000000011000000',
  '1101011101011010',
  '0110100110110101',
  '0000000010011010',
  '1111111001101101',
  '1000001011010100',
  '1011101000111011',
  '1000001011001101',
  '1111111010110110',
];

export function QrPreview() {
  return (
    <svg viewBox="0 0 16 15" className="size-28" aria-hidden shapeRendering="crispEdges">
      {CELLS.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null,
        ),
      )}
    </svg>
  );
}
