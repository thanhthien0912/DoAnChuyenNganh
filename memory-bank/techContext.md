# Tech Context: Công nghệ, Thiết lập và Ràng buộc

## Stack công nghệ chính

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4+)
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB (v5+)
- **ODM**: Mongoose
- **Validation**: Joi
- **File Upload**: Multer
- **Email**: Nodemailer
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

### Frontend Web (Unified App)
- **Framework**: React.js (v18+)
- **Language**: JavaScript (ES6+)
- **State Management**: React Context API / Redux Toolkit
- **Routing**: React Router
- **UI Components**: Material-UI / Ant Design
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Yup
- **Styling**: CSS Modules / Styled Components
- **Testing**: Jest, React Testing Library
- **Build Tool**: Vite

### Mobile App (Android)
- **Language**: Kotlin
- **SDK**: Android SDK (API 24+)
- **Architecture**: MVVM
- **UI**: Jetpack Compose / XML Views
- **Networking**: Retrofit + OkHttp
- **Database**: Room Database (local storage)
- **Dependency Injection**: Dagger Hilt
- **Asynchronous**: Coroutines + Flow
- **NFC**: Host Card Emulation (HCE)
- **Testing**: JUnit, Espresso, MockK
- **Build System**: Gradle

### Database
- **Primary**: MongoDB (Atlas cloud hoặc self-hosted)
- **Caching**: Redis (cho sessions và frequent data)
- **File Storage**: AWS S3 / Local storage

### Development Tools
- **Version Control**: Git
- **Code Editor**: Visual Studio Code / Android Studio
- **API Testing**: Postman / Insomnia
- **Database Management**: MongoDB Compass
- **Package Managers**: npm, yarn, Gradle

## Thiết lập môi trường phát triển

### Prerequisites
- **Node.js**: v18.x.x trở lên
- **MongoDB**: v5.x.x trở lên
- **Android Studio**: Latest version
- **Git**: Latest version
- **VS Code**: Latest version (với extensions cần thiết)

### Environment Variables
```bash
# Backend (.env)
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/student_wallet
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# NFC Configuration
NFC_SECURITY_KEY=your_nfc_security_key
```

### Project Structure
```
student-wallet-platform/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   ├── tests/
│   ├── .env
│   └── package.json
├── frontend/                # React unified app (student + admin)
│   ├── src/
│   ├── public/
│   ├── assets/
│   └── package.json
├── mobile-app/              # Android app
│   ├── app/
│   ├── gradle/
│   └── build.gradle
├── memory-bank/            # Project documentation
├── .gitignore
└── README.md
```

## Dependencies và Packages

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.9.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.4",
    "redis": "^4.6.8",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "eslint": "^8.47.0",
    "prettier": "^3.0.2"
  }
}
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "axios": "^1.4.0",
    "@mui/material": "^5.14.5",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.3",
    "react-hook-form": "^7.45.4",
    "yup": "^1.3.0",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "react-query": "^3.39.3",
    "@hookform/resolvers": "^3.3.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5",
    "eslint": "^8.47.0",
    "prettier": "^3.0.2"
  }
}
```

### Mobile App Dependencies (build.gradle)
```gradle
dependencies {
    // Core
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'

    // Architecture
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.6.2'
    implementation 'androidx.navigation:navigation-fragment-ktx:2.7.0'
    implementation 'androidx.navigation:navigation-ui-ktx:2.7.0'

    // Networking
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'

    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'

    // Dependency Injection
    implementation 'com.google.dagger:hilt-android:2.47'
    kapt 'com.google.dagger:hilt-compiler:2.47'

    // Database
    implementation 'androidx.room:room-runtime:2.6.0'
    implementation 'androidx.room:room-ktx:2.6.0'
    kapt 'androidx.room:room-compiler:2.6.0'

    // NFC
    implementation 'androidx.nfc:androidx-nfc:1.0.0'

    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
```

## Ràng buộc kỹ thuật

### Performance Requirements
- **API Response Time**: < 500ms cho 90% requests
- **Mobile App Response**: < 2s cho UI interactions
- **Database Queries**: < 100ms cho common queries
- **Uptime**: 99.5% availability

### Security Requirements
- **Password Hashing**: bcrypt với salt rounds >= 10
- **JWT Expiration**: 7 days cho access tokens
- **HTTPS Required**: Tất cả environments
- **Input Validation**: Tất cả user inputs phải được validate
- **Rate Limiting**: 100 requests/minute per IP

### Data Constraints
- **File Upload Size**: Max 10MB per file
- **Database Connections**: Max 100 concurrent connections
- **API Rate Limit**: 1000 requests/hour per user
- **Transaction Amount**: Min 1,000 VND, Max 10,000,000 VND

### Platform Requirements
- **Android**: API level 24+ (Android 7.0+)
- **iOS**: Future consideration (not in scope)
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Node.js**: v18.x.x trở lên

## Testing Strategy

### Backend Testing
- **Unit Tests**: Jest cho individual functions
- **Integration Tests**: Supertest cho API endpoints
- **Database Tests**: In-memory MongoDB cho testing
- **Coverage**: Minimum 80% code coverage

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Mounting and interaction testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Cypress cho critical user flows

### Mobile Testing
- **Unit Tests**: JUnit cho Kotlin code
- **UI Tests**: Espresso cho interaction testing
- **Integration Tests**: MockK cho external dependencies
- **NFC Testing**: Emulator và physical device testing

## Deployment Considerations

### Backend Deployment
- **Platform**: Node.js trên Linux server
- **Process Manager**: PM2 cho production
- **Reverse Proxy**: Nginx cho load balancing
- **SSL**: Let's Encrypt certificates

### Database Deployment
- **MongoDB Atlas**: Recommended cho production
- **Backup Strategy**: Daily backups with retention
- **Monitoring**: MongoDB Atlas monitoring
- **Security**: Network access control và encryption

### Mobile App Deployment
- **Play Store**: Production distribution
- **Beta Testing**: Google Play Beta tracks
- **Code Signing**: Keystore management
- **Version Management**: Semantic versioning

## Monitoring và Logging

### Application Monitoring
- **Health Checks**: Endpoint /health cho monitoring
- **Error Tracking**: Error reporting dashboard
- **Performance Monitoring**: Response time tracking
- **Business Metrics**: Transaction volume tracking

### Logging Strategy
- **Structured Logging**: JSON format logs
- **Log Levels**: Error, Warn, Info, Debug
- **Log Rotation**: Daily rotation with retention
- **Centralized Logging**: ELK stack (Elasticsearch, Logstash, Kibana)

---
*Cập nhật lần cuối: 27/09/2025*