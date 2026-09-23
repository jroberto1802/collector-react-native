import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

type BarcodeScannerModalProps = {
  onClose: () => void;
  onScanned: (barcode: string) => void;
  visible: boolean;
};

const BARCODE_TYPES = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'itf14',
  'codabar',
] as const;

export function BarcodeScannerModal({
  onClose,
  onScanned,
  visible,
}: BarcodeScannerModalProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const lockedRef = useRef(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!visible) {
      lockedRef.current = false;
      setLocked(false);
      setReady(false);
      return;
    }

    let cancelled = false;

    const prepare = async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    };

    void prepare();

    // Só libera a câmera depois da permissão e com um pequeno delay de montagem.
    if (permission?.granted) {
      const timer = setTimeout(() => {
        if (!cancelled) {
          setReady(true);
        }
      }, 350);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    setReady(false);
    return () => {
      cancelled = true;
    };
  }, [permission?.granted, requestPermission, visible]);

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      const value = data?.trim();
      if (lockedRef.current || !value) {
        return;
      }

      lockedRef.current = true;
      setLocked(true);
      onScanned(value);
    },
    [onScanned],
  );

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible={visible}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons color={colors.white} name="close" size={24} />
          </Pressable>
          <Text style={styles.title}>Ler código de barras</Text>
          <View style={styles.closeButton} />
        </View>

        {!permission ? (
          <View style={styles.centered}>
            <Text style={styles.message}>Solicitando permissão da câmera...</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.centered}>
            <Text style={styles.message}>
              Precisamos da câmera para ler o código de barras.
            </Text>
            <Pressable
              onPress={() => void requestPermission()}
              style={styles.permissionButton}
            >
              <Text style={styles.permissionLabel}>Permitir câmera</Text>
            </Pressable>
          </View>
        ) : ready ? (
          <View style={styles.cameraFrame}>
            <CameraView
              barcodeScannerSettings={{
                barcodeTypes: [...BARCODE_TYPES],
              }}
              facing="back"
              onBarcodeScanned={locked ? undefined : handleBarcodeScanned}
              style={styles.camera}
            />
          </View>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.message}>Abrindo câmera...</Text>
          </View>
        )}

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          <Text style={styles.hint}>
            Aponte a câmera para o código de barras do produto
          </Text>
          {Platform.OS === 'android' ? (
            <Text style={styles.subHint}>
              Mantenha o código bem iluminado e centralizado
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111111',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cameraFrame: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 16,
    marginTop: 18,
    overflow: 'hidden',
  },
  camera: {
    ...StyleSheet.absoluteFill,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  message: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: colors.orange,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  permissionLabel: {
    color: colors.white,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  hint: {
    color: '#D0D0D0',
    fontSize: 13,
    textAlign: 'center',
  },
  subHint: {
    color: '#8A8A8A',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
});
