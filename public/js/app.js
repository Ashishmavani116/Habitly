// ===== CONFIG =====
const API = "/api";
const EMOJIS = ["💪", "📚", "🧘", "🏃", "💧", "🥗", "😴", "🎯", "🎨", "🧹"];
const COLORS = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#C77DFF",
  "#FF9A3C",
  "#00C9A7",
];

// ===== STATE =====
let habits = [];
let editingId = null;
let selectedEmoji = EMOJIS[0];
let selectedColor = COLORS[0];
let lineChart = null,
  barChart = null,
  radarChart = null;

// ===== UTILS =====
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}
function getToday() {
  return new Date().toISOString().split("T")[0];
}
function getShortDay(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
  });
}
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type}`;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    t.className = "toast hidden";
  }, 2500);
}

// ===== API CALLS =====
async function fetchHabits() {
  try {
    const res = await fetch(`${API}/habits`);
    habits = await res.json();
  } catch (e) {
    // fallback: use local array (no server)
    console.warn("Backend not connected, using local state.");
  }
  renderAll();
}

async function createHabit(data) {
  try {
    const res = await fetch(`${API}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const h = await res.json();
    habits.unshift(h);
  } catch {
    habits.unshift({
      _id: Date.now().toString(),
      ...data,
      streak: 0,
      history: {},
    });
  }
  renderAll();
}

async function updateHabit(id, data) {
  try {
    const res = await fetch(`${API}/habits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    habits = habits.map((h) => (h._id === id ? { ...h, ...updated } : h));
  } catch {
    habits = habits.map((h) => (h._id === id ? { ...h, ...data } : h));
  }
  renderAll();
}

async function toggleHabit(id) {
  const today = getToday();
  try {
    const res = await fetch(`${API}/habits/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today }),
    });
    const updated = await res.json();
    habits = habits.map((h) => (h._id === id ? updated : h));
  } catch {
    habits = habits.map((h) => {
      if (h._id !== id) return h;
      const done = !h.history[today];
      return {
        ...h,
        history: { ...h.history, [today]: done },
        streak: done ? h.streak + 1 : Math.max(0, h.streak - 1),
      };
    });
  }
  const h = habits.find((h) => h._id === id);
  if (h)
    showToast(
      h.history[today] ? `${h.emoji} Habit checked!` : `${h.emoji} Unchecked`,
    );
  renderAll();
}

async function deleteHabit(id) {
  try {
    await fetch(`${API}/habits/${id}`, { method: "DELETE" });
  } catch {}
  habits = habits.filter((h) => h._id !== id);
  showToast("Habit removed", "error");
  renderAll();
}

// ===== RENDER DASHBOARD =====
function renderDashboard() {
  const today = getToday();
  const last7 = getLast7Days();
  const total = habits.length;
  const done = habits.filter((h) => h.history && h.history[today]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const bestStreak = Math.max(...habits.map((h) => h.streak || 0), 0);

  document.getElementById("todayPct").textContent = pct + "%";
  document.getElementById("todaySub").textContent =
    `${done} of ${total} habits done`;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("totalHabits").textContent = total;
  document.getElementById("bestStreak").textContent = bestStreak + " days";

  const list = document.getElementById("habitList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  if (habits.length === 0) {
    list.appendChild(empty);
    empty.classList.remove("hidden");
    return;
  }

  habits.forEach((h) => {
    const isDone = !!(h.history && h.history[today]);
    const weekDone = last7.filter((d) => h.history && h.history[d]).length;
    const card = document.createElement("div");
    card.className = `habit-card ${isDone ? "done" : ""}`;
    card.style.setProperty("--habit-color", h.color);

    // glow on done
    const glow = isDone
      ? `<div class="habit-card-glow" style="background:radial-gradient(ellipse at left, ${h.color}18, transparent 60%)"></div>`
      : "";

    // week dots
    const dots = last7
      .map((d) => {
        const checked = h.history && h.history[d];
        return `<div class="week-dot" style="background:${checked ? h.color : "rgba(255,255,255,0.07)"};border-color:${checked ? h.color : "rgba(255,255,255,0.12)"};color:${checked ? "#fff" : "rgba(255,255,255,0.35)"}">
        ${checked ? "✓" : getShortDay(d)[0]}
      </div>`;
      })
      .join("");

    card.innerHTML = `
      ${glow}
      <div class="habit-card-inner">
        <button class="check-btn ${isDone ? "done" : ""}" style="border-color:${h.color};color:${isDone ? "#fff" : h.color};background:${isDone ? h.color : "transparent"}" data-id="${h._id}">
          ${isDone ? "✓" : h.emoji}
        </button>
        <div class="habit-info">
          <div class="habit-name ${isDone ? "done-text" : ""}">
            ${h.name}
            ${h.streak > 0 ? `<span class="streak-badge">🔥 ${h.streak} day streak</span>` : ""}
          </div>
          <div class="week-dots">${dots}</div>
          <div class="week-count">${weekDone}/7 this week</div>
        </div>
        <div class="habit-actions">
          <button class="icon-btn edit-btn" data-id="${h._id}">✏️</button>
          <button class="icon-btn delete-btn" data-id="${h._id}">🗑</button>
        </div>
      </div>`;
    list.appendChild(card);
  });

  // Events
  list.querySelectorAll(".check-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleHabit(btn.dataset.id));
  });
  list.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });
  list.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteHabit(btn.dataset.id));
  });
}

// ===== RENDER CHARTS =====
function renderCharts() {
  const last7 = getLast7Days();
  const labels = last7.map(getShortDay);
  const chartDefaults = {
    color: "rgba(255,255,255,0.6)",
    borderColor: "rgba(255,255,255,0.08)",
  };

  // Line chart
  const lineData = last7.map((d) => {
    const t = habits.length;
    const done = habits.filter((h) => h.history && h.history[d]).length;
    return t ? Math.round((done / t) * 100) : 0;
  });
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Completion %",
          data: lineData,
          borderColor: "#FFD93D",
          backgroundColor: "rgba(255,211,61,0.12)",
          borderWidth: 3,
          pointBackgroundColor: "#FFD93D",
          pointRadius: 5,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: chartOptions("Completion %", "%"),
  });

  // Bar chart
  const barDatasets = habits.map((h) => ({
    label: h.name,
    data: last7.map((d) => (h.history && h.history[d] ? 1 : 0)),
    backgroundColor: h.color + "cc",
    borderRadius: 4,
  }));
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: { labels, datasets: barDatasets },
    options: {
      ...chartOptions("Habits"),
      scales: {
        x: {
          stacked: true,
          ticks: { color: "rgba(255,255,255,0.6)" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y: {
          stacked: true,
          ticks: { color: "rgba(255,255,255,0.6)" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
      },
    },
  });

  // Radar chart
  if (radarChart) radarChart.destroy();
  radarChart = new Chart(document.getElementById("radarChart"), {
    type: "radar",
    data: {
      labels: habits.map((h) => h.emoji + " " + h.name.split(" ")[0]),
      datasets: [
        {
          label: "Days done",
          data: habits.map(
            (h) => last7.filter((d) => h.history && h.history[d]).length,
          ),
          borderColor: "#C77DFF",
          backgroundColor: "rgba(199,125,255,0.25)",
          borderWidth: 2,
          pointBackgroundColor: "#C77DFF",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: 7,
          ticks: { color: "rgba(255,255,255,0.5)", stepSize: 1 },
          grid: { color: "rgba(255,255,255,0.08)" },
          pointLabels: { color: "rgba(255,255,255,0.7)", font: { size: 12 } },
        },
      },
    },
  });

  // Scorecards
  const sc = document.getElementById("scorecards");
  sc.innerHTML =
    habits.length === 0
      ? '<div class="empty-state">No habits yet!</div>'
      : habits
          .map((h) => {
            const done = last7.filter((d) => h.history && h.history[d]).length;
            const p = Math.round((done / 7) * 100);
            return `<div class="scorecard-item">
          <div class="scorecard-row">
            <span>${h.emoji} ${h.name}</span>
            <span style="color:${h.color};font-weight:700">${done}/7</span>
          </div>
          <div class="scorecard-bar-wrap">
            <div class="scorecard-bar-fill" style="width:${p}%;background:${h.color}"></div>
          </div>
        </div>`;
          })
          .join("");
}

function chartOptions(label, unit = "") {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a3e",
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.7)",
        callbacks: unit ? { label: (ctx) => `${ctx.parsed.y}${unit}` } : {},
      },
    },
    scales: {
      x: {
        ticks: { color: "rgba(255,255,255,0.6)" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "rgba(255,255,255,0.6)" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };
}

// ===== RENDER AI INSIGHTS =====
function renderInsightStats() {
  const last7 = getLast7Days();
  const box = document.getElementById("insightStats");
  box.innerHTML = habits
    .map((h) => {
      const done = last7.filter((d) => h.history && h.history[d]).length;
      return `<div class="insight-stat-card" style="background:linear-gradient(135deg,${h.color}22,${h.color}11);border:1.5px solid ${h.color}44">
      <div style="font-size:22px">${h.emoji}</div>
      <div style="font-weight:700;font-size:14px;margin-top:4px">${h.name}</div>
      <div style="color:${h.color};font-weight:900;font-size:24px;margin-top:2px">${done}/7</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4)">days this week</div>
    </div>`;
    })
    .join("");
}

async function getInsights() {
  const btn = document.getElementById("getInsightsBtn");
  const loading = document.getElementById("insightLoading");
  const result = document.getElementById("insightResult");
  const placeholder = document.getElementById("insightPlaceholder");

  btn.disabled = true;
  btn.textContent = "✨ Analyzing your habits...";
  loading.classList.remove("hidden");
  result.classList.add("hidden");
  placeholder.classList.add("hidden");

  const last7 = getLast7Days();
  const habitsData = habits.map((h) => ({
    emoji: h.emoji,
    name: h.name,
    streak: h.streak || 0,
    weekDone: last7.filter((d) => h.history && h.history[d]).length,
  }));

  try {
    const res = await fetch(`${API}/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habits: habitsData }),
    });
    const data = await res.json();
    result.innerHTML = `
      <div class="ai-box-header">
        <span style="font-size:28px">🤖</span>
        <span class="ai-box-heading">llama's Analysis</span>
      </div>
      ${data.insight || data.error || "No response received."}`;
    result.classList.remove("hidden");
  } catch {
    result.innerHTML = `<div class="ai-box-header"><span style="font-size:28px">⚠️</span><span class="ai-box-heading">Could not connect to AI</span></div>Please check your server and API key.`;
    result.classList.remove("hidden");
  }

  loading.classList.add("hidden");
  btn.disabled = false;
  btn.textContent = "✨ Get AI Insights & Suggestions";
}

// ===== MODAL =====
function buildModalOptions() {
  // Emojis
  const eg = document.getElementById("emojiGrid");
  eg.innerHTML = EMOJIS.map(
    (e) =>
      `<button class="emoji-btn ${e === selectedEmoji ? "selected" : ""}" data-emoji="${e}">${e}</button>`,
  ).join("");
  eg.querySelectorAll(".emoji-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedEmoji = btn.dataset.emoji;
      eg.querySelectorAll(".emoji-btn").forEach((b) =>
        b.classList.remove("selected"),
      );
      btn.classList.add("selected");
    });
  });

  // Colors
  const cr = document.getElementById("colorRow");
  cr.innerHTML = COLORS.map(
    (c) =>
      `<div class="color-dot ${c === selectedColor ? "selected" : ""}" data-color="${c}" style="background:${c}"></div>`,
  ).join("");
  cr.querySelectorAll(".color-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      selectedColor = dot.dataset.color;
      cr.querySelectorAll(".color-dot").forEach((d) =>
        d.classList.remove("selected"),
      );
      dot.classList.add("selected");
    });
  });
}

function openAddModal() {
  editingId = null;
  selectedEmoji = EMOJIS[0];
  selectedColor = COLORS[0];
  document.getElementById("habitName").value = "";
  document.getElementById("modalTitle").textContent = "✨ New Habit";
  document.getElementById("saveHabit").textContent = "Add Habit 🚀";
  buildModalOptions();
  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("habitName").focus();
}

function openEditModal(id) {
  const h = habits.find((h) => h._id === id);
  if (!h) return;
  editingId = id;
  selectedEmoji = h.emoji;
  selectedColor = h.color;
  document.getElementById("habitName").value = h.name;
  document.getElementById("modalTitle").textContent = "✏️ Edit Habit";
  document.getElementById("saveHabit").textContent = "Save Changes";
  buildModalOptions();
  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("habitName").focus();
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
}

async function saveHabit() {
  const name = document.getElementById("habitName").value.trim();
  if (!name) {
    showToast("Please enter a habit name", "error");
    return;
  }
  if (editingId) {
    await updateHabit(editingId, {
      name,
      emoji: selectedEmoji,
      color: selectedColor,
    });
    showToast("Habit updated!");
  } else {
    await createHabit({ name, emoji: selectedEmoji, color: selectedColor });
    showToast("New habit added! 🎉");
  }
  closeModal();
}

// ===== RENDER ALL =====
function renderAll() {
  renderDashboard();
  const activeView = document.querySelector(".view.active");
  if (activeView && activeView.id === "view-charts") renderCharts();
  if (activeView && activeView.id === "view-insights") renderInsightStats();
}

// ===== NAV =====
function switchView(viewId) {
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.remove("active");
    v.classList.add("hidden");
  });
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("active");
  }

  document
    .querySelector(`.nav-btn[data-view="${viewId}"]`)
    ?.classList.add("active");

  if (viewId === "charts") renderCharts();
  if (viewId === "insights") renderInsightStats();
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  // Date label
  document.getElementById("dateLabel").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  // Nav
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  // Modal
  document
    .getElementById("openAddModal")
    .addEventListener("click", openAddModal);
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("saveHabit").addEventListener("click", saveHabit);
  document.getElementById("habitName").addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveHabit();
  });
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });

  // AI Insights
  document
    .getElementById("getInsightsBtn")
    .addEventListener("click", getInsights);

  // Fetch habits
  fetchHabits();
});
