# OVIA GYM website

Static site (home, about, classes, contact) + a Supabase-powered admin panel
(login only) for managing trainers, offers, and gallery photos.

## 1. Set up Supabase

1. Create a project at https://supabase.com
2. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → Run
3. Go to **Storage** → create a new bucket named `gym-images` → toggle it **Public**
4. Go to **Authentication → Users** → **Add user** → create yourself an admin
   login (email + password). Do NOT enable public sign-ups — this site has no
   sign-up form on purpose, only login.
5. Go to **Project Settings → API** → copy your **Project URL** and **anon public key**

## 2. Connect the site to Supabase

Open `js/supabase-client.js` and fill in:

```js
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";
```

## 3. Try it locally

Just open `index.html` in a browser, or run a simple local server:

```
npx serve .
```

Visit `/admin/login.html` and log in with the user you created in step 1.4 —
you can now add offers, trainers, and gallery photos, and they'll show up on
the public pages automatically.

## 4. Push to GitHub

```
git init
git add .
git commit -m "OVIA GYM website"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 5. Deploy on Render

1. Go to https://render.com → New → **Static Site**
2. Connect your GitHub repo
3. Build command: leave blank
4. Publish directory: `.` (root)
5. Deploy

That's it — no server needed, since Supabase is called directly from the
browser and access is controlled by the Row Level Security policies in
`supabase-schema.sql` (public can read, only your logged-in admin can write).

## Folder structure

```
ovia-gym/
├── index.html          home page
├── about.html
├── classes.html
├── contact.html
├── admin/
│   ├── login.html       admin login (Supabase Auth)
│   └── dashboard.html   manage offers, trainers, gallery
├── css/style.css
├── js/
│   ├── supabase-client.js   <- put your Supabase URL + key here
│   └── main.js
├── assets/               put hero.jpg and other images here
└── supabase-schema.sql   run this once in Supabase SQL editor
```

## What's next

- Add real photos to `assets/` (currently `hero.jpg` is referenced by the homepage)
- Replace placeholder phone/address/email on `contact.html`
- If you want the contact form to save messages into Supabase instead of
  opening an email app, just ask — it's a small addition (one more table).
