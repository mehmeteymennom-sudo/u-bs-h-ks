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

let username = "";
const userColors = {};
const colorClasses = ['user-color-0','user-color-1','user-color-2','user-color-3','user-color-4'];

function login() {
  username = document.getElementById("username").value.trim();
  if (!username) return alert("Kullanıcı adı gir!");
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";
}

function sendMessage() {
  const msg = document.getElementById("messageInput").value.trim();
  if (msg === "") return;

  if (username.toLowerCase() === "eymen" && msg.toLowerCase() === "clear") {
    db.ref("messages").remove();
    document.getElementById("messages").innerHTML = "";
    document.getElementById("messageInput").value = "";
    return;
  }

  db.ref("messages").push({
    user: username,
    text: msg
  });
  document.getElementById("messageInput").value = "";
}

db.ref("messages").on("child_added", (snapshot) => {
  const data = snapshot.val();
  const msgDiv = document.createElement("div");
  msgDiv.className = 'message';

  if(!userColors[data.user]) {
    const colorIndex = Object.keys(userColors).length % colorClasses.length;
    userColors[data.user] = colorClasses[colorIndex];
  }
  msgDiv.classList.add(userColors[data.user]);

  const userSpan = document.createElement("span");
  userSpan.className = "user";
  userSpan.textContent = data.user;
  msgDiv.appendChild(userSpan);

  const textDiv = document.createElement("div");
  textDiv.className = "text";
  textDiv.textContent = data.text;
  msgDiv.appendChild(textDiv);

  document.getElementById("messages").appendChild(msgDiv);
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
});

db.ref("messages").on("value", (snapshot) => {
  if (!snapshot.exists()) {
    document.getElementById("messages").innerHTML = "";
  }
});
