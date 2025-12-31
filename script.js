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
   DATA STORAGE (LOCAL)
================================ */
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

/* ===============================
   SAVE & LOAD
================================ */
function saveSubjects() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function loadSubjects() {
  subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  renderTable();
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
// loadSubjects();

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded → loading data");
  loadSubjects();
});
