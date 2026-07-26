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
    violet: '#A78BFA', gray: '#94A3B8', black: '#1E293B', pink: '#F9A8D4', orange: '#FB923C',
    purple: '#9333EA', grey: '#9CA3AF', gold: '#D4AF37', darkBrown: '#78350F', cream: '#FEF3C7',
    navy: '#1E3A8A', wood: '#C08552', coral: '#FB7185' };

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

    /* ---- numbers 11-40 ---- */
    eleven: () => textIcon('11'),
    twelve: () => textIcon('12'),
    thirteen: () => textIcon('13'),
    fourteen: () => textIcon('14'),
    sixteen: () => textIcon('16'),
    seventeen: () => textIcon('17'),
    nineteen: () => textIcon('19'),
    forty: () => textIcon('40'),

    /* ---- colors ---- */
    orange: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.orange })]),
    purple: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.purple })]),
    brown: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.brown })]),
    grey: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.grey })]),
    gold: () => svgWrap([el('circle', { cx: 60, cy: 60, r: 40, fill: C.gold })]),

    /* ---- home objects ---- */
    door: () => svgWrap([
      el('rect', { x: 34, y: 16, width: 52, height: 92, rx: 4, fill: C.wood }),
      el('rect', { x: 40, y: 22, width: 40, height: 80, rx: 3, fill: '#D8A868' }),
      el('circle', { cx: 72, cy: 62, r: 3.5, fill: C.gold }),
    ]),
    window: () => svgWrap([
      el('rect', { x: 20, y: 20, width: 80, height: 80, rx: 6, fill: C.sky, stroke: C.wood, 'stroke-width': 6 }),
      el('rect', { x: 56, y: 20, width: 8, height: 80, fill: C.wood }),
      el('rect', { x: 20, y: 56, width: 80, height: 8, fill: C.wood }),
    ]),
    table: () => svgWrap([
      el('rect', { x: 16, y: 46, width: 88, height: 12, fill: C.wood }),
      el('rect', { x: 24, y: 58, width: 8, height: 40, fill: C.brown }),
      el('rect', { x: 88, y: 58, width: 8, height: 40, fill: C.brown }),
    ]),
    chair: () => svgWrap([
      el('rect', { x: 34, y: 20, width: 44, height: 10, fill: C.wood }),
      el('rect', { x: 34, y: 20, width: 10, height: 60, fill: C.wood }),
      el('rect', { x: 30, y: 56, width: 52, height: 10, fill: C.wood }),
      el('rect', { x: 34, y: 66, width: 8, height: 34, fill: C.brown }),
      el('rect', { x: 74, y: 66, width: 8, height: 34, fill: C.brown }),
    ]),
    bed: () => svgWrap([
      el('rect', { x: 16, y: 60, width: 88, height: 30, rx: 4, fill: C.blue }),
      el('rect', { x: 16, y: 50, width: 22, height: 18, rx: 4, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('rect', { x: 16, y: 90, width: 8, height: 14, fill: C.wood }),
      el('rect', { x: 96, y: 90, width: 8, height: 14, fill: C.wood }),
    ]),
    lamp: () => svgWrap([
      el('path', { d: 'M40 20 L80 20 L92 56 L28 56 Z', fill: C.sun }),
      el('rect', { x: 56, y: 56, width: 8, height: 38, fill: C.grey }),
      el('rect', { x: 46, y: 94, width: 28, height: 8, fill: C.grey }),
    ]),
    clock: () => svgWrap([
      el('circle', { cx: 60, cy: 60, r: 40, fill: C.white, stroke: C.black, 'stroke-width': 4 }),
      el('line', { x1: 60, y1: 60, x2: 60, y2: 36, stroke: C.black, 'stroke-width': 4, 'stroke-linecap': 'round' }),
      el('line', { x1: 60, y1: 60, x2: 78, y2: 66, stroke: C.black, 'stroke-width': 4, 'stroke-linecap': 'round' }),
      el('circle', { cx: 60, cy: 60, r: 4, fill: C.red }),
    ]),
    mirror: () => svgWrap([
      el('ellipse', { cx: 60, cy: 52, rx: 30, ry: 38, fill: C.sky, stroke: C.gold, 'stroke-width': 6 }),
      el('rect', { x: 55, y: 88, width: 10, height: 20, fill: C.gold }),
    ]),
    key: () => svgWrap([
      el('circle', { cx: 40, cy: 50, r: 16, fill: 'none', stroke: C.gold, 'stroke-width': 8 }),
      el('rect', { x: 52, y: 46, width: 44, height: 8, fill: C.gold }),
      el('rect', { x: 80, y: 54, width: 8, height: 12, fill: C.gold }),
      el('rect', { x: 92, y: 54, width: 8, height: 16, fill: C.gold }),
    ]),
    roof: () => svgWrap([el('polygon', { points: '60,20 104,64 16,64', fill: C.red })]),
    wall: () => svgWrap([
      ...[0, 1, 2].flatMap(row => [0, 1].map(col => el('rect', {
        x: 16 + col * 46 + (row % 2 ? 23 : 0), y: 20 + row * 28, width: row % 2 && (col === 1) ? 23 : 46, height: 24,
        fill: row % 2 === 0 ? C.brown : C.wood, stroke: C.tan, 'stroke-width': 2,
      }))),
    ]),
    floor: () => svgWrap([
      ...[0, 1, 2, 3].map(i => el('rect', { x: 10, y: 20 + i * 20, width: 100, height: 18, fill: i % 2 ? C.wood : '#D8A868', stroke: C.brown, 'stroke-width': 1 })),
    ]),
    stairs: () => svgWrap([
      el('polygon', { points: '20,100 20,80 40,80 40,60 60,60 60,40 80,40 80,20 100,20 100,100', fill: C.grey }),
    ]),
    kitchen: () => svgWrap([
      el('rect', { x: 16, y: 50, width: 88, height: 40, fill: C.grey }),
      el('rect', { x: 24, y: 58, width: 24, height: 18, rx: 3, fill: C.sky }),
      el('circle', { cx: 76, cy: 44, r: 8, fill: C.black }),
      el('circle', { cx: 92, cy: 44, r: 8, fill: C.black }),
    ]),
    sofa: () => svgWrap([
      el('rect', { x: 18, y: 54, width: 84, height: 32, rx: 10, fill: C.violet }),
      el('rect', { x: 18, y: 38, width: 20, height: 30, rx: 8, fill: C.violet }),
      el('rect', { x: 82, y: 38, width: 20, height: 30, rx: 8, fill: C.violet }),
      el('rect', { x: 22, y: 86, width: 10, height: 12, fill: '#7C3AED' }),
      el('rect', { x: 88, y: 86, width: 10, height: 12, fill: '#7C3AED' }),
    ]),
    pillow: () => svgWrap([el('rect', { x: 24, y: 34, width: 72, height: 52, rx: 20, fill: C.pink })]),
    blanket: () => svgWrap([
      el('rect', { x: 16, y: 46, width: 88, height: 44, rx: 8, fill: C.orange }),
      ...[0, 1, 2].map(i => el('rect', { x: 16, y: 46 + i * 15, width: 88, height: 5, fill: C.cream })),
    ]),
    spoon: () => svgWrap([
      el('ellipse', { cx: 60, cy: 34, rx: 16, ry: 20, fill: C.grey }),
      el('rect', { x: 56, y: 50, width: 8, height: 52, rx: 4, fill: C.grey }),
    ]),
    plate: () => svgWrap([
      el('circle', { cx: 60, cy: 60, r: 42, fill: C.white, stroke: C.gray, 'stroke-width': 3 }),
      el('circle', { cx: 60, cy: 60, r: 26, fill: 'none', stroke: C.gray, 'stroke-width': 2 }),
    ]),
    cup: () => svgWrap([
      el('path', { d: 'M32 40 H80 V78 A24 24 0 0 1 32 78 Z', fill: C.sky, stroke: C.blue, 'stroke-width': 3 }),
      el('path', { d: 'M80 46 Q98 46 98 60 Q98 74 80 72', fill: 'none', stroke: C.blue, 'stroke-width': 4 }),
    ]),

    /* ---- animals ---- */
    lion: () => svgWrap([
      el('circle', { cx: 60, cy: 60, r: 26, fill: C.gold }),
      ...[0, 45, 90, 135, 180, 225, 270, 315].map(a => el('rect', { x: 56, y: 20, width: 8, height: 22, rx: 4, fill: C.brown, transform: `rotate(${a} 60 60)` })),
      el('circle', { cx: 52, cy: 56, r: 3, fill: C.black }),
      el('circle', { cx: 68, cy: 56, r: 3, fill: C.black }),
      el('ellipse', { cx: 60, cy: 68, rx: 5, ry: 3, fill: C.black }),
    ]),
    tiger: () => svgWrap([
      el('circle', { cx: 60, cy: 60, r: 30, fill: C.orange }),
      ...[[44, 40], [76, 40], [40, 60], [80, 60], [50, 80], [70, 80]].map(([x, y]) => el('rect', { x: x - 3, y: y - 8, width: 6, height: 16, rx: 3, fill: C.black })),
      el('circle', { cx: 50, cy: 56, r: 3, fill: C.black }),
      el('circle', { cx: 70, cy: 56, r: 3, fill: C.black }),
    ]),
    elephant: () => svgWrap([
      el('ellipse', { cx: 55, cy: 60, rx: 34, ry: 28, fill: C.grey }),
      el('ellipse', { cx: 30, cy: 50, rx: 14, ry: 18, fill: C.grey }),
      el('path', { d: 'M38 70 Q30 90 40 100', stroke: C.grey, 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }),
      el('circle', { cx: 62, cy: 52, r: 3, fill: C.black }),
    ]),
    bear: () => svgWrap([
      el('circle', { cx: 44, cy: 34, r: 10, fill: C.brown }),
      el('circle', { cx: 76, cy: 34, r: 10, fill: C.brown }),
      el('circle', { cx: 60, cy: 60, r: 32, fill: C.brown }),
      el('ellipse', { cx: 60, cy: 68, rx: 14, ry: 10, fill: '#D8A868' }),
      el('circle', { cx: 50, cy: 54, r: 3, fill: C.black }),
      el('circle', { cx: 70, cy: 54, r: 3, fill: C.black }),
      el('circle', { cx: 60, cy: 66, r: 3, fill: C.black }),
    ]),
    monkey: () => svgWrap([
      el('circle', { cx: 60, cy: 60, r: 28, fill: C.brown }),
      el('ellipse', { cx: 60, cy: 66, rx: 18, ry: 14, fill: C.tan }),
      el('circle', { cx: 34, cy: 46, r: 10, fill: C.brown }),
      el('circle', { cx: 86, cy: 46, r: 10, fill: C.brown }),
      el('circle', { cx: 51, cy: 58, r: 3, fill: C.black }),
      el('circle', { cx: 69, cy: 58, r: 3, fill: C.black }),
    ]),
    horse: () => svgWrap([
      el('ellipse', { cx: 60, cy: 70, rx: 34, ry: 20, fill: C.brown }),
      el('path', { d: 'M84 60 L100 34 L92 32 L78 54 Z', fill: C.brown }),
      el('path', { d: 'M80 40 Q92 36 96 42', stroke: C.black, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
      el('circle', { cx: 92, cy: 40, r: 2.5, fill: C.black }),
    ]),
    cow: () => svgWrap([
      el('ellipse', { cx: 60, cy: 66, rx: 36, ry: 24, fill: C.white, stroke: C.black, 'stroke-width': 2 }),
      el('circle', { cx: 46, cy: 56, r: 8, fill: C.black }),
      el('circle', { cx: 78, cy: 74, r: 10, fill: C.black }),
      el('ellipse', { cx: 60, cy: 46, rx: 10, ry: 8, fill: C.white, stroke: C.black, 'stroke-width': 2 }),
      el('circle', { cx: 56, cy: 44, r: 2, fill: C.black }),
      el('circle', { cx: 64, cy: 44, r: 2, fill: C.black }),
    ]),
    sheep: () => svgWrap([
      ...[[46, 50], [60, 44], [74, 50], [50, 62], [70, 62], [60, 56]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 14, fill: C.white, stroke: C.gray, 'stroke-width': 1 })),
      el('circle', { cx: 60, cy: 78, r: 10, fill: C.black }),
    ]),
    goat: () => svgWrap([
      el('ellipse', { cx: 60, cy: 66, rx: 26, ry: 20, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('circle', { cx: 60, cy: 40, r: 14, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('path', { d: 'M54 30 Q52 20 56 16 M66 30 Q68 20 64 16', stroke: C.grey, 'stroke-width': 3, fill: 'none' }),
      el('circle', { cx: 56, cy: 40, r: 2, fill: C.black }),
      el('circle', { cx: 64, cy: 40, r: 2, fill: C.black }),
    ]),
    rabbit: () => svgWrap([
      el('ellipse', { cx: 60, cy: 74, rx: 22, ry: 18, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('circle', { cx: 60, cy: 48, r: 16, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('ellipse', { cx: 50, cy: 24, rx: 5, ry: 16, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('ellipse', { cx: 66, cy: 24, rx: 5, ry: 16, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('circle', { cx: 55, cy: 46, r: 2, fill: C.black }),
      el('circle', { cx: 65, cy: 46, r: 2, fill: C.black }),
    ]),
    duck: () => svgWrap([
      el('ellipse', { cx: 55, cy: 68, rx: 28, ry: 20, fill: C.sun }),
      el('circle', { cx: 82, cy: 48, r: 16, fill: C.sun }),
      el('path', { d: 'M96 48 L108 45 L96 56 Z', fill: C.orange }),
      el('circle', { cx: 86, cy: 44, r: 2.5, fill: C.black }),
    ]),
    hen: () => svgWrap([
      el('ellipse', { cx: 55, cy: 68, rx: 26, ry: 22, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('circle', { cx: 84, cy: 48, r: 14, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('path', { d: 'M78 36 Q82 26 90 32', fill: C.red }),
      el('path', { d: 'M98 48 L108 46 L98 52 Z', fill: C.orange }),
      el('circle', { cx: 88, cy: 46, r: 2, fill: C.black }),
    ]),
    frog: () => svgWrap([
      el('ellipse', { cx: 60, cy: 72, rx: 30, ry: 20, fill: C.green }),
      el('circle', { cx: 44, cy: 44, r: 12, fill: C.green }),
      el('circle', { cx: 76, cy: 44, r: 12, fill: C.green }),
      el('circle', { cx: 44, cy: 40, r: 5, fill: C.white }), el('circle', { cx: 44, cy: 40, r: 2.5, fill: C.black }),
      el('circle', { cx: 76, cy: 40, r: 5, fill: C.white }), el('circle', { cx: 76, cy: 40, r: 2.5, fill: C.black }),
    ]),
    snake: () => svgWrap([
      el('path', { d: 'M20 90 Q40 60 20 40 Q0 20 30 20 Q60 20 60 40 Q60 60 90 60 Q100 60 100 50',
        stroke: C.green, 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }),
      el('circle', { cx: 98, cy: 50, r: 3, fill: C.black }),
    ]),
    deer: () => svgWrap([
      el('ellipse', { cx: 55, cy: 72, rx: 24, ry: 18, fill: C.tan }),
      el('circle', { cx: 78, cy: 50, r: 14, fill: C.tan }),
      el('path', { d: 'M72 38 Q68 26 60 24 M84 38 Q88 26 96 24', stroke: C.brown, 'stroke-width': 3, fill: 'none' }),
      el('circle', { cx: 82, cy: 46, r: 2, fill: C.black }),
    ]),

    /* ---- school objects ---- */
    pencil: () => svgWrap([
      el('polygon', { points: '30,90 90,30 104,44 44,104', fill: C.sun }),
      el('polygon', { points: '30,90 44,104 24,110', fill: C.tan }),
      el('rect', { x: 84, y: 24, width: 20, height: 20, transform: 'rotate(45 94 34)', fill: C.grey }),
    ]),
    pen: () => svgWrap([
      el('rect', { x: 52, y: 20, width: 16, height: 70, rx: 6, fill: C.blue }),
      el('polygon', { points: '52,90 68,90 60,106', fill: C.black }),
      el('rect', { x: 55, y: 14, width: 10, height: 12, fill: C.grey }),
    ]),
    book: () => svgWrap([
      el('path', { d: 'M20 26 Q40 18 60 26 V96 Q40 88 20 96 Z', fill: C.blue }),
      el('path', { d: 'M100 26 Q80 18 60 26 V96 Q80 88 100 96 Z', fill: C.coral }),
    ]),
    bag: () => svgWrap([
      el('rect', { x: 24, y: 44, width: 72, height: 58, rx: 10, fill: C.orange }),
      el('path', { d: 'M40 44 V30 Q40 18 60 18 Q80 18 80 30 V44', stroke: C.brown, 'stroke-width': 8, fill: 'none' }),
    ]),
    eraser: () => svgWrap([
      el('rect', { x: 24, y: 44, width: 72, height: 32, rx: 8, fill: C.pink }),
      el('rect', { x: 24, y: 44, width: 24, height: 32, rx: 8, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
    ]),
    ruler: () => svgWrap([
      el('rect', { x: 14, y: 50, width: 92, height: 20, fill: C.sun }),
      ...[24, 34, 44, 54, 64, 74, 84, 94].map(x => el('rect', { x, y: 50, width: 2, height: 10, fill: C.black })),
    ]),
    chalk: () => svgWrap([
      el('rect', { x: 30, y: 50, width: 60, height: 16, rx: 8, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
    ]),
    board: () => svgWrap([
      el('rect', { x: 14, y: 24, width: 92, height: 60, rx: 4, fill: C.green }),
      el('rect', { x: 14, y: 24, width: 92, height: 60, rx: 4, fill: 'none', stroke: C.wood, 'stroke-width': 6 }),
      el('path', { d: 'M30 60 H70', stroke: C.white, 'stroke-width': 3 }),
    ]),
    desk: () => svgWrap([
      el('rect', { x: 16, y: 44, width: 88, height: 12, fill: C.wood }),
      el('rect', { x: 16, y: 56, width: 88, height: 20, fill: '#D8A868' }),
      el('rect', { x: 22, y: 76, width: 8, height: 24, fill: C.brown }),
      el('rect', { x: 90, y: 76, width: 8, height: 24, fill: C.brown }),
    ]),
    bench: () => svgWrap([
      el('rect', { x: 14, y: 50, width: 92, height: 10, fill: C.wood }),
      el('rect', { x: 14, y: 72, width: 92, height: 10, fill: C.wood }),
      el('rect', { x: 20, y: 60, width: 8, height: 34, fill: C.brown }),
      el('rect', { x: 92, y: 60, width: 8, height: 34, fill: C.brown }),
    ]),
    crayon: () => svgWrap([
      el('rect', { x: 50, y: 30, width: 20, height: 60, fill: C.red }),
      el('polygon', { points: '50,30 70,30 60,14', fill: '#E11D62' }),
    ]),
    scissors: () => svgWrap([
      el('circle', { cx: 34, cy: 34, r: 10, fill: 'none', stroke: C.grey, 'stroke-width': 5 }),
      el('circle', { cx: 34, cy: 86, r: 10, fill: 'none', stroke: C.grey, 'stroke-width': 5 }),
      el('path', { d: 'M40 40 L96 60 M40 80 L96 60', stroke: C.gray, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }),
    ]),
    glue: () => svgWrap([
      el('rect', { x: 40, y: 40, width: 40, height: 60, rx: 8, fill: C.violet }),
      el('rect', { x: 48, y: 24, width: 24, height: 20, rx: 4, fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
    ]),
    notebook: () => svgWrap([
      el('rect', { x: 26, y: 20, width: 68, height: 84, rx: 6, fill: C.white, stroke: C.blue, 'stroke-width': 3 }),
      ...[0, 1, 2, 3].map(i => el('circle', { cx: 26, cy: 34 + i * 20, r: 4, fill: C.grey })),
      el('path', { d: 'M40 44 H82 M40 58 H82 M40 72 H82', stroke: C.sky, 'stroke-width': 3 }),
    ]),
    sharpener: () => svgWrap([
      el('rect', { x: 34, y: 40, width: 52, height: 40, rx: 6, fill: C.sun }),
      el('circle', { cx: 60, cy: 60, r: 10, fill: C.grey }),
    ]),
    paint: () => svgWrap([
      el('path', { d: 'M30 50 Q30 90 60 90 Q90 90 90 50 Z', fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('circle', { cx: 42, cy: 62, r: 8, fill: C.red }),
      el('circle', { cx: 60, cy: 70, r: 8, fill: C.blue }),
      el('circle', { cx: 78, cy: 62, r: 8, fill: C.sun }),
    ]),
    brush: () => svgWrap([
      el('rect', { x: 54, y: 40, width: 12, height: 60, fill: C.wood }),
      el('path', { d: 'M48 20 Q60 6 72 20 L66 40 H54 Z', fill: C.orange }),
    ]),
    uniform: () => svgWrap([
      el('path', { d: 'M44 20 L60 34 L76 20 L96 34 L86 50 L76 42 V100 H44 V42 L34 50 L24 34 Z', fill: C.navy }),
      el('path', { d: 'M52 20 L60 34 L68 20', fill: C.white }),
    ]),
    lunch: () => svgWrap([
      el('rect', { x: 26, y: 46, width: 68, height: 50, rx: 8, fill: C.red }),
      el('path', { d: 'M40 46 V34 Q40 26 60 26 Q80 26 80 34 V46', stroke: C.grey, 'stroke-width': 6, fill: 'none' }),
    ]),
    bus: () => svgWrap([
      el('rect', { x: 12, y: 40, width: 96, height: 40, rx: 8, fill: C.sun }),
      el('rect', { x: 20, y: 48, width: 20, height: 16, fill: C.sky }),
      el('rect', { x: 48, y: 48, width: 20, height: 16, fill: C.sky }),
      el('rect', { x: 76, y: 48, width: 20, height: 16, fill: C.sky }),
      el('circle', { cx: 34, cy: 84, r: 9, fill: C.black }),
      el('circle', { cx: 86, cy: 84, r: 9, fill: C.black }),
    ]),

    /* ---- family members ---- */
    sister: () => svgWrap([
      el('circle', { cx: 60, cy: 38, r: 18, fill: C.tan }),
      el('path', { d: 'M40 36 Q60 12 80 36 L80 48 Q60 40 40 48 Z', fill: '#7C2D12' }),
      el('path', { d: 'M38 100 Q38 66 60 66 Q82 66 82 100 Z', fill: C.pink }),
    ]),
    brother: () => svgWrap([
      el('circle', { cx: 60, cy: 38, r: 18, fill: C.tan }),
      el('path', { d: 'M42 34 Q60 20 78 34 L76 28 Q60 22 44 28 Z', fill: '#334155' }),
      el('path', { d: 'M38 100 Q38 66 60 66 Q82 66 82 100 Z', fill: C.blue }),
    ]),
    grandmother: () => svgWrap([
      el('circle', { cx: 60, cy: 40, r: 18, fill: C.tan }),
      el('path', { d: 'M40 38 Q60 20 80 38 L80 44 Q60 34 40 44 Z', fill: C.white, stroke: C.gray, 'stroke-width': 2 }),
      el('path', { d: 'M36 100 Q36 68 60 68 Q84 68 84 100 Z', fill: C.violet }),
      el('rect', { x: 50, y: 58, width: 20, height: 6, rx: 3, fill: C.gray }),
    ]),
    grandfather: () => svgWrap([
      el('circle', { cx: 60, cy: 40, r: 18, fill: C.tan }),
      el('path', { d: 'M36 100 Q36 68 60 68 Q84 68 84 100 Z', fill: C.grey }),
      el('rect', { x: 50, y: 58, width: 20, height: 6, rx: 3, fill: C.white }),
      el('circle', { cx: 60, cy: 32, r: 16, fill: 'none', stroke: C.white, 'stroke-width': 3 }),
    ]),
    uncle: () => svgWrap([
      el('circle', { cx: 60, cy: 38, r: 18, fill: C.tan }),
      el('path', { d: 'M42 34 Q60 20 78 34 L76 28 Q60 22 44 28 Z', fill: C.black }),
      el('path', { d: 'M38 100 Q38 66 60 66 Q82 66 82 100 Z', fill: C.brown }),
      el('rect', { x: 54, y: 66, width: 12, height: 26, fill: C.red }),
    ]),
    aunt: () => svgWrap([
      el('circle', { cx: 60, cy: 38, r: 18, fill: C.tan }),
      el('path', { d: 'M40 36 Q60 12 80 36 L80 52 Q60 42 40 52 Z', fill: '#7C2D12' }),
      el('path', { d: 'M38 100 Q38 66 60 66 Q82 66 82 100 Z', fill: C.purple }),
    ]),
    baby: () => svgWrap([
      el('circle', { cx: 60, cy: 62, r: 26, fill: C.tan }),
      el('path', { d: 'M38 56 Q60 34 82 56', fill: 'none', stroke: '#7C2D12', 'stroke-width': 6, 'stroke-linecap': 'round' }),
      el('circle', { cx: 50, cy: 62, r: 3, fill: C.black }),
      el('circle', { cx: 70, cy: 62, r: 3, fill: C.black }),
      el('path', { d: 'M52 72 Q60 78 68 72', stroke: C.black, 'stroke-width': 2.5, fill: 'none' }),
      el('rect', { x: 44, y: 88, width: 32, height: 18, rx: 9, fill: C.sky }),
    ]),
    cousin: () => svgWrap([
      el('circle', { cx: 46, cy: 46, r: 14, fill: C.tan }),
      el('path', { d: 'M32 88 Q32 62 46 62 Q60 62 60 88 Z', fill: C.green }),
      el('circle', { cx: 78, cy: 46, r: 14, fill: C.tan }),
      el('path', { d: 'M64 88 Q64 62 78 62 Q92 62 92 88 Z', fill: C.coral }),
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
