# 🚀 Crypto News Aggregator

เว็บแอพพลิเคชันรวบรวมข่าวคริปโตเคอร์เรนซีจากแหล่งต่างๆ พร้อมการวิเคราะห์ Sentiment และ Trending Score โดย AI

## ✨ คุณสมบัติหลัก

- 📰 **รวบรวมข่าวอัตโนมัติ** จาก RSS feeds ของเว็บไซต์ข่าวคริปโตชั้นนำ
- 🤖 **วิเคราะห์ด้วย AI** ใช้ Google Gemini API วิเคราะห์ sentiment และ trending score
- 📊 **จัดอันดับข่าว** ตาม trending score และความน่าสนใจ
- 🔍 **ฟิลเตอร์ข้าวต** ตาม sentiment, แหล่งข่าว, และเวลา
- 📱 **Responsive Design** ใช้งานได้ทุกอุปกรณ์
- ⚡ **Real-time Updates** อัปเดตข่าวทุกชั่วโมงโดยอัตโนมัติ

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI Analysis**: Google Gemini API
- **UI Components**: Tailwind CSS 
- **Cron Jobs**: Vercel Cron
- **RSS Parsing**: rss-parser

## 📋 ข้อกำหนดระบบ

- Node.js 18+
- npm หรือ yarn
- Supabase account
- Google AI API key

## 🚀 การติดตั้ง

### 1. Clone Repository

```bash
git clone <repository-url>
cd crypto-news-aggregator
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` และเพิ่มตัวแปรต่อไปนี้:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini API
GEMINI_API_KEY=your-google-gemini-api-key

```

### 4. ตั้งค่า Supabase Database

รัน SQL script ใน Supabase SQL Editor:

```sql
-- คัดลอกเนื้อหาจากไฟล์ supabase-schema.sql
```

### 5. รันแอพพลิเคชัน

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## 📊 แหล่งข่าวที่รองรับ

- **CoinDesk** - ข่าวคริปโตชั้นนำ
- **Cointelegraph** - ข่าวและบทวิเคราะห์
- **CoinGape** - ข่าวตลาดและเทคโนโลยี
- **Bitcoin Magazine** - ข่าวเฉพาะ Bitcoin
- **CryptoSlate** - ข่าวและข้อมูลโปรเจค

## 🔄 การทำงานของระบบ

### 1. News Crawler (ทุกชั่วโมง)
- ดึงข่าวจาก RSS feeds
- ตรวจสอบข่าวซ้ำ
- เก็บข้อมูลใน Supabase

### 2. AI Analysis
- ใช้ Gemini API วิเคราะห์เนื้อหา
- สร้างสรุปข่าว (Summary)
- ประเมิน Sentiment (Positive/Neutral/Negative)
- คำนวณ Trending Score (0-100)

### 3. Frontend Display
- แสดงข่าวตาม trending score
- ฟิลเตอร์และการเรียงลำดับ
- สถิติและข้อมูลเชิงลึก

## 🛡️ Security Features

- **RLS (Row Level Security)** ใน Supabase
- **Cron Secret** สำหรับ API endpoints
- **Input Validation** และ sanitization
- **Rate Limiting** สำหรับ API calls

## 📈 การปรับแต่งประสิทธิภาพ

- **Database Indexing** สำหรับ query ที่เร็วขึ้น
- **Caching** ด้วย Next.js built-in cache
- **Lazy Loading** สำหรับ components
- **Image Optimization** สำหรับรูปภาพ

## 🚀 การ Deploy

### Vercel (แนะนำ)

1. เชื่อมต่อ repository ไปยัง Vercel
2. ตั้งค่า Environment Variables ใน Vercel Dashboard
3. Deploy จะทำงานอัตโนมัติ

### อื่นๆ

สามารถ deploy ไปยัง platform อื่นที่รองรับ Next.js เช่น:
- Netlify
- Railway
- PlanetScale + Vercel

## 🔧 การพัฒนาต่อ

### เพิ่มแหล่งข่าวใหม่

แก้ไขไฟล์ `src/lib/rss-parser.ts`:

```typescript
export const NEWS_SOURCES: NewsSource[] = [
  // แหล่งข่าวเดิม...
  {
    name: 'ชื่อแหล่งข่าวใหม่',
    url: 'https://example.com/rss',
    enabled: true
  }
]
```

### ปรับแต่ง AI Prompt

แก้ไขไฟล์ `src/lib/gemini.ts` ใน method `analyzeArticle`

### เพิ่ม Features ใหม่

- สร้าง API routes ใหม่ใน `src/app/api/`
- เพิ่ม components ใน `src/components/`
- ปรับแต่ง database schema ใน Supabase

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **API Rate Limiting**: ลด frequency ของ cron job
2. **Database Connection**: ตรวจสอบ Supabase credentials
3. **Gemini API Errors**: ตรวจสอบ API key และ quota

### Debug Mode

เปิด debug mode ด้วยการตั้งค่า:

```env
NODE_ENV=development
DEBUG=true
```

## 📝 License

MIT License - ดู LICENSE file สำหรับรายละเอียด

## 🤝 การสนับสนุน

หากพบปัญหาหรือต้องการเสนอแนะ:
- เปิด GitHub Issue
- Fork และสร้าง Pull Request
- ติดต่อผ่าน email

---

Made with ❤️ for the Crypto Community
