import {StyleSheet} from 'react-native';

export const colors = {
  background: '#f0f0f0',
  ink: '#1a1a1a',
  mid: '#333333',
  gray: '#555555',
  muted: '#666666',
  faint: '#999999',
  border: '#dddddd',
  softBorder: '#eeeeee',
  surface: '#ffffff',
  form: '#fafafa',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  success: '#28a745',
};

export function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('tr-TR');
}

export function getStatusText(statusCode: number) {
  switch (statusCode) {
    case 0:
      return 'Bekliyor';
    case 1:
      return 'Yapılıyor';
    case 2:
      return 'Tamamlandı';
    default:
      return 'Bilinmiyor';
  }
}

export function getPriorityText(priority: number) {
  switch (priority) {
    case 0:
      return 'Düşük';
    case 1:
      return 'Orta';
    case 2:
      return 'Yüksek';
    default:
      return 'Bilinmiyor';
  }
}

export function getStatusColor(statusCode: number) {
  switch (statusCode) {
    case 0:
      return colors.warning;
    case 1:
      return colors.info;
    case 2:
      return colors.success;
    default:
      return colors.gray;
  }
}

export const webStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  topBar: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '700',
  },
  appSubtitle: {
    color: colors.faint,
    fontSize: 12,
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  roleBadgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  outlineButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 18,
    overflow: 'hidden',
  },
  cardHeaderDark: {
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  cardHeaderMid: {
    backgroundColor: colors.mid,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  cardHeaderGray: {
    backgroundColor: colors.gray,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  cardHeaderTitle: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: '700',
  },
  cardBody: {
    padding: 16,
  },
  formSection: {
    backgroundColor: colors.form,
    borderWidth: 1,
    borderColor: colors.softBorder,
    borderRadius: 8,
    padding: 16,
  },
  listItem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  listTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  meta: {
    color: colors.faint,
    fontSize: 12,
    marginTop: 7,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    color: colors.faint,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 30,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.ink,
    marginBottom: 10,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
  },
  primaryButton: {
    backgroundColor: colors.ink,
    borderRadius: 6,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
});
