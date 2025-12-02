const BOOKINGS_KEY = "allora_bookings";
const FALLBACK_STORE = [];
export const COMMISSION_RATE = 0.1;

const canUseLocalStorage = () => {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
};

const randomId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `bk-${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const parsePrice = (value) => {
  const numeric = parseFloat(String(value || "").replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return numeric;
};

export const calculateCommission = (basePrice, rate = COMMISSION_RATE) => {
  const price = parsePrice(basePrice);
  const commissionRate = Number.isFinite(rate) ? rate : COMMISSION_RATE;
  const commissionAmount = Math.round(price * commissionRate * 100) / 100;
  const totalPrice = Math.round((price + commissionAmount) * 100) / 100;
  const providerShare = Math.round(price * 100) / 100;
  return {
    basePrice: price,
    commissionRate,
    commissionAmount,
    totalPrice,
    providerShare,
  };
};

const readStore = () => {
  if (!canUseLocalStorage()) return [...FALLBACK_STORE];
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStore = (list) => {
  if (!canUseLocalStorage()) {
    FALLBACK_STORE.length = 0;
    FALLBACK_STORE.push(...list);
    return;
  }
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  } catch {
    // Ignore write errors (private mode, etc.)
  }
};

export const getBookings = async () => readStore();

export const addBooking = async (booking) => {
  const list = readStore();
  const amounts = calculateCommission(
    booking?.basePrice ?? booking?.price ?? 0,
    booking?.commissionRate ?? COMMISSION_RATE
  );

  const record = {
    id: booking?.id || randomId(),
    status: booking?.status || "Booked",
    createdAt: booking?.createdAt || new Date().toISOString(),
    ...booking,
    ...amounts,
  };

  list.unshift(record);
  writeStore(list);
  return record;
};

export const summarizeBookings = (bookings = []) =>
  bookings.reduce(
    (acc, booking) => {
      const commission = parsePrice(booking.commissionAmount);
      const providerShare = parsePrice(
        booking.providerShare ?? booking.basePrice ?? 0
      );
      const totalPrice = parsePrice(booking.totalPrice ?? booking.basePrice);
      acc.adminTotal += commission;
      acc.providerTotal += providerShare;
      acc.totalVolume += totalPrice;
      return acc;
    },
    { adminTotal: 0, providerTotal: 0, totalVolume: 0 }
  );

export const formatCurrency = (value) =>
  `$${parsePrice(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
