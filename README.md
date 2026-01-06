# Authentication Backend API

A complete Node.js authentication backend with user registration and login functionality.

## Features

- ✅ User Registration with validation
- ✅ User Login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Protected routes middleware
- ✅ MongoDB database integration
- ✅ Input validation with express-validator
- ✅ CORS enabled

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM for MySQL
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Project Structure

```
├── server.js                 # Main application entry point
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── config/
│   └── config.js           # Configuration loader
├── models/
│   ├── index.js            # Sequelize initialization
│   └── User.js             # User model schema
├── controllers/
│   └── authController.js   # Authentication logic
├── routes/
│   └── auth.js             # Authentication routes
└── middleware/
    └── auth.js             # JWT verification middleware
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=auth_db
     DB_USER=root
     DB_PASSWORD=your_password
     JWT_SECRET=your_secret_key_here
     JWT_EXPIRE=7d
     ```

3. **Set up MySQL database:**
   - Install MySQL locally or use a cloud MySQL service
   - Create a database named `auth_db` (or your preferred name)
   - Update `.env` with your MySQL credentials
   - The tables will be created automatically when you start the server
   - Update `MONGODB_URI` in `.env` with your connection string

## Running the Application

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Register User
- **URL:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

### 2. Login User
- **URL:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

### 3. Get Current User (Protected Route)
- **URL:** `GET /api/auth/me`
- **Headers:**
  ```
  Authorization: Bearer your_jwt_token_here
  ```
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-01-06T..."
    }
  }
  ```

## Testing the API

You can test the API using:
- **Postman** - Import the endpoints and test
- **cURL** - Command line testing
- **Thunder Client** - VS Code extension

### Example cURL Commands:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

- Passwords are hashed using bcrypt before storing
- JWT tokens for secure authentication
- Input validation on all routes
- Password not returned in user responses
- CORS protection
- Error handling middleware

## Next Steps

Consider adding:
- Password reset functionality
- Email verification
- Refresh tokens
- Rate limiting
- Session management
- Role-based access control (RBAC)

## License

ISC
