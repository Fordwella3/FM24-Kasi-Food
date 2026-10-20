# FM24 Kasi Food Website

A responsive React + TypeScript + Vite website prototype for FM24 Kasi Food.

## What's working in this prototype
- Responsive home page and restaurant listing
- Search restaurants, food names, and categories
- Restaurant menu panels
- Add menu items to basket, increase/decrease quantities
- Delivery or collection selection
- Demo checkout that saves a sample order to the current browser's local storage

## Important limitations
- Restaurant names, ratings, menu items, and prices are demo content.
- Demo checkout does not contact a restaurant, charge a customer, or arrange delivery.
- Firebase is optional and not configured until you add your own project settings.
- No live payments, driver GPS, production order processing, or admin/restaurant authentication is wired yet.

## Run locally
Install Node.js (LTS), then in this folder:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Optional Firebase setup
1. Create a project in Firebase Console.
2. Register a Web app in Project settings.
3. Copy `.env.example` to `.env.local`.
4. Fill in the `VITE_FIREBASE_*` values from Firebase.
5. Enable Email/Password in Firebase Authentication and create a Firestore database when ready.

Do not commit `.env.local` or secret credentials. Firebase web config is not a server secret, but production access must be secured with Firebase Security Rules and appropriate authentication.

## Build for deployment

```bash
npm run build
npm run preview
```

The generated site is in `dist/`. Deploy that folder using a host such as Vercel, Netlify, or Firebase Hosting after configuring the backend and testing production requirements.
