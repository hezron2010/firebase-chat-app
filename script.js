//////////////////////////////////////////
// Firebase Config
//////////////////////////////////////////
const firebaseConfig = {
  apiKey: "AIzaSyAjxwNdNF5JAbIChfqwebECBq7jgCgiBJQ",
  authDomain: "todo-task-manager-e9345.firebaseapp.com",
  projectId: "todo-task-manager-e9345",
  storageBucket: "todo-task-manager-e9345.firebasestorage.app",
  messagingSenderId: "820683070310",
  appId: "1:820683070310:web:36ea0b4f6cdd0feb0906a7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

//////////////////////////////////////////
// AUTH FUNCTIONS
//////////////////////////////////////////
function register() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert("Registered successfully!"))
        .catch(error => alert(error.message));
}

function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
}

function logout() {
    auth.signOut();
}

//////////////////////////////////////////
// AUTH STATE LISTENER
//////////////////////////////////////////
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("chat-section").style.display = "block";
        loadMessages();
    } else {
        currentUser = null;
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("chat-section").style.display = "none";
    }
});

//////////////////////////////////////////
// SEND MESSAGE
//////////////////////////////////////////
function sendMessage() {
    if (!currentUser) return;

    const input = document.getElementById("message-input");
    const text = input.value.trim();

    if (text === "") return;

    db.collection("messages").add({
        text: text,
        user: currentUser.email,
        uid: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(error => console.error("Error sending message:", error));

    input.value = "";
}

//////////////////////////////////////////
// LOAD MESSAGES (REAL-TIME)
//////////////////////////////////////////
function loadMessages() {
    db.collection("messages")
      .orderBy("createdAt")
      .onSnapshot(snapshot => {
          const messagesDiv = document.getElementById("messages");
          messagesDiv.innerHTML = "";

          snapshot.forEach(doc => {
              const message = doc.data();

              const div = document.createElement("div");
              div.classList.add("message");
              div.innerHTML = `<span>${message.user}:</span> ${message.text}`;

              messagesDiv.appendChild(div);
          });

          // Auto-scroll to bottom
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
      });
}

//////////////////////////////////////////
// ENTER KEY SEND
//////////////////////////////////////////
window.onload = function() {
    document.getElementById("message-input")
        .addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                sendMessage();
            }
        });
};
