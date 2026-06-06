# نشر SmarTooth على Cloudflare Pages (مجاني للأبد)

موقعك React (Vite) + وظائف الدفع (MyFatoorah) + Supabase — كله بيشتغل على Cloudflare Pages
بدون "رصيد" ولا تجارب ولا إيقاف نشر. هاي الخطوات لمرة وحدة.

## 1) أنشئ المشروع
1. سجّل/ادخل على https://dash.cloudflare.com → من اليسار: **Workers & Pages**.
2. **Create application** → تبويب **Pages** → **Connect to Git**.
3. اربط حساب GitHub واختر مستودع **`MohammadNasas/dentacare`** → **Begin setup**.

## 2) إعدادات البناء (Build settings)
| الحقل | القيمة |
|---|---|
| Framework preset | **None** (أو Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (افتراضي، فاضي) |

## 3) متغيّرات البيئة (Environment variables)
أضِفها كلها تحت **Production** (و**Preview** إذا حاب). انسخ القيم من Netlify
(Site settings → Environment variables) أو من Supabase / MyFatoorah:

| المتغيّر | لوين بيُستعمل | القيمة |
|---|---|---|
| `VITE_SUPABASE_URL` | بناء الواجهة | رابط مشروع Supabase |
| `VITE_SUPABASE_ANON_KEY` | بناء الواجهة | مفتاح anon العام |
| `SUPABASE_URL` | وظائف الدفع | نفس رابط Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | وظائف الدفع | مفتاح service_role (**سرّي!**) |
| `MYFATOORAH_TOKEN` | وظائف الدفع | توكن MyFatoorah |
| `MYFATOORAH_BASE` | وظائف الدفع | `https://apitest.myfatoorah.com` (تجريبي) |
| `MYFATOORAH_CURRENCY` | وظائف الدفع | `USD` (اختياري) |
| `NODE_VERSION` | البناء | `20` (موجود بـ `.nvmrc` كمان) |
| `SITE_URL` | وظائف الدفع | اختياري — بياخد رابط الموقع تلقائياً |

> 🔒 مفتاح `service_role` سرّي — موجود بس هون بإعدادات Cloudflare، أبداً مش بالكود.

## 4) انشر
اضغط **Save and Deploy**. أول بناء بياخد دقيقة-دقيقتين. بيطلعلك رابط زي:
`https://dentacare-xxx.pages.dev`

## 5) (لاحقاً) دومين خاص
Pages → مشروعك → **Custom domains** لو بدك دومين باسمك. بعدها حُط نفس الدومين
بمتغيّر `SITE_URL` لو حبيت تثبّته.

---
**كيف بيشتغل:** الواجهة بتنادي `/api/create-payment` و `/api/verify-payment`، وهنّي
موجودين بمجلد `functions/api/` — Cloudflare بشغّلهم تلقائياً كـ Functions على نفس الرابط.
