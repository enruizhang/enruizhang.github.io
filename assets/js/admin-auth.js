const ADMIN_EMAIL = "YOUR_ADMIN_EMAIL";

(function () {
  const statusEl = document.getElementById("adminStatus");
  const loginForm = document.getElementById("adminLoginForm");
  const logoutButton = document.getElementById("adminLogout");
  const adminPanel = document.getElementById("adminPanel");
  const workForm = document.getElementById("workForm");

  let auth = null;
  let database = null;
  let storage = null;

  function showStatus(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function hasUsableFirebaseConfig() {
    const config = window.FIREBASE_CONFIG;
    if (!config) return false;
    const required = ["apiKey", "authDomain", "projectId", "appId"];
    return required.every((key) => {
      const value = config[key];
      return value && typeof value === "string" && !value.startsWith("YOUR_");
    });
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function setupFirebase() {
    if (!hasUsableFirebaseConfig()) {
      showStatus("Firebase is not configured yet.");
      return false;
    }
    try {
      await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-storage-compat.js");
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      auth = window.firebase.auth();
      database = window.firebase.database();
      storage = window.firebase.storage();
      return true;
    } catch (error) {
      showStatus("Firebase is not configured yet.");
      return false;
    }
  }

  function renderUser(user) {
    const allowed = user && user.email === ADMIN_EMAIL && ADMIN_EMAIL !== "YOUR_ADMIN_EMAIL";
    if (!user) {
      showStatus("Not logged in.");
      adminPanel.hidden = true;
      logoutButton.hidden = true;
      return;
    }
    if (!allowed) {
      showStatus("You are not allowed to access this page.");
      adminPanel.hidden = true;
      logoutButton.hidden = false;
      return;
    }
    showStatus(`Logged in as: ${user.email}`);
    adminPanel.hidden = false;
    logoutButton.hidden = false;
  }

  async function initAdmin() {
    const ready = await setupFirebase();
    if (!ready) {
      adminPanel.hidden = true;
      logoutButton.hidden = true;
      return;
    }
    auth.onAuthStateChanged(renderUser);
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!auth) {
      showStatus("Firebase is not configured yet.");
      return;
    }
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      showStatus(error.message || "Login failed.");
    }
  });

  logoutButton.addEventListener("click", async () => {
    if (auth) await auth.signOut();
  });

  workForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!auth || !database || !storage || !auth.currentUser) {
      showStatus("Firebase is not configured yet.");
      return;
    }
    if (auth.currentUser.email !== ADMIN_EMAIL || ADMIN_EMAIL === "YOUR_ADMIN_EMAIL") {
      showStatus("You are not allowed to access this page.");
      return;
    }
    showStatus("Upload skeleton is ready. Real upload will be enabled after Firebase rules and storage paths are configured.");
  });

  initAdmin();
})();
