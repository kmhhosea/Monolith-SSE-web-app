const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '');

export const getAllowedOrigins = () => {
  const configuredOrigins = [process.env.CORS_ORIGINS, process.env.WEB_URL]
    .filter(Boolean)
    .flatMap((value) => (value ?? '').split(','))
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  return Array.from(new Set(configuredOrigins));
};

export const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  return getAllowedOrigins().includes(normalizedOrigin);
};
