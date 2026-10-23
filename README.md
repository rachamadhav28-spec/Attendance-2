# B.Tech Attendance Tracker Android Project

This project contains everything you need to build an Android App (.APK) using **Capacitor** or **Website2APK / Web2App / Android Studio**.

## Quickest Method 1: Web2App / Website2APK (No coding, 2 minutes)
1. Zip the files inside `www/` (`index.html`, `style.css`, `script.js`).
2. Download an app converter like **Web2App**, **Website2APK**, or use online converters like **WebIntoApp.com** / **AppGeyser.com**.
3. Select your zipped `www` folder or `index.html`.
4. Click **Build APK** and download the `.apk` file directly to your Android phone!

---

## Developer Method 2: Android Studio & Capacitor (Full Native Project)
1. Make sure **Node.js** and **Android Studio** are installed.
2. Open terminal in this folder and run:
   ```bash
   npm install
   npx cap add android
   npx cap sync
   npx cap open android
   ```
3. Android Studio will open. Click **Build > Build APK(s)** to generate your native `.apk` file!
