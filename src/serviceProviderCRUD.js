const PROVIDER_KEY = "allora_service_providers";
const SERVICE_KEY = "allora_services";

const randomId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`);

const seedProviders = [
  {
    id: "sp-seed-1",
    providerId: "SP-001",
    businessName: "Acme Home Services",
    ownerName: "Priya Rao",
    email: "hello@acmehome.nz",
    phone: "+64 21 111 1111",
    address: "12 Garden Lane, Auckland",
    category: "Home Services",
    status: "Active",
  },
  {
    id: "sp-seed-2",
    providerId: "SP-002",
    businessName: "Pixel Perfect Studio",
    ownerName: "Leo Martins",
    email: "projects@pixelperfect.nz",
    phone: "+64 21 222 2222",
    address: "88 K Road, Auckland",
    category: "Technology",
    status: "Pending",
  },
];

const seedServices = [
  {
    id: "svc-seed-1",
    serviceId: "SV-100",
    serviceName: "Deep Clean (3BR)",
    description: "Full house clean with kitchen and bathroom detailing.",
    price: "180",
    duration: "3 hours",
    category: "Home Services",
    providerId: "SP-001",
    available: true,
  },
  {
    id: "svc-seed-2",
    serviceId: "SV-200",
    serviceName: "Website Sprint",
    description: "Launch-ready marketing site in 7 days with CMS handoff.",
    price: "2400",
    duration: "1 week",
    category: "Technology",
    providerId: "SP-002",
    available: true,
  },
];

const readStore = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return [...fallback];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...fallback];
  } catch {
    return [...fallback];
  }
};

const writeStore = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors (private mode, etc.)
  }
};

export const getServiceProviders = async () => readStore(PROVIDER_KEY, seedProviders);

export const addServiceProvider = async (provider) => {
  const list = readStore(PROVIDER_KEY, seedProviders);
  const record = { id: randomId(), ...provider };
  list.push(record);
  writeStore(PROVIDER_KEY, list);
  return record;
};

export const updateServiceProvider = async (id, updates) => {
  const list = readStore(PROVIDER_KEY, seedProviders);
  const idx = list.findIndex((item) => item.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates };
    writeStore(PROVIDER_KEY, list);
    return list[idx];
  }
  return null;
};

export const deleteServiceProvider = async (id) => {
  const list = readStore(PROVIDER_KEY, seedProviders).filter((item) => item.id !== id);
  writeStore(PROVIDER_KEY, list);
  return true;
};

export const getServices = async () => readStore(SERVICE_KEY, seedServices);

export const addService = async (service) => {
  const list = readStore(SERVICE_KEY, seedServices);
  const record = { id: randomId(), ...service };
  list.push(record);
  writeStore(SERVICE_KEY, list);
  return record;
};

export const updateService = async (id, updates) => {
  const list = readStore(SERVICE_KEY, seedServices);
  const idx = list.findIndex((item) => item.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates };
    writeStore(SERVICE_KEY, list);
    return list[idx];
  }
  return null;
};

export const deleteService = async (id) => {
  const list = readStore(SERVICE_KEY, seedServices).filter((item) => item.id !== id);
  writeStore(SERVICE_KEY, list);
  return true;
};
