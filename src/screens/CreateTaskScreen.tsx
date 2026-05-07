import React, {useMemo, useState, useEffect} from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {createTask} from '../services/taskService';
import {getProjects, ProjectItem} from '../services/projectService';
import {getUsers, UserItem} from '../services/userService';
import {colors, getPriorityText, webStyles} from '../theme/webTheme';

type DateTarget = 'start' | 'completion';

export default function CreateTaskScreen() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [userIds, setUserIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dateTarget, setDateTarget] = useState<DateTarget | null>(null);

  useEffect(() => {
    Promise.all([getProjects(), getUsers()])
      .then(([projectData, userData]) => {
        setProjects(projectData);
        setUsers(userData);
      })
      .catch(() => Alert.alert('Hata', 'Veriler yüklenemedi.'));
  }, []);

  const toggleUser = (id: string) => {
    setUserIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const openCalendar = (target: DateTarget) => {
    setDateTarget(target);
  };

  const setSelectedDate = (value: string) => {
    if (dateTarget === 'start') {
      setStartDate(value);
    }

    if (dateTarget === 'completion') {
      setCompletionDate(value);
    }

    setDateTarget(null);
  };

  const save = async () => {
    const normalizedStartDate = normalizeDateInput(startDate);
    const normalizedCompletionDate = normalizeDateInput(completionDate);

    if (title.trim().length < 5 || title.trim().length > 100) {
      Alert.alert('Hata', 'Başlık 5-100 karakter olmalıdır.');
      return;
    }

    if (
      description.trim() &&
      (description.trim().length < 10 || description.trim().length > 500)
    ) {
      Alert.alert('Hata', 'Açıklama 10-500 karakter olmalıdır.');
      return;
    }

    if (!projectId) {
      Alert.alert('Hata', 'Proje seçmelisiniz.');
      return;
    }

    if (userIds.length === 0) {
      Alert.alert('Hata', 'En az bir kullanıcı seçmelisiniz.');
      return;
    }

    if (startDate && !normalizedStartDate) {
      Alert.alert('Hata', 'Başlangıç tarihi GG/AA/YYYY formatında olmalıdır.');
      return;
    }

    if (completionDate && !normalizedCompletionDate) {
      Alert.alert('Hata', 'Tamamlanma tarihi GG/AA/YYYY formatında olmalıdır.');
      return;
    }

    if (
      normalizedStartDate &&
      normalizedCompletionDate &&
      normalizedStartDate > normalizedCompletionDate
    ) {
      Alert.alert('Hata', 'Başlangıç tarihi, tamamlanma tarihinden büyük olamaz.');
      return;
    }

    try {
      setSaving(true);
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        projectId,
        userIds,
        startDate: normalizedStartDate,
        completionDate: normalizedCompletionDate,
      });

      Alert.alert('Başarılı', 'Görev oluşturuldu.');
      setTitle('');
      setDescription('');
      setProjectId('');
      setUserIds([]);
      setPriority(1);
      setStartDate('');
      setCompletionDate('');
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'Görev oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={webStyles.screen}>
      <ScrollView contentContainerStyle={webStyles.content}>
        <View style={webStyles.card}>
          <View style={webStyles.cardHeaderDark}>
            <Text style={webStyles.cardHeaderTitle}>Yeni Görev Ekle</Text>
          </View>
          <View style={webStyles.cardBody}>
            <View style={webStyles.formSection}>
              <Text style={webStyles.label}>Görev Başlığı *</Text>
              <TextInput
                style={webStyles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Görev başlığını giriniz"
                maxLength={100}
              />

              <Text style={webStyles.label}>Proje *</Text>
              {projects.map(project => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.selectItem,
                    projectId === project.id && styles.selectItemSelected,
                  ]}
                  onPress={() => setProjectId(project.id)}>
                  <Text
                    style={[
                      styles.selectText,
                      projectId === project.id && styles.selectTextSelected,
                    ]}>
                    {project.title}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={webStyles.label}>Açıklama</Text>
              <TextInput
                style={[webStyles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Görev açıklamasını giriniz"
                maxLength={500}
                multiline
              />

              <Text style={webStyles.label}>Öncelik</Text>
              <View style={styles.optionRow}>
                {[0, 1, 2].map(value => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.option,
                      priority === value && styles.optionSelected,
                    ]}
                    onPress={() => setPriority(value)}>
                    <Text
                      style={[
                        styles.optionText,
                        priority === value && styles.optionSelectedText,
                      ]}>
                      {getPriorityText(value)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.dateRow}>
                <DateButton
                  label="Başlangıç Tarihi"
                  value={startDate}
                  placeholder="Başlangıç Tarihi Giriniz"
                  onPress={() => openCalendar('start')}
                  onClear={() => setStartDate('')}
                />
                <DateButton
                  label="Tamamlanma Tarihi"
                  value={completionDate}
                  placeholder="Tamamlanma Tarihi Giriniz"
                  onPress={() => openCalendar('completion')}
                  onClear={() => setCompletionDate('')}
                />
              </View>

              <Text style={webStyles.label}>Atanan Kullanıcılar *</Text>
              <View style={styles.userList}>
                {users.map(listUser => (
                  <TouchableOpacity
                    key={listUser.id}
                    style={[
                      styles.userItem,
                      userIds.includes(listUser.id) && styles.userItemSelected,
                    ]}
                    onPress={() => toggleUser(listUser.id)}>
                    <Text
                      style={[
                        styles.selectText,
                        userIds.includes(listUser.id) && styles.selectTextSelected,
                      ]}>
                      {listUser.name} - {listUser.email}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[webStyles.primaryButton, {marginTop: 14}]}
                onPress={save}
                disabled={saving}>
                <Text style={webStyles.primaryButtonText}>
                  {saving ? 'Kaydediliyor...' : 'Görev Ekle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <CalendarModal
        visible={dateTarget !== null}
        initialValue={dateTarget === 'start' ? startDate : completionDate}
        onClose={() => setDateTarget(null)}
        onSelect={setSelectedDate}
      />
    </SafeAreaView>
  );
}

function DateButton({
  label,
  value,
  placeholder,
  onPress,
  onClear,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <View style={styles.dateColumn}>
      <Text style={webStyles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateInput} onPress={onPress}>
        <Text style={[styles.dateInputText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      {value ? (
        <TouchableOpacity style={styles.clearDateButton} onPress={onClear}>
          <Text style={styles.clearDateText}>Temizle</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function CalendarModal({
  visible,
  initialValue,
  onClose,
  onSelect,
}: {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const initialDate = parseDisplayDate(initialValue) || new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  useEffect(() => {
    if (visible) {
      const nextDate = parseDisplayDate(initialValue) || new Date();
      setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    }
  }, [initialValue, visible]);

  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const monthTitle = visibleMonth.toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });

  const changeMonth = (direction: number) => {
    setVisibleMonth(
      current => new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => changeMonth(-1)}>
              <Text style={styles.monthButtonText}>{'‹'}</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthTitle}</Text>
            <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth(1)}>
              <Text style={styles.monthButtonText}>{'›'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
              <Text key={day} style={styles.weekText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              const value = formatDisplayDate(day);
              const selected = value === initialValue;

              return (
                <TouchableOpacity
                  key={`${value}-${index}`}
                  style={[styles.dayButton, selected && styles.dayButtonSelected]}
                  onPress={() => onSelect(value)}>
                  <Text
                    style={[
                      styles.dayText,
                      !isCurrentMonth && styles.dayTextMuted,
                      selected && styles.dayTextSelected,
                    ]}>
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={webStyles.primaryButton} onPress={onClose}>
            <Text style={webStyles.primaryButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function normalizeDateInput(value: string) {
  const date = parseDisplayDate(value);

  if (!date) {
    return null;
  }

  return date.toISOString();
}

function parseDisplayDate(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDisplayDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function buildCalendarDays(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const mondayBasedStart = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayBasedStart);

  return Array.from({length: 42}, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
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
  selectItem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  selectItemSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  selectText: {
    color: colors.ink,
    fontWeight: '500',
  },
  selectTextSelected: {
    color: colors.surface,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  dateColumn: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dateInputText: {
    color: colors.ink,
    fontSize: 14,
  },
  placeholderText: {
    color: colors.faint,
  },
  clearDateButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  clearDateText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  userList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.surface,
  },
  userItem: {
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  userItemSelected: {
    backgroundColor: colors.ink,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 34,
  },
  monthTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekText: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  dayButton: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  dayButtonSelected: {
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  dayText: {
    color: colors.ink,
    fontSize: 14,
  },
  dayTextMuted: {
    color: colors.faint,
  },
  dayTextSelected: {
    color: colors.surface,
    fontWeight: '700',
  },
});
