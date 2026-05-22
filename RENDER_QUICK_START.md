# 🚀 Render ga Deploy - Tezkor Qo'llanma

## ✅ Tayyor! Hozir deploy qilishingiz mumkin!

Barcha kerakli fayllar yaratildi. Quyidagi qadamlarni bajaring:

---

## 📝 1-QADAM: GitHub ga Push qiling

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## 🌐 2-QADAM: Render da Deploy qilish

### A) PostgreSQL Database yaratish

1. https://render.com ga kiring va Sign Up qiling (GitHub bilan)
2. **New +** → **PostgreSQL**
3. Sozlamalar:
   - Name: `ai-psixolog-db`
   - Database: `ai_chatbot`
   - User: `ai_chatbot`
   - Region: `Oregon (US West)` yoki `Frankfurt (EU Central)`
   - Plan: **Free**
4. **Create Database** bosing
5. **Internal Database URL** ni nusxalab oling (masalan: `postgresql://ai_chatbot:xxxxx@dpg-xxxxx/ai_chatbot`)

### B) Backend Deploy qilish

1. **New +** → **Web Service**
2. GitHub repository ni ulang
3. Sozlamalar:
   - Name: `ai-psixolog-backend`
   - Region: Database bilan bir xil
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `./render-build.sh`
   - Start Command: `./render-start.sh`
   - Plan: **Free**

4. **Environment Variables** qo'shing:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[A qismda nusxalagan URL]
   JWT_SECRET=ai_chatBot_kjqwhilrbldiuasef654aw65f16ads5c165se1
   GEMINI_API_KEY=AIzaSyC88f2oU3oxl1iFdlGIjJ4Ho4lfzN3IIr8
   ALLOWED_ORIGINS=https://ai-psixolog-frontend.onrender.com
   ```

5. **Create Web Service** bosing
6. Deploy tugagach (5-10 daqiqa), backend URL ni nusxalab oling

### C) Frontend Deploy qilish

1. **New +** → **Static Site**
2. Xuddi shu repository ni tanlang
3. Sozlamalar:
   - Name: `ai-psixolog-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Environment Variables** qo'shing:
   ```
   VITE_API_URL=[Backend URL]/api
   ```
   Masalan: `https://ai-psixolog-backend.onrender.com/api`

5. **Create Static Site** bosing

---

## 🔧 3-QADAM: CORS ni yangilash

Frontend deploy qilingandan keyin:

1. Render → Backend Service → **Environment**
2. `ALLOWED_ORIGINS` ni yangilang:
   ```
   ALLOWED_ORIGINS=https://ai-psixolog-frontend.onrender.com
   ```
   (O'z frontend URL ingizni kiriting)
3. **Save Changes** → Service qayta ishga tushadi

---

## ✅ 4-QADAM: Tekshirish

1. **Backend**: `https://your-backend.onrender.com/api/health`
2. **Frontend**: `https://your-frontend.onrender.com`
3. Login qiling va chat ishga tushishini tekshiring

---

## ⚠️ Muhim Eslatmalar

### Free Plan:
- Backend 15 daqiqa faoliyatsizlikdan keyin "uxlaydi"
- Birinchi request 30-60 soniya davom etishi mumkin
- Database 90 kun faoliyatsizlikdan keyin o'chiriladi

### Yechim - Cron Job:
1. https://cron-job.org ga kiring
2. Yangi job yarating: `https://your-backend.onrender.com/api/health`
3. Interval: Har 10 daqiqa

---

## 🐛 Muammolar?

### Backend ishlamayapti:
- Render Dashboard → Service → **Logs** ni tekshiring
- Environment variables to'g'ri kiritilganini tekshiring

### Frontend backend ga ulanmayapti:
- `VITE_API_URL` to'g'ri ekanligini tekshiring
- Browser Console (F12) da xatolarni ko'ring
- Backend CORS sozlamalarini tekshiring

### Database migration xatolari:
- Render Dashboard → Backend → **Shell** oching
- `npx prisma migrate deploy` ni bajaring

---

## 📁 Yaratilgan Fayllar

✅ `backend/render-build.sh` - Build script
✅ `backend/render-start.sh` - Start script  
✅ `RENDER_DEPLOY.md` - To'liq qo'llanma
✅ `render.yaml` - Render konfiguratsiya
✅ `.env.production.example` - Environment example

---

## 🎉 Tayyor!

Endi yuqoridagi qadamlarni bajaring va loyihangiz Render da ishlaydi!

Muammolar bo'lsa, `RENDER_DEPLOY.md` faylini o'qing yoki Render Logs ni tekshiring.
