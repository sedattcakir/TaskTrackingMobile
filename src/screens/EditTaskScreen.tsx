import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import {getTaskById, updateTask} from '../services/taskService';
import {getProjects, ProjectItem} from '../services/projectService';
import {getUsers, UserItem} from '../services/userService';
import {useAuth} from '../context/AuthContext';
import {
  colors,
  getPriorityText,
  getStatusText,
  webStyles,
} from '../theme/webTheme';

type EditTaskScreenRouteProp = RouteProp<RootStackParamList, 'EditTask'>;

type Props = {
  route: EditTaskScreenRouteProp;
};

const statusOptions = [0, 1, 2];
const priorityOptions = [0, 1, 2];

export default function EditTaskScreen({route}: Props) {
  const {taskId} = route.params;
  const {user} = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusCode, setStatusCode] = useState(0);
  const [priority, setPriority] = useState(1);
  const [projectId, setProjectId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [task, projectData, userData] = await Promise.all([
          getTaskById(taskId),
          getProjects(),
          getUsers(),
        ]);

        setProjects(projectData);
        setUsers(userData);
        setTitle(task.title);
        setDescription(task.description || '');
        setStatusCode(task.statusCode);
        setPriority(task.priority);
        setProjectId(task.projectId);
        setSelectedUserIds(task.assignedUsers.map(assignedUser => assignedUser.id));
      } catch (error: any) {
        Alert.alert('Hata', error?.message || 'Görev bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [taskId]);

  const selectedProject = useMemo(
    () => projects.find(project => project.id === projectId) || null,
    [projects, projectId],
  );

  const selectedUsers = useMemo(
    () => users.filter(listUser => selectedUserIds.includes(listUser.id)),
    [users, selectedUserIds],
  );

  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    return query
      ? projects.filter(project => project.title.toLowerCase().includes(query))
      : projects;
  }, [projects, projectSearch]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return query
      ? users.filter(
          listUser =>
            listUser.name.toLowerCase().includes(query) ||
            listUser.email.toLowerCase().includes(query),
        )
      : users;
  }, [users, userSearch]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSave = async () => {
    if (isAdmin) {
      if (title.trim().length < 5 || title.trim().length > 100) {
        Alert.alert('Hata', 'Başlık 5-100 karakter olmalıdır.');
        return;
      }

      if (!projectId) {
        Alert.alert('Hata', 'Lütfen bir proje seçin.');
        return;
      }

      if (
        description.trim() &&
        (description.trim().length < 10 || description.trim().length > 500)
      ) {
        Alert.alert('Hata', 'Açıklama 10-500 karakter olmalıdır.');
        return;
      }

      if (selectedUserIds.length === 0) {
        Alert.alert('Hata', 'En az bir kullanıcı seçmelisiniz.');
        return;
      }
    }

    try {
      setSaving(true);
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim(),
        statusCode,
        priority,
        projectId,
        userIds: selectedUserIds,
        startDate: null,
        completionDate: null,
      });
      Alert.alert('Başarılı', 'Görev güncellendi.');
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'Görev güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <SafeAreaView style={webStyles.screen}>
      <ScrollView contentContainerStyle={webStyles.content}>
        <View style={webStyles.card}>
          <View style={webStyles.cardHeaderDark}>
            <Text style={webStyles.cardHeaderTitle}>
              {isAdmin ? 'Görev Düzenle' : 'Durum Güncelle'}
            </Text>
          </View>
          <View style={webStyles.cardBody}>
            <View style={webStyles.formSection}>
              <Text style={webStyles.label}>Görev Başlığı *</Text>
              {isAdmin ? (
                <TextInput
                  style={webStyles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Görev başlığını giriniz"
                  maxLength={100}
                />
              ) : (
                <View style={styles.readonlyBox}>
                  <Text style={styles.readonlyText}>{title}</Text>
                </View>
              )}

              <Text style={webStyles.label}>Açıklama</Text>
              {isAdmin ? (
                <TextInput
                  style={[webStyles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Görev açıklamasını giriniz"
                  maxLength={500}
                  multiline
                />
              ) : (
                <View style={styles.readonlyBox}>
                  <Text style={styles.readonlyText}>
                    {description || 'Açıklama yok'}
                  </Text>
                </View>
              )}

              <Text style={webStyles.label}>Durum</Text>
              <View style={styles.optionRow}>
                {statusOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.option,
                      statusCode === option && styles.optionSelected,
                    ]}
                    onPress={() => setStatusCode(option)}>
                    <Text
                      style={[
                        styles.optionText,
                        statusCode === option && styles.optionSelectedText,
                      ]}>
                      {getStatusText(option)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {isAdmin ? (
                <>
                  <Text style={webStyles.label}>Öncelik</Text>
                  <View style={styles.optionRow}>
                    {priorityOptions.map(option => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.option,
                          priority === option && styles.optionSelected,
                        ]}
                        onPress={() => setPriority(option)}>
                        <Text
                          style={[
                            styles.optionText,
                            priority === option && styles.optionSelectedText,
                          ]}>
                          {getPriorityText(option)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={webStyles.label}>Proje *</Text>
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setProjectModalVisible(true)}>
                    <Text style={styles.selectorText}>
                      {selectedProject ? selectedProject.title : 'Proje seç'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={webStyles.label}>Seçili Kullanıcılar</Text>
                  <View style={styles.chipWrap}>
                    {selectedUsers.length > 0 ? (
                      selectedUsers.map(selectedUser => (
                        <View key={selectedUser.id} style={styles.chip}>
                          <Text style={styles.chipText}>{selectedUser.name}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={webStyles.description}>
                        Henüz kullanıcı seçilmedi.
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.selector, {marginTop: 8}]}
                    onPress={() => setUserModalVisible(true)}>
                    <Text style={styles.selectorText}>Kullanıcı seç</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={webStyles.label}>Öncelik</Text>
                  <View style={styles.readonlyBox}>
                    <Text style={styles.readonlyText}>
                      {getPriorityText(priority)}
                    </Text>
                  </View>

                  <Text style={webStyles.label}>Proje</Text>
                  <View style={styles.readonlyBox}>
                    <Text style={styles.readonlyText}>
                      {selectedProject?.title || 'Proje bulunamadı'}
                    </Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[webStyles.primaryButton, {marginTop: 16}]}
                onPress={handleSave}
                disabled={saving}>
                <Text style={webStyles.primaryButtonText}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <SelectionModal
        visible={projectModalVisible}
        title="Proje Seç"
        searchValue={projectSearch}
        searchPlaceholder="Proje ara"
        onSearchChange={setProjectSearch}
        onClose={() => setProjectModalVisible(false)}
        data={filteredProjects}
        keyExtractor={item => item.id}
        renderLabel={item => item.title}
        onSelect={item => {
          setProjectId(item.id);
          setProjectModalVisible(false);
          setProjectSearch('');
        }}
      />

      <SelectionModal
        visible={userModalVisible}
        title="Kullanıcı Seç"
        searchValue={userSearch}
        searchPlaceholder="Kullanıcı ara"
        onSearchChange={setUserSearch}
        onClose={() => {
          setUserModalVisible(false);
          setUserSearch('');
        }}
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderLabel={item => `${item.name} - ${item.email}`}
        isSelected={item => selectedUserIds.includes(item.id)}
        onSelect={item => toggleUser(item.id)}
      />
    </SafeAreaView>
  );
}

type SelectionModalProps<T> = {
  visible: boolean;
  title: string;
  searchValue: string;
  searchPlaceholder: string;
  data: T[];
  onSearchChange: (value: string) => void;
  onClose: () => void;
  keyExtractor: (item: T) => string;
  renderLabel: (item: T) => string;
  onSelect: (item: T) => void;
  isSelected?: (item: T) => boolean;
};

function SelectionModal<T>({
  visible,
  title,
  searchValue,
  searchPlaceholder,
  data,
  onSearchChange,
  onClose,
  keyExtractor,
  renderLabel,
  onSelect,
  isSelected,
}: SelectionModalProps<T>) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={webStyles.input}
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
          />
          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={({item}) => {
              const selected = isSelected?.(item) || false;

              return (
                <TouchableOpacity
                  style={[styles.modalItem, selected && styles.modalItemSelected]}
                  onPress={() => onSelect(item)}>
                  <Text
                    style={[
                      styles.modalItemText,
                      selected && styles.modalItemTextSelected,
                    ]}>
                    {renderLabel(item)}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={webStyles.emptyState}>Kayıt bulunamadı.</Text>
            }
          />
          <TouchableOpacity style={webStyles.primaryButton} onPress={onClose}>
            <Text style={webStyles.primaryButtonText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  textArea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  optionText: {
    color: colors.ink,
    fontWeight: '600',
  },
  optionSelectedText: {
    color: colors.surface,
  },
  selector: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectorText: {
    color: colors.ink,
    fontWeight: '500',
  },
  readonlyBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  readonlyText: {
    color: colors.ink,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#eeeeee',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: colors.gray,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    maxHeight: '78%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 16,
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.softBorder,
    paddingVertical: 13,
    paddingHorizontal: 8,
  },
  modalItemSelected: {
    backgroundColor: colors.ink,
  },
  modalItemText: {
    color: colors.ink,
  },
  modalItemTextSelected: {
    color: colors.surface,
    fontWeight: '700',
  },
});
