import { AppConstants } from '../constants/AppConstants';
import {
  parseIntegrationToken,
  type IntegrationToken,
} from '../models/products/IntegrationToken';
import {
  parseProductsPage,
  type ProductsPage,
} from '../models/products/Product';

function buildServiceUrl(path: string) {
  if (!AppConstants.deviceBaseUrl) {
    throw new Error('A URL da retaguarda não foi informada pelo login.');
  }

  return `${AppConstants.deviceBaseUrl.replace(/\/$/, '')}${path}`;
}

async function readPayload(response: Response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return { payload: null, rawBody };
  }

  try {
    return {
      payload: JSON.parse(rawBody) as unknown,
      rawBody,
    };
  } catch {
    return { payload: rawBody, rawBody };
  }
}

function getEndpointName(url: string) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return url;
  }
}

function compactMessage(message: string) {
  const compacted = message.replace(/\s+/g, ' ').trim();
  return compacted.length > 240
    ? `${compacted.slice(0, 237)}...`
    : compacted;
}

function getHtmlErrorMessage(body: string, status: number, url: string) {
  const endpoint = getEndpointName(url);
  const readableBody = body
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&larr;/gi, '←')
    .replace(/&copy;/gi, '©')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    /selfhost offline/i.test(readableBody) ||
    /serviço não está respondendo/i.test(readableBody)
  ) {
    return `Selfhost offline (HTTP ${status}). O cliente da retaguarda não está conectado ou não está respondendo. Endpoint: ${endpoint}.`;
  }

  return `HTTP ${status} em ${endpoint}. A retaguarda retornou uma página HTML em vez de JSON.`;
}

function getApiError(
  payload: unknown,
  fallback: string,
  status: number,
  url: string,
) {
  const endpoint = getEndpointName(url);

  if (typeof payload === 'string' && payload.trim()) {
    if (/<(!doctype|html|head|body|style|script)\b/i.test(payload)) {
      return getHtmlErrorMessage(payload, status, url);
    }

    return `HTTP ${status} em ${endpoint}: ${compactMessage(payload)}`;
  }

  const candidate = Array.isArray(payload) ? payload[0] : payload;

  if (candidate && typeof candidate === 'object') {
    const response = candidate as Record<string, unknown>;
    const message = response.human ?? response.message ?? response.error;

    if (typeof message === 'string' && message.trim()) {
      return `HTTP ${status} em ${endpoint}: ${compactMessage(message)}`;
    }
  }

  return `${fallback} HTTP ${status} em ${endpoint}.`;
}

async function request(
  url: string,
  options: RequestInit,
  fallbackError: string,
) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AppConstants.synchronizationRequestTimeoutMs,
  );

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const { payload, rawBody } = await readPayload(response);

    if (!response.ok) {
      if (__DEV__) {
        console.info('Falha na API de sincronização', {
          endpoint: getEndpointName(url),
          responsePreview: compactMessage(rawBody).slice(0, 500),
          status: response.status,
        });
      }
      throw new Error(
        getApiError(payload, fallbackError, response.status, url),
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('A retaguarda demorou demais para responder.');
    }

    if (error instanceof TypeError) {
      throw new Error('Não foi possível conectar à retaguarda.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestIntegrationToken(): Promise<IntegrationToken> {
  if (!AppConstants.deviceClientId || !AppConstants.deviceClientSecret) {
    throw new Error('As credenciais da retaguarda não foram informadas.');
  }

  const form = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: AppConstants.deviceClientId,
    client_secret: AppConstants.deviceClientSecret,
  });
  const payload = await request(
    buildServiceUrl('/authentication/token'),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    },
    'Não foi possível autenticar na retaguarda.',
  );

  return parseIntegrationToken(payload);
}

export async function requestProductsPage(
  token: string,
  page: number,
): Promise<ProductsPage> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(AppConstants.productsSyncPageSize),
  });
  const payload = await request(
    buildServiceUrl(`/api/v2/produtos/simplificado?${params.toString()}`),
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Api-Version': 'v2',
      },
    },
    `Não foi possível baixar a página ${page} dos produtos.`,
  );

  return parseProductsPage(payload);
}
