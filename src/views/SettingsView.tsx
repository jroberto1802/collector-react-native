import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type LayoutRectangle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  PRICE_TYPE_OPTIONS,
  SEARCH_TYPE_OPTIONS,
  labelForPriceType,
  labelForSearchType,
  type PriceType,
  type SearchType,
  type SettingOption,
} from '../constants/SettingsConstants';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { useSettingsViewModel } from '../viewmodels/useSettingsViewModel';

type SettingsViewProps = {
  onBack: () => void;
};

type SelectFieldProps<T extends string> = {
  options: SettingOption<T>[];
  value: T;
  onChange: (value: T) => void;
  valueLabel: string;
};

function SelectField<T extends string>({
  options,
  value,
  onChange,
  valueLabel,
}: SelectFieldProps<T>) {
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const closeDropdown = () => setOpen(false);

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable onPress={openDropdown} style={styles.selectControl}>
          <Text style={styles.selectValue} numberOfLines={1}>
            {valueLabel}
          </Text>
          <Ionicons
            color="#8A8A8A"
            name="chevron-down"
            size={14}
            style={styles.selectChevron}
          />
        </Pressable>
      </View>

      <Modal
        animationType="none"
        onRequestClose={closeDropdown}
        statusBarTranslucent
        transparent
        visible={open}
      >
        <View style={styles.dropdownRoot}>
          <Pressable onPress={closeDropdown} style={StyleSheet.absoluteFill} />
          {anchor ? (
            <View
              style={[
                styles.dropdownPanel,
                {
                  top: anchor.y + anchor.height + 4,
                  left: Math.max(12, anchor.x + anchor.width - 180),
                  width: Math.max(anchor.width, 180),
                },
              ]}
            >
              {options.map((option, index) => {
                const selected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      closeDropdown();
                    }}
                    style={[
                      styles.dropdownOption,
                      index < options.length - 1 ? styles.dropdownOptionBorder : null,
                      selected ? styles.dropdownOptionActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionLabel,
                        selected ? styles.dropdownOptionLabelActive : null,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

type SettingCardProps = {
  title: string;
  description: string;
  control: ReactNode;
  disabled?: boolean;
};

function SettingCard({
  title,
  description,
  control,
  disabled = false,
}: SettingCardProps) {
  return (
    <View style={[styles.card, disabled ? styles.cardDisabled : null]}>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, disabled ? styles.textDisabled : null]}>
          {title}
        </Text>
        <Text
          style={[
            styles.cardDescription,
            disabled ? styles.descriptionDisabled : null,
          ]}
        >
          {description}
        </Text>
      </View>
      <View style={styles.cardControl}>{control}</View>
    </View>
  );
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const {
    isDetailedModeExclusive,
    isLoading,
    isLotSerialAvailable,
    isLotSerialDisabled,
    isQuickCollectionExclusive,
    setGrade,
    setLotSerial,
    setPriceType,
    setQuickCollection,
    setSearchType,
    settings,
  } = useSettingsViewModel();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons color="#555555" name="chevron-back" size={20} />
          </Pressable>
          <Text style={styles.title}>Configurações</Text>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            <SettingCard
              title="Coleta rápida ⚡"
              description="Lançamento de itens ao capturar código"
              disabled={isDetailedModeExclusive}
              control={
                <Switch
                  disabled={isDetailedModeExclusive}
                  trackColor={{ false: '#D8D8D8', true: '#FFB07A' }}
                  thumbColor={
                    settings.quickCollection ? colors.orange : '#F4F4F4'
                  }
                  ios_backgroundColor="#D8D8D8"
                  onValueChange={setQuickCollection}
                  value={settings.quickCollection}
                />
              }
            />

            {isLotSerialAvailable ? (
              <SettingCard
                title="Lote/Serial"
                description="Solicitar o lote ou número de série e as datas de fabricação ou validade dos produtos."
                disabled={isLotSerialDisabled}
                control={
                  <Switch
                    disabled={isLotSerialDisabled}
                    trackColor={{ false: '#D8D8D8', true: '#FFB07A' }}
                    thumbColor={settings.lotSerial ? colors.orange : '#F4F4F4'}
                    ios_backgroundColor="#D8D8D8"
                    onValueChange={setLotSerial}
                    value={settings.lotSerial}
                  />
                }
              />
            ) : null}

            <SettingCard
              title="Grade"
              description="Solicitar atributos de cor e tamanho"
              disabled={isQuickCollectionExclusive}
              control={
                <Switch
                  disabled={isQuickCollectionExclusive}
                  trackColor={{ false: '#D8D8D8', true: '#FFB07A' }}
                  thumbColor={settings.grade ? colors.orange : '#F4F4F4'}
                  ios_backgroundColor="#D8D8D8"
                  onValueChange={setGrade}
                  value={settings.grade}
                />
              }
            />

            <SettingCard
              title="Tipo de Busca"
              description="Selecione o tipo de busca"
              control={
                <SelectField<SearchType>
                  options={SEARCH_TYPE_OPTIONS}
                  value={settings.searchType}
                  valueLabel={labelForSearchType(settings.searchType)}
                  onChange={setSearchType}
                />
              }
            />

            <SettingCard
              title="Tipo de Preço"
              description="Selecione entre preço de venda e preço de compra"
              control={
                <SelectField<PriceType>
                  options={PRICE_TYPE_OPTIONS}
                  value={settings.priceType}
                  valueLabel={labelForPriceType(settings.priceType)}
                  onChange={setPriceType}
                />
              }
            />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7F7F7',
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenHorizontalPadding,
  },
  header: {
    alignItems: 'center',
    height: layout.headerActionSize,
    justifyContent: 'center',
    marginTop: layout.screenTopPadding,
    position: 'relative',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: layout.headerActionRadius,
    height: layout.headerActionSize,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: layout.headerActionSize,
    zIndex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: layout.headerActionSize + 12,
    textAlign: 'center',
    width: '100%',
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 28,
    paddingTop: 18,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardDisabled: {
    backgroundColor: '#E8ECF0',
    elevation: 0,
    shadowOpacity: 0,
  },
  cardText: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#9A9A9A',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  textDisabled: {
    color: '#7A8490',
  },
  descriptionDisabled: {
    color: '#9AA3AD',
  },
  cardControl: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  selectControl: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 8,
    width: 148,
  },
  selectValue: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    marginRight: 6,
  },
  selectChevron: {
    marginTop: 1,
  },
  dropdownRoot: {
    flex: 1,
  },
  dropdownPanel: {
    backgroundColor: colors.white,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 6,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  dropdownOption: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownOptionBorder: {
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownOptionActive: {
    backgroundColor: '#FFF0E7',
  },
  dropdownOptionLabel: {
    color: colors.text,
    fontSize: 13,
  },
  dropdownOptionLabelActive: {
    color: colors.orange,
    fontWeight: '700',
  },
});
