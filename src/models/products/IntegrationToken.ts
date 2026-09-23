export type IntegrationToken = {
  token: string;
  expiresIn: number;
  type: string;
  scope: string | null;
};

function asRecord(value: unknown, fieldName: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Resposta de token inválida: ${fieldName}.`);
  }

  return value as Record<string, unknown>;
}

export function parseIntegrationToken(payload: unknown): IntegrationToken {
  const responsePayload = Array.isArray(payload) ? payload[0] : payload;
  const response = asRecord(responsePayload, 'resposta');
  const data = asRecord(response.data, 'data');

  if (typeof data.token !== 'string' || !data.token) {
    throw new Error('A API não retornou um token de sincronização válido.');
  }

  return {
    token: data.token,
    expiresIn:
      typeof data.expires_in === 'number' ? data.expires_in : Number(data.expires_in) || 0,
    type: typeof data.type === 'string' ? data.type : 'Bearer',
    scope: typeof data.scope === 'string' ? data.scope : null,
  };
}
