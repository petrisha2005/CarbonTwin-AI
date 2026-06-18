import type { CorsOptions } from "cors";

const localDevelopmentOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];

export const productionClientOrigins = ["https://carbon-twin-ai-client.vercel.app"];

export function allowedCorsOrigins(clientOrigin: string, nodeEnv: string) {
  return new Set([
    clientOrigin,
    ...productionClientOrigins,
    ...(nodeEnv === "production" ? [] : localDevelopmentOrigins)
  ]);
}

export function createCorsOptions(clientOrigin: string, nodeEnv: string): CorsOptions {
  const allowedOrigins = allowedCorsOrigins(clientOrigin, nodeEnv);
  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true
  };
}
