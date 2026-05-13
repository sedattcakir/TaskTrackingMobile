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
import {createUser, UserItem} from '../services/userService';
import {RootStackParamList} from '../navigation/AppNavigator';
import {colors, webStyles} from '../theme/webTheme';

type CreateUserNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateUser'
>;

export default function CreateUserScreen() {
  const navigation = useNavigation<CreateUserNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserItem['role']>('Personel');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (name.trim().length < 4) {
      Alert.alert('Hata', 'Ad soyad en az 4 karakter olmalıdır.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Hata', 'Geçerli bir e-posta giriniz.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setSaving(true);
      await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        profileImage: null,
      });

      Alert.alert('Başarılı', 'Kullanıcı oluşturuldu.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'Kullanıcı oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={webStyles.screen}>
      <ScrollView contentContainerStyle={webStyles.content}>
        <View style={webStyles.card}>
          <View style={webStyles.cardHeaderGray}>
            <Text style={webStyles.cardHeaderTitle}>Yeni Kullanıcı Ekle</Text>
          </View>

          <View style={webStyles.cardBody}>
            <View style={webStyles.formSection}>
              <Text style={webStyles.label}>Ad Soyad *</Text>
              <TextInput
                style={webStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Kullanıcı adını giriniz"
                maxLength={100}
              />

              <Text style={webStyles.label}>E-posta *</Text>
              <TextInput
                style={webStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={150}
              />

              <Text style={webStyles.label}>Şifre *</Text>
              <TextInput
                style={webStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="En az 6 karakter"
                secureTextEntry
                maxLength={64}
              />

              <Text style={webStyles.label}>Rol *</Text>
              <View style={styles.optionRow}>
                {(['Personel', 'Admin'] as UserItem['role'][]).map(value => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.option,
                      role === value && styles.optionSelected,
                    ]}
                    onPress={() => setRole(value)}>
                    <Text
                      style={[
                        styles.optionText,
                        role === value && styles.optionSelectedText,
                      ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={webStyles.primaryButton}
                onPress={save}
                disabled={saving}>
                <Text style={webStyles.primaryButtonText}>
                  {saving ? 'Kaydediliyor...' : 'Kullanıcı Ekle'}
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
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
});
