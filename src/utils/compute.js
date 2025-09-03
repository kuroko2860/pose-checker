// export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// angle at point b
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

/**
 * Calculate 3D distance between two landmarks
 * @param {Object} a - landmark {x, y, z}
 * @param {Object} b - landmark {x, y, z}
 * @returns {number} distance
 */
export function distance3D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate angle (in degrees) formed by 3 landmarks (A-B-C)
 * @param {Object} a - landmark {x, y, z}
 * @param {Object} b - landmark {x, y, z} (vertex point)
 * @param {Object} c - landmark {x, y, z}
 * @returns {number} angle in degrees
 */
export function angle3D(a, b, c) {
  // vectors BA and BC
  const BA = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const BC = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  // dot product & magnitudes
  const dot = BA.x * BC.x + BA.y * BC.y + BA.z * BC.z;
  const magBA = Math.sqrt(BA.x * BA.x + BA.y * BA.y + BA.z * BA.z);
  const magBC = Math.sqrt(BC.x * BC.x + BC.y * BC.y + BC.z * BC.z);

  // avoid NaN from division by zero
  if (magBA === 0 || magBC === 0) return 0;

  let cosTheta = dot / (magBA * magBC);

  // clamp to [-1, 1] to avoid floating point errors
  cosTheta = Math.max(-1, Math.min(1, cosTheta));

  return Math.acos(cosTheta) * (180 / Math.PI);
}
