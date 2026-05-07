import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {getUsers, UserItem} from '../services/userService';
import {RootStackParamList} from '../navigation/AppNavigator';
import {colors, formatDate, webStyles} from '../theme/webTheme';

type UsersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateUser'
>;

export default function UsersScreen() {
  const navigation = useNavigation<UsersScreenNavigationProp>();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setUsers(await getUsers());
    } catch (error: any) {
      setErrorMessage(error?.message || 'Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, []),
  );

  return (
    <SafeAreaView style={webStyles.screen}>
      <FlatList
        data={loading ? [] : users}
        keyExtractor={item => item.id}
        contentContainerStyle={webStyles.content}
        ListHeaderComponent={
          <View style={webStyles.card}>
            <View style={webStyles.cardHeaderGray}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                <Text style={webStyles.cardHeaderTitle}>
                  Kullanıcılar  ({users.length})
                </Text>
                <TouchableOpacity
                  style={webStyles.outlineButton}
                  onPress={() => navigation.navigate('CreateUser')}>
                  <Text style={webStyles.outlineButtonText}>Yeni Kullanıcı</Text>
                </TouchableOpacity>
              </View>
            </View>
            {loading ? (
              <View style={webStyles.cardBody}>
                <ActivityIndicator size="large" color={colors.ink} />
                <Text style={webStyles.emptyState}>Kullanıcılar yükleniyor...</Text>
              </View>
            ) : errorMessage ? (
              <Text style={webStyles.emptyState}>{errorMessage}</Text>
            ) : null}
          </View>
        }
        renderItem={({item}) => (
          <View style={[webStyles.listItem, {borderLeftColor: colors.gray}]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 1}}>
                <Text style={webStyles.listTitle}>{item.name}</Text>
                <Text style={webStyles.description}>{item.email}</Text>
                <Text style={webStyles.meta}>
                  Oluşturulma: {formatDate(item.createdTime)}
                </Text>
              </View>
              <View style={[webStyles.badge, {backgroundColor: colors.gray}]}>
                <Text style={webStyles.badgeText}>{item.role}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading && !errorMessage ? (
            <Text style={webStyles.emptyState}>Henüz kullanıcı eklenmemiş</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
