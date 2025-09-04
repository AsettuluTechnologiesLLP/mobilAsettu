// src/screens/Households/HouseholdDetails.styles.ts
import { colors, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import { StyleSheet } from 'react-native';

export const BORDER = colors.border;
export const CARD_BG = '#F5F7FB';

export const styles = StyleSheet.create({
  center: {
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.error,
    marginTop: spacing.sm,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleInput: {
    flex: 1,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
  },
  fieldError: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  address: {
    marginTop: spacing.xs,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textSecondary,
  },
  metaRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hint: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.textMuted,
  },
  meta: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.textMuted,
  },
});

export const pillStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: BORDER,
  },
  txt: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export const metaPill = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#EDF2FF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  txt: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export const member = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: BORDER,
  },
  avatarTxt: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  name: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
  },
});

export const pickerRow = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  label: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export const pickerModal = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: BORDER,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  option: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  optionSelected: {
    backgroundColor: '#F1F5FF',
  },
  optionTxt: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
});

export const floatBar = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    left: spacing.md,
  },
});

export const sticky = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
});
