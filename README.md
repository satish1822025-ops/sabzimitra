# 🥬 SabziMitra

**SabziMitra** connects customers with nearby vegetable and fruit vendors in real-time. Find fresh produce, compare prices, and contact vendors directly — all from your mobile device.

## 🌟 Features

### For Customers 🛒
- **Live Map View**: Discover vendors near you with interactive Google Maps
- **Real-time Inventory**: See what's available, how much it costs, and when it was last updated
- **Smart Filters**: Filter by product, price, distance, quality, organic-only
- **Direct Contact**: Call, WhatsApp, or chat with vendors
- **Favorites**: Save your go-to vendors
- **Reviews & Ratings**: Read community feedback

### For Vendors 🏪
- **Photo-based Listing**: Take a photo → AI identifies the vegetable → Set price & quantity → Go live!
- **Real-time Updates**: Customers see your stock changes instantly (WebSocket)
- **Simple Dashboard**: Track views, sales, popular items
- **Quick Actions**: Mark all sold out, duplicate yesterday's stock, set discounts
- **Minimal Literacy Support**: Icons, visual feedback, Hindi language support

## 🎨 Design System

Premium earthy color palette:
- **Primary**: `#252525` (dark), `#545454`, `#7D7D7D`, `#CFCFCF`, `#E6E6E6`, `#F2F0EF`, `#FFFFFF`
- **Accent** (warm tones): `#FFDBBB`, `#CCBEB1`, `#997E67`, `#664930`
- **Nature** (fresh greens): `#7B9699`, `#6C8480`, `#BAC8B1`, `#404E3B`

Typography: Inter / Poppins  
Animations: Smooth 300ms transitions, skeleton loaders, fade-ins

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 22+, RxJS, Angular Material + Tailwind CSS |
| **Backend** | Spring Boot 3.3.4, Spring Security, Spring Data JPA |
| **Database** | PostgreSQL (primary), Redis (caching) |
| **Real-time** | WebSocket (STOMP/SockJS) for live inventory |
| **Maps** | Google Maps JavaScript API + Geolocation API |
| **Auth** | JWT (Access + Refresh tokens), OAuth2 optional |
| **Deployment** | Docker, Docker Compose |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Java 21+
- PostgreSQL 16+
- Redis 7+
- Docker (optional)

### 1. Clone & Install

```bash
# Angular Frontend
cd d:/Internship/sabzimitra
npm install

# Spring Boot Backend
cd d:/Internship/sabzimitrabackend/sabzimitrabackend
./mvnw clean install
```

### 2. Configure Environment

**Frontend**: Update `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'http://localhost:8080',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
};
```

**Backend**: Update `src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sabzimitra
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.data.redis.host=localhost
app.jwt.secret=YOUR_SECRET_KEY_256_BITS
```

### 3. Start Services

**Option A: Manual**
```bash
# Start PostgreSQL & Redis
# (install via your package manager or run via Docker)

# Run Backend
cd d:/Internship/sabzimitrabackend/sabzimitrabackend
./mvnw spring-boot:run

# Run Frontend
cd d:/Internship/sabzimitra
npm start
```

**Option B: Docker Compose** (recommended)
```bash
cd d:/Internship/sabzimitra
docker-compose up --build
```

Frontend: http://localhost:4200  
Backend: http://localhost:8080  
Swagger UI: http://localhost:8080/swagger-ui/index.html

### 4. Create Database

PostgreSQL:
```sql
CREATE DATABASE sabzimitra;
```

Flyway will auto-run migrations on app startup.

## 📊 Database Schema

- `users` — auth & profile
- `vendors` — shop details, location (lat/lng), status
- `products` — vegetable catalog (English + Hindi names)
- `vendor_inventory` — stock, prices, quality grades
- `favorites`, `reviews`, `messages`, `notifications`

## 📱 Demo Credentials

All passwords: **`password123`**

| Role | Phone | Email | Name |
|------|-------|-------|------|
| Vendor | +919876543210 | ramkaka@sabzimitra.in | Ram Kaka |
| Vendor | +919876543211 | shyam@sabzimitra.in | Shyam Vegetables |
| Vendor | +919876543212 | devi@sabzimitra.in | Devi Fresh Farm |
| Customer | +919876500001 | rahul@gmail.com | Rahul Kumar |
| Customer | +919876500002 | priya@gmail.com | Priya Sharma |

## 🗺️ API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/send-otp` — Send OTP
- `POST /api/auth/verify-otp` — Verify OTP & login
- `POST /api/auth/refresh` — Refresh tokens
- `GET /api/auth/me` — Current user

### Vendors (Public)
- `GET /api/vendors/nearby?lat={}&lng={}&radius={}` — Find nearby vendors
- `GET /api/vendors/{id}` — Vendor profile + inventory
- `GET /api/vendors/{id}/reviews` — Reviews
- `POST /api/vendors/{id}/favorite` — Add to favorites
- `DELETE /api/vendors/{id}/favorite` — Remove from favorites
- `GET /api/customer/favorites` — My favorites
- `POST /api/reviews` — Add review

### Vendor Management (Vendor role only)
- `GET /api/vendor/profile` — My shop profile
- `PUT /api/vendor/profile` — Update profile
- `PUT /api/vendor/status` — Open/Close shop
- `GET /api/vendor/dashboard` — Stats
- `GET /api/vendor/inventory` — My inventory
- `POST /api/vendor/inventory` — Add item
- `PUT /api/vendor/inventory/{id}` — Update item
- `DELETE /api/vendor/inventory/{id}` — Delete item
- `POST /api/vendor/inventory/mark-sold-out` — Mark all sold out
- `POST /api/vendor/inventory/duplicate-yesterday` — Duplicate stock
- `POST /api/vendor/identify-product` — AI product identification (upload image)

### Search
- `GET /api/search/suggestions?q={}` — Autocomplete
- `GET /api/search/seasonal` — Seasonal items

### WebSocket
- Connect: `ws://localhost:8080/ws` (SockJS)
- Subscribe: `/topic/chat/{roomId}` — Chat messages
- Subscribe: `/topic/vendor/{vendorId}/stock-updates` — Real-time inventory updates
- Send: `/app/chat/{roomId}` — Send message

## 📦 Project Structure

### Angular Frontend
```
src/app/
├── core/               # Services, guards, interceptors, models
│   ├── services/
│   ├── interceptors/
│   ├── guards/
│   └── models/
├── shared/             # Reusable components
│   ├── header/
│   ├── footer/
│   ├── skeleton-loader/
│   ├── rating-stars/
│   └── toast/
└── modules/
    ├── auth/           # Login, Register, OTP
    ├── customer/       # Map, Search, Vendor Detail, Favorites
    ├── vendor/         # Dashboard, Inventory, Add Product, Profile
    └── chat/           # WebSocket messaging
```

### Spring Boot Backend
```
src/main/java/com/sabzimitra/sabzimitrabackend/
├── config/             # Security, WebSocket, CORS
├── controller/         # REST controllers
├── service/            # Business logic
├── repository/         # JPA repositories
├── entity/             # JPA entities
├── dto/                # Request/Response DTOs
├── security/jwt/       # JWT service, auth filter
├── exception/          # Global exception handler
└── websocket/          # WebSocket message handlers
```

## 🔒 Security

- JWT-based auth (access + refresh tokens)
- BCrypt password hashing
- Role-based access control (CUSTOMER, VENDOR, ADMIN)
- CORS configured for frontend origin
- Rate limiting on auth endpoints (TODO)

## 🚢 Deployment

### Docker Compose (easiest)
```bash
docker-compose up --build -d
```

### Manual Deploy
1. Build frontend: `ng build --configuration production`
2. Serve via nginx (use provided `nginx.conf`)
3. Build backend: `mvn clean package`
4. Run: `java -jar target/sabzimitrabackend-0.0.1-SNAPSHOT.jar`

## 📝 TODO / Roadmap

- [ ] Integrate Google Vision API for product photo recognition
- [ ] File upload to AWS S3 / Cloudinary
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Vendor subscription payment gateway
- [ ] Admin panel for moderation
- [ ] Progressive Web App (PWA) manifest
- [ ] Offline mode support
- [ ] Price trend analytics
- [ ] Recipe suggestions based on inventory

## 🤝 Contributing

This is a fully functional startup-ready MVP. To extend:
1. Fork the repo
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License — Free to use, modify, and deploy.

## 👨‍💻 Author

Built with ❤️ by the SabziMitra team.  
Contact: help@sabzimitra.in

---

**🌱 SabziMitra — Fresh Veggies Near You**
