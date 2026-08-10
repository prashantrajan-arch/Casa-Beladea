// Shared pricing logic for Casa Beladea.
// Imported by both index.html (public calendar) and PropertyManager/index.html
// (booking dashboard) so the numbers can never drift out of sync between them.

// Nightly rates in USD by calendar month (0 = January ... 11 = December).
// Edit these to change pricing site-wide.
export const MONTHLY_RATES_USD = [500, 600, 600, 700, 700, 800, 1000, 1000, 800, 700, 600, 600];

// Extra charges, already in EUR (no FX conversion applied to these).
export const POOL_HEATING_EUR_PER_NIGHT = 25;
export const MIDWEEK_CLEANING_EUR_FLAT = 150;

// Pool & hot tub heating is only offered/charged for nights in this window:
// October (9) through April (3), inclusive, wrapping across the new year.
export function isHeatingSeason(dateObj) {
  const m = dateObj.getMonth(); // 0-11
  return m >= 9 || m <= 3;
}

const FALLBACK_USD_TO_EUR = 0.865;

export async function getUsdToEur() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR');
    const data = await res.json();
    if (data && data.rates && data.rates.EUR) return data.rates.EUR;
  } catch (err) {
    // fall through to fallback rate
  }
  return FALLBACK_USD_TO_EUR;
}

export function nightlyPriceEUR(dateObj, usdToEur) {
  const usd = MONTHLY_RATES_USD[dateObj.getMonth()];
  return Math.round(usd * usdToEur);
}

// Sum of base nightly rates for [checkIn, checkOut) — checkOut night not included.
export function baseStayTotalEUR(checkIn, checkOut, usdToEur) {
  let total = 0;
  const d = new Date(checkIn);
  while (d < checkOut) {
    total += nightlyPriceEUR(d, usdToEur);
    d.setDate(d.getDate() + 1);
  }
  return total;
}

// Pool heating surcharge for [checkIn, checkOut) — only counts nights in season.
export function poolHeatingTotalEUR(checkIn, checkOut) {
  let nights = 0;
  const d = new Date(checkIn);
  while (d < checkOut) {
    if (isHeatingSeason(d)) nights++;
    d.setDate(d.getDate() + 1);
  }
  return nights * POOL_HEATING_EUR_PER_NIGHT;
}

export function fmtEUR(n) {
  return '€' + Math.round(n).toLocaleString('en-GB');
}
