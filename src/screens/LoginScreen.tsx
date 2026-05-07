import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {useAuth} from '../context/AuthContext';
import {colors, webStyles} from '../theme/webTheme';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const {login} = useAuth();
  const [loading, setLoading] = useState(false);

  const {control, handleSubmit} = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.loginWrap}>
        <View style={webStyles.card}>
          <View style={webStyles.cardHeaderDark}>
            <Text style={webStyles.cardHeaderTitle}>Görev Takip Sistemi</Text>
            <Text style={webStyles.appSubtitle}>Görevlerinizi kolayca yönetin</Text>
          </View>

          <View style={webStyles.cardBody}>
            <View style={webStyles.formSection}>
              <Text style={styles.formTitle}>Giriş Yap</Text>

              <Text style={webStyles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                rules={{required: 'Email zorunludur'}}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <>
                    <TextInput
                      style={webStyles.input}
                      placeholder="Email giriniz"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    {error ? <Text style={styles.error}>{error.message}</Text> : null}
                  </>
                )}
              />

              <Text style={webStyles.label}>Şifre</Text>
              <Controller
                control={control}
                name="password"
                rules={{required: 'Şifre zorunludur'}}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <>
                    <TextInput
                      style={webStyles.input}
                      placeholder="Şifre giriniz"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                    />
                    {error ? <Text style={styles.error}>{error.message}</Text> : null}
                  </>
                )}
              />

              <TouchableOpacity
                style={webStyles.primaryButton}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={webStyles.primaryButtonText}>Giriş Yap</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...webStyles.screen,
    justifyContent: 'center',
    padding: 18,
  },
  loginWrap: {
    width: '100%',
  },
  formTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    marginBottom: 10,
  },
});
