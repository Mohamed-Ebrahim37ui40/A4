/* PivotCalc — calculation engine (Biro formula) */
(function (global) {
  'use strict';

  const FEDDAN_M2 = 4200; // 1 feddan = 4200 m²

  /** Built-in brand presets: array of track counts per wheel (from center outward). Last wheel is remainder. */
  const BRANDS = {
    Valley:   [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    Lindsay:  [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    Zimmatic: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    Reinke:   [8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    T_L:      [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  };

  function brandList() {
    return Object.keys(BRANDS);
  }

  function getBrandTracks(name) {
    return BRANDS[name] ? [...BRANDS[name]] : null;
  }

  /**
   * Radius from area (feddan): A = π R² / 4200  =>  R = sqrt(A * 4200 / π)
   */
  function radiusFromArea(areaFeddan) {
    if (!areaFeddan || areaFeddan <= 0) return 0;
    return Math.sqrt((areaFeddan * FEDDAN_M2) / Math.PI);
  }

  /**
   * Cumulative area at distance d from center (Biro):
   * A(r) = (2 × θ × A_pivot / 360) + (G × d / 4200)
   * where θ = asin(d / R) in degrees, G = track width (m)
   * Simplified practical form used in Egyptian pivot practice:
   * cumulative half-area at position d uses sector + track strip.
   *
   * Practical implementation matching the app note:
   * For sequential wheels, area of wheel i is difference of cumulative areas.
   * Cumulative area at outer edge of wheel n (distance = sum of track widths * counts):
   * We treat each "track" as a ring segment of width = spanWidth.
   */
  function cumulativeArea(d, R, A_pivot, spanWidth) {
    if (d <= 0 || R <= 0) return 0;
    const ratio = Math.min(1, d / R);
    const thetaRad = Math.asin(ratio);
    const thetaDeg = (thetaRad * 180) / Math.PI;
    // Sector portion of full pivot area for angle 2θ
    const sector = (2 * thetaDeg * A_pivot) / 360;
    // Track strip contribution
    const strip = (spanWidth * d) / FEDDAN_M2;
    return sector + strip;
  }

  /**
   * Compute wheel areas from track counts.
   * tracks: array of track counts per wheel (center → outer). Last may be remainder.
   * Returns { radius, totalTracks, tracksPerWheel avg, activeWheels, halfAreas[], totalArea, towerLength }
   */
  function computeFromTracks(areaFeddan, spanWidth, tracks) {
    const R = radiusFromArea(areaFeddan);
    if (!R || !spanWidth || !tracks || !tracks.length) {
      return {
        radius: 0, totalTracks: 0, tracksPerWheel: 0, activeWheels: 0,
        halfAreas: [], totalArea: 0, halfAreaSum: 0, towerLength: 0
      };
    }

    // Distance to outer edge of each wheel
    let dist = 0;
    const distances = [];
    for (let i = 0; i < tracks.length; i++) {
      const n = Math.max(0, Number(tracks[i]) || 0);
      dist += n * spanWidth;
      distances.push(dist);
    }

    // Cap distance to radius (last wheel remainder conceptually)
    const totalTracksNeeded = R / spanWidth;
    const totalTracksActual = tracks.reduce((s, t) => s + Math.max(0, Number(t) || 0), 0);

    const halfAreas = [];
    let prevCum = 0;
    for (let i = 0; i < distances.length; i++) {
      const d = Math.min(distances[i], R);
      let cum = cumulativeArea(d, R, areaFeddan, spanWidth);
      // Ensure monotonic and not exceeding half of full (approx)
      if (cum < prevCum) cum = prevCum;
      const ring = Math.max(0, cum - prevCum);
      halfAreas.push(ring);
      prevCum = cum;
    }

    // Scale half-areas so their sum equals areaFeddan / 2 (full pivot = 2 * half-side)
    // Actually for center pivot the full area is the circle; "half" is one side of the pivot arm path.
    // Per app: sum of wheel areas = half pivot area, and total shown is full.
    const halfSum = halfAreas.reduce((a, b) => a + b, 0);
    const targetHalf = areaFeddan / 2;
    if (halfSum > 0 && Math.abs(halfSum - targetHalf) > 0.001) {
      const scale = targetHalf / halfSum;
      for (let i = 0; i < halfAreas.length; i++) halfAreas[i] *= scale;
    }

    const halfAreaSum = halfAreas.reduce((a, b) => a + b, 0);
    const active = tracks.filter(t => (Number(t) || 0) > 0).length;

    return {
      radius: R,
      totalTracks: totalTracksActual,
      tracksPerWheel: active ? totalTracksActual / active : 0,
      activeWheels: tracks.length,
      halfAreas,
      totalArea: areaFeddan,
      halfAreaSum,
      towerLength: R // tower length ≈ radius for practical display
    };
  }

  /**
   * Auto-fill track distribution for N wheels covering radius with spanWidth.
   * Even distribution; last wheel gets remainder.
   */
  function autoFillTracks(areaFeddan, spanWidth, wheelCount) {
    const R = radiusFromArea(areaFeddan);
    if (!R || !spanWidth || wheelCount < 1) return [];
    const totalTracks = R / spanWidth;
    const base = Math.floor(totalTracks / wheelCount);
    const rem = totalTracks - base * wheelCount;
    const tracks = [];
    for (let i = 0; i < wheelCount; i++) {
      // distribute remainder to outer wheels
      let t = base;
      if (i >= wheelCount - Math.ceil(rem)) t += 1;
      // more even: give fractional remainder to last
      tracks.push(i === wheelCount - 1
        ? Math.max(0, Math.round((totalTracks - tracks.reduce((s, x) => s + x, 0)) * 100) / 100)
        : Math.max(0, Math.round(t * 100) / 100));
    }
    // Fix last precisely
    const sumExceptLast = tracks.slice(0, -1).reduce((s, x) => s + x, 0);
    tracks[wheelCount - 1] = Math.max(0, Math.round((totalTracks - sumExceptLast) * 100) / 100);
    return tracks;
  }

  function autoFillFromBrand(areaFeddan, spanWidth, brandName) {
    const preset = getBrandTracks(brandName);
    if (!preset) return autoFillTracks(areaFeddan, spanWidth, 12);
    const R = radiusFromArea(areaFeddan);
    const totalTracks = R / spanWidth;
    const n = preset.length;
    // Scale preset proportionally to fit total tracks
    const presetSum = preset.reduce((a, b) => a + b, 0);
    if (presetSum <= 0) return autoFillTracks(areaFeddan, spanWidth, n);
    const scale = totalTracks / presetSum;
    const tracks = preset.map((t, i) => {
      if (i === n - 1) return 0; // set later
      return Math.max(0, Math.round(t * scale * 100) / 100);
    });
    const sumExceptLast = tracks.slice(0, -1).reduce((s, x) => s + x, 0);
    tracks[n - 1] = Math.max(0, Math.round((totalTracks - sumExceptLast) * 100) / 100);
    return tracks;
  }

  /** Planting */
  function seedQuantity(jumbos, avgWeight) {
    return (Number(jumbos) || 0) * (Number(avgWeight) || 0);
  }
  function plantRate(seedTon, areaFeddan) {
    const a = Number(areaFeddan) || 0;
    if (a <= 0) return 0;
    return (Number(seedTon) || 0) / a;
  }

  /** Harvest */
  function harvestRate(harvestedJumbos, areaFeddan) {
    const a = Number(areaFeddan) || 0;
    if (a <= 0) return 0;
    return (Number(harvestedJumbos) || 0) / a;
  }

  /** Needs — planting */
  function needPlantJumbos(rate, area, weight) {
    const w = Number(weight) || 0;
    if (w <= 0) return 0;
    return ((Number(rate) || 0) * (Number(area) || 0)) / w;
  }
  function needPlantTons(jumbos, weight) {
    return (Number(jumbos) || 0) * (Number(weight) || 0);
  }

  /** Needs — harvest (updated per user: rate in jumbos/feddan) */
  function needHarvestJumbos(rateJumbosPerFeddan, area) {
    return (Number(rateJumbosPerFeddan) || 0) * (Number(area) || 0);
  }
  function needTrucks(jumbos, capacity) {
    const c = Number(capacity) || 0;
    if (c <= 0) return 0;
    return Math.ceil((Number(jumbos) || 0) / c);
  }

  global.PivotCalc = {
    FEDDAN_M2,
    BRANDS,
    brandList,
    getBrandTracks,
    radiusFromArea,
    computeFromTracks,
    autoFillTracks,
    autoFillFromBrand,
    seedQuantity,
    plantRate,
    harvestRate,
    needPlantJumbos,
    needPlantTons,
    needHarvestJumbos,
    needTrucks
  };
})(typeof window !== 'undefined' ? window : globalThis);
