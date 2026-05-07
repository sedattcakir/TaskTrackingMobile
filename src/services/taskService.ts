import firestore from '@react-native-firebase/firestore';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {getProjects} from './projectService';
import {getUsers} from './userService';
import {User} from '../types/auth';

export type AssignedUser = {
  id: string;
  name: string;
  profileImage?: string | null;
};

export type TaskItem = {
  id: string;
  title: string;
  description: string;
  statusCode: number;
  priority: number;
  completionDate: string | null;
  startDate: string | null;
  createdTime: string;
  projectId: string;
  projectTitle: string;
  assignedUsers: AssignedUser[];
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority: number;
  projectId: string;
  userIds: string[];
  completionDate: string | null;
  startDate: string | null;
};

export type UpdateTaskPayload = CreateTaskPayload & {
  statusCode: number;
};

function normalizeDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as {toDate: () => Date}).toDate().toISOString();
  }

  return typeof value === 'string' ? value : null;
}

function normalizeTask(
  id: string,
  data: FirebaseFirestoreTypes.DocumentData,
): TaskItem {
  return {
    id,
    title: String(data.title || ''),
    description: String(data.description || ''),
    statusCode: Number(data.statusCode ?? 0),
    priority: Number(data.priority ?? 1),
    completionDate: normalizeDate(data.completionDate),
    startDate: normalizeDate(data.startDate),
    createdTime: normalizeDate(data.createdTime) || new Date().toISOString(),
    projectId: String(data.projectId || ''),
    projectTitle: String(data.projectTitle || ''),
    assignedUsers: Array.isArray(data.assignedUsers)
      ? data.assignedUsers.map((user: any) => ({
          id: String(user.id || ''),
          name: String(user.name || ''),
          profileImage:
            typeof user.profileImage === 'string' ? user.profileImage : null,
        }))
      : [],
  };
}

async function buildTaskDocument(payload: CreateTaskPayload | UpdateTaskPayload) {
  const [projects, users] = await Promise.all([getProjects(), getUsers()]);
  const selectedProject = projects.find(project => project.id === payload.projectId);
  const assignedUsers = users
    .filter(user => payload.userIds.includes(user.id))
    .map(user => ({
      id: user.id,
      name: user.name,
      profileImage: user.profileImage || null,
    }));

  return {
    title: payload.title,
    description: payload.description || '',
    statusCode: 'statusCode' in payload ? payload.statusCode : 0,
    priority: payload.priority,
    projectId: payload.projectId,
    projectTitle: selectedProject?.title || '',
    assignedUserIds: payload.userIds,
    assignedUsers,
    completionDate: payload.completionDate || null,
    startDate: payload.startDate || null,
  };
}

export async function getTasks(currentUser?: User | null) {
  const snapshot = await firestore()
    .collection('tasks')
    .orderBy('createdTime', 'desc')
    .get();

  const tasks = snapshot.docs.map(doc => normalizeTask(doc.id, doc.data()));

  if (!currentUser || currentUser.role === 'Admin') {
    return tasks;
  }

  return tasks.filter(task =>
    task.assignedUsers.some(assignedUser => assignedUser.id === currentUser.id),
  );
}

export async function getTaskById(id: string) {
  const doc = await firestore().collection('tasks').doc(id).get();

  if (!doc.exists) {
    throw new Error('Görev bulunamadı.');
  }

  return normalizeTask(doc.id, doc.data() || {});
}

export async function createTask(payload: CreateTaskPayload) {
  const taskDocument = await buildTaskDocument(payload);
  const docRef = await firestore()
    .collection('tasks')
    .add({
      ...taskDocument,
      createdTime: firestore.FieldValue.serverTimestamp(),
    });

  return getTaskById(docRef.id);
}

export async function updateTask(id: string, payload: UpdateTaskPayload) {
  const taskDocument = await buildTaskDocument(payload);

  await firestore().collection('tasks').doc(id).update(taskDocument);
  return getTaskById(id);
}

export async function deleteTask(id: string) {
  await firestore().collection('tasks').doc(id).delete();
  return {message: 'Görev silindi.'};
}

export async function updateTaskAssignments(id: string, userIds: string[]) {
  const users = await getUsers();
  const assignedUsers = users
    .filter(user => userIds.includes(user.id))
    .map(user => ({
      id: user.id,
      name: user.name,
      profileImage: user.profileImage || null,
    }));

  await firestore().collection('tasks').doc(id).update({
    assignedUserIds: userIds,
    assignedUsers,
  });

  return {message: 'Atamalar güncellendi.'};
}
