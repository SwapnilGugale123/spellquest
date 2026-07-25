// illustrations.js — consistent flat SVG illustrations for word images (C.2).
// Style: rounded flat shapes, soft outlines, limited palette shared with the
// app's color system. Falls back to a labeled placeholder for any word
// without a hand-drawn icon (so new admin-added words still work).
const Illustrations = (() => {
  const ns = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function svgWrap(children) {
    const svg = el('svg', { viewBox: '0 0 120 120' });
    children.forEach(c => svg.appendChild(c));
    return svg;
  }
  const C = { sky: '#DBEAFE', grass: '#BBF7D0', sun: '#FACC15', line: '#1E293B', red: '#FB7185',
    blue: '#3B82F6', brown: '#B45309', tan: '#FDE68A', white: '#FFFFFF', green: '#22C55E',
    violet: '#A78BFA', gray: '#94A3B8', black: '#1E293B', pink: '#F9A8D4', orange: '#FB923C' };

  const ICONS = {
    cat: () => svgWrap([
      el('ellipse', { cx: 60, cy: 78, rx: 34, ry: 26, fill: C.orange }),
      el('circle', { cx: 60, cy: 50, r: 26, fill: C.orange }),
      el('path', { d: 'M38 34 L46 50 L34 50 Z', fill: C.orange }),
      el('path', { d: 'M82 34 L86 50 L74 50 Z', fill: C.orange }),
      el('circle', { cx: 50, cy: 50, r: 4, fill: C.black }),
      el('circle', { cx: 70, cy: 50, r: 4, fill: C.black }),
      el('path', { d: 'M56 58 L64 58 L60 63 Z', fill: C.black }),
      el('path', { d: 'M60 63 Q52 70 44 66 M60 63 Q68 70 76 66', stroke: C.black, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }),
    ]),
    dog: () => svgWrap([
      el('ellipse', { cx: 60, cy: 82, rx: 32, ry: 24, fill: C.tan }),
      el('circle', { cx: 60, cy: 52, r: 24, fill: C.tan }),
      el('ellipse', { cx: 38, cy: 48, rx: 10, ry: 18, fill: C.brown, transform: 'rotate(-15 38 48)' }),
      el('ellipse', { cx: 82, cy: 48, rx: 10, ry: 18, fill: C.brown, transform: 'rotate(15 82 48)' }),
      el('circle', { cx: 51, cy: 52, r: 3.5, fill: C.black }),
      el('circle', { cx: 69, cy: 52, r: 3.5, fill: C.black }),
      el('ellipse', { cx: 60, cy: 60, rx: 4, ry: 3, fill: C.black }),
    ]),
    bird: () => svgWrap([
      el('ellipse', { cx: 58, cy: 66, rx: 26, ry: 22, fill: C.blue }),
      el('circle', { cx: 82, cy: 50, r: 14, fill: C.blue }),
      el('path', { d: 'M94 50 L104 46 L94 56 Z', fill: C.sun }),
      el('circle', { cx: 86, cy: 46, r: 2.5, fill: C.black }),
      el('path', { d: 'M40 70 Q20 60 24 44', stroke: C.blue, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }),
      el('path', { d: 'M50 88 L46 100 M62 88 L64 100', stroke: C.orange, 'stroke-width': 4, 'stroke-linecap': 'round' }),
    ]),
    sun: () => svgWrap([
      ...Array.from({ length: 8 }, (_, i) => el('rect', { x: 56, y: 6, width: 8, height: 20, rx: 4, fill: C.sun, transform: `rotate(${i * 45} 60 60)` })),
      el('circle', { cx: 60, cy: 60, r: 26, fill: C.sun }),
      el('circle', { cx: 52, cy: 56, r: 3, fill: C.brown }),
      el('circle', { cx: 68, cy: 56, r: 3, fill: C.brown }),
      el('path', { d: 'M50 68 Q60 78 70 68', stroke: C.brown, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }),
    ]),
    red: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.red })]),
    blue: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.blue })]),
    green: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.green })]),
    white: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.white, stroke: C.gray, 'stroke-width': 3 })]),
    black: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.black })]),
    yellow: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.sun })]),
    box: () => svgWrap([
      el('rect', { x: 26, y: 46, width: 68, height: 52, fill: C.brown, rx: 4 }),
      el('polygon', { points: '26,46 60,28 94,46 60,64', fill: C.tan }),
      el('rect', { x: 54, y: 46, width: 12, height: 52, fill: '#92400E' }),
    ]),
    egg: () => svgWrap([el('ellipse', { cx: 60, cy: 64, rx: 26, ry: 34, fill: C.white, stroke: C.gray, 'stroke-width': 2 })]),
    ball: () => svgWrap([
      el('circle', { cx: 60, cy: 60, r: 36, fill: C.red }),
      el('path', { d: 'M60 24 V96 M24 60 H96 M33 33 Q60 60 87 33 M33 87 Q60 60 87 87', stroke: C.white, 'stroke-width': 3, fill: 'none' }),
    ]),
    fish: () => svgWrap([
      el('ellipse', { cx: 55, cy: 60, rx: 32, ry: 20, fill: C.blue }),
      el('polygon', { points: '86,60 106,44 106,76', fill: C.blue }),
      el('circle', { cx: 40, cy: 56, r: 3, fill: C.black }),
      el('path', { d: 'M30 60 Q20 50 16 60 Q20 70 30 60', fill: C.orange }),
    ]),
    tree: () => svgWrap([
      el('rect', { x: 54, y: 70, width: 12, height: 34, fill: C.brown }),
      el('circle', { cx: 60, cy: 48, r: 30, fill: C.green }),
      el('circle', { cx: 40, cy: 60, r: 20, fill: C.green }),
      el('circle', { cx: 80, cy: 60, r: 20, fill: C.green }),
    ]),
    milk: () => svgWrap([
      el('path', { d: 'M44 20 H76 V36 L84 48 V100 H36 V48 L44 36 Z', fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('rect', { x: 36, y: 60, width: 48, height: 16, fill: C.blue }),
    ]),
    star: () => svgWrap([el('path', { d: 'M60 18 L70 46 L100 46 L76 64 L86 94 L60 76 L34 94 L44 64 L20 46 L50 46 Z', fill: C.sun })]),
    rain: () => svgWrap([
      el('ellipse', { cx: 60, cy: 44, rx: 30, ry: 18, fill: C.gray }),
      ...[36, 56, 76].map(x => el('path', { d: `M${x} 66 L${x - 6} 90`, stroke: C.blue, 'stroke-width': 5, 'stroke-linecap': 'round' })),
    ]),
    girl: () => svgWrap([
      el('circle', { cx: 60, cy: 42, r: 20, fill: C.tan }),
      el('path', { d: 'M40 40 Q60 10 80 40 L80 54 Q60 44 40 54 Z', fill: C.brown }),
      el('path', { d: 'M40 92 Q40 62 60 62 Q80 62 80 92 Z', fill: C.pink }),
    ]),
    boy: () => svgWrap([
      el('circle', { cx: 60, cy: 42, r: 20, fill: C.tan }),
      el('path', { d: 'M40 38 Q60 20 80 38 L78 30 Q60 22 42 30 Z', fill: C.black }),
      el('path', { d: 'M40 92 Q40 62 60 62 Q80 62 80 92 Z', fill: C.blue }),
    ]),
    father: () => svgWrap([
      el('circle', { cx: 60, cy: 38, r: 18, fill: C.tan }),
      el('path', { d: 'M42 34 Q60 18 78 34 L76 28 Q60 20 44 28 Z', fill: '#334155' }),
      el('path', { d: 'M38 100 Q38 66 60 66 Q82 66 82 100 Z', fill: '#334155' }),
      el('rect', { x: 56, y: 66, width: 8, height: 30, fill: C.red }),
    ]),
    mother: () => svgWrap([
      el('circle', { cx: 60, cy: 38, r: 18, fill: C.tan }),
      el('path', { d: 'M40 36 Q60 12 80 36 L80 50 Q60 40 40 50 Z', fill: '#7C2D12' }),
      el('path', { d: 'M38 100 Q38 66 60 66 Q82 66 82 100 Z', fill: C.violet }),
    ]),
    water: () => svgWrap([
      el('path', { d: 'M60 20 C40 50 30 66 30 80 A30 30 0 0 0 90 80 C90 66 80 50 60 20 Z', fill: C.blue }),
      el('ellipse', { cx: 50, cy: 78, rx: 8, ry: 12, fill: C.sky, opacity: .7 }),
    ]),
    tea: () => svgWrap([
      el('path', { d: 'M32 50 H80 V80 A24 24 0 0 1 32 80 Z', fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('path', { d: 'M36 56 H76 V78 A20 20 0 0 1 36 78 Z', fill: C.brown }),
      el('path', { d: 'M80 56 Q100 56 100 68 Q100 80 80 78', fill: 'none', stroke: C.gray, 'stroke-width': 4 }),
    ]),
    coffee: () => svgWrap([
      el('path', { d: 'M32 50 H80 V80 A24 24 0 0 1 32 80 Z', fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('path', { d: 'M36 56 H76 V78 A20 20 0 0 1 36 78 Z', fill: '#4B2E1E' }),
      el('path', { d: 'M80 56 Q100 56 100 68 Q100 80 80 78', fill: 'none', stroke: C.gray, 'stroke-width': 4 }),
      el('path', { d: 'M48 30 Q52 38 46 44 M64 30 Q68 38 62 44', stroke: C.gray, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }),
    ]),
    inside: () => svgWrap([
      el('rect', { x: 22, y: 46, width: 76, height: 54, fill: C.tan }),
      el('polygon', { points: '18,46 60,16 102,46', fill: C.red }),
      el('rect', { x: 46, y: 68, width: 20, height: 32, fill: C.brown }),
      el('circle', { cx: 60, cy: 60, r: 10, fill: C.blue }),
    ]),
    outside: () => svgWrap([
      el('rect', { x: 10, y: 58, width: 44, height: 34, fill: C.tan }),
      el('polygon', { points: '6,58 32,38 58,58', fill: C.red }),
      el('circle', { cx: 96, cy: 22, r: 14, fill: C.sun }),
      el('circle', { cx: 82, cy: 78, r: 12, fill: C.blue }),
      el('circle', { cx: 82, cy: 92, r: 6, fill: C.blue }),
    ]),
    car: () => svgWrap([
      el('rect', { x: 20, y: 60, width: 80, height: 24, rx: 8, fill: C.blue }),
      el('path', { d: 'M36 60 L46 40 L74 40 L84 60 Z', fill: C.blue }),
      el('rect', { x: 48, y: 44, width: 24, height: 14, fill: C.sky }),
      el('circle', { cx: 40, cy: 86, r: 10, fill: C.black }),
      el('circle', { cx: 80, cy: 86, r: 10, fill: C.black }),
    ]),
    van: () => svgWrap([
      el('rect', { x: 18, y: 42, width: 84, height: 42, rx: 8, fill: C.orange }),
      el('rect', { x: 26, y: 50, width: 24, height: 16, fill: C.sky }),
      el('circle', { cx: 38, cy: 88, r: 10, fill: C.black }),
      el('circle', { cx: 84, cy: 88, r: 10, fill: C.black }),
    ]),
    bike: () => svgWrap([
      el('path', { d: 'M40 82 L60 40 L80 40', stroke: C.blue, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }),
      el('path', { d: 'M60 40 L48 82', stroke: C.blue, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }),
      el('circle', { cx: 40, cy: 86, r: 18, fill: 'none', stroke: C.black, 'stroke-width': 5 }),
      el('circle', { cx: 80, cy: 86, r: 18, fill: 'none', stroke: C.black, 'stroke-width': 5 }),
    ]),
    cycle: () => svgWrap([
      el('path', { d: 'M40 82 L60 40 L80 40', stroke: C.violet, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }),
      el('path', { d: 'M60 40 L48 82', stroke: C.violet, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }),
      el('circle', { cx: 40, cy: 86, r: 18, fill: 'none', stroke: C.black, 'stroke-width': 5 }),
      el('circle', { cx: 80, cy: 86, r: 18, fill: 'none', stroke: C.black, 'stroke-width': 5 }),
    ]),
    apple: () => svgWrap([
      el('path', { d: 'M60 40 C40 34 28 50 30 66 C32 86 46 100 60 96 C74 100 88 86 90 66 C92 50 80 34 60 40 Z', fill: C.red }),
      el('path', { d: 'M58 40 Q54 26 66 20', stroke: C.brown, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
      el('ellipse', { cx: 66, cy: 24, rx: 8, ry: 5, fill: C.green, transform: 'rotate(-30 66 24)' }),
    ]),
    river: () => svgWrap([
      el('path', { d: 'M10 50 Q40 40 60 50 Q80 60 110 50 L110 90 Q80 100 60 90 Q40 80 10 90 Z', fill: C.blue }),
      el('rect', { x: 0, y: 30, width: 120, height: 20, fill: C.grass }),
      el('rect', { x: 0, y: 100, width: 120, height: 20, fill: C.grass }),
    ]),
    cloud: () => svgWrap([
      el('ellipse', { cx: 50, cy: 62, rx: 26, ry: 18, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('ellipse', { cx: 74, cy: 56, rx: 20, ry: 16, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('ellipse', { cx: 40, cy: 70, rx: 18, ry: 12, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
    ]),
    bridge: () => svgWrap([
      el('path', { d: 'M14 80 Q60 30 106 80', stroke: C.brown, 'stroke-width': 8, fill: 'none' }),
      el('rect', { x: 10, y: 80, width: 100, height: 8, fill: '#78716C' }),
      ...[28, 50, 70, 92].map(x => el('rect', { x, y: 80, width: 4, height: 16, fill: '#78716C' })),
    ]),
    garden: () => svgWrap([
      el('rect', { x: 0, y: 70, width: 120, height: 40, fill: C.grass }),
      el('circle', { cx: 36, cy: 66, r: 10, fill: C.red }),
      el('circle', { cx: 60, cy: 60, r: 10, fill: C.sun }),
      el('circle', { cx: 84, cy: 66, r: 10, fill: C.violet }),
      ...[36, 60, 84].map(x => el('rect', { x: x - 2, y: 70, width: 4, height: 16, fill: C.green })),
    ]),
    thirty: () => textIcon('30'),
    oval: () => svgWrap([el('ellipse', { cx: 60, cy: 60, rx: 42, ry: 28, fill: C.violet })]),
    curd: () => svgWrap([
      el('path', { d: 'M40 40 H80 V78 A20 20 0 0 1 40 78 Z', fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('ellipse', { cx: 60, cy: 40, rx: 20, ry: 6, fill: '#F1F5F9' }),
    ]),
    pune: () => textIcon('Pune'),
    bulb: () => svgWrap([
      el('circle', { cx: 60, cy: 50, r: 26, fill: C.tan }),
      el('rect', { x: 50, y: 74, width: 20, height: 14, fill: C.gray }),
      el('path', { d: 'M52 88 H68 M54 92 H66', stroke: C.gray, 'stroke-width': 3 }),
    ]),
    under: () => svgWrap([
      el('rect', { x: 20, y: 40, width: 80, height: 8, fill: C.brown }),
      el('circle', { cx: 60, cy: 74, r: 14, fill: C.orange }),
    ]),
    drum: () => svgWrap([
      el('ellipse', { cx: 60, cy: 44, rx: 32, ry: 12, fill: C.red }),
      el('rect', { x: 28, y: 44, width: 64, height: 40, fill: '#DC2626' }),
      el('ellipse', { cx: 60, cy: 84, rx: 32, ry: 12, fill: '#B91C1C' }),
    ]),
    ring: () => svgWrap([
      el('circle', { cx: 60, cy: 68, r: 26, fill: 'none', stroke: C.sun, 'stroke-width': 10 }),
      el('path', { d: 'M60 30 L50 44 L70 44 Z', fill: C.blue }),
      el('circle', { cx: 60, cy: 38, r: 6, fill: '#93C5FD' }),
    ]),
    pink: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.pink })]),
    gift: () => svgWrap([
      el('rect', { x: 26, y: 52, width: 68, height: 46, fill: C.red }),
      el('rect', { x: 26, y: 52, width: 68, height: 14, fill: '#DC2626' }),
      el('rect', { x: 54, y: 52, width: 12, height: 46, fill: C.sun }),
      el('path', { d: 'M60 52 Q44 32 34 44 Q34 52 48 52 Z', fill: C.sun }),
      el('path', { d: 'M60 52 Q76 32 86 44 Q86 52 72 52 Z', fill: C.sun }),
    ]),
    corn: () => svgWrap([
      el('path', { d: 'M60 20 C40 20 34 46 40 76 C44 96 76 96 80 76 C86 46 80 20 60 20 Z', fill: C.sun }),
      ...[38, 50, 62, 74, 86].map(y => el('circle', { cx: 46, cy: y - 8, r: 3.5, fill: '#EAB308' })),
      ...[38, 50, 62, 74, 86].map(y => el('circle', { cx: 60, cy: y - 4, r: 3.5, fill: '#EAB308' })),
      ...[38, 50, 62, 74, 86].map(y => el('circle', { cx: 74, cy: y - 8, r: 3.5, fill: '#EAB308' })),
      el('path', { d: 'M48 22 Q60 6 72 22', fill: C.green }),
    ]),
    long: () => svgWrap([
      el('rect', { x: 14, y: 54, width: 92, height: 12, rx: 6, fill: C.blue }),
      el('rect', { x: 14, y: 54, width: 20, height: 12, rx: 6, fill: C.coral }),
    ]),
    pond: () => svgWrap([
      el('ellipse', { cx: 60, cy: 68, rx: 44, ry: 26, fill: C.blue }),
      el('ellipse', { cx: 44, cy: 60, rx: 8, ry: 5, fill: '#93C5FD' }),
      el('path', { d: 'M30 44 Q36 34 44 38', stroke: C.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
      el('path', { d: 'M84 46 Q90 36 98 40', stroke: C.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
    ]),
    circle: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: 'none', stroke: C.violet, 'stroke-width': 10 })]),
    fifteen: () => textIcon('15'),
    eighteen: () => textIcon('18'),
    twenty: () => textIcon('20'),
    nose: () => svgWrap([
      el('circle', { cx: 60, cy: 40, r: 30, fill: C.tan }),
      el('path', { d: 'M52 60 Q50 78 60 82 Q70 78 68 60', fill: C.tan, stroke: '#D97706', 'stroke-width': 2 }),
      el('circle', { cx: 55, cy: 76, r: 3, fill: '#92400E' }),
      el('circle', { cx: 65, cy: 76, r: 3, fill: '#92400E' }),
    ]),
    tongue: () => svgWrap([
      el('path', { d: 'M34 30 H86 V56 Q86 96 60 96 Q34 96 34 56 Z', fill: C.pink }),
      el('path', { d: 'M60 56 V90', stroke: '#F472B6', 'stroke-width': 3 }),
      el('rect', { x: 34, y: 30, width: 52, height: 14, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
    ]),
  };

  function textIcon(label) {
    return svgWrap([
      el('rect', { x: 10, y: 10, width: 100, height: 100, rx: 18, fill: '#EEF2FF' }),
      Object.assign(el('text', { x: 60, y: 68, 'text-anchor': 'middle', 'font-size': 26, 'font-family': "'Baloo 2',sans-serif", 'font-weight': 800, fill: '#3B82F6' }), { textContent: label }),
    ]);
  }

  function render(word) {
    const key = (word || '').toLowerCase().trim();
    const fn = ICONS[key];
    if (fn) return fn();
    return textIcon(word ? word[0].toUpperCase() : '?');
  }

  return { render, has: w => !!ICONS[(w || '').toLowerCase().trim()] };
})();
