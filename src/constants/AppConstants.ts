import type {
  LoginDevice,
  LoginResponse,
} from '../models/auth/LoginResponse';
import { normalizeBaseUrl } from '../utils/normalizeBaseUrl';

export abstract class AppConstants {
  static readonly appName = 'Collector';
  static readonly appVersion = '3.0.0';
  static readonly authenticationUrl =
    process.env.EXPO_PUBLIC_AUTH_API_URL ??
    'https://collector-func.azurewebsites.net/api/login';
  static readonly requestTimeoutMs = 15000;
  static readonly synchronizationRequestTimeoutMs = 120000;
  static readonly productsSyncPageSize = 500;
  static readonly softcomUrl = 'https://www.softcomtecnologia.com.br';

  static userName = '';
  static merchantCnpj = '';
  static merchantName = '';
  static merchantSoftcomCode = '';
  static device: LoginDevice | null = null;
  static deviceId = '';
  static deviceMerchantId = '';
  static deviceBaseUrl = '';
  static deviceClientId = '';
  static deviceClientSecret = '';
  static deviceDeviceId = '';
  static deviceName = '';
  static authenticationToken = '';
  static productsAccessToken = '';
  static productsTokenExpiresAt = 0;

  static setLoginData(loginData: LoginResponse) {
    const deviceBaseUrl = normalizeBaseUrl(loginData.device.baseUrl);

    AppConstants.userName = loginData.userName;
    AppConstants.merchantCnpj = loginData.merchantCnpj;
    AppConstants.merchantName = loginData.merchantName;
    AppConstants.merchantSoftcomCode = loginData.merchantSoftcomCode;
    AppConstants.device = {
      ...loginData.device,
      baseUrl: deviceBaseUrl,
    };
    AppConstants.deviceId = loginData.device.id;
    AppConstants.deviceMerchantId = loginData.device.merchantId;
    AppConstants.deviceBaseUrl = deviceBaseUrl;
    AppConstants.deviceClientId = loginData.device.clientId;
    AppConstants.deviceClientSecret = loginData.device.clientSecret;
    AppConstants.deviceDeviceId = loginData.device.deviceId;
    AppConstants.deviceName = loginData.device.deviceName;
    AppConstants.authenticationToken = loginData.token ?? '';
    AppConstants.productsAccessToken = '';
    AppConstants.productsTokenExpiresAt = 0;

    if (__DEV__) {
      console.info(
        '[Collector][Login] BaseURL configurada:',
        AppConstants.deviceBaseUrl,
      );
    }
  }

  static clearLoginData() {
    AppConstants.userName = '';
    AppConstants.merchantCnpj = '';
    AppConstants.merchantName = '';
    AppConstants.merchantSoftcomCode = '';
    AppConstants.device = null;
    AppConstants.deviceId = '';
    AppConstants.deviceMerchantId = '';
    AppConstants.deviceBaseUrl = '';
    AppConstants.deviceClientId = '';
    AppConstants.deviceClientSecret = '';
    AppConstants.deviceDeviceId = '';
    AppConstants.deviceName = '';
    AppConstants.authenticationToken = '';
    AppConstants.productsAccessToken = '';
    AppConstants.productsTokenExpiresAt = 0;
  }

  static setProductsToken(token: string, expiresInSeconds: number) {
    AppConstants.productsAccessToken = token;
    AppConstants.productsTokenExpiresAt =
      Date.now() + Math.max(0, expiresInSeconds - 60) * 1000;
  }
}
