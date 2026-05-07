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
import {useAuth} from '../context/AuthContext';
import {getTasks, TaskItem} from '../services/taskService';
import {RootStackParamList} from '../navigation/AppNavigator';
import {
  colors,
  formatDate,
  getPriorityText,
  getStatusColor,
  getStatusText,
  webStyles,
} from '../theme/webTheme';

type TasksScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TaskDetail'
>;

export default function TasksScreen() {
  const {user, logout} = useAuth();
  const navigation = useNavigation<TasksScreenNavigationProp>();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setTasks(await getTasks(user));
    } catch (error: any) {
      setErrorMessage(error?.message || 'Görevler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [user]),
  );

  return (
    <SafeAreaView style={webStyles.screen}>
      <FlatList
        data={loading ? [] : tasks}
        keyExtractor={item => item.id}
        contentContainerStyle={webStyles.content}
        ListHeaderComponent={
          <>
            <View style={webStyles.topBar}>
              <View style={webStyles.topRow}>
                <View style={{flex: 1}}>
                  <Text style={webStyles.appTitle}>Görev Takip Sistemi</Text>
                  <Text style={webStyles.appSubtitle}>
                    Görevlerinizi kolayca yönetin
                  </Text>
                  <Text style={[webStyles.appSubtitle, {marginTop: 10}]}>
                    {user?.name}
                  </Text>
                  <View style={webStyles.roleBadge}>
                    <Text style={webStyles.roleBadgeText}>{user?.role}</Text>
                  </View>
                </View>

                <View style={{gap: 8}}>
                  {user?.role === 'Admin' ? (
                    <TouchableOpacity
                      style={webStyles.outlineButton}
                      onPress={() => navigation.navigate('CreateTask')}>
                      <Text style={webStyles.outlineButtonText}>Yeni Görev</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity style={webStyles.outlineButton} onPress={logout}>
                    <Text style={webStyles.outlineButtonText}>Çıkış</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={webStyles.card}>
              <View style={webStyles.cardHeaderDark}>
                <Text style={webStyles.cardHeaderTitle}>
                  Görevler  ({tasks.length})
                </Text>
              </View>
              {loading ? (
                <View style={webStyles.cardBody}>
                  <ActivityIndicator size="large" color={colors.ink} />
                  <Text style={webStyles.emptyState}>Görevler yükleniyor...</Text>
                </View>
              ) : errorMessage ? (
                <Text style={webStyles.emptyState}>{errorMessage}</Text>
              ) : null}
            </View>
          </>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TaskDetail', {taskId: item.id})}>
            <View style={[webStyles.listItem, {borderLeftColor: colors.ink}]}>
              <Text style={webStyles.listTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={webStyles.description}>{item.description}</Text>
              ) : null}
              <Text style={webStyles.meta}>{formatDate(item.createdTime)}</Text>
              <Text style={webStyles.meta}>Proje: {item.projectTitle || '-'}</Text>
              <View style={{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}}>
                <View
                  style={[
                    webStyles.badge,
                    {backgroundColor: getStatusColor(item.statusCode)},
                  ]}>
                  <Text style={webStyles.badgeText}>
                    {getStatusText(item.statusCode)}
                  </Text>
                </View>
                <View style={[webStyles.badge, {backgroundColor: colors.gray}]}>
                  <Text style={webStyles.badgeText}>
                    {getPriorityText(item.priority)}
                  </Text>
                </View>
              </View>
              <Text style={webStyles.meta}>
                Atanan kullanıcı sayısı: {item.assignedUsers.length}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && !errorMessage ? (
            <Text style={webStyles.emptyState}>Henüz görev eklenmemiş</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
