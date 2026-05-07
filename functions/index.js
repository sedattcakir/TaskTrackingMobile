const {onRequest} = require('firebase-functions/https');
const {initializeApp} = require('firebase-admin/app');
const {getAuth} = require('firebase-admin/auth');
const {FieldValue, getFirestore} = require('firebase-admin/firestore');

initializeApp();

const db = getFirestore();

function setCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

async function requireAdmin(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/);

  if (!match) {
    const error = new Error('Oturum bilgisi eksik.');
    error.status = 401;
    throw error;
  }

  const decodedToken = await getAuth().verifyIdToken(match[1]);
  const userDoc = await db.collection('users').doc(decodedToken.uid).get();
  const user = userDoc.data();

  if (!userDoc.exists || user?.role !== 'Admin') {
    const error = new Error('Bu işlem için admin yetkisi gerekir.');
    error.status = 403;
    throw error;
  }

  return {uid: decodedToken.uid, email: decodedToken.email || user.email || ''};
}

exports.createUserByAdmin = onRequest({region: 'us-central1'}, async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({message: 'Sadece POST isteği desteklenir.'});
    return;
  }

  try {
    const adminUser = await requireAdmin(req);
    const {name, email, password, role, profileImage} = req.body || {};

    if (!name || !email || !password) {
      res.status(400).json({message: 'Ad, email ve şifre zorunludur.'});
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      res.status(400).json({
        message: 'Şifre en az 8 karakter, 1 büyük harf ve 1 rakam içermelidir.',
      });
      return;
    }

    const normalizedRole = role === 'Admin' ? 'Admin' : 'Personel';
    const authUser = await getAuth().createUser({
      email,
      password,
      displayName: name,
      disabled: false,
    });

    const userPayload = {
      name,
      email,
      role: normalizedRole,
      profileImage: profileImage || null,
      createdTime: FieldValue.serverTimestamp(),
      createdBy: adminUser.uid,
    };

    await db.collection('users').doc(authUser.uid).set(userPayload);
    await db.collection('auditLogs').add({
      userEmail: adminUser.email,
      action: `Personel eklendi: ${email}`,
      ipAddress: req.ip || null,
      timestamp: FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      id: authUser.uid,
      ...userPayload,
      createdTime: new Date().toISOString(),
    });
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || '';

    if (code === 'auth/email-already-exists') {
      res.status(400).json({message: 'Bu email zaten kullanılıyor.'});
      return;
    }

    res.status(status).json({
      message: error.message || 'Kullanıcı oluşturulamadı.',
    });
  }
});
