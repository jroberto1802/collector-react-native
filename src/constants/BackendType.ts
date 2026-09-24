export const BACKEND_TYPE = {
  SOFTCOMSHOP: 'softcomshop',
  SOFTSHOP: 'softshop',
} as const;

export type BackendType = (typeof BACKEND_TYPE)[keyof typeof BACKEND_TYPE];

const SOFTCOMSHOP_BASE_URL_MARKERS = [
  '.meusoftcom.com.br/softauth',
  '.softcomtecnologia.com.br/softauth',
] as const;

export function detectBackendType(baseUrl: string): BackendType {
  const normalized = baseUrl.trim().toLowerCase();

  const isSoftcomshop = SOFTCOMSHOP_BASE_URL_MARKERS.some((marker) =>
    normalized.includes(marker),
  );

  return isSoftcomshop ? BACKEND_TYPE.SOFTCOMSHOP : BACKEND_TYPE.SOFTSHOP;
}
