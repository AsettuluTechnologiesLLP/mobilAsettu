// src/screens/Households/components/MembersTile.tsx
import { Text } from '@ui';
import { colors, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  findNodeHandle,
  Modal,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  TextInput,
  UIManager,
  View,
  type ViewStyle,
} from 'react-native';

export type Member = {
  id: string;
  name: string;
  phone?: string | null;
  role: string; // 'PRIMARY OWNER' | 'OWNER' | 'MEMBER' | 'TENANT' (any case)
  isYou?: boolean;
};

type Props = {
  title?: string;
  members: Member[];
  canEdit?: boolean;
  style?: StyleProp<ViewStyle>;
  onAdd?: (payload: { phone: string; role: string }) => void;
  onDelete?: (memberId: string) => void;
  onChangeRole?: (memberId: string, role: string) => void;
};

/** Menu list + sorting order (as requested) */
const ROLES = ['PRIMARY OWNER', 'OWNER', 'MEMBER', 'TENANT'] as const;

type Anchor = { x: number; y: number; w: number; h: number };

/* ---------- Responsive column widths ---------- */
const screenW = Dimensions.get('window').width;
// fixed role column so all rows align
const ROLE_COL_W = Math.min(220, Math.max(160, Math.round(screenW * 0.44)));
// delete column
const DELETE_COL_W = 36;
// center-clamped width for Add form fields
const FIELD_W = Math.min(420, Math.max(260, Math.round(screenW * 0.82)));

export default function MembersTile({
  title = 'Members',
  members,
  canEdit = true,
  style,
  onAdd,
  onDelete,
  onChangeRole,
}: Props) {
  const [list, setList] = useState<Member[]>(members ?? []);
  useEffect(() => setList(members ?? []), [members]);

  const [expanded, setExpanded] = useState(true);

  // Add form
  const [adding, setAdding] = useState(false);
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<(typeof ROLES)[number]>('MEMBER');

  // Shared dropdown (Modal)
  const [menuFor, setMenuFor] = useState<{ type: 'row' | 'form'; id?: string } | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const closeMenu = useCallback(() => {
    setMenuFor(null);
    setAnchor(null);
  }, []);

  /* ---------- Sort: you first → role order → name ---------- */
  const rolePriority = useCallback((role?: string | null) => {
    const v = String(role || '')
      .trim()
      .toUpperCase();
    if (v === 'PRIMARY OWNER') return 1;
    if (v === 'OWNER') return 2;
    if (v === 'MEMBER') return 3;
    if (v === 'TENANT') return 4;
    return 99;
  }, []);

  const viewList = useMemo(() => {
    const copy = [...list];
    copy.sort((a, b) => {
      if (!!a.isYou !== !!b.isYou) return a.isYou ? -1 : 1;
      const r = rolePriority(a.role) - rolePriority(b.role);
      if (r !== 0) return r;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
    return copy;
  }, [list, rolePriority]);

  /* ---------- Actions ---------- */
  const submitAdd = useCallback(() => {
    const phone = formPhone.trim();
    if (!phone) return;
    const newMember: Member = { id: `tmp_${Date.now()}`, name: phone, phone, role: formRole };
    setList((prev) => [newMember, ...prev]);
    onAdd?.({ phone, role: formRole });
    setAdding(false);
    setFormPhone('');
    setFormRole('MEMBER');
    closeMenu();
  }, [formPhone, formRole, onAdd, closeMenu]);

  const removeMember = (id: string) => {
    setList((prev) => prev.filter((m) => m.id !== id));
    onDelete?.(id);
  };

  const changeRole = (id: string, role: string) => {
    setList((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    onChangeRole?.(id, role);
    closeMenu();
  };

  /* ---------- Header Right ---------- */
  const headerRight = (
    <View style={S.headerRight}>
      <View style={S.countPill}>
        <Text style={S.countTxt}>{list.length}</Text>
      </View>

      {canEdit && (
        <Pressable
          onPress={() => {
            setExpanded(true);
            setAdding((v) => !v);
            closeMenu();
          }}
          style={({ pressed }) => [S.iconBtn, pressed && S.pressed]}
          accessibilityLabel="Add member"
        >
          <Text style={S.iconTxt}>＋</Text>
        </Pressable>
      )}

      <Pressable
        onPress={() => {
          setExpanded((v) => !v);
          closeMenu();
        }}
        style={({ pressed }) => [S.iconBtn, pressed && S.pressed]}
        accessibilityLabel={expanded ? 'Collapse' : 'Expand'}
      >
        <Text style={S.iconTxt}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[S.card, style]}>
      {/* Header */}
      <View style={S.headerRow}>
        <Text style={S.title} numberOfLines={1}>
          {title}
        </Text>
        {headerRight}
      </View>

      {/* Body */}
      {expanded && (
        <View>
          {/* Add form (centered) */}
          {adding && (
            <AddForm
              formPhone={formPhone}
              setFormPhone={setFormPhone}
              formRole={formRole}
              onOpenMenu={(a) => {
                setMenuFor({ type: 'form' });
                setAnchor(a);
              }}
              onCancel={() => {
                setAdding(false);
                setFormPhone('');
                setFormRole('MEMBER');
                closeMenu();
              }}
              onSubmit={submitAdd}
            />
          )}

          {/* Rows */}
          <View>
            {viewList.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                canEdit={canEdit}
                onOpenMenu={(a) => {
                  setMenuFor({ type: 'row', id: m.id });
                  setAnchor(a);
                }}
                onDelete={() => removeMember(m.id)}
              />
            ))}

            {viewList.length === 0 && !adding && <Text style={S.empty}>No members yet.</Text>}
          </View>
        </View>
      )}

      {/* Dropdown modal: width = button width; outside tap closes */}
      <RoleMenuModal
        open={!!menuFor && !!anchor}
        anchor={anchor}
        onClose={closeMenu}
        onSelect={(role) => {
          if (!menuFor) return;
          if (menuFor.type === 'form') {
            setFormRole(role as (typeof ROLES)[number]);
            closeMenu();
          } else if (menuFor.type === 'row' && menuFor.id) {
            changeRole(menuFor.id, role);
          }
        }}
      />
    </View>
  );
}

/* ======================= Add Form (centered block) ======================= */

function AddForm({
  formPhone,
  setFormPhone,
  formRole,
  onOpenMenu,
  onCancel,
  onSubmit,
}: {
  formPhone: string;
  setFormPhone: (v: string) => void;
  formRole: (typeof ROLES)[number];
  onOpenMenu: (a: Anchor) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const roleBtnRef = useRef<View>(null);

  const openRoleMenu = () => {
    const node = findNodeHandle(roleBtnRef.current);
    if (!node) return;
    UIManager.measureInWindow(node, (x, y, w, h) => onOpenMenu({ x, y, w, h }));
  };

  return (
    <View style={S.addWrap}>
      {/* Inner clamp: centers the whole add section */}
      <View style={S.addInner}>
        {/* Phone */}
        <Text style={S.label}>Phone Number</Text>
        <TextInput
          value={formPhone}
          onChangeText={setFormPhone}
          placeholder="+91 98765 43210"
          placeholderTextColor={colors.textSecondary}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'phone-pad'}
          style={S.input}
        />

        {/* Role */}
        <Text style={[S.label, { marginTop: spacing.sm }]}>Member Role</Text>
        <View ref={roleBtnRef} collapsable={false}>
          <Pressable onPress={openRoleMenu} style={S.roleButton}>
            <Text style={S.roleBtnTxt} numberOfLines={1} ellipsizeMode="tail">
              {formRole || 'MEMBER'}
            </Text>
            <Text style={S.caret}>▾</Text>
          </Pressable>
        </View>

        {/* Actions */}
        <View style={S.formActions}>
          <Pressable onPress={onCancel} style={({ pressed }) => [S.btnGhost, pressed && S.pressed]}>
            <Text style={S.btnGhostTxt}>Cancel</Text>
          </Pressable>
          <View style={{ width: spacing.sm }} />
          <Pressable
            onPress={onSubmit}
            style={({ pressed }) => [S.btnPrimary, pressed && S.pressed]}
          >
            <Text style={S.btnPrimaryTxt}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ============================ Member Row ============================ */

function MemberRow({
  member,
  canEdit,
  onOpenMenu,
  onDelete,
}: {
  member: Member;
  canEdit: boolean;
  onOpenMenu: (a: Anchor) => void;
  onDelete: () => void;
}) {
  const roleBtnRef = useRef<View>(null);

  const openRoleMenu = () => {
    const node = findNodeHandle(roleBtnRef.current);
    if (!node) return;
    UIManager.measureInWindow(node, (x, y, w, h) => onOpenMenu({ x, y, w, h }));
  };

  const roleLabel = String(member.role || 'MEMBER').toUpperCase();

  return (
    <View style={S.row}>
      {/* Name (fills remaining) */}
      <Text style={S.name} numberOfLines={1} ellipsizeMode="tail">
        {member.name}
        {member.isYou ? ' (you)' : ''}
      </Text>

      {/* Role (fixed column) */}
      <View
        ref={roleBtnRef}
        collapsable={false}
        style={{ width: ROLE_COL_W, marginLeft: spacing.sm }}
      >
        <Pressable onPress={openRoleMenu} style={S.roleButton} accessibilityLabel="Change role">
          <Text style={S.roleBtnTxt} numberOfLines={1} ellipsizeMode="tail">
            {roleLabel}
          </Text>
          <Text style={S.caret}>▾</Text>
        </Pressable>
      </View>

      {/* Delete (fixed column) */}
      {canEdit && (
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [
            S.iconBtnSm,
            { width: DELETE_COL_W, marginLeft: spacing.sm },
            pressed && S.pressed,
          ]}
          accessibilityLabel="Delete member"
        >
          <Text style={S.iconTxt}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ========================= Role Menu (Modal) ========================= */

function RoleMenuModal({
  open,
  anchor,
  onClose,
  onSelect,
}: {
  open: boolean;
  anchor: Anchor | null;
  onClose: () => void;
  onSelect: (r: string) => void;
}) {
  if (!open || !anchor) return null;

  const screen = Dimensions.get('window');
  const menuWidth = anchor.w; // EXACT width of the button
  const itemH = 36;
  const menuH = itemH * ROLES.length;

  // Position below if possible, else above; left-align to button
  const spaceBelow = screen.height - (anchor.y + anchor.h);
  const top = spaceBelow > menuH + 12 ? anchor.y + anchor.h + 4 : Math.max(8, anchor.y - menuH - 4);
  const left = Math.min(Math.max(8, anchor.x), screen.width - menuWidth - 8);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={S.modalBackdrop} onPress={onClose} />
      <View style={[S.menuPortal, { top, left, width: menuWidth }]}>
        {ROLES.map((r) => (
          <Pressable
            key={`menu-${r}`}
            onPress={() => onSelect(r)}
            style={({ pressed }) => [S.menuItem, pressed && S.menuItemPressed]}
          >
            <Text style={S.menuItemTxt}>{r}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

/* =============================== Styles =============================== */

const BORDER = colors.border;

const S = StyleSheet.create({
  card: {
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.tileBackground,
    borderWidth: 1,
    borderColor: BORDER,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  countPill: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: colors.badgeBg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countTxt: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  iconBtn: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnSm: {
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  pressed: { opacity: 0.85 },

  /* Add form container (centered block) */
  addWrap: {
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  addInner: {
    width: FIELD_W,
    alignSelf: 'center',
    alignItems: 'center',
  },
  label: {
    width: '100%',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'left', // change to 'center' if you prefer centered labels
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.select({ ios: 8, android: 6 }),
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
    backgroundColor: colors.tileBackground,
  },
  roleButton: {
    width: '100%', // ensures menu matches the button width
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.tileBackground,
  },
  roleBtnTxt: {
    flex: 1,
    fontSize: fontSizes.sm, // smaller text as requested
    lineHeight: lineHeights.sm,
    color: colors.textPrimary,
  },
  caret: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.textSecondary,
  },
  formActions: {
    marginTop: spacing.sm,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnGhost: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'transparent',
    marginRight: spacing.sm,
  },
  btnGhostTxt: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  btnPrimary: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.primary ?? '#2563eb',
  },
  btnPrimaryTxt: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: '#fff',
    fontWeight: '700',
  },

  /* Row layout (columns align) */
  row: {
    minHeight: 44,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  /* Modal dropdown */
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuPortal: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: radii.sm,
    backgroundColor: colors.tileBackground,
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 5 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  menuItem: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
  },
  menuItemPressed: { backgroundColor: colors.badgeBg },
  menuItemTxt: {
    fontSize: fontSizes.sm, // smaller, matches button text
    lineHeight: lineHeights.sm,
    color: colors.textPrimary,
  },

  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
