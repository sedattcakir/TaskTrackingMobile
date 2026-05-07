import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {User} from '../types/auth';

type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

function normalizeDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as {toDate: () => Date}).toDate().toISOString();
  }

  return typeof value === 'string' ? value : undefined;
}

export async function getUserProfile(uid: string): Promise<User> {
  const userDoc = await firestore().collection('users').doc(uid).get();

  if (!userDoc.exists) {
    throw new Error('Kullanıcı profili bulunamadı.');
  }

  const data = userDoc.data() || {};

  return {
    id: uid,
    name: String(data.name || ''),
    email: String(data.email || ''),
    role: data.role === 'Admin' ? 'Admin' : 'Personel',
    profileImage:
      typeof data.profileImage === 'string' ? data.profileImage : null,
    createdTime: normalizeDate(data.createdTime),
  };
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const credential = await auth().signInWithEmailAndPassword(
    payload.email,
    payload.password,
  );
  const token = await credential.user.getIdToken();
  const user = await getUserProfile(credential.user.uid);

  return {token, user};
}

export async function logoutRequest() {
  await auth().signOut();
}
