import React from 'react';
import {ActivityIndicator, SafeAreaView} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {useAuth} from '../context/AuthContext';
import {colors, webStyles} from '../theme/webTheme';

import LoginScreen from '../screens/LoginScreen';
import TasksScreen from '../screens/TasksScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import UsersScreen from '../screens/UsersScreen';
import AuditLogsScreen from '../screens/AuditLogsScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import CreateProjectScreen from '../screens/CreateProjectScreen';
import CreateUserScreen from '../screens/CreateUserScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  TaskDetail: {taskId: string};
  EditTask: {taskId: string};
  CreateTask: undefined;
  CreateProject: undefined;
  CreateUser: undefined;
};

export type MainTabParamList = {
  Tasks: undefined;
  Projects: undefined;
  Users: undefined;
  AuditLogs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const {user} = useAuth();
  const isAdmin = user?.role === 'Admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: {fontSize: 12, fontWeight: '700'},
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}>
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{tabBarLabel: 'Görevler'}}
      />

      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{tabBarLabel: 'Projeler'}}
      />

      {isAdmin ? (
        <>
          <Tab.Screen
            name="Users"
            component={UsersScreen}
            options={{tabBarLabel: 'Kullanıcılar'}}
          />

          <Tab.Screen
            name="AuditLogs"
            component={AuditLogsScreen}
            options={{tabBarLabel: 'İşlemler'}}
          />
        </>
      ) : null}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const {initializing, isAuthenticated} = useAuth();

  if (initializing) {
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
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.ink},
          headerTintColor: colors.surface,
          headerTitleStyle: {fontWeight: '700'},
        }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{headerShown: false}}
            />

            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{title: 'Görev Detayı'}}
            />

            <Stack.Screen
              name="EditTask"
              component={EditTaskScreen}
              options={{title: 'Görev Düzenle'}}
            />

            <Stack.Screen
              name="CreateTask"
              component={CreateTaskScreen}
              options={{title: 'Görev Oluştur'}}
            />

            <Stack.Screen
              name="CreateProject"
              component={CreateProjectScreen}
              options={{title: 'Proje Oluştur'}}
            />

            <Stack.Screen
              name="CreateUser"
              component={CreateUserScreen}
              options={{title: 'Kullanıcı Oluştur'}}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
