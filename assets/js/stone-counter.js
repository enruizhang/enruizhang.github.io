(function () {
  const DEFAULT_STORAGE_KEY = "jingweiV16Stones";
  const DATABASE_PATH = "/counters/stones";

  let countElement = null;
  let storageKey = DEFAULT_STORAGE_KEY;
  let firebaseReady = false;
  let firebaseLoading = null;
  let databaseRef = null;
  let realtimeListening = false;

  function hasUsableFirebaseConfig() {
    const config = window.FIREBASE_CONFIG;
    if (!config) return false;
    const required = ["apiKey", "authDomain", "databaseURL", "projectId", "appId"];
    return required.every((key) => {
      const value = config[key];
      return value && typeof value === "string" && !value.startsWith("YOUR_");
    });
  }

  function readLocalCount() {
    return Number(localStorage.getItem(storageKey) || 0);
  }

  function writeLocalCount(value) {
    localStorage.setItem(storageKey, String(value));
    return value;
  }

  function renderStoneCount(value) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : readLocalCount();
    if (countElement) {
      countElement.textContent = safeValue.toLocaleString("en-US");
    }
    window.dispatchEvent(new CustomEvent("stonecountchange", { detail: { count: safeValue } }));
    return safeValue;
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

  async function ensureFirebase() {
    if (firebaseReady) return true;
    if (!hasUsableFirebaseConfig()) return false;
    if (!firebaseLoading) {
      firebaseLoading = (async () => {
        try {
          await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
          await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js");
          if (!window.firebase) return false;
          if (!window.firebase.apps.length) {
            window.firebase.initializeApp(window.FIREBASE_CONFIG);
          }
          databaseRef = window.firebase.database().ref(DATABASE_PATH);
          firebaseReady = true;
          return true;
        } catch (error) {
          firebaseReady = false;
          databaseRef = null;
          return false;
        }
      })();
    }
    return firebaseLoading;
  }

  function startRealtimeListener() {
    if (!databaseRef || realtimeListening) return;
    realtimeListening = true;
    try {
      databaseRef.on(
        "value",
        (snapshot) => {
          const remoteValue = Number(snapshot.val() || 0);
          if (!Number.isFinite(remoteValue)) return;
          writeLocalCount(remoteValue);
          renderStoneCount(remoteValue);
        },
        () => {
          realtimeListening = false;
        }
      );
    } catch (error) {
      realtimeListening = false;
    }
  }

  async function getStoneCount() {
    const canUseFirebase = await ensureFirebase();
    if (!canUseFirebase || !databaseRef) {
      return readLocalCount();
    }
    startRealtimeListener();
    try {
      const snapshot = await databaseRef.get();
      const remoteValue = Number(snapshot.val() || 0);
      if (Number.isFinite(remoteValue)) {
        writeLocalCount(remoteValue);
        return remoteValue;
      }
    } catch (error) {
      return readLocalCount();
    }
    return readLocalCount();
  }

  async function incrementStoneCount() {
    const canUseFirebase = await ensureFirebase();
    if (!canUseFirebase || !databaseRef) {
      const nextLocal = readLocalCount() + 1;
      writeLocalCount(nextLocal);
      return renderStoneCount(nextLocal);
    }
    startRealtimeListener();
    try {
      const result = await databaseRef.transaction((current) => Number(current || 0) + 1);
      const nextRemote = Number(result.snapshot.val() || 0);
      writeLocalCount(nextRemote);
      return renderStoneCount(nextRemote);
    } catch (error) {
      const nextLocal = readLocalCount() + 1;
      writeLocalCount(nextLocal);
      return renderStoneCount(nextLocal);
    }
  }

  async function initStoneCounter(options = {}) {
    countElement = options.element || countElement || document.getElementById("count");
    storageKey = options.storageKey || storageKey;
    renderStoneCount(readLocalCount());
    const value = await getStoneCount();
    return renderStoneCount(value);
  }

  window.getStoneCount = getStoneCount;
  window.incrementStoneCount = incrementStoneCount;
  window.renderStoneCount = renderStoneCount;
  window.initStoneCounter = initStoneCounter;
})();
