# Render ga Deploy qilish bo'yicha to'liq qo'llanma

## 📋 Render nima?
Render - bu zamonaviy cloud platform bo'lib, backend va frontend ilovalarni oson deploy qilish imkonini beradi. Bepul plan mavjud!

---

## 🚀 Deploy qilish bosqichlari

### 1-QADAM: Render Account yaratish

1. https://render.com ga kiring
2. **Sign Up** tugmasini bosing
3. GitHub account bilan ro'yxatdan o'ting (tavsiya etiladi)
4. Email ni tasdiqlang

---

### 2-QADAM: PostgreSQL Database yaratish

1. Render Dashboard ga kiring
2. **New +** tugmasini bosing
3. **PostgreSQL** ni tanlang
4. Quyidagi ma'lumotlarni kiriting:
   - **Name**: `ai-psixolog-db`
   - **Database**: `ai_chatbot`
   - **User**: `ai_chatbot`
   - **Region**: `Oregon (US West)` yoki `Frankfurt (EU Central)` (sizga yaqinroq)
   - **Plan**: **Free** (bepul)
5. **Create Database** tugmasini bosing
6. Database yaratilguncha 2-3 daqiqa kuting
7. Database ochilgandan keyin **Internal Database URL** ni nusxalab oling (keyin kerak bo'ladi)

---

### 3-QADAM: Backend (NestJS) ni deploy qilish

1. Render Dashboard ga qayting
2. **New +** → **Web Service** ni tanlang
3. GitHub repository ni ulang:
   - **Connect a repository** tugmasini bosing
   - Repository ni tanlang va **Connect** bosing
4. Quyidagi sozlamalarni kiriting:

   **Basic Settings:**
   - **Name**: `ai-psixolog-backend`
   - **Region**: Database bilan bir xil region tanlang
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `./render-build.sh`
   - **Start Command**: `./render-start.sh`
   - **Plan**: **Free**

5. **Advanced** tugmasini bosing va **Environment Variables** qo'shing:

   ```
   NODE_ENV = production
   PORT = 3000
   DATABASE_URL = [2-qadamda nusxalagan Internal Database URL]
   JWT_SECRET = ai_chatBot_kjqwhilrbldiuasef654aw65f16ads5c165se1
   GEMINI_API_KEY = AIzaSyC88f2oU3oxl1iFdlGIjJ4Ho4lfzN3IIr8
   ```

   **MUHIM**: `DATABASE_URL` ni 2-qadamda yaratgan database dan oling!

6. **Create Web Service** tugmasini bosing
7. Deploy jarayoni boshlanadi (5-10 daqiqa davom etadi)
8. Deploy tugagach, backend URL ni nusxalab oling (masalan: `https://ai-psixolog-backend.onrender.com`)

---

### 4-QADAM: Frontend (React) ni deploy qilish

#### Variant 1: Render da Static Site sifatida (Tavsiya etiladi)

1. Render Dashboard ga qayting
2. **New +** → **Static Site** ni tanlang
3. Xuddi shu GitHub repository ni tanlang
4. Quyidagi sozlamalarni kiriting:

   **Basic Settings:**
   - **Name**: `ai-psixolog-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. **Advanced** tugmasini bosing va **Environment Variables** qo'shing:

   ```
   VITE_API_URL = [3-qadamda olgan backend URL]/api
   ```

   **Masalan**: `https://ai-psixolog-backend.onrender.com/api`

6. **Create Static Site** tugmasini bosing
7. Deploy tugagach, frontend URL ni oling (masalan: `https://ai-psixolog-frontend.onrender.com`)

#### Variant 2: Vercel da deploy qilish (Tezroq)

Agar frontend ni Vercel da deploy qilmoqchi bo'lsangiz:

1. https://vercel.com ga kiring
2. GitHub bilan login qiling
3. **Add New** → **Project**
4. Repository ni import qiling
5. Sozlamalar:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Environment Variables** qo'shing:
   ```
   VITE_API_URL = [Backend URL]/api
   ```
7. **Deploy** tugmasini bosing

---

## 🔧 Backend CORS sozlamalarini yangilash

Backend deploy qilingandan keyin, frontend URL ni CORS ga qo'shish kerak:

1. Render Dashboard → Backend Service → **Environment** ga kiring
2. Yangi environment variable qo'shing:
   ```
   ALLOWED_ORIGINS = https://ai-psixolog-frontend.onrender.com
   ```
   (Agar Vercel ishlatayotgan bo'lsangiz, Vercel URL ni kiriting)

3. **Save Changes** tugmasini bosing
4. Service avtomatik qayta ishga tushadi

---

## ✅ Tekshirish

1. **Backend health check**:
   - Browser da oching: `https://your-backend-url.onrender.com/api/health`
   - Natija: `{"status":"ok","timestamp":"...","uptime":...}`

2. **Frontend**:
   - Browser da frontend URL ni oching
   - Login/Signup qilishga harakat qiling
   - Chat ishga tushishini tekshiring

---

## 🎯 Muhim Eslatmalar

### Free Plan Cheklashlari:
- **Backend**: 15 daqiqa faoliyatsizlikdan keyin "uxlaydi" (sleep mode)
- **Database**: 90 kun faoliyatsizlikdan keyin o'chiriladi
- **Birinchi request**: Uxlab turgan service uchun 30-60 soniya davom etishi mumkin

### Yechim:
1. **Cron Job** o'rnating (har 10 daqiqada backend ga ping yuborish):
   - https://cron-job.org da bepul account yarating
   - Yangi cron job yarating: `https://your-backend-url.onrender.com/api/health`
   - Interval: Har 10 daqiqa

2. **UptimeRobot** ishlatish:
   - https://uptimerobot.com ga kiring
   - Monitor qo'shing: Backend URL
   - Interval: 5 daqiqa

---

## 🔄 Yangilanishlar (Updates)

Render avtomatik deploy qiladi:
- GitHub ga push qilganingizda
- `main` branch ga merge qilganingizda

Manual deploy:
1. Render Dashboard → Service → **Manual Deploy** → **Deploy latest commit**

---

## 🐛 Muammolar va Yechimlar

### Backend ishlamayapti:
1. Render Dashboard → Service → **Logs** ni tekshiring
2. Environment variables to'g'ri kiritilganini tekshiring
3. Database URL to'g'ri ekanligini tekshiring

### Frontend backend ga ulanmayapti:
1. `VITE_API_URL` to'g'ri sozlanganini tekshiring
2. Backend CORS sozlamalarini tekshiring
3. Browser Console (F12) da xatolarni ko'ring

### Database migration xatolari:
1. Render Dashboard → Backend Service → **Shell** ni oching
2. Quyidagi buyruqni bajaring:
   ```bash
   npx prisma migrate deploy
   ```

---

## 💰 Narxlar (Agar upgrade qilmoqchi bo'lsangiz)

- **Free**: $0/oy (cheklangan)
- **Starter**: $7/oy (database), $7/oy (web service)
- **Standard**: $25/oy (database), $25/oy (web service)

Free plan ko'pchilik loyihalar uchun yetarli!

---

## 📞 Qo'shimcha Yordam

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com

---

**Muvaffaqiyatli Deploy! 🎉**

Agar biror muammo yuzaga kelsa, Render Logs ni tekshiring yoki menga yozing!
