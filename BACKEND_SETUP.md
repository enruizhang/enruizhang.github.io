# Backend setup notes

This website is currently a static website designed to be hosted on GitHub Pages.

GitHub Pages does not run a server backend. It can serve HTML, CSS, JavaScript, images, videos, and other static files, but it cannot run private server code.

For the backend foundation, this project is prepared to use:

1. Firebase Realtime Database for the public Jingwei stone counter.
2. Contact form was removed. Contact information is listed on the CV page.
3. Firebase Authentication for `admin.html`.
4. Firebase Storage for future image and video uploads.
5. Firebase Realtime Database or Firestore for future artwork metadata.

The existing Jingwei and Other Stones pages remain static. This setup does not migrate or replace the current hand-built pages.

## Files added for setup

- `assets/js/firebase-config.example.js` shows the Firebase config shape.
- `assets/js/firebase-config.js` is the placeholder file where the real config should be added later.
- `assets/js/stone-counter.js` provides the stone counter adapter.
- `assets/js/admin-auth.js` provides the basic admin login and upload skeleton.
- Contact form was removed. Contact information is listed on the CV page.
- `admin.html` contains the hidden admin login and future artwork upload skeleton.
- `data/works.example.json` shows a future artwork data structure.

## What still needs to be done manually

1. Create a Firebase project.
2. Create a Firebase Web app.
3. Enable Realtime Database.
4. Enable Authentication with Email/Password.
5. Enable Firebase Storage.
6. Copy the Firebase config into `assets/js/firebase-config.js`.
7. Replace `YOUR_ADMIN_EMAIL` in `assets/js/admin-auth.js` with the real administrator email.

## Stone counter

The stone counter uses the database path:

```text
/counters/stones
```

If Firebase is configured and reachable, the homepage reads and increments the remote counter.

If Firebase is missing, not configured, or unavailable, the homepage automatically falls back to `localStorage`. The fallback keeps the public animation safe and prevents Firebase problems from breaking the site.

## Contact

Contact form was removed. Contact information is listed on the CV page.

## Admin page

`admin.html` is not linked in the public navigation. It is only available to someone who knows the URL.

It is currently a skeleton:

- It can show a Firebase login form.
- It can check whether the logged-in email matches `ADMIN_EMAIL`.
- It can show the future artwork upload form after login.
- It does not yet upload real files or modify the public pages.

## Security reminders

1. Do not write the real administrator password into code.
2. Firebase API keys can appear in frontend code, but database rules and authentication rules must protect write access.
3. The stone counter can allow public reading.
4. Stone counter writes should later include anti-abuse rules.
5. Admin artwork writes must only allow the administrator account.
6. Firebase Storage uploads must only allow the administrator account.
7. Do not put private files or original high-quality master videos directly into the public repository.
