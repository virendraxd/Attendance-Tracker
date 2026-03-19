/* ===============================
   SCRIPT LOAD CHECK
================================ */
console.log("script.js loaded ✅");
 
/* ===============================
   INPUT REFERENCES
================================ */
const subjectName = document.getElementById("subjectName");
const subjectCode = document.getElementById("subjectCode");
const teacherName = document.getElementById("teacherName");

/* ===============================
   ADD SUBJECT TOGGLE
================================ */
let addSubVisible = true;

function toggleAddSubject() {
  const body = document.getElementById("addSubjectBody");
  const btn = document.getElementById("toggleAddSubBtn");

  addSubVisible = !addSubVisible;
  body.style.display = addSubVisible ? "block" : "none";
  btn.innerText = addSubVisible ? "➖" : "➕";
}

/* ===============================
   FIREBASE CONFIGURATION
================================ */
// TODO: Replace this with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBL-X0y5ve2Uqa7ESamuXLmAPVMSwhpf8M",
  authDomain: "attendance-tracker-c5721.firebaseapp.com",
  databaseURL: "https://attendance-tracker-c5721-default-rtdb.firebaseio.com",
  projectId: "attendance-tracker-c5721",
  storageBucket: "attendance-tracker-c5721.firebasestorage.app",
  messagingSenderId: "373910652258",
  appId: "1:373910652258:web:6da21ce1c9c68a5908183b"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const database = firebase.database();
let subjectsRef = null;
let currentUser = null;

/* ===============================
   AUTHENTICATION
================================ */
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch((error) => {
    console.error("Login failed:", error);
    alert("Could not log in. Check console for details.");
  });
}

function logout() {
  auth.signOut().catch((error) => {
    console.error("Logout failed:", error);
  });
}

auth.onAuthStateChanged((user) => {
  const loginSection = document.getElementById("loginSection");
  const appSection = document.getElementById("appSection");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    // User is logged in
    currentUser = user;
    loginSection.style.display = "none";
    appSection.style.display = "block";
    logoutBtn.style.display = "block";
    
    // Create a new reference dedicated to this matched user
    subjectsRef = database.ref(`attendance_tracker_users/${user.uid}/subjects`);
    loadSubjects();
  } else {
    // User is logged out
    currentUser = null;
    loginSection.style.display = "block";
    appSection.style.display = "none";
    logoutBtn.style.display = "none";
    
    // Clean up past listeners so errors don't trigger when logged out
    if (subjectsRef) {
      subjectsRef.off("value");
    }
    subjectsRef = null;
    subjects = [];
    renderTable();
  }
});
/* ===============================
   DATA STORAGE (FIREBASE)
================================ */
let subjects = [];

/* ===============================
   SAVE & LOAD
================================ */
function saveSubjects() {
  if (!subjectsRef) return;
  subjectsRef.set(subjects).catch((error) => {
    console.error("Error saving data to Firebase:", error);
    alert("Could not save to Firebase. Check console for details.");
  });
}

function loadSubjects() {
  if (!subjectsRef) return;
  subjectsRef.on("value", (snapshot) => {
    const data = snapshot.val();
    subjects = data || [];
    renderTable();
  }, (error) => {
    console.error("Error loading data from Firebase:", error);
    alert("Could not load from Firebase. Check console for details.");
  });
}

/* ===============================
   ADD SUBJECT
================================ */
function addSubject() {
  console.log("Add Subject clicked");

  const name = subjectName.value.trim();
  const code = subjectCode.value.trim();
  const teacher = teacherName.value.trim();

  if (!name || !code || !teacher) {
    alert("Fill all fields");
    return;
  }

  subjects.push({
    id: Date.now(), // simple unique id
    name,
    code,
    teacher,
    total: 0,
    attended: 0
  });

  saveSubjects();
  clearInputs();
  renderTable();
}

/* ===============================
   ATTENDANCE ACTIONS
================================ */
function markPresent(index) {
  subjects[index].total++;
  subjects[index].attended++;
  saveSubjects();
  renderTable();
}

function markAbsent(index) {
  subjects[index].total++;
  saveSubjects();
  renderTable();
}

/* ===============================
   TABLE RENDER
================================ */
function calculatePercentage(sub) {
  if (sub.total === 0) return "0.00";
  return ((sub.attended / sub.total) * 100).toFixed(2);
}

function renderTable() {
  const table = document.getElementById("subjectTable");
  table.innerHTML = "";

  let totalClasses = 0;
  let totalAttended = 0;

  subjects.forEach((sub, index) => {
    totalClasses += sub.total;
    totalAttended += sub.attended;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <strong>${sub.name}</strong><br>
        <small>${sub.code}</small>
      </td>
      <td>${sub.teacher}</td>
      <td>${sub.total}</td>
      <td>${sub.attended}</td>
      <td>${calculatePercentage(sub)}%</td>
      <td>
        <button class="present" onclick="markPresent(${index})">P</button>
        <button class="absent" onclick="markAbsent(${index})">A</button><br><br>
        <button onclick="moveUp(${index})">⬆</button>
        <button onclick="moveDown(${index})">⬇</button>
        <button onclick="deleteSubject(${index})">🗑</button>
      </td>
    `;
    table.appendChild(row);
  });

  document.getElementById("totalClassesCell").innerText = totalClasses;
  document.getElementById("totalAttendedCell").innerText = totalAttended;
  document.getElementById("overallPercentCell").innerText =
    totalClasses
      ? ((totalAttended / totalClasses) * 100).toFixed(2) + "%"
      : "0%";
}

/* ===============================
   DELETE & REORDER
================================ */
function deleteSubject(index) {
  if (!confirm("Delete this subject?")) return;
  subjects.splice(index, 1);
  saveSubjects();
  renderTable();
}

function moveUp(index) {
  if (index === 0) return;
  [subjects[index - 1], subjects[index]] =
    [subjects[index], subjects[index - 1]];
  saveSubjects();
  renderTable();
}

function moveDown(index) {
  if (index === subjects.length - 1) return;
  [subjects[index + 1], subjects[index]] =
    [subjects[index], subjects[index + 1]];
  saveSubjects();
  renderTable();
}

/* ===============================
   HELPERS
================================ */
function clearInputs() {
  subjectName.value = "";
  subjectCode.value = "";
  teacherName.value = "";
}

/* ===============================
   INITIAL LOAD
================================ */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded → waiting for authentication state...");
});
