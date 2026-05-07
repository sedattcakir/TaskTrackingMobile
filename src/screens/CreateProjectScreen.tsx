import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {createProject} from '../services/projectService';
import {RootStackParamList} from '../navigation/AppNavigator';
import {webStyles} from '../theme/webTheme';

type CreateProjectNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateProject'
>;

export default function CreateProjectScreen() {
  const navigation = useNavigation<CreateProjectNavigationProp>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (title.trim().length < 3) {
      Alert.alert('Hata', 'Proje adı en az 3 karakter olmalıdır.');
      return;
    }

    try {
      setSaving(true);
      await createProject({
        title: title.trim(),
        description: description.trim(),
      });

      Alert.alert('Başarılı', 'Proje oluşturuldu.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'Proje oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={webStyles.screen}>
      <ScrollView contentContainerStyle={webStyles.content}>
        <View style={webStyles.card}>
          <View style={webStyles.cardHeaderMid}>
            <Text style={webStyles.cardHeaderTitle}>Yeni Proje Ekle</Text>
          </View>

          <View style={webStyles.cardBody}>
            <View style={webStyles.formSection}>
              <Text style={webStyles.label}>Proje Adı *</Text>
              <TextInput
                style={webStyles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Proje adını giriniz"
                maxLength={100}
              />

              <Text style={webStyles.label}>Açıklama</Text>
              <TextInput
                style={[webStyles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Proje açıklamasını giriniz"
                maxLength={500}
                multiline
              />

              <TouchableOpacity
                style={webStyles.primaryButton}
                onPress={save}
                disabled={saving}>
                <Text style={webStyles.primaryButtonText}>
                  {saving ? 'Kaydediliyor...' : 'Proje Ekle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});
