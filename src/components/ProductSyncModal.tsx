import LottieView from 'lottie-react-native';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { useProductSyncViewModel } from '../viewmodels/useProductSyncViewModel';

type ProductSyncModalProps = {
  onCompleted: () => void;
  visible: boolean;
};

export function ProductSyncModal({
  onCompleted,
  visible,
}: ProductSyncModalProps) {
  const { errorMessage, productCount, progress, retry, status } =
    useProductSyncViewModel(visible, onCompleted);
  const isError = status === 'error';
  const isSuccess = status === 'success';
  const progressLabel = progress
    ? `Página ${progress.currentPage} de ${progress.lastPage} • ${progress.downloadedProducts} produtos`
    : 'Preparando a sincronização...';

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => undefined}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LottieView
            autoPlay
            loop={!isSuccess}
            source={require('../../assets/animations/sync-animation.json')}
            style={styles.folderAnimation}
          />

          <Text style={styles.title}>
            {isError
              ? 'Não foi possível sincronizar'
              : isSuccess
                ? 'Sincronização concluída!'
                : 'Sincronizando seus itens...'}
          </Text>

          {isError ? (
            <View style={styles.errorContainer}>
              <ScrollView
                contentContainerStyle={styles.errorContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <Text selectable style={styles.errorText}>
                  {errorMessage}
                </Text>
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.description}>
              {isSuccess
                ? `${productCount} produtos disponíveis para uso offline.`
                : 'Esta ação pode levar alguns minutos. Por favor, aguarde!'}
            </Text>
          )}

          {isError ? (
            <Pressable onPress={() => void retry()} style={styles.retryButton}>
              <Text style={styles.retryLabel}>Tentar novamente</Text>
            </Pressable>
          ) : isSuccess ? null : (
            <>
              <LottieView
                autoPlay
                loop
                source={require('../../assets/animations/loading-animation.json')}
                style={styles.loadingAnimation}
              />
              <Text style={styles.progress}>{progressLabel}</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    maxHeight: '82%',
    maxWidth: 390,
    minHeight: 289,
    paddingBottom: 22,
    paddingHorizontal: 14,
    paddingTop: 24,
    width: '100%',
  },
  folderAnimation: {
    height: 126,
    width: 126,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    marginTop: -7,
    textAlign: 'center',
  },
  description: {
    color: '#A0A0A0',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 7,
    marginTop: 14,
    maxHeight: 112,
    minHeight: 66,
    width: '100%',
  },
  errorContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: '#707070',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  loadingAnimation: {
    height: 54,
    marginTop: 6,
    width: 54,
  },
  progress: {
    color: '#A0A0A0',
    fontSize: 10,
    marginTop: -7,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 7,
    height: 40,
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 24,
  },
  retryLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
