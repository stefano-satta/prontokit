import { describe, expect, it } from 'vitest';
import { chartFileBase, svgFromPng, tableFileBase } from '../src/lib/chart-generator/exportNames';
import { shortLabel } from '../src/lib/chart-generator/chartConfig';
import { legendEntries } from '../src/lib/chart-generator/legend';
import { formatNumber, parseNumber } from '../src/lib/chart-generator/numbers';
import { LIGHT_CHART_PALETTE, readableInkOn, seriesColor } from '../src/lib/chart-generator/palette';
import { chartBlocker, MAX_CHART_ROWS, parseChartData } from '../src/lib/chart-generator/parseChartData';
import { buildTableModel, pieSliceText } from '../src/lib/chart-generator/tableModel';
import { buildTableSvg } from '../src/lib/chart-generator/tableSvg';

describe('parseNumber', () => {
  it.each([
    ['120', 120],
    ['12,5', 12.5],
    ['12.5', 12.5],
    ['1.250', 1250],
    ['1.250,75', 1250.75],
    ['-3,2', -3.2],
    ['+7', 7],
    [' 1 000 ', 1000],
    ['0,05', 0.05],
  ])('%s → %d', (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it.each(['abc', '12a', '1,2,3', '', '--1', '12,'])('"%s" non è un numero', (input) => {
    expect(parseNumber(input)).toBeNull();
  });
});

describe('formatNumber', () => {
  it('usa il formato italiano', () => {
    expect(formatNumber(1250.5)).toBe('1250,5');
    expect(formatNumber(12345.5)).toBe('12.345,5');
    expect(formatNumber(3, 2)).toBe('3,00');
  });
});

describe('parseChartData', () => {
  it('legge le righe "etichetta;valore" e ignora quelle vuote', () => {
    const parsed = parseChartData('Gennaio;120\n\n  Febbraio ; 98,5  \r\nMarzo;1.250');
    expect(parsed.issues).toEqual([]);
    expect(parsed.rows).toEqual([
      { label: 'Gennaio', value: 120 },
      { label: 'Febbraio', value: 98.5 },
      { label: 'Marzo', value: 1250 },
    ]);
  });

  it('divide sull’ultimo punto e virgola', () => {
    expect(parseChartData('Nord; Est;10').rows).toEqual([{ label: 'Nord; Est', value: 10 }]);
  });

  it('segnala le righe non valide con il numero di riga', () => {
    const parsed = parseChartData('Gennaio,120\n;5\nMarzo;\nAprile;tanti\nMaggio;3');
    expect(parsed.rows).toEqual([{ label: 'Maggio', value: 3 }]);
    expect(parsed.issues.map((issue) => issue.line)).toEqual([1, 2, 3, 4]);
    expect(parsed.issues[0].message).toContain('punto e virgola');
    expect(parsed.issues[3].message).toContain('"tanti"');
  });

  it('limita il numero di righe', () => {
    const text = Array.from({ length: MAX_CHART_ROWS + 3 }, (_, i) => `V${i};${i}`).join('\n');
    const parsed = parseChartData(text);
    expect(parsed.rows).toHaveLength(MAX_CHART_ROWS);
    expect(parsed.truncated).toBe(3);
  });
});

describe('chartBlocker', () => {
  const rows = [
    { label: 'A', value: 2 },
    { label: 'B', value: -1 },
  ];
  it('chiede almeno una riga', () => {
    expect(chartBlocker('bar', [])).toContain('almeno una riga');
  });
  it('barre e linee accettano i negativi', () => {
    expect(chartBlocker('bar', rows)).toBeNull();
    expect(chartBlocker('line', rows)).toBeNull();
  });
  it('la torta rifiuta negativi e totale zero', () => {
    expect(chartBlocker('pie', rows)).toContain('"B"');
    expect(chartBlocker('pie', [{ label: 'A', value: 0 }])).toContain('zero');
  });
});

describe('tabella e formato della torta', () => {
  const rows = [
    { label: 'A', value: 1 },
    { label: 'B', value: 2 },
  ];

  it('barre: valore come inserito e quota sul massimo con barra colorata', () => {
    const model = buildTableModel(
      'bar',
      [
        { label: 'A', value: 12.25 },
        { label: 'B', value: 49 },
        { label: 'C', value: -7 },
      ],
      { mode: 'value', decimals: 1 },
    );
    expect(model.columns.map((c) => c.label)).toEqual(['Etichetta', 'Valore', 'Rispetto al massimo']);
    expect(model.rows).toEqual([
      ['A', '12,25', '25,0%'],
      ['B', '49', '100,0%'],
      ['C', '-7', '-14,3%'],
    ]);
    expect(model.meter).toEqual({ column: 2, fractions: [0.25, 1, 0], colorIndexes: [0, 1, 2] });
    expect(model.footer).toBeUndefined();
  });

  it('linee: un solo colore e nessuna quota se il massimo non è positivo', () => {
    const model = buildTableModel('line', [{ label: 'A', value: 0 }, { label: 'B', value: -2 }], { mode: 'value', decimals: 1 });
    expect(model.rows.map((row) => row[2])).toEqual(['–', '–']);
    expect(model.meter?.colorIndexes).toEqual([0, 0]);
  });

  it('torta: percentuale con i decimali scelti e totale', () => {
    const model = buildTableModel('pie', rows, { mode: 'percent', decimals: 2 });
    expect(model.rows).toEqual([
      ['A', '1', '33,33%'],
      ['B', '2', '66,67%'],
    ]);
    expect(model.footer).toEqual(['Totale', '3', '100,00%']);
  });

  it('testo dello spicchio in valore o percentuale', () => {
    expect(pieSliceText(1, 3, { mode: 'percent', decimals: 1 })).toBe('33,3%');
    expect(pieSliceText(1, 3, { mode: 'value', decimals: 2 })).toBe('1,00');
  });
});

describe('buildTableSvg', () => {
  const measure = (text: string) => text.length * 8;

  it('produce un SVG con titolo, intestazioni e celle escapate', () => {
    const model = buildTableModel('pie', [{ label: 'R&D <2026>', value: 5 }], { mode: 'value', decimals: 1 });
    const { svg, width, height } = buildTableSvg(model, 'Budget "Q1"', measure);
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain(`viewBox="0 0 ${width} ${height}"`);
    expect(svg).toContain('R&amp;D &lt;2026&gt;');
    expect(svg).toContain('<title>Budget &quot;Q1&quot;</title>');
    expect(svg).toContain('>Percentuale</text>');
    expect(svg).toContain('>Totale</text>');
  });

  it('disegna le barre di avanzamento con i colori delle serie', () => {
    const model = buildTableModel('bar', [{ label: 'A', value: 1 }, { label: 'B', value: 2 }], { mode: 'value', decimals: 1 });
    const { svg } = buildTableSvg(model, '', measure);
    expect(svg).toContain('>Rispetto al massimo</text>');
    expect(svg).toContain('width="70" height="8" rx="4" fill="#2a78d6"');
    expect(svg).toContain('width="140" height="8" rx="4" fill="#eb6834"');
  });

  it('allarga le colonne sul testo più lungo', () => {
    const short = buildTableSvg(buildTableModel('bar', [{ label: 'A', value: 1 }], { mode: 'value', decimals: 1 }), '', measure);
    const long = buildTableSvg(
      buildTableModel('bar', [{ label: 'Una etichetta molto lunga', value: 1 }], { mode: 'value', decimals: 1 }),
      '',
      measure,
    );
    expect(long.width).toBeGreaterThan(short.width);
  });
});

describe('shortLabel', () => {
  it('lascia intatte le etichette corte e accorcia quelle lunghe', () => {
    expect(shortLabel('Gennaio')).toBe('Gennaio');
    expect(shortLabel('Una etichetta molto lunga')).toBe('Una etichetta m…');
  });
});

describe('legendEntries', () => {
  const rows = [
    { label: 'A', value: 1 },
    { label: 'B', value: 3 },
  ];
  const pieFormat = { mode: 'percent', decimals: 1 } as const;

  it('barre: colori misti e valori come inseriti', () => {
    expect(legendEntries({ kind: 'bar', rows, pieFormat }, LIGHT_CHART_PALETTE)).toEqual([
      { label: 'A', text: '1', color: '#2a78d6' },
      { label: 'B', text: '3', color: '#eb6834' },
    ]);
  });

  it('linee: un solo colore', () => {
    expect(legendEntries({ kind: 'line', rows, pieFormat }, LIGHT_CHART_PALETTE).map((e) => e.color)).toEqual(['#2a78d6', '#2a78d6']);
  });

  it('torta: formato scelto', () => {
    expect(legendEntries({ kind: 'pie', rows, pieFormat }, LIGHT_CHART_PALETTE).map((e) => e.text)).toEqual(['25,0%', '75,0%']);
  });
});

describe('palette ed esportazione', () => {
  it('assegna i colori in ordine fisso', () => {
    expect(seriesColor(LIGHT_CHART_PALETTE, 0)).toBe('#2a78d6');
    expect(seriesColor(LIGHT_CHART_PALETTE, 8)).toBe('#2a78d6');
  });

  it('sceglie l’inchiostro più leggibile', () => {
    expect(readableInkOn('#2a78d6')).toBe('#0b0b0b');
    expect(readableInkOn('#008300')).toBe('#ffffff');
    expect(readableInkOn('#eda100')).toBe('#0b0b0b');
  });

  it('nomi file sicuri dal titolo', () => {
    expect(chartFileBase('Vendite 2026/Q1', 'pie')).toBe('Vendite 2026Q1-torta');
    expect(chartFileBase('  ', 'bar')).toBe('grafico-barre');
    expect(tableFileBase('Vendite')).toBe('Vendite-tabella');
  });

  it('SVG che incapsula il PNG', () => {
    const svg = svgFromPng('data:image/png;base64,AAA', 10, 20, 'A & B');
    expect(svg).toContain('href="data:image/png;base64,AAA"');
    expect(svg).toContain('<title>A &amp; B</title>');
  });
});
