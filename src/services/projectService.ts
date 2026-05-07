import firestore from '@react-native-firebase/firestore';

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  createdTime: string;
};

export type CreateProjectPayload = {
  title: string;
  description: string;
};

function normalizeDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as {toDate: () => Date}).toDate().toISOString();
  }

  return typeof value === 'string' ? value : new Date().toISOString();
}

export async function getProjects() {
  const snapshot = await firestore()
    .collection('projects')
    .orderBy('createdTime', 'desc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      title: String(data.title || ''),
      description: String(data.description || ''),
      createdTime: normalizeDate(data.createdTime),
    };
  });
}

export async function createProject(payload: CreateProjectPayload) {
  const docRef = await firestore()
    .collection('projects')
    .add({
      title: payload.title,
      description: payload.description,
      createdTime: firestore.FieldValue.serverTimestamp(),
    });

  const doc = await docRef.get();
  const data = doc.data() || {};

  return {
    id: doc.id,
    title: String(data.title || payload.title),
    description: String(data.description || payload.description),
    createdTime: normalizeDate(data.createdTime),
  };
}

export async function deleteProject(id: string) {
  await firestore().collection('projects').doc(id).delete();
  return {message: 'Proje silindi.'};
}
