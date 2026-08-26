export interface ServiceHealth {
  service: "marketlens-web";
  status: "ok";
  timestamp: string;
}

export function createServiceHealth(now = new Date()): ServiceHealth {
  return {
    service: "marketlens-web",
    status: "ok",
    timestamp: now.toISOString(),
  };
}
