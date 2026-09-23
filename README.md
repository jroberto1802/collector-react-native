# Collector

Aplicação mobile multiplataforma em React Native com Expo. Esta primeira etapa
implementa a tela de login baseada no protótipo existente e integra a API de
autenticação do Collector.

## Executar

```bash
npm install
npm start
```

Use `npm run android`, `npm run ios` ou leia o QR Code com o Expo Go.

## Autenticação

Por padrão, o aplicativo envia `POST` para:

```text
https://collector-func.azurewebsites.net/api/login
```

O endereço pode ser substituído com a variável
`EXPO_PUBLIC_AUTH_API_URL`. O corpo enviado segue o formato:

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha"
}
```

Quando **Salvar Senha** está marcado, as credenciais são armazenadas com
`expo-secure-store` no dispositivo.

## Arquitetura MVVM

- `src/models`: contratos e validação dos dados retornados pela API.
- `src/views`: componentes visuais e interação com o usuário.
- `src/viewmodels`: estado e regras de apresentação das telas.
- `src/services`: comunicação HTTP com serviços externos.
- `src/storage`: persistência segura de credenciais e dados do login.
- `src/constants/AppConstants.ts`: configurações do aplicativo e dados da
  sessão corrente.

Após uma autenticação válida, cada valor retornado é disponibilizado
separadamente em `AppConstants`, incluindo `userName`, `merchantCnpj`,
`merchantName`, `merchantSoftcomCode`, `device`, `deviceId`, `deviceMerchantId`,
`deviceBaseUrl`, `deviceClientId`, `deviceClientSecret`, `deviceDeviceId` e
`deviceName`. Os mesmos dados também são persistidos com `expo-secure-store`
para suportar as próximas etapas offline.

## Sincronização de produtos

Após o login, a tela inicial abre uma sincronização obrigatória. O aplicativo:

1. solicita o token da retaguarda usando `client_credentials`;
2. baixa todas as páginas de `/api/v2/produtos/simplificado`;
3. substitui os produtos locais dentro de uma transação SQLite;
4. libera a tela inicial somente depois da conclusão.

O banco local usa `expo-sqlite`, alternativa multiplataforma ao Room, que é
específico do Android. O popup reutilizável está implementado em
`src/components/ProductSyncModal.tsx`.
