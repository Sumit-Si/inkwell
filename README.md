# 🖋️ Inkwell - Blog Publishing API with Admin Approval Flow

A REST API for blog publishing with admin approval workflow, built with Node.js, Express, and PostgreSQL.

## ✨ Features

- **User Management**: Registration, authentication, role-based access control
- **Blog Post Management**: CRUD operations with approval workflow
- **Admin Approval**: Posts require admin approval before publication
- **Category System**: Hierarchical categories with parent-child relationships
- **Comment System**: Nested comments with approval workflow
- **API Key Management**: Secure API access with key-based authentication
- **File Upload**: Cloudinary integration for banner images and user profiles
- **Rate Limiting**: Protection against API abuse

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL
- **ORM**: Prisma 6.x
- **Authentication**: JWT + Refresh Tokens
- **Security**: bcryptjs, express-validator, express-rate-limit
- **File Upload**: Multer + Cloudinary

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Docker (optional)
- Cloudinary account

## 🚀 Quick Start

1. **Clone & Install**

   ```bash
   git clone <repository-url>
   cd inkwell
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**

   ```bash
   docker-compose up -d
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start Application**

   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://<username>:<password>@<localhost>:5432/inkwell"

# JWT Security
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000   # Frontend URL

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📁 File Upload Structure

```
public/
├── uploads/
│   ├── posts/          # Blog post banner images
│   └── userProfiles/   # User profile pictures
├── temp/               # Temporary upload storage
└── .gitkeep
```

### File Upload Limits

- **Post Images**: 5MB max (JPEG, PNG, WebP)
- **User Profile**: 2MB max (JPEG, PNG, WebP)
- **General**: 10MB max (JPEG, PNG, WebP)

## 📚 API Documentation

### Base URL: `http://localhost:3000/api/v1`

### 🔐 Authentication Endpoints

#### `POST /users/register`

**Request:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "fullName": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "USER"
    }
  }
}
```

#### `POST /users/login`

**Request:**

```json
{
  "username": "johndoe" || "email" : "johndoe@gmail.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "role": "USER"
    }
  }
}
```

#### `POST /users/api-key` (Protected)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Request:**

```json
{
  "endedAt": "2024-12-31T23:59:59.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "API key generated successfully",
  "data": {
    "apiKey": "generated-api-key"
  }
}
```

#### `GET /users/me` (Protected)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "profileImage": "url"
    }
  }
}
```

### 📝 Blog Post Endpoints

#### `POST /posts` (Protected)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Request:**

```json
{
  "title": "My First Blog Post",
  "description": "This is the content of my blog post",
  "categories": ["technology", "programming"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": {
      "id": "uuid",
      "title": "My First Blog Post",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### `POST /posts/:id/banner` (Protected)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Request:** `multipart/form-data` with `bannerImage` field

**Response:**

```json
{
  "success": true,
  "message": "Banner image uploaded successfully",
  "data": {
    "bannerImage": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "inkwell/post_1234567890_abc123",
      "format": "jpg",
      "size": 1024000
    }
  }
}
```

#### `GET /posts` (Public)

**Response:**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "title": "My First Blog Post",
        "status": "APPROVED",
        "author": {
          "username": "johndoe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### `GET /posts/:id` (Protected)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Response:**

```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "title": "My First Blog Post",
      "description": "Content...",
      "status": "APPROVED",
      "slug": "my-first-blog-post",
      "bannerImage": "url",
      "author": {
        "username": "johndoe"
      },
      "categories": ["technology"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 👤 User Profile Endpoints

#### `PUT /users/profile-image` (Protected)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Request:** `multipart/form-data` with `profileImage` field

**Response:**

```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "profileImage": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "inkwell/userProfile_1234567890_abc123",
      "format": "png",
      "size": 512000
    }
  }
}
```

### 💬 Comment Endpoints

#### `POST /posts/:postId/comments` (Protected)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Request:**

```json
{
  "message": "Great article!",
  "parentId": null
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "comment": {
      "id": "uuid",
      "message": "Great article!",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### `GET /posts/:postId/comments` (Public)

**Response:**

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "message": "Great article!",
        "status": "APPROVED",
        "author": {
          "username": "johndoe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 🏷️ Category Endpoints

#### `POST /categories` (Protected, Admin only)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Request:**

```json
{
  "categoryName": "Technology",
  "parentId": null
}
```

**Response:**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": "uuid",
      "categoryName": "Technology",
      "parentId": null
    }
  }
}
```

### 👨‍💼 Admin Review Endpoints

#### `GET /admin/posts` (Protected, Admin only)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Response:**

```json
{
  "success": true,
  "data": {
    "pendingPosts": [
      {
        "id": "uuid",
        "title": "My First Blog Post",
        "status": "PENDING",
        "author": {
          "username": "johndoe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### `PUT /admin/posts/:id/approve` (Protected, Admin only)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Request:**

```json
{
  "comment": "Great content, approved!",
  "rating": 5
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post approved successfully",
  "data": {
    "post": {
      "id": "uuid",
      "status": "APPROVED"
    }
  }
}
```

#### `PUT /admin/posts/:id/reject` (Protected, Admin only)

**Headers:** `Authorization: Bearer <jwt-token>`, `X-API-Key: <api-key>`

**Request:**

```json
{
  "comment": "Content needs improvement"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post rejected successfully",
  "data": {
    "post": {
      "id": "uuid",
      "status": "REJECTED"
    }
  }
}
```

### 🏥 Health Check

#### `GET /healthCheck`

**Response:**

```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 Security Features

### Authentication

- **JWT Tokens**: Access token (15min) + Refresh token (7 days)
- **API Keys**: Required for all protected endpoints
- **Password Hashing**: bcryptjs with salt rounds

### Authorization

- **Role-Based Access**: USER vs ADMIN permissions
- **Resource Ownership**: Users can only modify their own content
- **Admin Privileges**: Post approval, category management

### Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per window
- **Headers**: `X-RateLimit-*` for monitoring

### Input Validation

- **Request Validation**: express-validator middleware
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: Input sanitization

### File Upload Security

- **File Type Validation**: Only JPEG, PNG, WebP allowed
- **Size Limits**: Configurable per upload type
- **Cloud Storage**: Secure Cloudinary integration
- **Automatic Cleanup**: Temporary files removed after upload

## 🗄️ Database Schema

### Core Models

- **User**: Authentication, roles, profile
- **Post**: Blog content with approval workflow
- **Category**: Hierarchical organization
- **Comment**: Nested discussion system
- **PostReview**: Admin approval workflow
- **ApiKey**: Secure API access

### Key Features

- UUID primary keys
- Timestamp tracking
- Soft delete support
- Referential integrity

## 🧪 Development

### Scripts

```bash
npm run dev      # Development with nodemon
npm start        # Production server
```

### Database Operations

```bash
npx prisma generate    # Generate client
npx prisma migrate dev # Run migrations
npx prisma studio     # Database GUI
```

### Docker

```bash
docker-compose up -d   # Start PostgreSQL
```

## 🧪 Testing Examples

### cURL Commands

**Register User:**

```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123","fullName":"Test User"}'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'
```

**Create Post (with auth):**

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -H "X-API-Key: <api-key>" \
  -d '{"title":"Test Post","description":"Content","categories":["test"]}'
```

**Upload Banner Image:**

```bash
curl -X POST http://localhost:3000/api/v1/posts/123/banner \
  -H "Authorization: Bearer <jwt-token>" \
  -H "X-API-Key: <api-key>" \
  -F "bannerImage=@/path/to/image.jpg"
```

**Update Profile Image:**

```bash
curl -X PUT http://localhost:3000/api/v1/users/profile-image \
  -H "Authorization: Bearer <jwt-token>" \
  -H "X-API-Key: <api-key>" \
  -F "profileImage=@/path/to/profile.jpg"
```

## 📄 License

ISC License

## 👨‍💻 Author

**Sumit Singh Tomar**

---

**Inkwell** - Blog Publishing API with Admin Approval Flow 🚀
