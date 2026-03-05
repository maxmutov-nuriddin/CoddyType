import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  limit,
  onSnapshot
} from "firebase/firestore";

export function initMonkeyType() {
  "use strict";

  const FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
    apiKey: "AIzaSyAAoC8TV9dP0mhzccUZTpPNE1yPn4xAHa0",
    authDomain: "monkeytype-ff36d.firebaseapp.com",
    projectId: "monkeytype-ff36d",
    storageBucket: "monkeytype-ff36d.firebasestorage.app",
    messagingSenderId: "270224867954",
    appId: "1:270224867954:web:e42ebc683021ab9d32b8eb",
    measurementId: "G-EZ25MD36MK"
  };

  const SVG_NS = "http://www.w3.org/2000/svg";
  const STORAGE_KEY = "monkeytype_clone_settings_v3";
  const SESSION_KEY = "monkeytype_has_session";
  const MODE_PRESETS = { time: [15, 30, 60, 120], words: [10, 25, 50, 100] };
  const DEFAULT_SETTINGS = { mode: "time", time: 15, words: 25, punctuation: false, numbers: false, customText: "" };

  const WORDS = "ability about above accept across action active actual advice after again agent agree ahead allow almost alone along already always amount animal answer appear apply argue around arrive artist aspect attack author autumn available avoid aware balance basic become before begin behind believe benefit better between beyond border bottom branch budget build business camera cancel capital career carry center chance change charge choice choose citizen civil claim class clear client close coach color common company compare complete concern connect consider contact contain content control corner correct course create credit culture current damage debate decide define degree demand design detail develop device digital direct discuss doctor driver during easily economy effect effort either enable energy engine enough entire equal escape event exact example exchange exist expect expert explain factor family feature federal fellow field figure final finance finish flight focus follow force forget formal forward friend future garden general global ground group growth handle health heart heavy history holiday honest human identify impact improve include income increase indeed inform inside instead interest invite issue journey judge knowledge language large leader learn level likely listen little local machine major manage market matter measure memory message middle minute modern moment money month moral mother motion nation native nature network notice number object observe occur offer office online option origin output owner paper parent people period person phone photo place planet player policy popular position power prepare present pretty prevent price primary private problem process product program project proper provide public purpose quality quick radio raise range rather reach reason record reduce reflect region relate remain remove report result return reveal review right river safety school science screen search season secure select senior series service settle share short should simple single sister skill small social source space special spirit spring staff stage standard start state station status story street strong student style subject success sudden summer supply support system table target teacher theory thing think thread today topic total toward trade travel treat trend trouble truth under union unique update useful value various vehicle version victory video visit voice wait watch water wealth weight window winter within wonder worker world writer yellow young".split(" ");
  const EASY_WORDS = WORDS.filter((w) => w.length <= 7);
  const QUOTES = [
    "The only way to do great work is to love what you do.",
    "Simplicity is the ultimate sophistication.",
    "Any sufficiently advanced technology is indistinguishable from magic.",
    "Programs must be written for people to read, and only incidentally for machines to execute.",
    "First solve the problem, then write the code.",
    "Code is like humor. When you have to explain it, it is bad.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Do not wait. The time will never be just right.",
    "Action is the foundational key to all success.",
    "If you can dream it, you can do it."
  ];
  const PUNCT_END = [".", ",", "!", "?", ";", ":"];
  const PUNCT_WRAP = [["\"", "\""], ["(", ")"], ["[", "]"], ["'", "'"]];

  const el = {
    page: document.querySelector(".page"),
    modeBar: document.getElementById("modeBar"),
    words: document.getElementById("words"),
    wrap: document.getElementById("typingWrap"),
    caret: document.getElementById("smoothCaret"),
    input: document.getElementById("hiddenInput"),
    restart: document.getElementById("restartBtn"),
    resultLine: document.getElementById("result"),
    liveTime: document.getElementById("liveTime"),
    resultActions: document.querySelector(".result-actions"),
    wpm: document.getElementById("resultWpm"),
    acc: document.getElementById("resultAcc"),
    raw: document.getElementById("resultRaw"),
    chars: document.getElementById("resultChars"),
    consistency: document.getElementById("resultConsistency"),
    time: document.getElementById("resultTime"),
    timeMeta: document.getElementById("resultTimeMeta"),
    testType: document.getElementById("resultTestType"),
    chart: document.getElementById("resultChart"),
    chartGrid: document.getElementById("chartGrid"),
    chartRaw: document.getElementById("chartRaw"),
    chartWpm: document.getElementById("chartWpm"),
    chartRawDots: document.getElementById("chartRawDots"),
    chartWpmDots: document.getElementById("chartWpmDots"),
    chartErrors: document.getElementById("chartErrors"),
    hoverLine: document.getElementById("chartHoverLine"),
    hoverDotRaw: document.getElementById("chartHoverDotRaw"),
    hoverDotWpm: document.getElementById("chartHoverDotWpm"),
    tooltip: document.getElementById("chartTooltip"),
    authGate: document.getElementById("authGate"),
    authMessage: document.getElementById("authMessage"),
    showRegisterBtn: document.getElementById("showRegisterBtn"),
    showLoginBtn: document.getElementById("showLoginBtn"),
    registerForm: document.getElementById("registerForm"),
    loginForm: document.getElementById("loginForm"),
    regGroup: document.getElementById("regGroup"),
    regFirstName: document.getElementById("regFirstName"),
    regLastName: document.getElementById("regLastName"),
    regPassword: document.getElementById("regPassword"),
    regPasswordConfirm: document.getElementById("regPasswordConfirm"),
    loginFirstName: document.getElementById("loginFirstName"),
    loginLastName: document.getElementById("loginLastName"),
    loginGroup: document.getElementById("loginGroup"),
    loginPassword: document.getElementById("loginPassword"),
    logoutBtn: document.getElementById("logoutBtn"),
    profileBtn: document.getElementById("profileBtn"),
    userModal: document.getElementById("userModal"),
    userModalName: document.getElementById("userModalName"),
    adminToggleBtn: document.getElementById("adminToggleBtn"),
    adminPage: document.getElementById("adminPage"),
    adminTableBody: document.getElementById("adminTableBody"),
    adminEmpty: document.getElementById("adminEmpty"),
    adminLoading: document.getElementById("adminLoading"),
    refreshAdminBtn: document.getElementById("refreshAdminBtn"),
    adminSearch: document.getElementById("adminSearch"),
    adminGroupFilter: document.getElementById("adminGroupFilter"),
    apStatTotal: document.getElementById("apStatTotal"),
    apStatAvgWpm: document.getElementById("apStatAvgWpm"),
    apStatTopWpm: document.getElementById("apStatTopWpm"),
    apStatAvgAcc: document.getElementById("apStatAvgAcc"),
    authLoading: document.getElementById("authLoading"),
    authLoadingText: document.getElementById("authLoadingText"),
    pageLoading: document.getElementById("pageLoading"),
    apConfig: document.getElementById("apConfig"),
    saveConfigBtn: document.getElementById("saveConfigBtn")
  };
  if (!el.page || !el.modeBar || !el.words || !el.input) return;

  const modeItems = [...el.modeBar.querySelectorAll(".mode-item")];
  const optionItems = [...el.modeBar.querySelectorAll(".time-item")];
  const modeSeps = [...el.modeBar.querySelectorAll(".mode-sep")];
  const findMode = (name) => modeItems.find((m) => (m.textContent || "").toLowerCase().includes(name)) || null;
  const modeButtons = {
    punctuation: findMode("punctuation"),
    numbers: findMode("numbers"),
    time: findMode("time"),
    words: findMode("words"),
    quote: findMode("quote"),
    zen: findMode("zen"),
    custom: findMode("custom")
  };
  const tailIcon = modeItems.find((m) => !m.querySelector("span")) || null;

  let settings = loadSettings();
  let timeLeft = settings.time;
  let timerId = null;
  let startedAt = 0;
  let finished = false;
  let targetText = "";
  let charSpans = [];
  let extraSpans = [];
  let correctness = [];
  let lastTyped = "";
  let lastCaretInputIndex = 0;
  let lastCaretCharIndex = 0;
  let rafPending = false;
  let tabHeld = false;
  let lastCorrectCount = 0;
  let sampleSecond = 0;
  let previousTotalErrors = 0;
  let secondWpm = [];
  let secondRaw = [];
  let secondErrors = [];
  let chartHoverData = [];
  let chartGridInfo = null;
  let currentUser = null;
  let currentProfile = null;
  let authReady = false;
  let firebaseApp = null;
  let auth = null;
  let db = null;
  let adminPanelOpen = false;
  let configUnsubscribe = null;
  let adminAllRows = [];   // cache of all user docs
  let adminSortCol = "maxWpm";
  let adminSortAsc = false;
  let wordsTranslateY = 0;
  let currentLineOffsetTop = -1;
  let cachedLineHeight = 0;

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      return {
        mode: ["time", "words", "quote", "zen", "custom"].includes(parsed.mode) ? parsed.mode : DEFAULT_SETTINGS.mode,
        time: MODE_PRESETS.time.includes(parsed.time) ? parsed.time : DEFAULT_SETTINGS.time,
        words: MODE_PRESETS.words.includes(parsed.words) ? parsed.words : DEFAULT_SETTINGS.words,
        punctuation: !!parsed.punctuation,
        numbers: !!parsed.numbers,
        customText: typeof parsed.customText === "string" ? parsed.customText : ""
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  const saveSettings = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  const isInfinite = () => settings.mode === "time" || settings.mode === "zen";
  const isFinite = () => !isInfinite();
  const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const fmt2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  const nowElapsed = () => (startedAt ? Math.max(0, (Date.now() - startedAt) / 1000) : 0);
  const fmtSession = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return hh + ":" + mm + ":" + ss;
  };

  const hasFirebaseConfig = () =>
    Object.values(FIREBASE_CONFIG).every((v) => typeof v === "string" && v.trim().length > 0);

  const TRANSLIT = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
    'з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o',
    'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
    'ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
  };
  const normalizeLogin = (value) =>
    value.trim().toLowerCase().replace(/\s+/g, "")
      .split("").map(c => TRANSLIT[c] ?? c).join("")
      .replace(/[^a-z0-9]/g, "");
  const buildLogin = (firstName, lastName, group) =>
    normalizeLogin(firstName) + normalizeLogin(lastName) + normalizeLogin(group);
  const loginToEmail = (login) => normalizeLogin(login) + "@school.local";
  const isAdminUser = () => currentProfile?.role === "admin";

  function setAuthFormLoading(on, text) {
    el.authGate?.classList.toggle("submitting", on);
    if (el.authLoadingText) el.authLoadingText.textContent = text || "Обработка...";
  }

  function setAuthMessage(text, isError) {
    if (!el.authMessage) return;
    el.authMessage.textContent = text || "";
    el.authMessage.style.color = isError ? "var(--error-color)" : "var(--sub-color)";
  }

  function setAuthMode(mode) {
    const registerActive = mode === "register";
    el.showRegisterBtn?.classList.toggle("active", registerActive);
    el.showLoginBtn?.classList.toggle("active", !registerActive);
    el.registerForm?.classList.toggle("hidden", !registerActive);
    el.loginForm?.classList.toggle("hidden", registerActive);
    setAuthMessage("", false);
  }

  function setAuthLocked(locked) {
    el.authGate?.classList.toggle("hidden", !locked);
    el.page.classList.toggle("auth-locked", locked);
    if (locked) {
      el.input.blur();
    } else {
      el.input.focus();
    }
  }

  function formatUserName(profile) {
    if (!profile) return "guest";
    const full = (profile.firstName || "") + " " + (profile.lastName || "");
    return full.trim() || profile.login || "user";
  }

  function setAdminView(on) {
    adminPanelOpen = on;
    el.page.classList.toggle("admin-view", on);
    el.adminPage?.classList.toggle("hidden", !on);
  }

  function renderSessionUi() {
    if (el.userModalName) {
      el.userModalName.textContent = currentUser ? formatUserName(currentProfile) : "guest";
    }
    el.logoutBtn?.classList.toggle("hidden", !currentUser);
    el.adminToggleBtn?.classList.toggle("hidden", !currentUser || !isAdminUser());
    if (!currentUser || !isAdminUser()) {
      setAdminView(false);
    }
  }

  async function ensureUserProfile(user, fallbackLogin) {
    if (!db || !user) return null;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    const login = normalizeLogin(fallbackLogin || user.email?.split("@")[0] || "user");
    const profile = {
      login,
      firstName: "",
      lastName: "",
      group: "",
      role: login === "admin" ? "admin" : "student",
      maxWpm: 0,
      maxAcc: 0,
      maxRaw: 0,
      restartCount: 0,
      lastWpm: 0,
      lastAcc: 0,
      lastRaw: 0,
      lastResultAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(ref, profile, { merge: true });
    return profile;
  }

  function mapFirebaseError(error) {
    const code = error?.code || "";
    if (code.includes("email-already-in-use")) return "Login already exists.";
    if (code.includes("invalid-email")) return "Invalid login.";
    if (code.includes("weak-password")) return "Password is too short (min 6 chars).";
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
      return "Invalid login or password.";
    }
    return "Firebase error: " + (error?.message || "unknown");
  }

  async function loadAdminTable() {
    if (!db || !isAdminUser() || !el.adminTableBody) return;
    // show loading state
    el.adminTableBody.innerHTML = "";
    el.adminEmpty?.classList.add("hidden");
    el.adminLoading?.classList.remove("hidden");
    el.refreshAdminBtn?.classList.add("loading");
    ["apStatTotal","apStatAvgWpm","apStatTopWpm","apStatAvgAcc"].forEach(id => {
      const el2 = document.getElementById(id);
      if (el2) { el2.textContent = "—"; el2.classList.add("ap-skel"); }
    });
    try {
      const q = query(collection(db, "users"), orderBy("maxWpm", "desc"), limit(500));
      const snap = await getDocs(q);
      adminAllRows = snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.role !== "admin");
      renderAdminStats(adminAllRows);
      populateGroupFilter(adminAllRows);
      renderAdminRows();
    } finally {
      el.adminLoading?.classList.add("hidden");
      el.refreshAdminBtn?.classList.remove("loading");
      ["apStatTotal","apStatAvgWpm","apStatTopWpm","apStatAvgAcc"].forEach(id => {
        document.getElementById(id)?.classList.remove("ap-skel");
      });
    }
  }

  function renderAdminStats(rows) {
    const total = rows.length;
    const wpms = rows.map(u => Number(u.maxWpm || 0)).filter(v => v > 0);
    const accs = rows.map(u => Number(u.maxAcc || 0)).filter(v => v > 0);
    const avgWpm = wpms.length ? wpms.reduce((a, b) => a + b, 0) / wpms.length : 0;
    const topWpm = wpms.length ? Math.max(...wpms) : 0;
    const avgAcc = accs.length ? accs.reduce((a, b) => a + b, 0) / accs.length : 0;
    if (el.apStatTotal) el.apStatTotal.textContent = total || "—";
    if (el.apStatAvgWpm) el.apStatAvgWpm.textContent = wpms.length ? fmt2(avgWpm) : "—";
    if (el.apStatTopWpm) el.apStatTopWpm.textContent = wpms.length ? fmt2(topWpm) : "—";
    if (el.apStatAvgAcc) el.apStatAvgAcc.textContent = accs.length ? fmt2(avgAcc) + "%" : "—";
  }

  function populateGroupFilter(rows) {
    if (!el.adminGroupFilter) return;
    const groups = [...new Set(rows.map(u => u.group || "").filter(Boolean))].sort();
    const current = el.adminGroupFilter.value;
    el.adminGroupFilter.innerHTML = "<option value=\"\">Все группы</option>" +
      groups.map(g => `<option value="${g}"${g === current ? " selected" : ""}>${g}</option>`).join("");
  }

  function renderAdminRows() {
    if (!el.adminTableBody) return;
    const search = (el.adminSearch?.value || "").toLowerCase().trim();
    const group = el.adminGroupFilter?.value || "";

    let rows = adminAllRows.filter(u => {
      if (group && (u.group || "") !== group) return false;
      if (search) {
        const name = ((u.firstName || "") + " " + (u.lastName || "")).toLowerCase();
        if (!name.includes(search)) return false;
      }
      return true;
    });

    // sort
    rows.sort((a, b) => {
      let av, bv;
      if (adminSortCol === "name") {
        av = ((a.firstName || "") + " " + (a.lastName || "")).toLowerCase();
        bv = ((b.firstName || "") + " " + (b.lastName || "")).toLowerCase();
      } else if (adminSortCol === "group") {
        av = (a.group || "").toLowerCase();
        bv = (b.group || "").toLowerCase();
      } else if (adminSortCol === "lastResultAt") {
        av = a.lastResultAt?.toMillis ? a.lastResultAt.toMillis() : 0;
        bv = b.lastResultAt?.toMillis ? b.lastResultAt.toMillis() : 0;
      } else {
        av = Number(a[adminSortCol] || 0);
        bv = Number(b[adminSortCol] || 0);
      }
      if (av < bv) return adminSortAsc ? -1 : 1;
      if (av > bv) return adminSortAsc ? 1 : -1;
      return 0;
    });

    el.adminTableBody.innerHTML = "";
    if (!rows.length) {
      el.adminEmpty?.classList.remove("hidden");
      return;
    }
    el.adminEmpty?.classList.add("hidden");

    const topWpm = Math.max(...rows.map(u => Number(u.maxWpm || 0)));

    rows.forEach((u, i) => {
      const tr = document.createElement("tr");
      const lastAt = u.lastResultAt?.toDate ? u.lastResultAt.toDate() : null;
      const isTop = topWpm > 0 && Number(u.maxWpm || 0) === topWpm;
      if (isTop) tr.classList.add("ap-row-top");
      tr.innerHTML =
        `<td class="ap-rank">${i + 1}</td>` +
        "<td>" + ((u.firstName || "") + " " + (u.lastName || "")).trim() + "</td>" +
        "<td>" + (u.group || "—") + "</td>" +
        `<td class="ap-wpm-val">${fmt2(Number(u.maxWpm || 0))}</td>` +
        "<td>" + fmt2(Number(u.maxAcc || 0)) + "%</td>" +
        "<td>" + fmt2(Number(u.maxRaw || 0)) + "</td>" +
        "<td>" + Number(u.restartCount || 0) + "</td>" +
        "<td>" + (lastAt ? lastAt.toLocaleString() : "—") + "</td>" +
        `<td class="ap-actions">
          <button class="ap-action-btn ap-reset-btn" title="Обнулить статистику" data-uid="${u.uid}">
            <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/></svg>
          </button>
          <button class="ap-action-btn ap-delete-btn" title="Удалить ученика" data-uid="${u.uid}">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </td>`;
      el.adminTableBody.appendChild(tr);
    });

    // update sort icons on headers
    el.adminPage?.querySelectorAll(".ap-th").forEach(th => {
      th.classList.toggle("sorted-asc", th.dataset.col === adminSortCol && adminSortAsc);
      th.classList.toggle("sorted-desc", th.dataset.col === adminSortCol && !adminSortAsc);
    });
  }

  async function resetStudentStats(uid) {
    if (!db || !isAdminUser()) return;
    try {
      await updateDoc(doc(db, "users", uid), {
        maxWpm: 0, maxAcc: 0, maxRaw: 0,
        lastWpm: 0, lastAcc: 0, lastRaw: 0,
        restartCount: 0, lastResultAt: null, updatedAt: serverTimestamp()
      });
      adminAllRows = adminAllRows.map(u => u.uid === uid
        ? { ...u, maxWpm: 0, maxAcc: 0, maxRaw: 0, lastWpm: 0, lastAcc: 0, lastRaw: 0, restartCount: 0, lastResultAt: null }
        : u);
      // if this is the currently logged-in student's own profile, reset local cache too
      if (currentUser && currentUser.uid === uid && currentProfile) {
        currentProfile.maxWpm = 0; currentProfile.maxAcc = 0; currentProfile.maxRaw = 0;
        currentProfile.lastWpm = 0; currentProfile.lastAcc = 0; currentProfile.lastRaw = 0;
        currentProfile.restartCount = 0; currentProfile.lastResultAt = null;
      }
      renderAdminStats(adminAllRows);
      renderAdminRows();
    } catch (err) {
      console.error("[Admin] Reset failed:", err);
      alert("Ошибка сброса: " + (err?.message || err));
    }
  }

  async function deleteStudent(uid) {
    if (!db || !isAdminUser()) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      adminAllRows = adminAllRows.filter(u => u.uid !== uid);
      populateGroupFilter(adminAllRows);
      renderAdminStats(adminAllRows);
      renderAdminRows();
    } catch (err) {
      console.error("[Admin] Delete failed:", err);
      alert("Ошибка удаления: " + (err?.message || err));
    }
  }

  async function persistRestartCount() {
    if (!db || !currentUser) return;
    try {
      const ref = doc(db, "users", currentUser.uid);
      await updateDoc(ref, {
        restartCount: increment(1),
        updatedAt: serverTimestamp()
      });
      if (currentProfile) {
        currentProfile.restartCount = Number(currentProfile.restartCount || 0) + 1;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function persistResultSnapshot(snapshot) {
    if (!db || !currentUser || !snapshot) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const maxWpm = Math.max(Number(currentProfile?.maxWpm || 0), Number(snapshot.wpm || 0));
      const maxAcc = Math.max(Number(currentProfile?.maxAcc || 0), Number(snapshot.acc || 0));
      const maxRaw = Math.max(Number(currentProfile?.maxRaw || 0), Number(snapshot.raw || 0));
      await addDoc(collection(db, "results"), {
        uid: currentUser.uid,
        login: currentProfile?.login || "",
        firstName: currentProfile?.firstName || "",
        lastName: currentProfile?.lastName || "",
        wpm: snapshot.wpm,
        raw: snapshot.raw,
        acc: snapshot.acc,
        chars: snapshot.chars,
        mode: snapshot.mode,
        duration: snapshot.duration,
        elapsed: snapshot.elapsed,
        createdAt: serverTimestamp()
      });
      await updateDoc(userRef, {
        maxWpm,
        maxAcc,
        maxRaw,
        lastWpm: snapshot.wpm,
        lastAcc: snapshot.acc,
        lastRaw: snapshot.raw,
        lastResultAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      if (currentProfile) {
        currentProfile.maxWpm = maxWpm;
        currentProfile.maxAcc = maxAcc;
        currentProfile.maxRaw = maxRaw;
        currentProfile.lastWpm = snapshot.wpm;
      }
      if (adminPanelOpen && isAdminUser()) {
        await loadAdminTable();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function applyConfigSnapshot(cfg) {
    if (["time","words","quote","zen","custom"].includes(cfg.mode)) settings.mode = cfg.mode;
    if (MODE_PRESETS.time.includes(cfg.time)) settings.time = cfg.time;
    if (MODE_PRESETS.words.includes(cfg.words)) settings.words = cfg.words;
    settings.punctuation = !!cfg.punctuation;
    settings.numbers = !!cfg.numbers;
    saveSettings();
    renderControls();
    renderAdminConfig();
    resetTest("config-sync");
  }

  function loadGlobalConfig() {
    if (!db) return;
    if (configUnsubscribe) configUnsubscribe();
    configUnsubscribe = onSnapshot(
      doc(db, "config", "global"),
      (snap) => {
        if (snap.exists()) applyConfigSnapshot(snap.data());
        else renderAdminConfig();
      },
      (err) => {
        console.error("[Config] snapshot error:", err.code);
        if (isAdminUser()) {
          const label = el.apConfig?.querySelector(".ap-config-label");
          if (label) label.textContent = "⚠ Ошибка доступа к config/global — обнови Firestore Rules";
        }
      }
    );
  }

  async function saveGlobalConfig() {
    if (!db || !isAdminUser()) return;
    await setDoc(doc(db, "config", "global"), {
      mode: settings.mode,
      time: settings.time,
      words: settings.words,
      punctuation: settings.punctuation,
      numbers: settings.numbers
    });
  }

  function renderAdminConfig() {
    if (!el.apConfig) return;
    el.apConfig.querySelectorAll(".ap-cfg-mode").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === settings.mode);
    });
    const timeVal = String(settings.mode === "words" ? settings.words : settings.time);
    el.apConfig.querySelectorAll(".ap-cfg-time").forEach(btn => {
      const show = settings.mode === "time" || settings.mode === "words";
      btn.style.display = show ? "" : "none";
      btn.classList.toggle("active", btn.dataset.time === timeVal);
    });
    el.apConfig.querySelectorAll(".ap-cfg-sep").forEach((sep, i) => {
      if (i === 1) {
        const show = settings.mode === "time" || settings.mode === "words";
        sep.style.display = show ? "" : "none";
      }
    });
    el.apConfig.querySelector("[data-toggle='punctuation']")?.classList.toggle("active", settings.punctuation);
    el.apConfig.querySelector("[data-toggle='numbers']")?.classList.toggle("active", settings.numbers);
  }

  async function setupFirebaseAuth() {
    if (!hasFirebaseConfig()) {
      el.authGate?.classList.remove("loading");
      setAuthLocked(true);
      setAuthMode("register");
      setAuthMessage("Fill FIREBASE_CONFIG in js/app.js or set window.FIREBASE_CONFIG.", true);
      return;
    }
    try {
      firebaseApp = initializeApp(FIREBASE_CONFIG);
      auth = getAuth(firebaseApp);
      db = getFirestore(firebaseApp);
      onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        el.authGate?.classList.remove("loading");
        if (!user) {
          el.pageLoading?.classList.add("hidden");
          localStorage.removeItem(SESSION_KEY);
          currentProfile = null;
          renderSessionUi();
          setAuthLocked(true);
          return;
        }
        localStorage.setItem(SESSION_KEY, "true");
        try {
          currentProfile = await ensureUserProfile(user);
          renderSessionUi();
          el.page.classList.toggle("ctrl-locked", !isAdminUser());
          setAuthLocked(false);
          loadGlobalConfig();
          resetTest("init");
          if (isAdminUser()) {
            setAdminView(true);
            await loadAdminTable();
          }
        } catch (err) {
          console.error("[Auth] Profile load error:", err);
          currentProfile = null;
          renderSessionUi();
          setAuthLocked(false);
          resetTest("init");
          setAuthMessage("Ошибка профиля (Firestore): " + (err?.message || "unknown"), true);
        } finally {
          el.pageLoading?.classList.add("hidden");
        }
      });
    } catch (err) {
      el.authGate?.classList.remove("loading");
      setAuthLocked(true);
      setAuthMode("register");
      setAuthMessage("Firebase init failed: " + (err?.message || "unknown"), true);
    }
  }

  const toggleTyping = (on) => el.page.classList.toggle("typing-active", on);
  const toggleTimerRun = (on) => el.page.classList.toggle("timer-running", on);

  function token() {
    const pool = EASY_WORDS.length ? EASY_WORDS : WORDS;
    let t = settings.numbers && Math.random() < 0.12 ? String(rint(0, 9999)) : pool[rint(0, pool.length - 1)];
    if (settings.punctuation) {
      if (Math.random() < 0.08) {
        const p = PUNCT_WRAP[rint(0, PUNCT_WRAP.length - 1)];
        t = p[0] + t + p[1];
      }
      if (Math.random() < 0.24) t += PUNCT_END[rint(0, PUNCT_END.length - 1)];
      if (Math.random() < 0.03) t += "...";
    }
    return t;
  }

  function buildWords(n) {
    const out = [];
    const c = Math.max(1, n | 0);
    for (let i = 0; i < c; i += 1) out.push(token());
    return out.join(" ");
  }

  function chooseQuote() {
    const scored = QUOTES.map((q) => ({ q, d: Math.abs(q.trim().split(/\s+/).length - settings.words) })).sort((a, b) => a.d - b.d);
    const top = scored.slice(0, Math.min(6, scored.length));
    return top[rint(0, top.length - 1)].q;
  }

  function askCustom(force) {
    const current = settings.customText.trim();
    if (!force && current.length >= 3) return current;
    const input = window.prompt("Enter custom text for typing:", current);
    if (input === null) return null;
    const clean = input.trim();
    if (clean.length < 3) return current.length >= 3 ? current : null;
    return clean;
  }

  function buildByMode() {
    if (settings.mode === "time") return buildWords(220);
    if (settings.mode === "words") return buildWords(settings.words);
    if (settings.mode === "quote") return chooseQuote();
    if (settings.mode === "zen") return buildWords(260);
    if (settings.mode === "custom") {
      const text = askCustom(false);
      if (text === null) {
        settings.mode = "time";
        saveSettings();
        return buildWords(220);
      }
      settings.customText = text;
      saveSettings();
      return text;
    }
    return buildWords(220);
  }

  const getWpm = () => {
    if (!startedAt) return 0;
    const min = Math.max(nowElapsed() / 60, 1 / 60);
    return Math.max(0, (lastCorrectCount / 5) / min);
  };
  const getRaw = () => {
    if (!startedAt) return 0;
    const min = Math.max(nowElapsed() / 60, 1 / 60);
    return Math.max(0, (el.input.value.length / 5) / min);
  };
  const getExtra = () => (isFinite() ? Math.max(0, el.input.value.length - targetText.length) : 0);
  const getIncorrect = () => {
    const lim = Math.min(el.input.value.length, targetText.length);
    let bad = 0;
    for (let i = 0; i < lim; i += 1) if (correctness[i] === 0) bad += 1;
    return bad;
  };
  const getAcc = () => {
    const typed = el.input.value.length;
    if (!typed) return 100;
    return Math.max(0, (lastCorrectCount / typed) * 100);
  };
  const getConsistency = () => {
    if (secondWpm.length < 2) return 100;
    const mean = secondWpm.reduce((a, b) => a + b, 0) / secondWpm.length;
    if (mean <= 0.01) return 100;
    const variance = secondWpm.reduce((a, v) => a + (v - mean) * (v - mean), 0) / secondWpm.length;
    const std = Math.sqrt(variance);
    return Math.max(0, Math.min(100, 100 - (std / mean) * 100));
  };

  function updateLiveTime() {
    el.liveTime.textContent = settings.mode === "time" ? String(Math.max(0, Math.ceil(timeLeft))) : "";
  }

  function testTypeLabel() {
    if (settings.mode === "time") return "time " + settings.time + "<br>english";
    if (settings.mode === "words") return "words " + settings.words + "<br>english";
    if (settings.mode === "quote") return "quote<br>english";
    if (settings.mode === "zen") return "zen<br>english";
    return "custom<br>english";
  }

  function calcLineHeight() {
    if (cachedLineHeight > 0) return cachedLineHeight;
    if (charSpans.length > 1) {
      const top0 = charSpans[0].offsetTop;
      for (let i = 1; i < charSpans.length; i++) {
        if (charSpans[i].offsetTop > top0) {
          cachedLineHeight = charSpans[i].offsetTop - top0;
          return cachedLineHeight;
        }
      }
    }
    cachedLineHeight = parseFloat(getComputedStyle(el.words).fontSize) * 1.78;
    return cachedLineHeight;
  }

  function syncSmoothCaret(index) {
    if (!el.caret) return;
    if (!charSpans.length || finished) {
      el.caret.style.opacity = "0";
      return;
    }
    const safe = Math.max(0, Math.min(index, charSpans.length - 1));
    const span = charSpans[safe];
    if (!span) return;
    const x = span.offsetLeft - 3;
    const y = span.offsetTop + wordsTranslateY + 7;
    const h = Math.max(20, Math.round(span.getBoundingClientRect().height * 0.72));
    el.caret.style.height = h + "px";
    el.caret.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
    el.caret.style.opacity = "0.95";
  }

  function syncLiveTimePosition() {
    if (!el.liveTime || !el.wrap) return;
    const left = el.wrap.offsetLeft;
    const top = Math.max(0, el.wrap.offsetTop - 66);
    const width = el.wrap.offsetWidth;
    el.liveTime.style.left = left + "px";
    el.liveTime.style.top = top + "px";
    el.liveTime.style.width = width + "px";
  }

  function clearExtras() {
    for (const s of extraSpans) s.remove();
    extraSpans = [];
  }

  function drawExtras(text) {
    clearExtras();
    if (!text) return;
    const frag = document.createDocumentFragment();
    const out = [];
    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "char incorrect extra";
      span.textContent = ch;
      if (ch === " ") span.classList.add("incorrect-space");
      out.push(span);
      frag.appendChild(span);
    }
    el.words.appendChild(frag);
    extraSpans = out;
  }

  function renderText(text) {
    targetText = text;
    el.words.innerHTML = "";
    charSpans = [];
    correctness = [];
    clearExtras();
    const frag = document.createDocumentFragment();
    for (const ch of targetText) {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;
      frag.appendChild(span);
      charSpans.push(span);
      correctness.push(0);
    }
    el.words.appendChild(frag);
    if (charSpans[0]) charSpans[0].classList.add("current");
    lastTyped = "";
    lastCaretInputIndex = 0;
    lastCaretCharIndex = 0;
    syncSmoothCaret(0);
  }

  function appendWords(n) {
    const words = buildWords(n);
    if (!words) return;
    const prefix = targetText.length > 0 && !targetText.endsWith(" ") ? " " : "";
    const chunk = prefix + words;
    targetText += chunk;
    const frag = document.createDocumentFragment();
    for (const ch of chunk) {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;
      frag.appendChild(span);
      charSpans.push(span);
      correctness.push(0);
    }
    el.words.appendChild(frag);
  }

  function ensureBuffer() {
    if (!isInfinite() || finished) return;
    if (targetText.length - el.input.value.length < 180) appendWords(120);
  }

  function svg(name) {
    return document.createElementNS(SVG_NS, name);
  }

  function renderGrid(points, maxY) {
    const width = 1120, height = 260, left = 36, right = 20, top = 14, bottom = 30;
    const plotWidth = width - left - right, plotHeight = height - top - bottom;
    const safeCount = Math.max(2, points);
    el.chartGrid.innerHTML = "";
    for (let i = 0; i <= 4; i += 1) {
      const y = top + (i / 4) * plotHeight;
      const ln = svg("line");
      ln.setAttribute("class", "chart-grid");
      ln.setAttribute("x1", String(left));
      ln.setAttribute("x2", String(width - right));
      ln.setAttribute("y1", String(y));
      ln.setAttribute("y2", String(y));
      el.chartGrid.appendChild(ln);
    }
    for (let i = 0; i < safeCount; i += 1) {
      const x = left + (i / (safeCount - 1)) * plotWidth;
      const ln = svg("line");
      ln.setAttribute("class", "chart-grid");
      ln.setAttribute("x1", String(x));
      ln.setAttribute("x2", String(x));
      ln.setAttribute("y1", String(top));
      ln.setAttribute("y2", String(height - bottom));
      el.chartGrid.appendChild(ln);
    }
    return { width, height, left, right, top, bottom, plotWidth, plotHeight, safeCount, maxY };
  }

  function renderDots(group, pts, cls) {
    group.innerHTML = "";
    for (const p of pts) {
      const c = svg("circle");
      c.setAttribute("class", cls);
      c.setAttribute("cx", String(p.x));
      c.setAttribute("cy", String(p.y));
      c.setAttribute("r", "3.2");
      group.appendChild(c);
    }
  }

  function renderErrors(points, arr) {
    el.chartErrors.innerHTML = "";
    for (let i = 0; i < arr.length; i += 1) {
      if (!arr[i]) continue;
      const p = points[Math.min(i, points.length - 1)];
      if (!p) continue;
      const y = p.y - 46;
      const l1 = svg("line"), l2 = svg("line");
      for (const ln of [l1, l2]) ln.setAttribute("class", "chart-error");
      l1.setAttribute("x1", String(p.x - 4)); l1.setAttribute("y1", String(y - 4)); l1.setAttribute("x2", String(p.x + 4)); l1.setAttribute("y2", String(y + 4));
      l2.setAttribute("x1", String(p.x + 4)); l2.setAttribute("y1", String(y - 4)); l2.setAttribute("x2", String(p.x - 4)); l2.setAttribute("y2", String(y + 4));
      el.chartErrors.appendChild(l1); el.chartErrors.appendChild(l2);
    }
  }

  function hideHover() {
    el.hoverLine.style.opacity = "0";
    el.hoverDotRaw.style.opacity = "0";
    el.hoverDotWpm.style.opacity = "0";
    el.tooltip.classList.remove("visible");
  }

  function showHover(i) {
    if (!chartHoverData[i] || !chartGridInfo) return hideHover();
    const s = chartHoverData[i];
    el.hoverLine.setAttribute("x1", String(s.x));
    el.hoverLine.setAttribute("x2", String(s.x));
    el.hoverLine.setAttribute("y1", String(chartGridInfo.top));
    el.hoverLine.setAttribute("y2", String(chartGridInfo.height - chartGridInfo.bottom));
    el.hoverLine.style.opacity = "0.85";
    el.hoverDotRaw.setAttribute("cx", String(s.x)); el.hoverDotRaw.setAttribute("cy", String(s.yRaw)); el.hoverDotRaw.style.opacity = "0.95";
    el.hoverDotWpm.setAttribute("cx", String(s.x)); el.hoverDotWpm.setAttribute("cy", String(s.yWpm)); el.hoverDotWpm.style.opacity = "0.95";
    el.tooltip.textContent = "t " + s.sec + "s  wpm " + fmt2(s.wpm) + "  raw " + fmt2(s.raw) + "  err " + s.err;
    const svgRect = el.chart.getBoundingClientRect();
    const wrapRect = el.chart.parentElement.getBoundingClientRect();
    const rx = ((s.x / chartGridInfo.width) * svgRect.width) + (svgRect.left - wrapRect.left);
    const ry = ((s.yWpm / chartGridInfo.height) * svgRect.height) + (svgRect.top - wrapRect.top);
    const tw = el.tooltip.offsetWidth || 220;
    const th = el.tooltip.offsetHeight || 30;
    const left = Math.max(8, Math.min(rx, wrapRect.width - tw - 8));
    const top = Math.max(8, ry - th - 14);
    el.tooltip.style.left = left + "px";
    el.tooltip.style.top = top + "px";
    el.tooltip.classList.add("visible");
  }

  function drawChart() {
    const ws = secondWpm.length ? secondWpm : [0];
    const rs = secondRaw.length ? secondRaw : [0];
    const real = Math.max(ws.length, rs.length, 1);
    const points = Math.max(real, 2);
    const maxY = Math.ceil(Math.max(80, ...ws, ...rs) / 10) * 10;
    const g = renderGrid(points, maxY);
    chartGridInfo = g;
    const wp = [], rp = [];
    chartHoverData = [];
    const mapX = (i) => g.left + (i / (g.safeCount - 1)) * g.plotWidth;
    const mapY = (v) => g.top + (1 - Math.max(0, Math.min(1, v / g.maxY))) * g.plotHeight;
    for (let i = 0; i < g.safeCount; i += 1) {
      const wv = ws[Math.min(i, ws.length - 1)], rv = rs[Math.min(i, rs.length - 1)];
      wp.push({ x: mapX(i), y: mapY(wv) });
      rp.push({ x: mapX(i), y: mapY(rv) });
    }
    for (let i = 0; i < real; i += 1) {
      const x = mapX(i), wv = ws[Math.min(i, ws.length - 1)], rv = rs[Math.min(i, rs.length - 1)];
      chartHoverData.push({ sec: i + 1, x, yWpm: mapY(wv), yRaw: mapY(rv), wpm: wv, raw: rv, err: secondErrors[i] ? 1 : 0 });
    }
    el.chartWpm.setAttribute("points", wp.map((p) => p.x + "," + p.y).join(" "));
    el.chartRaw.setAttribute("points", rp.map((p) => p.x + "," + p.y).join(" "));
    renderDots(el.chartWpmDots, wp, "chart-dot");
    renderDots(el.chartRawDots, rp, "chart-dot-raw");
    renderErrors(wp, secondErrors);
    animateChartLines();
    hideHover();
  }

  function animateChartLines() {
    const lines = [el.chartRaw, el.chartWpm];
    for (const line of lines) {
      if (!line || typeof line.getTotalLength !== "function") continue;
      const len = line.getTotalLength();
      if (!Number.isFinite(len) || len <= 0) continue;
      line.style.strokeDasharray = String(len);
      line.style.strokeDashoffset = String(len);
      void line.getBoundingClientRect();
      line.style.strokeDashoffset = "0";
    }
  }

  function resetSampling() {
    sampleSecond = 0;
    previousTotalErrors = 0;
    secondWpm = [];
    secondRaw = [];
    secondErrors = [];
  }

  function recordSample(force) {
    if (!startedAt) return;
    const sec = Math.max(1, Math.floor(nowElapsed()));
    const wpm = getWpm();
    const raw = getRaw();
    const totalErrors = getIncorrect() + getExtra();
    const diff = Math.max(0, totalErrors - previousTotalErrors);
    previousTotalErrors = totalErrors;
    if (sec <= sampleSecond) {
      if (force && secondWpm.length) {
        const i = secondWpm.length - 1;
        secondWpm[i] = wpm;
        secondRaw[i] = raw;
        secondErrors[i] = secondErrors[i] || (diff > 0 ? 1 : 0);
      }
      return;
    }
    sampleSecond = sec;
    secondWpm.push(wpm);
    secondRaw.push(raw);
    secondErrors.push(diff > 0 ? 1 : 0);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function progressHint() {
    if (finished) return;
    if (settings.mode === "time") {
      el.resultLine.textContent = "";
      return;
    }
    if (settings.mode === "zen") {
      el.resultLine.textContent = "zen mode | Ctrl+Enter to finish | " + fmt2(nowElapsed()) + "s";
      return;
    }
    const typed = Math.min(el.input.value.length, targetText.length);
    const total = targetText.length;
    const pct = total ? (typed / total) * 100 : 0;
    el.resultLine.textContent = typed + "/" + total + " (" + fmt2(pct) + "%)";
  }

  function showResults() {
    const typed = el.input.value.length;
    const correct = lastCorrectCount;
    const incorrect = getIncorrect();
    const extra = getExtra();
    const missed = isFinite() ? Math.max(0, targetText.length - Math.min(typed, targetText.length)) : 0;
    const elapsed = settings.mode === "time" ? settings.time : nowElapsed();
    const wpm = Number(fmt2(getWpm()));
    const acc = Number(fmt2(getAcc()));
    const raw = Number(fmt2(getRaw()));
    const charsText = correct + "/" + incorrect + "/" + extra + "/" + missed;

    el.wpm.textContent = fmt2(wpm);
    el.acc.textContent = fmt2(acc) + "%";
    el.raw.textContent = fmt2(raw);
    el.chars.textContent = charsText;
    el.consistency.textContent = fmt2(getConsistency()) + "%";
    el.time.textContent = fmt2(elapsed) + "s";
    el.timeMeta.textContent = fmtSession(elapsed) + " session";
    el.testType.innerHTML = testTypeLabel();

    drawChart();
    el.page.classList.add("show-results");
    return {
      wpm,
      acc,
      raw,
      chars: charsText,
      mode: settings.mode,
      duration: settings.mode === "time" ? settings.time : null,
      elapsed: Number(fmt2(elapsed))
    };
  }

  async function finishTest() {
    if (finished) return;
    finished = true;
    recordSample(true);
    stopTimer();
    toggleTyping(false);
    toggleTimerRun(false);
    if (el.caret) el.caret.style.opacity = "0";
    el.input.blur();
    const snapshot = showResults();
    await persistResultSnapshot(snapshot);
  }

  function startIfNeeded() {
    if (!currentUser || startedAt || finished) return;
    startedAt = Date.now();
    toggleTyping(true);
    if (settings.mode === "time") {
      toggleTimerRun(true);
      updateLiveTime();
    } else {
      toggleTimerRun(false);
    }
    timerId = setInterval(() => {
      recordSample(false);
      if (settings.mode === "time") {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          timeLeft = 0;
          updateLiveTime();
          void finishTest();
          return;
        }
        updateLiveTime();
      }
      progressHint();
    }, 1000);
  }

  function updateView() {
    const typed = el.input.value;
    ensureBuffer();

    let from = 0;
    const comparable = Math.min(Math.max(lastTyped.length, typed.length), targetText.length);
    while (from < comparable && lastTyped[from] === typed[from]) from += 1;

    for (let i = from; i < comparable; i += 1) {
      const span = charSpans[i];
      if (!span) break;
      if (correctness[i] === 1) lastCorrectCount -= 1;
      correctness[i] = 0;
      span.classList.remove("correct", "incorrect", "incorrect-space", "hit-correct", "hit-incorrect");
      const tc = typed[i];
      if (tc == null) continue;
      if (tc === targetText[i]) {
        span.classList.add("correct");
        correctness[i] = 1;
        lastCorrectCount += 1;
        pulseCharState(span, "hit-correct");
      } else {
        span.classList.add("incorrect");
        if (span.textContent === " ") span.classList.add("incorrect-space");
        pulseCharState(span, "hit-incorrect");
      }
    }

    if (isFinite()) drawExtras(typed.slice(targetText.length)); else clearExtras();

    if (charSpans[lastCaretCharIndex]) charSpans[lastCaretCharIndex].classList.remove("current");
    const caret = Math.min(typed.length, Math.max(0, charSpans.length - 1));
    if (charSpans[caret]) {
      charSpans[caret].classList.add("current");
      lastCaretCharIndex = caret;
      if (typed.length !== lastCaretInputIndex) {
        const newLineTop = charSpans[caret].offsetTop;
        if (newLineTop !== currentLineOffsetTop) {
          currentLineOffsetTop = newLineTop;
          const lh = calcLineHeight();
          const lineIndex = lh > 0 ? Math.round(newLineTop / lh) : 0;
          const newTranslate = lineIndex >= 2 ? -(lineIndex - 1) * lh : 0;
          if (newTranslate !== wordsTranslateY) {
            wordsTranslateY = newTranslate;
            el.words.style.transform = "translateY(" + wordsTranslateY + "px)";
          }
        }
      }
      syncSmoothCaret(caret);
    }

    if (!finished && (settings.mode === "words" || settings.mode === "quote" || settings.mode === "custom") && typed.length >= targetText.length) {
      void finishTest();
      return;
    }

    lastTyped = typed;
    lastCaretInputIndex = typed.length;
    progressHint();
  }

  function queueUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      updateView();
    });
  }

  function resetTest(reason = "manual") {
    const shouldCountRestart =
      reason !== "init" &&
      currentUser &&
      (startedAt > 0 || finished || (el.input.value || "").length > 0);
    if (shouldCountRestart) {
      void persistRestartCount();
    }
    stopTimer();
    timeLeft = settings.time;
    startedAt = 0;
    finished = false;
    lastCorrectCount = 0;
    lastTyped = "";
    lastCaretInputIndex = 0;
    lastCaretCharIndex = 0;
    resetSampling();

    el.input.value = "";
    el.resultLine.textContent = "";
    updateLiveTime();
    toggleTimerRun(false);
    toggleTyping(false);
    el.page.classList.remove("show-results");
    hideHover();

    wordsTranslateY = 0;
    currentLineOffsetTop = -1;
    cachedLineHeight = 0;
    el.words.style.transition = "none";
    el.words.style.transform = "translateY(0)";
    requestAnimationFrame(() => { el.words.style.transition = ""; });

    renderText(buildByMode());
    renderControls();
    ensureBuffer();
    progressHint();
    syncLiveTimePosition();
    syncSmoothCaret(0);
    if (currentUser) {
      el.input.focus();
    }
  }

  function ctrlBackspaceDeleteWord() {
    const value = el.input.value;
    const s = el.input.selectionStart ?? value.length;
    const e = el.input.selectionEnd ?? value.length;
    let next = value;
    let caret = s;
    if (s !== e) {
      next = value.slice(0, s) + value.slice(e);
      caret = s;
    } else {
      let cut = s;
      while (cut > 0 && value[cut - 1] === " ") cut -= 1;
      while (cut > 0 && value[cut - 1] !== " ") cut -= 1;
      next = value.slice(0, cut) + value.slice(e);
      caret = cut;
    }
    if (next !== value) {
      el.input.value = next;
      el.input.setSelectionRange(caret, caret);
      queueUpdate();
    }
  }

  function activateMode(mode) {
    if (!["time", "words", "quote", "zen", "custom"].includes(mode)) return;
    if (mode === settings.mode && mode !== "custom") return;
    if (mode === "custom") {
      const txt = askCustom(true);
      if (txt === null) return;
      settings.customText = txt;
    }
    settings.mode = mode;
    saveSettings();
    renderControls();
    resetTest("mode-change");
  }

  function setPreset(value) {
    if (settings.mode === "time") {
      if (!MODE_PRESETS.time.includes(value)) return;
      settings.time = value;
    } else if (settings.mode === "words") {
      if (!MODE_PRESETS.words.includes(value)) return;
      settings.words = value;
    } else return;
    saveSettings();
    renderControls();
    resetTest("preset-change");
  }

  function renderControls() {
    const pairs = [[modeButtons.time, "time"], [modeButtons.words, "words"], [modeButtons.quote, "quote"], [modeButtons.zen, "zen"], [modeButtons.custom, "custom"]];
    for (const [node, mode] of pairs) if (node) node.classList.toggle("active", settings.mode === mode);
    if (modeButtons.punctuation) modeButtons.punctuation.classList.toggle("active", settings.punctuation);
    if (modeButtons.numbers) modeButtons.numbers.classList.toggle("active", settings.numbers);

    let values = null;
    let active = 0;
    if (settings.mode === "time") {
      values = MODE_PRESETS.time;
      active = settings.time;
    } else if (settings.mode === "words") {
      values = MODE_PRESETS.words;
      active = settings.words;
    }
    const show = Array.isArray(values);
    for (let i = 0; i < optionItems.length; i += 1) {
      const item = optionItems[i];
      if (!show) {
        item.style.display = "none";
        item.classList.remove("active");
        item.removeAttribute("data-value");
        continue;
      }
      const value = values[i];
      item.style.display = "";
      item.textContent = String(value);
      item.dataset.value = String(value);
      item.classList.toggle("active", value === active);
    }
    if (modeSeps[1]) modeSeps[1].style.display = show ? "" : "none";
    if (tailIcon) tailIcon.style.display = show ? "" : "none";
  }

  function pulseControl(node) {
    if (!node) return;
    node.classList.remove("tap");
    void node.getBoundingClientRect();
    node.classList.add("tap");
    window.setTimeout(() => node.classList.remove("tap"), 140);
  }

  function pulseCharState(node, cls) {
    if (!node) return;
    node.classList.remove("hit-correct", "hit-incorrect");
    void node.getBoundingClientRect();
    node.classList.add(cls);
    if (typeof node.animate === "function") {
      const keyframes = cls === "hit-correct"
        ? [
            { opacity: 0.62, transform: "translateY(0.8px) scale(0.992)" },
            { opacity: 1, transform: "translateY(0) scale(1)" }
          ]
        : [
            { opacity: 0.64, transform: "translateY(1.1px) scale(0.993)" },
            { opacity: 1, transform: "translateY(0) scale(1)" }
          ];
      node.animate(keyframes, {
        duration: cls === "hit-correct" ? 210 : 230,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "none"
      });
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    if (!auth || !db) return;
    const group = (el.regGroup?.value || "").trim();
    const firstName = (el.regFirstName?.value || "").trim();
    const lastName = (el.regLastName?.value || "").trim();
    const password = el.regPassword?.value || "";
    const confirm = el.regPasswordConfirm?.value || "";
    if (!group || !firstName || !lastName || !password || !confirm) {
      setAuthMessage("Заполните все поля регистрации.", true);
      return;
    }
    if (password !== confirm) {
      setAuthMessage("Пароли не совпадают.", true);
      return;
    }
    const login = buildLogin(firstName, lastName, group);
    console.log("[Register] email:", loginToEmail(login));
    setAuthFormLoading(true, "Создаём аккаунт...");
    try {
      const cred = await createUserWithEmailAndPassword(auth, loginToEmail(login), password);
      const role = login === "admin" ? "admin" : "student";
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName,
        lastName,
        group,
        login,
        role,
        maxWpm: 0,
        maxAcc: 0,
        maxRaw: 0,
        restartCount: 0,
        lastWpm: 0,
        lastAcc: 0,
        lastRaw: 0,
        lastResultAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      setAuthMessage("Регистрация завершена. Входим...", false);
    } catch (err) {
      setAuthFormLoading(false);
      setAuthMessage(mapFirebaseError(err), true);
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    if (!auth) return;
    const firstName = (el.loginFirstName?.value || "").trim();
    const lastName = (el.loginLastName?.value || "").trim();
    const group = (el.loginGroup?.value || "").trim();
    const password = el.loginPassword?.value || "";
    if (!firstName || !lastName || !group || !password) {
      setAuthMessage("Введите все данные для входа.", true);
      return;
    }
    const login = buildLogin(firstName, lastName, group);
    const email = loginToEmail(login);
    console.log("[Login] email:", email);
    setAuthFormLoading(true, "Входим...");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthMessage("", false);
    } catch (err) {
      console.error("[Login] error:", err?.code, err?.message);
      setAuthFormLoading(false);
      setAuthMessage(mapFirebaseError(err) + " (логин: " + login + ")", true);
    }
  }

  async function handleLogout() {
    if (!auth) return;
    try {
      if (configUnsubscribe) { configUnsubscribe(); configUnsubscribe = null; }
      await signOut(auth);
      el.page.classList.remove("ctrl-locked");
      setAuthMode("login");
      setAuthMessage("Logged out.", false);
    } catch (err) {
      setAuthMessage(mapFirebaseError(err), true);
    }
  }

  async function toggleAdminPanel() {
    if (!isAdminUser()) return;
    setAdminView(!adminPanelOpen);
    if (adminPanelOpen) {
      await loadAdminTable();
    }
  }

  el.showRegisterBtn?.addEventListener("click", () => setAuthMode("register"));
  el.showLoginBtn?.addEventListener("click", () => setAuthMode("login"));
  el.registerForm?.addEventListener("submit", (e) => { void handleRegisterSubmit(e); });
  el.loginForm?.addEventListener("submit", (e) => { void handleLoginSubmit(e); });
  el.logoutBtn?.addEventListener("click", () => { el.userModal?.classList.add("hidden"); void handleLogout(); });
  el.adminToggleBtn?.addEventListener("click", () => { el.userModal?.classList.add("hidden"); void toggleAdminPanel(); });
  el.refreshAdminBtn?.addEventListener("click", () => { void loadAdminTable(); });

  el.profileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!el.userModal) return;
    const isHidden = el.userModal.classList.contains("hidden");
    if (isHidden) {
      const rect = el.profileBtn.getBoundingClientRect();
      el.userModal.style.top = (rect.bottom + 8) + "px";
      el.userModal.style.left = "";
      el.userModal.style.right = (window.innerWidth - rect.right) + "px";
      el.userModal.classList.remove("hidden");
    } else {
      el.userModal.classList.add("hidden");
    }
  });
  document.addEventListener("click", (e) => {
    if (el.userModal && !el.userModal.classList.contains("hidden")) {
      if (!el.userModal.contains(/** @type {Node} */ (e.target)) && e.target !== el.profileBtn) {
        el.userModal.classList.add("hidden");
      }
    }
  });

  el.apConfig?.addEventListener("click", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const modeBtn = t.closest(".ap-cfg-mode");
    if (modeBtn) {
      const mode = modeBtn.dataset.mode;
      if (mode && mode !== settings.mode) {
        settings.mode = mode;
        saveSettings();
        renderControls();
        renderAdminConfig();
        resetTest("mode-change");
      }
      return;
    }
    const timeBtn = t.closest(".ap-cfg-time");
    if (timeBtn) {
      const val = Number(timeBtn.dataset.time);
      if (!Number.isFinite(val) || val <= 0) return;
      if (settings.mode === "time") settings.time = val;
      else if (settings.mode === "words") settings.words = val;
      saveSettings();
      renderControls();
      renderAdminConfig();
      resetTest("preset-change");
      return;
    }
    const toggleBtn = t.closest(".ap-cfg-toggle");
    if (toggleBtn) {
      const key = toggleBtn.dataset.toggle;
      if (key === "punctuation") settings.punctuation = !settings.punctuation;
      else if (key === "numbers") settings.numbers = !settings.numbers;
      saveSettings();
      renderControls();
      renderAdminConfig();
      resetTest("toggle-setting");
    }
  });

  el.saveConfigBtn?.addEventListener("click", async () => {
    const btn = el.saveConfigBtn;
    btn.disabled = true;
    btn.textContent = "Сохраняем...";
    try {
      await saveGlobalConfig();
      btn.classList.add("saved");
      btn.textContent = "Сохранено ✓";
      setTimeout(() => {
        btn.classList.remove("saved");
        btn.textContent = "Сохранить";
        btn.disabled = false;
      }, 2000);
    } catch (err) {
      btn.textContent = "Ошибка — нет прав";
      btn.style.background = "var(--error-color)";
      btn.style.color = "#fff";
      setTimeout(() => {
        btn.textContent = "Сохранить";
        btn.style.background = "";
        btn.style.color = "";
        btn.disabled = false;
      }, 3000);
    }
  });

  el.adminTableBody?.addEventListener("click", (e) => {
    const t = /** @type {Element} */ (e.target);
    const resetBtn = t.closest(".ap-reset-btn");
    const deleteBtn = t.closest(".ap-delete-btn");
    if (resetBtn) {
      const uid = resetBtn.dataset.uid;
      if (uid && confirm("Обнулить статистику этого ученика?")) void resetStudentStats(uid);
    }
    if (deleteBtn) {
      const uid = deleteBtn.dataset.uid;
      if (uid && confirm("Удалить этого ученика? Это действие необратимо.")) void deleteStudent(uid);
    }
  });

  el.adminSearch?.addEventListener("input", () => renderAdminRows());
  el.adminGroupFilter?.addEventListener("change", () => renderAdminRows());
  el.adminPage?.querySelectorAll(".ap-th[data-col]").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (adminSortCol === col) {
        adminSortAsc = !adminSortAsc;
      } else {
        adminSortCol = col;
        adminSortAsc = col === "name" || col === "group";
      }
      renderAdminRows();
    });
  });

  el.input.addEventListener("keydown", (e) => {
    if (!currentUser) return;
    if (finished) return;
    if (e.key === "Backspace" && e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      ctrlBackspaceDeleteWord();
    }
  });

  el.input.addEventListener("input", () => {
    if (!currentUser) return;
    if (finished) return;
    startIfNeeded();
    queueUpdate();
  });

  el.wrap.addEventListener("click", () => {
    if (!currentUser) return;
    if (!finished) el.input.focus();
  });
  el.restart.addEventListener("click", () => resetTest("restart-button"));

  if (el.resultActions) {
    el.resultActions.querySelectorAll(".result-action").forEach((n) => {
      n.setAttribute("role", "button");
      n.setAttribute("tabindex", "0");
      n.setAttribute("aria-label", "Restart test");
    });
    el.resultActions.addEventListener("click", (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (t && t.closest(".result-action")) resetTest("result-action");
    });
    el.resultActions.addEventListener("keydown", (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t || !t.closest(".result-action")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        resetTest("result-action");
      }
    });
  }

  el.modeBar.querySelectorAll(".mode-item, .time-item").forEach((n) => {
    n.setAttribute("role", "button");
    n.setAttribute("tabindex", "0");
    n.style.cursor = "pointer";
  });

  el.modeBar.addEventListener("keydown", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    if (e.key === "Enter" || e.key === " ") {
      const c = t.closest(".mode-item, .time-item");
      if (c) {
        e.preventDefault();
        c.click();
      }
    }
  });

  el.modeBar.addEventListener("click", (e) => {
    if (!isAdminUser()) return;
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;

    const opt = t.closest(".time-item");
    if (opt && opt.dataset.value) {
      pulseControl(opt);
      const value = Number(opt.dataset.value);
      if (Number.isFinite(value) && value > 0) setPreset(value);
      return;
    }

    const mode = t.closest(".mode-item");
    if (!mode) return;

    if (mode === modeButtons.punctuation) {
      pulseControl(mode);
      settings.punctuation = !settings.punctuation;
      saveSettings();
      renderControls();
      resetTest("toggle-setting");
      return;
    }
    if (mode === modeButtons.numbers) {
      pulseControl(mode);
      settings.numbers = !settings.numbers;
      saveSettings();
      renderControls();
      resetTest("toggle-setting");
      return;
    }
    if (mode === modeButtons.time) {
      pulseControl(mode);
      return activateMode("time");
    }
    if (mode === modeButtons.words) {
      pulseControl(mode);
      return activateMode("words");
    }
    if (mode === modeButtons.quote) {
      pulseControl(mode);
      return activateMode("quote");
    }
    if (mode === modeButtons.zen) {
      pulseControl(mode);
      return activateMode("zen");
    }
    if (mode === modeButtons.custom) {
      pulseControl(mode);
      return activateMode("custom");
    }
  });

  el.chart.addEventListener("mousemove", (e) => {
    if (!el.page.classList.contains("show-results") || chartHoverData.length === 0 || !chartGridInfo) return;
    const rect = el.chart.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const viewX = (localX / Math.max(1, rect.width)) * chartGridInfo.width;
    let idx = 0;
    let dist = Infinity;
    for (let i = 0; i < chartHoverData.length; i += 1) {
      const d = Math.abs(chartHoverData[i].x - viewX);
      if (d < dist) {
        dist = d;
        idx = i;
      }
    }
    showHover(idx);
  });
  el.chart.addEventListener("mouseleave", hideHover);

  window.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    const isFormField = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA") && active !== el.input;
    if (isFormField) return;

    if (e.key === "Tab") {
      tabHeld = true;
      e.preventDefault();
      if (!finished) el.input.focus();
      return;
    }
    if (e.key === " " && tabHeld) {
      e.preventDefault();
      resetTest("tab-space");
      return;
    }
    if (!finished && settings.mode === "zen" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void finishTest();
      return;
    }
    if (e.key === "Escape" && !finished) {
      e.preventDefault();
      resetTest("escape");
      return;
    }
    if (
      currentUser &&
      !finished &&
      document.activeElement !== el.input &&
      (e.key.length === 1 || e.key === "Backspace") &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      el.input.focus();
    }
  });

  window.addEventListener("resize", () => {
    syncLiveTimePosition();
    syncSmoothCaret(lastCaretCharIndex);
  });

  const finishOnLeave = () => {
    if (startedAt && !finished) {
      void finishTest();
    }
  };
  window.addEventListener("blur", finishOnLeave);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      finishOnLeave();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "Tab") tabHeld = false;
  });

  requestAnimationFrame(() => el.page.classList.add("page-ready"));
  setAuthMode("register");
  renderSessionUi();
  if (localStorage.getItem(SESSION_KEY)) {
    el.pageLoading?.classList.remove("hidden");
  } else {
    setAuthLocked(true);
  }
  renderControls();
  resetTest("init");
  syncLiveTimePosition();
  void setupFirebaseAuth();
}
