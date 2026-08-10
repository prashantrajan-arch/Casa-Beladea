// Shared pricing logic for Casa Beladea.
// Imported by both index.html (public calendar) and PropertyManager/index.html
// (booking dashboard) so the numbers can never drift out of sync between them.
//
// All prices are set and stored in EUR — that's the actual currency you're charging in.
// The public site can optionally show a converted USD estimate via a toggle; the
// property manager dashboard always shows EUR, since that's the real number.

// Nightly rates in EUR by calendar month (0 = January ... 11 = December).
// Edit these to change pricing site-wide.
export const MONTHLY_RATES_EUR = [500, 600, 600, 700, 700, 800, 1000, 1000, 800, 700, 600, 600];

// Extra charges, in EUR.
export const POOL_HEATING_EUR_PER_NIGHT = 25;
export const MIDWEEK_CLEANING_EUR_FLAT = 150;

// Pool & hot tub heating is only offered/charged for nights in this window:
// October (9) through April (3), inclusive, wrapping across the new year.
export function isHeatingSeason(dateObj) {
  const m = dateObj.getMonth(); // 0-11
  return m >= 9 || m <= 3;
}

const FALLBACK_EUR_TO_USD = 1.155;

// Live EUR -> USD rate, for the public site's optional USD toggle.
export async function getEurToUsd() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD');
    const data = await res.json();
    if (data && data.rates && data.rates.USD) return data.rates.USD;
  } catch (err) {
    // fall through to fallback rate
  }
  return FALLBACK_EUR_TO_USD;
}

// Base nightly rate in EUR for a given date — the real, stored price.
export function nightlyPriceEUR(dateObj) {
  return MONTHLY_RATES_EUR[dateObj.getMonth()];
}

// Sum of base nightly rates (EUR) for [checkIn, checkOut) — checkOut night not included.
export function baseStayTotalEUR(checkIn, checkOut) {
  let total = 0;
  const d = new Date(checkIn);
  while (d < checkOut) {
    total += nightlyPriceEUR(d);
    d.setDate(d.getDate() + 1);
  }
  return total;
}

// Pool heating surcharge (EUR) for [checkIn, checkOut) — only counts nights in season.
export function poolHeatingTotalEUR(checkIn, checkOut) {
  let nights = 0;
  const d = new Date(checkIn);
  while (d < checkOut) {
    if (isHeatingSeason(d)) nights++;
    d.setDate(d.getDate() + 1);
  }
  return nights * POOL_HEATING_EUR_PER_NIGHT;
}

// Convert a EUR amount to the display currency (EUR passthrough, or converted USD).
export function toDisplayAmount(amountEur, currency, eurToUsd) {
  if (currency === 'USD') return Math.round(amountEur * eurToUsd);
  return Math.round(amountEur);
}

export function fmtEUR(n) {
  return '€' + Math.round(n).toLocaleString('en-GB');
}

export function fmtPrice(amount, currency) {
  const symbol = currency === 'USD' ? '$' : '€';
  return symbol + Math.round(amount).toLocaleString('en-GB');
}
