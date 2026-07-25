// vehicles.js — SVG illustrations for each vehicle type, assembled part by
// part (part 1..6 unlock in sequence as the child completes levels 1..6).
const Vehicles = (() => {
  const ns = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const e = document.createElementNS(ns, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function darken(hex) {
    const m = { '#22C55E': '#16A34A', '#FB7185': '#E11D62', '#3B82F6': '#2563EB', '#EF4444': '#B91C1C',
      '#F59E0B': '#B45309', '#A78BFA': '#7C3AED', '#FACC15': '#CA8A04', '#1E3A8A': '#152A63' };
    return m[hex] || '#334155';
  }

  // Each builder returns an SVG string; `parts` (0-6) controls how many are visible.
  // animatePart marks one group with a "fly in" class for the reward moment.
  function wrap(bodyFn, parts, color, opt) {
    opt = opt || {};
    const svg = el('svg', { viewBox: '0 0 300 160', width: '100%', height: '100%' });
    if (parts < 1 && !opt.ghost) {
      svg.setAttribute('opacity', '0.25');
      bodyFn(svg, 6, color, opt, darken);
      return svg;
    }
    bodyFn(svg, parts, color, opt, darken);
    return svg;
  }

  function group(svg, idx, parts, opt, children) {
    if (parts < idx) return;
    const g = el('g', { class: opt.animatePart === idx ? 'veh-part-fly' : '' });
    children.forEach(c => g.appendChild(c));
    svg.appendChild(g);
  }

  function wheelEl(cx, cy, r) {
    const g = el('g', {});
    g.appendChild(el('circle', { cx, cy, r, fill: '#1E293B' }));
    g.appendChild(el('circle', { cx, cy, r: r * 0.55, fill: '#94A3B8' }));
    return g;
  }

  // --- car-family builders (sedan, sports_car, police_car share a base) ---
  function carBody(svg, parts, color, opt, darken, roofStyle) {
    // shadow
    if (parts >= 1) svg.appendChild(el('ellipse', { cx: 150, cy: 142, rx: 118, ry: 9, fill: 'rgba(30,41,59,.14)' }));
    // part1 chassis
    group(svg, 1, parts, opt, [el('rect', { x: 24, y: 78, width: 252, height: 46, rx: 16, fill: color })]);
    // part4 cabin/roof
    const roofPath = roofStyle === 'sport'
      ? 'M88 78 L118 40 L182 40 L206 78 Z'
      : 'M88 78 L108 46 Q112 40 122 40 L178 40 Q188 40 192 46 L206 78 Z';
    group(svg, 4, parts, opt, [el('path', { d: roofPath, fill: color })]);
    // part5 windows
    group(svg, 5, parts, opt, [
      el('path', { d: 'M118 76 L128 50 L150 50 L150 76 Z', fill: '#DBEAFE', stroke: color, 'stroke-width': 3 }),
      el('path', { d: 'M154 76 L154 50 L176 50 L186 76 Z', fill: '#DBEAFE', stroke: color, 'stroke-width': 3 }),
    ]);
    // part6 lights + bumper
    group(svg, 6, parts, opt, [
      el('circle', { cx: 268, cy: 96, r: 8, fill: '#FACC15' }),
      el('rect', { x: 272, y: 108, width: 12, height: 16, rx: 4, fill: darken(color) }),
      el('rect', { x: 16, y: 108, width: 12, height: 16, rx: 4, fill: darken(color) }),
    ]);
    // part2 rear wheel, part3 front wheel
    group(svg, 2, parts, opt, [wheelEl(80, 124, 20)]);
    group(svg, 3, parts, opt, [wheelEl(220, 124, 20)]);
  }

  function bikeBody(svg, parts, color, opt, darken) {
    if (parts >= 1) svg.appendChild(el('ellipse', { cx: 150, cy: 142, rx: 100, ry: 8, fill: 'rgba(30,41,59,.14)' }));
    group(svg, 1, parts, opt, [el('path', { d: 'M100 118 L150 60 L180 60', stroke: color, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })]);
    group(svg, 4, parts, opt, [el('path', { d: 'M150 60 L120 118', stroke: color, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' })]);
    group(svg, 5, parts, opt, [el('path', { d: 'M180 60 L165 42', stroke: darken(color), 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }),
      el('path', { d: 'M155 42 L180 42', stroke: darken(color), 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' })]);
    group(svg, 6, parts, opt, [el('circle', { cx: 100, cy: 118, r: 6, fill: '#1E293B' }), el('rect', { x: 96, y: 100, width: 8, height: 20, rx: 3, fill: darken(color) })]);
    group(svg, 2, parts, opt, [wheelEl(100, 130, 26)]);
    group(svg, 3, parts, opt, [wheelEl(200, 130, 26)]);
  }

  function fireEngineBody(svg, parts, color, opt, darken) {
    if (parts >= 1) svg.appendChild(el('ellipse', { cx: 150, cy: 142, rx: 122, ry: 9, fill: 'rgba(30,41,59,.14)' }));
    group(svg, 1, parts, opt, [el('rect', { x: 20, y: 60, width: 258, height: 64, rx: 12, fill: color })]);
    group(svg, 4, parts, opt, [el('rect', { x: 40, y: 40, width: 70, height: 40, rx: 10, fill: color })]);
    group(svg, 5, parts, opt, [el('rect', { x: 50, y: 48, width: 50, height: 22, rx: 5, fill: '#DBEAFE' }),
      el('rect', { x: 130, y: 66, width: 130, height: 10, fill: '#FACC15' }),
      el('rect', { x: 130, y: 82, width: 130, height: 10, fill: '#FACC15' })]);
    group(svg, 6, parts, opt, [el('circle', { cx: 250, cy: 46, r: 10, fill: '#EF4444' }),
      el('rect', { x: 246, y: 30, width: 8, height: 14, fill: '#94A3B8' }),
      el('circle', { cx: 264, cy: 96, r: 8, fill: '#FACC15' })]);
    group(svg, 2, parts, opt, [wheelEl(72, 128, 22)]);
    group(svg, 3, parts, opt, [wheelEl(228, 128, 22)]);
  }

  function bulldozerBody(svg, parts, color, opt, darken) {
    if (parts >= 1) svg.appendChild(el('ellipse', { cx: 150, cy: 142, rx: 122, ry: 9, fill: 'rgba(30,41,59,.14)' }));
    group(svg, 1, parts, opt, [el('rect', { x: 60, y: 76, width: 180, height: 44, rx: 10, fill: color })]);
    group(svg, 4, parts, opt, [el('rect', { x: 90, y: 44, width: 70, height: 36, rx: 8, fill: color })]);
    group(svg, 5, parts, opt, [el('rect', { x: 98, y: 52, width: 54, height: 20, rx: 4, fill: '#DBEAFE' })]);
    group(svg, 6, parts, opt, [
      el('rect', { x: 14, y: 70, width: 14, height: 56, fill: darken(color) }),
      el('rect', { x: 8, y: 62, width: 28, height: 12, rx: 3, fill: '#94A3B8' }),
    ]);
    group(svg, 2, parts, opt, [el('rect', { x: 50, y: 104, width: 150, height: 26, rx: 13, fill: '#1E293B' })]);
    group(svg, 3, parts, opt, [
      el('rect', { x: 60, y: 108, width: 14, height: 18, fill: '#94A3B8' }),
      el('rect', { x: 100, y: 108, width: 14, height: 18, fill: '#94A3B8' }),
      el('rect', { x: 140, y: 108, width: 14, height: 18, fill: '#94A3B8' }),
      el('rect', { x: 180, y: 108, width: 14, height: 18, fill: '#94A3B8' }),
    ]);
  }

  function forkliftBody(svg, parts, color, opt, darken) {
    if (parts >= 1) svg.appendChild(el('ellipse', { cx: 150, cy: 142, rx: 110, ry: 9, fill: 'rgba(30,41,59,.14)' }));
    group(svg, 1, parts, opt, [el('rect', { x: 90, y: 70, width: 130, height: 50, rx: 10, fill: color })]);
    group(svg, 4, parts, opt, [el('rect', { x: 110, y: 40, width: 60, height: 34, rx: 8, fill: color })]);
    group(svg, 5, parts, opt, [el('rect', { x: 118, y: 48, width: 44, height: 18, rx: 4, fill: '#DBEAFE' })]);
    group(svg, 6, parts, opt, [
      el('rect', { x: 40, y: 30, width: 8, height: 92, fill: darken(color) }),
      el('rect', { x: 22, y: 108, width: 44, height: 8, fill: '#94A3B8' }),
    ]);
    group(svg, 2, parts, opt, [wheelEl(120, 128, 18)]);
    group(svg, 3, parts, opt, [wheelEl(190, 128, 18)]);
  }

  function dumperBody(svg, parts, color, opt, darken) {
    if (parts >= 1) svg.appendChild(el('ellipse', { cx: 150, cy: 142, rx: 122, ry: 9, fill: 'rgba(30,41,59,.14)' }));
    group(svg, 1, parts, opt, [el('rect', { x: 40, y: 80, width: 120, height: 40, rx: 8, fill: color })]);
    group(svg, 4, parts, opt, [el('rect', { x: 170, y: 56, width: 70, height: 40, rx: 8, fill: color })]);
    group(svg, 5, parts, opt, [el('rect', { x: 180, y: 64, width: 30, height: 20, rx: 4, fill: '#DBEAFE' })]);
    group(svg, 6, parts, opt, [el('path', { d: 'M40 80 L60 44 L150 44 L150 80 Z', fill: darken(color), opacity: .9 })]);
    group(svg, 2, parts, opt, [wheelEl(78, 128, 20)]);
    group(svg, 3, parts, opt, [wheelEl(200, 128, 20)]);
  }

  const BUILDERS = {
    sedan: (svg, p, c, o, d) => carBody(svg, p, c, o, d, 'sedan'),
    sports_car: (svg, p, c, o, d) => carBody(svg, p, c, o, d, 'sport'),
    police_car: (svg, p, c, o, d) => carBody(svg, p, c, o, d, 'sedan'),
    bike: bikeBody,
    fire_engine: fireEngineBody,
    bulldozer: bulldozerBody,
    forklift: forkliftBody,
    dumper: dumperBody,
  };

  function render(type, parts, color, opt) {
    const builder = BUILDERS[type] || BUILDERS.sedan;
    return wrap(builder, parts, color, opt);
  }

  return { render };
})();
