export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export const angleAt = (b, a, c) => {
  if (!a || !b || !c) return null;
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const d = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (m1 === 0 || m2 === 0) return null;
  const cos = Math.max(-1, Math.min(1, d / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
};