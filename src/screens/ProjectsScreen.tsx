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
import {getProjects, ProjectItem} from '../services/projectService';
import {RootStackParamList} from '../navigation/AppNavigator';
import {colors, formatDate, webStyles} from '../theme/webTheme';

type ProjectsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateProject'
>;

export default function ProjectsScreen() {
  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setProjects(await getProjects());
    } catch (error: any) {
      setErrorMessage(error?.message || 'Projeler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, []),
  );

  return (
    <SafeAreaView style={webStyles.screen}>
      <FlatList
        data={loading ? [] : projects}
        keyExtractor={item => item.id}
        contentContainerStyle={webStyles.content}
        ListHeaderComponent={
          <View style={webStyles.card}>
            <View style={webStyles.cardHeaderMid}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                <Text style={webStyles.cardHeaderTitle}>
                  Projeler  ({projects.length})
                </Text>
                <TouchableOpacity
                  style={webStyles.outlineButton}
                  onPress={() => navigation.navigate('CreateProject')}>
                  <Text style={webStyles.outlineButtonText}>Yeni Proje</Text>
                </TouchableOpacity>
              </View>
            </View>
            {loading ? (
              <View style={webStyles.cardBody}>
                <ActivityIndicator size="large" color={colors.ink} />
                <Text style={webStyles.emptyState}>Projeler yükleniyor...</Text>
              </View>
            ) : errorMessage ? (
              <Text style={webStyles.emptyState}>{errorMessage}</Text>
            ) : null}
          </View>
        }
        renderItem={({item}) => (
          <View style={[webStyles.listItem, {borderLeftColor: colors.mid}]}>
            <Text style={webStyles.listTitle}>{item.title}</Text>
            {item.description ? (
              <Text style={webStyles.description}>{item.description}</Text>
            ) : null}
            <Text style={webStyles.meta}>
              Oluşturulma: {formatDate(item.createdTime)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading && !errorMessage ? (
            <Text style={webStyles.emptyState}>Henüz proje eklenmemiş</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
