import firestore from '@react-native-firebase/firestore';

export type AuditLogItem = {
  id: string;
  userEmail: string;
  action: string;
  timestamp: string;
  ipAddress?: string | null;
};

function normalizeDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as {toDate: () => Date}).toDate().toISOString();
  }

  return typeof value === 'string' ? value : new Date().toISOString();
}

export async function getAuditLogs() {
  const snapshot = await firestore()
    .collection('auditLogs')
    .orderBy('timestamp', 'desc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      userEmail: String(data.userEmail || ''),
      action: String(data.action || ''),
      timestamp: normalizeDate(data.timestamp),
      ipAddress: typeof data.ipAddress === 'string' ? data.ipAddress : null,
    };
  });
}
