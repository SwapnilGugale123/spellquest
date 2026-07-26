// rewards.js — vehicle part unlock / assembly progression logic (C.3, C.4).
const Rewards = (() => {

  // Vehicle catalog: type variety across units, progressively more elaborate,
  // matching spec's "cars, bikes, construction equipment, emergency vehicles".
  const CATALOG = [
    { type: 'sedan',        name: 'Sunny Sedan',     color: '#22C55E', sound: 'horn' },
    { type: 'sports_car',   name: 'Coral Racer',     color: '#FB7185', sound: 'rev' },
    { type: 'bike',         name: 'Blue Bike',       color: '#3B82F6', sound: 'bell' },
    { type: 'fire_engine',  name: 'Fire Engine',     color: '#EF4444', sound: 'siren' },
    { type: 'bulldozer',    name: 'Big Bulldozer',   color: '#F59E0B', sound: 'beep' },
    { type: 'forklift',     name: 'Fast Forklift',   color: '#A78BFA', sound: 'beep' },
    { type: 'dumper',       name: 'Dizzy Dumper',    color: '#FACC15', sound: 'beep' },
    { type: 'police_car',   name: 'Police Car',      color: '#1E3A8A', sound: 'siren' },
  ];

  // catalogIndex picks which vehicle look/type to use (wraps around so it
  // never runs out); id is caller-assigned and stable regardless of
  // reordering units later.
  function vehicleForUnit(id, catalogIndex) {
    const v = CATALOG[((catalogIndex || 1) - 1) % CATALOG.length];
    return { id, name: v.name, type: v.type, part_count: 6, color: v.color, sound: v.sound };
  }

  function reward(model, unitId) {
    let r = model.rewards.find(x => x.unit_id === unitId);
    if (!r) { r = { id: model._uid(), unit_id: unitId, parts_unlocked: 0, vehicle_complete: 0 }; model.rewards.push(r); }
    return r;
  }

  function unlockPart(model, unitId, level) {
    const r = reward(model, unitId);
    r.parts_unlocked = Math.max(r.parts_unlocked, level);
    return r;
  }

  function completeVehicle(model, unitId) {
    const r = reward(model, unitId);
    r.vehicle_complete = 1;
    r.parts_unlocked = 6;
    return r;
  }

  return { CATALOG, vehicleForUnit, reward, unlockPart, completeVehicle };
})();
