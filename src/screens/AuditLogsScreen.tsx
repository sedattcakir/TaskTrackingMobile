import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import {getAuditLogs, AuditLogItem} from '../services/auditService';
import {colors, formatDate, webStyles} from '../theme/webTheme';

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setLogs(await getAuditLogs());
    } catch (error: any) {
      setErrorMessage(error?.message || 'İşlem kayıtları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={webStyles.screen}>
      <FlatList
        data={loading ? [] : logs}
        keyExtractor={item => item.id}
        contentContainerStyle={webStyles.content}
        ListHeaderComponent={
          <View style={webStyles.card}>
            <View style={webStyles.cardHeaderGray}>
              <Text style={webStyles.cardHeaderTitle}>
                İşlemler  ({logs.length})
              </Text>
            </View>
            {loading ? (
              <View style={webStyles.cardBody}>
                <ActivityIndicator size="large" color={colors.ink} />
                <Text style={webStyles.emptyState}>İşlemler yükleniyor...</Text>
              </View>
            ) : errorMessage ? (
              <Text style={webStyles.emptyState}>{errorMessage}</Text>
            ) : null}
          </View>
        }
        renderItem={({item}) => (
          <View style={[webStyles.listItem, {borderLeftColor: colors.info}]}>
            <Text style={webStyles.listTitle}>{item.action}</Text>
            <Text style={webStyles.description}>Kullanıcı: {item.userEmail}</Text>
            <Text style={webStyles.meta}>Tarih: {formatDate(item.timestamp)}</Text>
            <Text style={webStyles.meta}>IP: {item.ipAddress || '-'}</Text>
          </View>
        )}
        ListEmptyComponent={
          !loading && !errorMessage ? (
            <Text style={webStyles.emptyState}>Henüz işlem kaydı yok</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
