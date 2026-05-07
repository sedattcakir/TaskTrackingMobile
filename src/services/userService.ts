import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export type UserItem = {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  role: 'Admin' | 'Personel';
  createdTime: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Personel';
  profileImage?: string | null;
};

function normalizeDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as {toDate: () => Date}).toDate().toISOString();
  }

  return typeof value === 'string' ? value : new Date().toISOString();
}

export async function getUsers(): Promise<UserItem[]> {
  const snapshot = await firestore().collection('users').orderBy('name').get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    const role: UserItem['role'] = data.role === 'Admin' ? 'Admin' : 'Personel';

    return {
      id: doc.id,
      name: String(data.name || ''),
      email: String(data.email || ''),
      profileImage:
        typeof data.profileImage === 'string' ? data.profileImage : null,
      role,
      createdTime: normalizeDate(data.createdTime),
    };
  });
}

export async function createUser(payload: CreateUserPayload) {
  const token = await auth().currentUser?.getIdToken();

  if (!token) {
    throw new Error('Oturum bulunamadı.');
  }

  const response = await fetch(
    'https://us-central1-tasktrackingmobile.cloudfunctions.net/createUserByAdmin',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
  const responseText = await response.text();
  let data: any = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      response.status === 403
        ? 'Kullanıcı oluşturma servisine erişim kapalı. Cloud Run Invoker izni verilmelidir.'
        : `Kullanıcı oluşturma servisi JSON dönmedi. HTTP ${response.status}`,
    );
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Kullanıcı oluşturulamadı.');
  }

  return {
    id: String(data.id),
    name: String(data.name || payload.name),
    email: String(data.email || payload.email),
    role: data.role === 'Admin' ? 'Admin' : 'Personel',
    profileImage:
      typeof data.profileImage === 'string' ? data.profileImage : null,
    createdTime:
      typeof data.createdTime === 'string'
        ? data.createdTime
        : new Date().toISOString(),
  };
}

export async function createUserProfileOnly(payload: CreateUserPayload) {
  const docRef = await firestore().collection('users').add({
    name: payload.name,
    email: payload.email,
    role: payload.role,
    profileImage: payload.profileImage || null,
    createdTime: firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: docRef.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    profileImage: payload.profileImage || null,
    createdTime: new Date().toISOString(),
  };
}

export async function deleteUser(id: string) {
  await firestore().collection('users').doc(id).delete();
  return {message: 'Kullanıcı silindi.'};
}
