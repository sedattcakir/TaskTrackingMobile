import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getTaskById, TaskItem} from '../services/taskService';
import {RootStackParamList} from '../navigation/AppNavigator';
import {
  colors,
  formatDate,
  getPriorityText,
  getStatusColor,
  getStatusText,
  webStyles,
} from '../theme/webTheme';

type TaskDetailScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

type TaskDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditTask'
>;

type Props = {
  route: TaskDetailScreenRouteProp;
};

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <View style={[webStyles.listItem, {borderLeftColor: colors.ink}]}>
      <Text style={webStyles.meta}>{label}</Text>
      <Text style={[webStyles.listTitle, {marginTop: 4}]}>{value}</Text>
    </View>
  );
}

export default function TaskDetailScreen({route}: Props) {
  const {taskId} = route.params;
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const [task, setTask] = useState<TaskItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        setTask(await getTaskById(taskId));
      } catch (error: any) {
        setErrorMessage(error?.message || 'Görev detayı yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  if (loading) {
    return (
      <SafeAreaView
        style={[
          webStyles.screen,
          {alignItems: 'center', justifyContent: 'center'},
        ]}>
        <ActivityIndicator size="large" color={colors.ink} />
      </SafeAreaView>
    );
  }

  if (errorMessage || !task) {
    return (
      <SafeAreaView style={webStyles.screen}>
        <Text style={webStyles.emptyState}>
          {errorMessage || 'Görev bulunamadı.'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={webStyles.screen}>
      <ScrollView contentContainerStyle={webStyles.content}>
        <View style={webStyles.card}>
          <View style={webStyles.cardHeaderDark}>
            <Text style={webStyles.cardHeaderTitle}>{task.title}</Text>
          </View>
          <View style={webStyles.cardBody}>
            {task.description ? (
              <Text style={webStyles.description}>{task.description}</Text>
            ) : null}

            <View style={{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}}>
              <View
                style={[
                  webStyles.badge,
                  {backgroundColor: getStatusColor(task.statusCode)},
                ]}>
                <Text style={webStyles.badgeText}>
                  {getStatusText(task.statusCode)}
                </Text>
              </View>
              <View style={[webStyles.badge, {backgroundColor: colors.gray}]}>
                <Text style={webStyles.badgeText}>
                  {getPriorityText(task.priority)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[webStyles.primaryButton, {marginBottom: 14}]}
          onPress={() => navigation.navigate('EditTask', {taskId: task.id})}>
          <Text style={webStyles.primaryButtonText}>Düzenle</Text>
        </TouchableOpacity>

        <DetailRow label="Proje" value={task.projectTitle || '-'} />
        <DetailRow label="Oluşturulma" value={formatDate(task.createdTime)} />
        <DetailRow label="Başlangıç Tarihi" value={formatDate(task.startDate)} />
        <DetailRow
          label="Tamamlanma Tarihi"
          value={formatDate(task.completionDate)}
        />
        <View style={[webStyles.listItem, {borderLeftColor: colors.ink}]}>
          <Text style={webStyles.meta}>Atanan Kullanıcılar</Text>
          {task.assignedUsers.length > 0 ? (
            task.assignedUsers.map(user => (
              <Text key={user.id} style={[webStyles.listTitle, {marginTop: 6}]}>
                {user.name}
              </Text>
            ))
          ) : (
            <Text style={[webStyles.listTitle, {marginTop: 6}]}>
              Kullanıcı yok
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
