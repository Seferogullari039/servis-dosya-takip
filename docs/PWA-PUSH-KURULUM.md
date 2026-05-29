# PWA ve Push Bildirim Kurulumu

Seferoğulları Otomotiv servis paneli — iPhone Ana Ekran + Firebase Cloud Messaging (FCM).

## Gereksinimler

- HTTPS (Vercel production otomatik sağlar)
- iOS **16.4+** ve uygulamanın **Ana Ekrana Eklenmiş** olması (gerçek push için zorunlu)
- Firebase projesi (Blaze plan gerekmez; FCM web push ücretsiz kotada çalışır)

---

## 1. Firebase Console

1. [Firebase Console](https://console.firebase.google.com/) → yeni veya mevcut proje.
2. **Project settings** → **General** → Web uygulaması ekleyin (`</>`).
3. Config değerlerini kopyalayın (`apiKey`, `authDomain`, `projectId`, …).
4. **Build** → **Cloud Messaging**:
   - **Web Push certificates** → **Generate key pair** → VAPID public key (`NEXT_PUBLIC_FIREBASE_VAPID_KEY`).
5. **Project settings** → **Service accounts** → **Generate new private key** → JSON indirin.

---

## 2. Ortam değişkenleri (Vercel)

Vercel → Project → **Settings** → **Environment Variables**:

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Web config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Web config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Web config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web config |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Web Push VAPID public key |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Service account JSON (tek satır) |

`FIREBASE_SERVICE_ACCOUNT_JSON` örneği (PowerShell):

```powershell
$json = Get-Content -Raw .\firebase-adminsdk.json
# Vercel'e tek satır olarak yapıştırın (tırnak içinde)
```

Yerel geliştirme: `.env.local` dosyasına aynı değişkenleri ekleyin (`.env.example` şablonu).

Deploy sonrası `prebuild` script `public/firebase-messaging-sw.js` dosyasını üretir.

---

## 3. Supabase migration

```bash
npm run db:migrate
```

`016_push_subscriptions.sql` tablosunu oluşturur.

---

## 4. iPhone — Ana Ekrana Ekle

1. **Safari** ile production URL’yi açın (ör. `https://your-app.vercel.app`).
2. Giriş yapın.
3. **Paylaş** → **Ana Ekrana Ekle**.
4. Uygulamayı **ana ekrandaki ikondan** açın (Safari sekmesinden değil).
5. Dashboard’da **“Bildirim almak ister misiniz?”** → **İzin ver**.

> iOS push yalnızca Home Screen PWA + izin verilmiş bildirimler ile çalışır.

---

## 5. Bildirim akışı

| Olay | Örnek mesaj |
|------|-------------|
| İş emri oluşturuldu | Yeni iş emri oluşturuldu |
| Araç hazır | Araç teslimata hazır |
| Teslim edildi | Araç teslim edildi |
| Parça kargoda | Parça kargoda |
| Parça geldi | Parça servise ulaştı |
| Stokta yok | Parça stokta yok |
| Servis satın aldı | Servis parçayı satın aldı |
| Eksper bekleniyor | Eksper bekleniyor |
| Onay bekleniyor | Onay bekleniyor |
| Dosya kapandı | Dosya kapandı |

Bildirime tıklanınca ilgili sayfa açılır (`/is-emirleri/[id]`, `/tedarik`, `/dosyalar/[id]`, `/dashboard`).

---

## 6. Yerel geliştirme

```bash
npm install
npm run dev
```

- PWA service worker **development’ta kapalıdır** (`next.config` → `disable: dev`).
- Push test için `npm run build && npm run start` veya Vercel preview kullanın.

---

## 7. Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| Push gelmiyor (iOS) | Ana ekrandan açıldığından emin olun; iOS 16.4+ |
| Token kaydedilmiyor | `NEXT_PUBLIC_FIREBASE_VAPID_KEY` ve SW dosyası kontrol |
| Sunucu push atmıyor | `FIREBASE_SERVICE_ACCOUNT_JSON` Vercel’de tanımlı mı |
| Bildirim tıklanınca açılmıyor | `firebase-messaging-sw.js` güncel mi (`npm run prebuild`) |

Dashboard → **Push bildirim durumu** kartından abonelik durumunu kontrol edin.
