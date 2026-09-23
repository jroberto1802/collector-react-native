import { useEffect, useState } from 'react';

import { AppConstants } from '../constants/AppConstants';
import { login } from '../services/auth';
import {
  clearSavedCredentials,
  loadSavedCredentials,
  saveCredentials,
} from '../storage/credentials';
import { loadLoginData, saveLoginData } from '../storage/loginData';

export function useLoginViewModel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loginSucceeded, setLoginSucceeded] = useState(false);

  useEffect(() => {
    async function restoreStoredData() {
      const [credentials, loginData] = await Promise.all([
        loadSavedCredentials(),
        loadLoginData(),
      ]);

      if (credentials) {
        setEmail(credentials.email);
        setPassword(credentials.password);
        setRememberPassword(true);
      }

      if (loginData) {
        AppConstants.setLoginData(loginData);
      }
    }

    void restoreStoredData().catch(() => {
      AppConstants.clearLoginData();
    });
  }, []);

  async function submitLogin() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setFeedback('Informe o e-mail e a senha para continuar.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    setFeedback('');
    setLoginSucceeded(false);
    setIsSubmitting(true);

    try {
      const loginData = await login({
        email: normalizedEmail,
        password,
      });

      AppConstants.setLoginData(loginData);
      await saveLoginData(loginData);

      if (rememberPassword) {
        await saveCredentials({ email: normalizedEmail, password });
      } else {
        await clearSavedCredentials();
      }

      setFeedback('Login realizado com sucesso.');
      setLoginSucceeded(true);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o login.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    feedback,
    isSubmitting,
    loginSucceeded,
    password,
    passwordVisible,
    rememberPassword,
    setEmail,
    setPassword,
    setRememberPassword,
    submitLogin,
    togglePasswordVisibility: () => setPasswordVisible((visible) => !visible),
  };
}
