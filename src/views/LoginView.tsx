import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CollectorLogo from '../../assets/images/logo-collector.svg';
import { OutlinedInput } from '../components/OutlinedInput';
import { AppConstants } from '../constants/AppConstants';
import { colors } from '../theme/colors';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

type LoginViewProps = {
  onLoginSuccess: () => void;
};

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const {
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
    togglePasswordVisibility,
  } = useLoginViewModel();

  useEffect(() => {
    if (loginSucceeded) {
      onLoginSuccess();
    }
  }, [loginSucceeded, onLoginSuccess]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.hero}>
              <CollectorLogo
                accessibilityLabel="Collector"
                height={34}
                width={164}
              />

              <Text style={styles.title}>Seja bem vindo!</Text>
              <Text style={styles.subtitle}>
                Pronto para simplificar o seu controle do estoque?
              </Text>
            </View>

            <View style={styles.form}>
              <OutlinedInput
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                label="E-mail"
                onChangeText={setEmail}
                placeholder="Digite seu e-mail"
                returnKeyType="next"
                value={email}
              />

              <OutlinedInput
                autoCapitalize="none"
                autoComplete="current-password"
                label="Senha"
                onChangeText={setPassword}
                onSubmitEditing={() => void submitLogin()}
                placeholder="Digite sua senha"
                returnKeyType="done"
                secureTextEntry={!passwordVisible}
                value={password}
                trailing={
                  <Pressable
                    accessibilityLabel={
                      passwordVisible ? 'Ocultar senha' : 'Mostrar senha'
                    }
                    hitSlop={8}
                    onPress={togglePasswordVisibility}
                  >
                    <Ionicons
                      color="#858585"
                      name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
                      size={17}
                    />
                  </Pressable>
                }
              />

              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberPassword }}
                onPress={() => setRememberPassword((remember) => !remember)}
                style={styles.rememberRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberPassword ? styles.checkboxChecked : null,
                  ]}
                >
                  {rememberPassword ? (
                    <Ionicons color={colors.white} name="checkmark" size={12} />
                  ) : null}
                </View>
                <Text style={styles.rememberLabel}>Salvar Senha</Text>
              </Pressable>

              <Pressable
                disabled={isSubmitting}
                onPress={() => void submitLogin()}
                style={({ pressed }) => [
                  styles.button,
                  pressed && !isSubmitting ? styles.buttonPressed : null,
                  isSubmitting ? styles.buttonDisabled : null,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.buttonLabel}>Continuar</Text>
                )}
              </Pressable>

              {feedback ? (
                <Text
                  accessibilityLiveRegion="polite"
                  style={[
                    styles.feedback,
                    feedback.includes('sucesso') ? styles.success : null,
                  ]}
                >
                  {feedback}
                </Text>
              ) : null}
            </View>

            <View style={styles.footer}>
              <Image
                accessibilityLabel="by Softcom"
                resizeMode="contain"
                source={require('../../assets/images/logo-by-softcom.png')}
                style={styles.softcomLogo}
              />
              <Text style={styles.version}>
                Versão {AppConstants.appVersion}
              </Text>
              <Text style={styles.company}>Softcom Tecnologia | 0800 003 3600</Text>
              <Pressable
                onPress={() => void Linking.openURL(AppConstants.softcomUrl)}
              >
                <Text style={styles.link}>www.softcomtecnologia.com.br</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 23,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 82,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 42,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 11,
    textAlign: 'center',
  },
  form: {
    marginTop: 45,
  },
  rememberRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    minHeight: 26,
    paddingHorizontal: 6,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#D9DEE3',
    borderRadius: 3,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  checkboxChecked: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  rememberLabel: {
    color: colors.text,
    fontSize: 12,
    marginLeft: 7,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 7,
    height: 36,
    justifyContent: 'center',
    marginTop: 25,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  feedback: {
    color: colors.error,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  success: {
    color: '#2E7D32',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 34,
    paddingTop: 36,
  },
  softcomLogo: {
    height: 29,
    width: 163,
  },
  version: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  company: {
    color: '#5E5E5E',
    fontSize: 11,
    marginTop: 3,
  },
  link: {
    color: '#555555',
    fontSize: 11,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
});
