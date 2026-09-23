export type LoginDevice = {
  id: string;
  merchantId: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  deviceId: string;
  deviceName: string;
};

export type LoginResponse = {
  userName: string;
  merchantCnpj: string;
  merchantName: string;
  merchantSoftcomCode: string;
  device: LoginDevice;
  token?: string;
};

function requireObject(
  value: unknown,
  fieldName: string,
): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Resposta de login inválida: ${fieldName}.`);
  }

  return value as Record<string, unknown>;
}

function requireString(
  record: Record<string, unknown>,
  fieldName: string,
) {
  const value = record[fieldName];

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Resposta de login inválida: ${fieldName}.`);
  }

  return value;
}

export function parseLoginResponse(payload: unknown): LoginResponse {
  const response = requireObject(payload, 'objeto principal');
  const device = requireObject(response.device, 'device');
  const token =
    response.token ?? response.accessToken ?? response.access_token ?? undefined;

  return {
    userName: requireString(response, 'userName'),
    merchantCnpj: requireString(response, 'merchantCnpj'),
    merchantName: requireString(response, 'merchantName'),
    merchantSoftcomCode: requireString(response, 'merchantSoftcomCode'),
    device: {
      id: requireString(device, 'id'),
      merchantId: requireString(device, 'merchantId'),
      baseUrl: requireString(device, 'baseUrl'),
      clientId: requireString(device, 'clientId'),
      clientSecret: requireString(device, 'clientSecret'),
      deviceId: requireString(device, 'deviceId'),
      deviceName: requireString(device, 'deviceName'),
    },
    token: typeof token === 'string' ? token : undefined,
  };
}
