const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

// Push a circle (the player) out of all active colliders
export function resolveCollisions(pos, radius, colliders, isActive) {
  for (let iter = 0; iter < 3; iter++) {
    for (const c of colliders) {
      if (c.cond && !isActive(c.cond)) continue
      if (c.type === 'box') {
        const cx = clamp(pos.x, c.minX, c.maxX)
        const cz = clamp(pos.z, c.minZ, c.maxZ)
        const dx = pos.x - cx, dz = pos.z - cz
        const d2 = dx * dx + dz * dz
        if (d2 >= radius * radius) continue
        if (d2 > 1e-9) {
          const d = Math.sqrt(d2)
          pos.x += (dx / d) * (radius - d)
          pos.z += (dz / d) * (radius - d)
        } else {
          const l = pos.x - c.minX, r = c.maxX - pos.x, t = pos.z - c.minZ, b = c.maxZ - pos.z
          const m = Math.min(l, r, t, b)
          if (m === l) pos.x = c.minX - radius
          else if (m === r) pos.x = c.maxX + radius
          else if (m === t) pos.z = c.minZ - radius
          else pos.z = c.maxZ + radius
        }
      } else {
        const dx = pos.x - c.x, dz = pos.z - c.z
        const min = c.r + radius
        const d2 = dx * dx + dz * dz
        if (d2 >= min * min) continue
        const d = Math.sqrt(d2) || 1e-4
        pos.x = c.x + (dx / d) * min
        pos.z = c.z + (dz / d) * min
      }
    }
  }
}

// Ray (origin o, unit dir d) vs axis-aligned boxes. Returns nearest hit distance or Infinity.
export function raycastBoxes(o, d, maxDist, colliders, isActive) {
  let best = maxDist
  for (const c of colliders) {
    // round obstacles (trees, stalls, fountain) are approximated by their bounding box
    const isBox = c.type === 'box'
    if (isBox ? c.h < 1.5 : c.h < 1.2) continue
    if (c.cond && !isActive(c.cond)) continue
    let tmin = 0, tmax = best
    const mins = isBox ? [c.minX, 0, c.minZ] : [c.x - c.r, 0, c.z - c.r]
    const maxs = isBox ? [c.maxX, c.h, c.maxZ] : [c.x + c.r, c.h, c.z + c.r]
    const os = [o.x, o.y, o.z], ds = [d.x, d.y, d.z]
    let hit = true
    for (let i = 0; i < 3; i++) {
      if (Math.abs(ds[i]) < 1e-8) {
        if (os[i] < mins[i] || os[i] > maxs[i]) { hit = false; break }
      } else {
        let t1 = (mins[i] - os[i]) / ds[i], t2 = (maxs[i] - os[i]) / ds[i]
        if (t1 > t2) [t1, t2] = [t2, t1]
        tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2)
        if (tmin > tmax) { hit = false; break }
      }
    }
    if (hit && tmin < best && tmin > 0) best = tmin
  }
  return best
}
