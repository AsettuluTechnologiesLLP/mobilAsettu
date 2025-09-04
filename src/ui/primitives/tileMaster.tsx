import { Text } from '@ui';
import { colors, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import React from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

// Minimal Tile with built-in Asettu theme defaults + optional dividers, per-section backgrounds,
// and a fullBleed mode for edge-to-edge section colors with no outer padding.
// 3 slots (header, body, footer), optional onPress, single style override.
export interface TileMasterProps {
  header?: React.ReactNode | string;
  body?: React.ReactNode | string;
  footer?: React.ReactNode | string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>; // parent overrides for bg, padding, border, radius, etc.

  // Dividers
  dividerHB?: boolean; // divider between Header and Body
  dividerBF?: boolean; // divider between Body and Footer
  dividerColor?: string; // defaults to tokens border
  dividerThickness?: number; // defaults to 1

  // Per-section background colors
  headerBg?: string;
  bodyBg?: string;
  footerBg?: string;

  // Full-bleed option (no outer padding; section backgrounds can run to the rounded edges)
  fullBleed?: boolean; // default false
  sectionPadding?: number; // optional internal padding for each section when fullBleed is true (default 0)
}

const headerTextDefaults = {
  color: (colors as any)?.text ?? '#111827',
  fontSize: (fontSizes as any)?.md ?? 16,
  lineHeight: (lineHeights as any)?.md ?? 22,
  fontWeight: '700' as const,
};

const bodyTextDefaults = {
  color: (colors as any)?.text ?? '#111827',
  fontSize: (fontSizes as any)?.md ?? 14,
  lineHeight: (lineHeights as any)?.md ?? 20,
};

const footerTextDefaults = {
  color: (colors as any)?.textMuted ?? '#6B7280',
  fontSize: (fontSizes as any)?.sm ?? 12,
  lineHeight: (lineHeights as any)?.sm ?? 18,
};

const asNode = (n?: React.ReactNode | string, variant: 'header' | 'body' | 'footer' = 'body') => {
  if (n == null) return null;
  if (typeof n === 'string') {
    const style =
      variant === 'header'
        ? headerTextDefaults
        : variant === 'footer'
        ? footerTextDefaults
        : bodyTextDefaults;
    return <Text style={style}>{n}</Text>;
  }
  return n;
};

const TileMaster: React.FC<TileMasterProps> = ({
  header,
  body,
  footer,
  onPress,
  style,
  dividerHB = false,
  dividerBF = false,
  dividerColor,
  dividerThickness,
  headerBg,
  bodyBg,
  footerBg,
  fullBleed = false,
  sectionPadding,
}) => {
  // Asettu theme defaults with safe fallbacks
  const gap = (spacing as any)?.sm ?? 8;
  const divColor = dividerColor ?? (colors as any)?.border ?? '#E5E7EB';
  const divThickness = typeof dividerThickness === 'number' ? dividerThickness : 1;
  const sectionPad = typeof sectionPadding === 'number' ? sectionPadding : 0;

  const baseStyle: ViewStyle = {
    backgroundColor: (colors as any)?.surface ?? '#FFFFFF',
    padding: fullBleed ? 0 : (spacing as any)?.md ?? 12,
    borderRadius: (radii as any)?.md ?? 12,
    borderWidth: 1,
    borderColor: (colors as any)?.border ?? '#E5E7EB',
    overflow: fullBleed ? 'hidden' : undefined, // clip section colors to rounded corners
  };

  const Header =
    header != null ? (
      <View
        style={[
          headerBg ? { backgroundColor: headerBg } : null,
          sectionPad ? { padding: sectionPad } : null,
        ]}
      >
        {asNode(header, 'header')}
      </View>
    ) : null;

  const Body =
    body != null ? (
      <View
        style={[
          bodyBg ? { backgroundColor: bodyBg } : null,
          sectionPad ? { padding: sectionPad } : null,
          header && dividerHB
            ? {
                borderTopWidth: divThickness,
                borderTopColor: divColor,
                paddingTop: (sectionPad ? sectionPad : 0) + gap,
              }
            : { marginTop: header ? gap : 0 },
        ]}
      >
        {asNode(body, 'body')}
      </View>
    ) : null;

  const Footer =
    footer != null ? (
      <View
        style={[
          footerBg ? { backgroundColor: footerBg } : null,
          sectionPad ? { padding: sectionPad } : null,
          body && dividerBF
            ? {
                borderTopWidth: divThickness,
                borderTopColor: divColor,
                paddingTop: (sectionPad ? sectionPad : 0) + gap,
              }
            : { marginTop: gap },
        ]}
      >
        {asNode(footer, 'footer')}
      </View>
    ) : null;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [baseStyle, pressed && { opacity: 0.96 }, style as any]}
      >
        {Header}
        {Body}
        {Footer}
      </Pressable>
    );
  }

  return (
    <View style={[baseStyle, style]}>
      {Header}
      {Body}
      {Footer}
    </View>
  );
};

export default TileMaster;
