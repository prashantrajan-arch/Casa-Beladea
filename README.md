# Casa Beladea — rental site

Files: `index.html` (public site), `PropertyManager/index.html` (password-protected booking dashboard for your property manager), `firebase-config.js` and `pricing.js` (shared config, imported by both pages), and `images/` (your photos).

Bookings now live in a real database (Firebase), not a JSON file. Your property manager adds/edits bookings through a real login at `casa-beladea.com/PropertyManager/`, and the public calendar picks up her changes automatically — no GitHub involvement needed on her end.

## 1. Add your photos
Drop images into `images/` named `1.jpg` through `9.jpg`:
- `1.jpg`–`4.jpg` — the rotating hero album (landscape, ideally 1800px+ wide)
- `5.jpg`–`9.jpg` — the gallery grid

Any missing file just shows a labelled placeholder, so you can launch before all nine are ready.

## 2. Edit the text
Open `index.html` in any text editor and update:
- The house name (`Casa Beladea` — already set throughout `index.html`; search-and-replace if you rename it again)
- Hero headline/tagline, bedroom count, "sleeps —"
- The four cards under "The House"
- The "Location" paragraph

## 3. Set up Firebase (one-time, ~15 minutes)

This powers both the property manager's real login and the shared booking database. Free at this scale — no credit card charge expected.

1. Go to [console.firebase.google.com](https://console.firebase.google.com), sign in with a Google account, click **"Add project"**, name it e.g. `casa-beladea`, and finish the wizard (you can decline Google Analytics — not needed here).
2. In the left sidebar, go to **Build → Authentication → Get started**. Under the "Sign-in method" tab, enable **Email/Password**.
3. Still in Authentication, go to the **Users** tab → **Add user**. Enter your property manager's email and set a password for her — this is her real login for the dashboard. (She can't reset it herself yet; if you want a "forgot password" flow later, ask and I'll add it.)
4. In the left sidebar, go to **Build → Firestore Database → Create database**. Choose **production mode**, pick a region close to Portugal (e.g. `europe-west1`), and click Enable.
5. In Firestore, go to the **Rules** tab and replace the contents with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /bookings/{bookingId} {
         allow read, write: if request.auth != null;
       }
       match /publicAvailability/{docId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   Click **Publish**. This is what actually enforces security: guest names and notes (`bookings`) can only be read or written by someone signed in; the public calendar (`publicAvailability`) can be read by anyone but only written by someone signed in.
6. Back in Project settings (gear icon, top left) → **General** tab → scroll to "Your apps" → click the **`</>`** (web) icon → register an app (any nickname) → you'll be shown a `firebaseConfig` object.
7. Open `firebase-config.js` in this project and paste those values in, replacing the `REPLACE_ME` placeholders. Save.

That's it — both `index.html` and `PropertyManager/index.html` read from this one config file.

## 4. Using the property manager dashboard
Once deployed (see hosting below), your manager goes to `casa-beladea.com/PropertyManager/`, signs in with the email/password you set up in step 3, and can:
- Add a booking: guest name, dates, whether they want pool & hot tub heating (auto-charged only for nights between October and April) and midweek cleaning, plus notes and status (Confirmed/Tentative)
- See every booking in a table with an estimated total per stay
- Edit or delete any booking

The page isn't linked from the public site's navigation and is excluded from search engines, but the real protection is the Firebase login, not obscurity — someone would need her actual credentials to get in or to write any data.

## 5. Enquiry form
Already connected to Formspree (endpoint `mzepeggo`) — submissions arrive by email wherever that form is set to notify. It submits by AJAX, so visitors stay on the page and see an inline confirmation instead of being redirected. Two things worth knowing:
- **Free tier limit**: Formspree's free plan caps monthly submissions (check your dashboard at formspree.io if enquiries seem to stop arriving).
- **Notification email**: set/change where submissions get sent from your Formspree dashboard, not from this code.

## 6. Hosting — cheapest/free options

**GitHub Pages** (what you're already using):
Upload everything, including the `PropertyManager/` folder, to the repo root — `PropertyManager/index.html` will be reachable at `casa-beladea.com/PropertyManager/` automatically once Pages rebuilds.

**Netlify** (free, no git required):
Drag the whole project folder onto Netlify's "Deploy manually" area — same folder structure, same result.

Either is genuinely $0/year unless you want your own domain name. Firebase's free tier ("Spark plan") comfortably covers a single property's booking volume.

## Notes
- `availability.json` is no longer used by the live site — Firestore is now the source of truth. You can delete it, or keep it around as a historical reference.
- Pricing logic (nightly rates, pool heating surcharge, cleaning fee) lives in one place — `pricing.js` — and both `index.html` and the dashboard import from it, so they can never drift out of sync. Edit rates there.
- If you ever want her to reset her own password, or want more than one manager login, say the word — both are quick additions on top of what's here.
