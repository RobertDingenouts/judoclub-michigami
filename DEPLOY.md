# 🚀 Deploy naar Vercel - Judoclub Michigami Website

## ✅ Status
- **Project**: Draait lokaal op `http://localhost:3000` ✓
- **Framework**: Next.js 16 + TypeScript + Tailwind CSS 4
- **Database**: Prisma + SQLite (voor later)
- **Dashboard**: Complete exameneisen interface ✓

---

## 📋 Stap 1: GitHub Repo aanmaken

1. Ga naar https://github.com/new
2. Vul in:
   - **Repository name**: `judoclub-michigami`
   - **Description**: "Judoclub Michigami Steenbergen Website"
   - **Private**: ✓ (aanvinken)
   - **Initialize with README**: ✓
3. Klik "Create repository"

---

## 📋 Stap 2: Code pushen naar GitHub

```bash
cd /home/suffie/michigami-website

# Verwijder tijdelijke bestanden
rm -rf .next node_modules package-lock.json

# Git setup
git init
git add .
git commit -m "Initial commit - Judoclub Michigami Website"

# Link naar GitHub repo
git remote add origin https://github.com/RobertDingenouts/judoclub-michigami.git
git branch -M main
git push -u origin main
```

---

## 📋 Stap 3: Vercel Deploy

### Optie A: Via Vercel Dashboard (Eenvoudigst)
1. Ga naar https://vercel.com/new
2. Klik "Import Git Repository"
3. Selecteer `judoclub-michigami`
4. Klik "Deploy" - Vercel detecteert automatisch Next.js!

### Optie B: Via Vercel CLI
```bash
# Installeer Vercel CLI
npm i -g vercel

# Login en deploy
vercel login
vercel --prod
```

---

## 🎨 Na Deploy

Je website is live op: `https://judoclub-michigami.vercel.app`

### Custom Domein (optioneel)
1. Ga naar Vercel Dashboard → Project → Domains
2. Voeg `judoclubmichigami.nl` toe
3. Update DNS records bij je domein provider

---

## 🔧 Lokale Development

```bash
# Dependencies installeren
npm install

# Dev server starten
npm run dev

# Build voor productie
npm run build

# Productie server starten
npm start
```

---

## 📁 Project Structuur

```
michigami-website/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # ✅ Exam Dashboard (GLM-5.1)
│   │   ├── layout.tsx    # ✅ Navigation Header
│   │   └── globals.css   # Tailwind CSS + Dark Mode
│   ├── components/ui/    # 50+ shadcn/ui components
│   ├── data/             # Exameneisen data
│   └── lib/              # Prisma client + utils
├── prisma/               # Database schema
├── public/               # Logo, images
├── vercel.json           # ✅ Vercel config
└── package.json          # Dependencies
```

---

## 🎯 Volgende Features (na deploy)

- [ ] Agenda pagina (van GitHub data)
- [ ] Lestijden & locatie pagina's
- [ ] Contact formulier
- [ ] Lid worden formulier
- [ ] Admin panel
- [ ] Auth systeem (leden login)

---

**Need Help?** Vraag het aan Hermes! 🤖
