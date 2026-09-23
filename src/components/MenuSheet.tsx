import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppConstants } from '../constants/AppConstants';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { formatCnpj } from '../utils/formatCnpj';

type MenuSheetProps = {
  onClose: () => void;
  onLogout: () => void;
  onOpenProducts: () => void;
  onSynchronize: () => void;
  visible: boolean;
};

type MenuItemProps = {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
};

function MenuItem({ description, icon, label, onPress }: MenuItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <Ionicons color={colors.orange} name={icon} size={23} />
      <View style={styles.menuItemText}>
        <Text style={styles.menuItemLabel}>{label}</Text>
        <Text style={styles.menuItemDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

export function MenuSheet({
  onClose,
  onLogout,
  onOpenProducts,
  onSynchronize,
  visible,
}: MenuSheetProps) {
  const { width } = useWindowDimensions();
  const sheetWidth = Math.min(width * 0.9, 420);
  const translateX = useRef(new Animated.Value(-sheetWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const merchantCnpj = useMemo(
    () => formatCnpj(AppConstants.merchantCnpj),
    [],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    translateX.setValue(-sheetWidth);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateX, {
        duration: 260,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        duration: 220,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sheetWidth, translateX, visible]);

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalContainer}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateX }], width: sheetWidth },
          ]}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
              <Pressable
                hitSlop={8}
                onPress={onClose}
                style={styles.backButton}
              >
                <Ionicons color="#444444" name="chevron-back" size={20} />
              </Pressable>

              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Bem vindo! 👋</Text>
                <Text style={styles.merchantName}>
                  Empresa: {AppConstants.merchantName || 'Não informada'}
                </Text>
                <Text style={styles.merchantCnpj}>{merchantCnpj}</Text>
              </View>

              <View style={styles.menuList}>
                <MenuItem
                  description="Habilitar ou Desabilitar recursos"
                  icon="settings-outline"
                  label="Configurações"
                  onPress={() => undefined}
                />
                <MenuItem
                  description="Atualiza os dados de produtos cadastrados"
                  icon="sync-outline"
                  label="Sincronizar"
                  onPress={onSynchronize}
                />
                <MenuItem
                  description="Visualizar os produtos sincronizados"
                  icon="storefront-outline"
                  label="Meus Produtos"
                  onPress={onOpenProducts}
                />
                <MenuItem
                  description="Realizar Logoff"
                  icon="log-out-outline"
                  label="Sair"
                  onPress={onLogout}
                />
              </View>

              <View style={styles.footer}>
                <Text style={styles.version}>
                  Versão {AppConstants.appVersion}
                </Text>
                <Text style={styles.company}>
                  Softcom Tecnologia | 0800 003 3600
                </Text>
                <Pressable
                  onPress={() => void Linking.openURL(AppConstants.softcomUrl)}
                >
                  <Text style={styles.link}>www.softcomtecnologia.com.br</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: colors.white,
    elevation: 16,
    height: '100%',
    shadowColor: '#000000',
    shadowOffset: { height: 0, width: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenHorizontalPadding,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: layout.headerActionRadius,
    height: layout.headerActionSize,
    justifyContent: 'center',
    marginTop: layout.screenTopPadding,
    width: layout.headerActionSize,
  },
  welcomeCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    marginTop: 23,
    paddingBottom: 17,
    paddingHorizontal: 12,
    paddingTop: 14,
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  welcomeTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  merchantName: {
    color: '#9A9A9A',
    fontSize: 16,
    lineHeight: 21,
    marginTop: 2,
    textAlign: 'center',
  },
  merchantCnpj: {
    color: '#9A9A9A',
    fontSize: 16,
    marginTop: 2,
  },
  menuList: {
    borderTopColor: '#E1E4E8',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
  },
  menuItem: {
    alignItems: 'center',
    borderBottomColor: '#DADDE1',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: 0,
  },
  menuItemText: {
    marginLeft: 18,
  },
  menuItemLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  menuItemDescription: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 4,
  },
  version: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  company: {
    color: '#5E5E5E',
    fontSize: 11,
    marginTop: 4,
  },
  link: {
    color: '#555555',
    fontSize: 11,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
});
