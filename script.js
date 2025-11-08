// script.js

// Firebase ayarlarını buraya gir
const firebaseConfig = {
  apiKey: "AIzaSyAOWoR2vmyn_VxSnLJWBQXXhSb3GapeTas",
  authDomain: "mesajlar-99680.firebaseapp.com",
  databaseURL: "https://mesajlar-99680-default-rtdb.firebaseio.com",
  projectId: "mesajlar-99680",
  storageBucket: "mesajlar-99680.appspot.com",
  messagingSenderId: "72389173543",
  appId: "1:72389173543:web:4270a610b27cedbc844902"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

let username = "";

function login() {
  username = document.getElementById("username").value.trim();
  if (!username) return alert("Kullanıcı adı gir!");
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";
}

async function sendMessage() {
  const msgEl = document.getElementById("messageInput");
  const fileEl = document.getElementById("imageInput");
  const msg = msgEl.value.trim();
  const file = fileEl.files[0];

  if (!msg && !file) return;

  if (username.toLowerCase() === "eymen" && msg.toLowerCase() === "clear") {
    if (!confirm('Tüm mesajlar ve resimler silinecek. Emin misin?')) return;

    const snapshot = await db.ref('messages').once('value');
    const deletes = [];
    snapshot.forEach(child => {
      const val = child.val();
      if (val && val.storagePath) deletes.push(storage.ref(val.storagePath).delete().catch(()=>{}));
    });
    await Promise.all(deletes);
    await db.ref('messages').remove();

    document.getElementById('messages').innerHTML = '';
    msgEl.value = '';
    fileEl.value = '';
    return;
  }

  let imageUrl = null;
  let storagePath = null;
  if (file) {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    storagePath = `images/${timestamp}_${safeName}`;
    const ref = storage.ref(storagePath);
    const snapshot = await ref.put(file);
    imageUrl = await snapshot.ref.getDownloadURL();
  }

  db.ref('messages').push({
    user: username,
    text: msg || null,
    imageUrl: imageUrl || null,
    storagePath: storagePath || null,
    timestamp: Date.now()
  });

  msgEl.value = '';
  fileEl.value = '';
}

db.ref('messages').on('child_added', (snapshot) => {
  const data = snapshot.val();
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message';

  const meta = document.createElement('div');
  meta.className = 'meta';
  const when = data.timestamp ? new Date(data.timestamp).toLocaleString() : '';
  meta.textContent = `${data.user}${when ? ' — ' + when : ''}`;
  msgDiv.appendChild(meta);

  if (data.text) {
    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = data.text;
    msgDiv.appendChild(text);
  }

  if (data.imageUrl) {
    const a = document.createElement('a');
    a.href = data.imageUrl;
    a.target = '_blank';
    const img = document.createElement('img');
    img.src = data.imageUrl;
    img.alt = 'Gönderilen resim';
    a.appendChild(img);
    msgDiv.appendChild(a);
  }

  document.getElementById('messages').appendChild(msgDiv);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

db.ref('messages').on('value', (snapshot) => {
  if (!snapshot.exists()) {
    document.getElementById('messages').innerHTML = '';
  }
});
