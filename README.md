# ChatConnect - Real-Time 1:1 Web Chat App

A simple real-time 1:1 chat application built with Node.js and Socket.IO. Features JWT authentication, user list with online status, real-time messaging with typing indicators, and persistent message history using MongoDB.

## Features

- **Authentication**: Secure user registration and login using JWT
- **User List**: View all registered users and their online status
- **Real-Time Chat**: Instant messaging powered by Socket.IO
- **Typing Indicators**: See when another user is typing
- **Message Status**: Track message status with sent, delivered, and read receipts
- **Persistent History**: All conversations are saved to MongoDB

## Tech Stack

- **Frontend (Mobile)**: React Native (Expo)
- **Frontend (Web test client)**: HTML, CSS, JavaScript (in `server/public/`)
- **Backend**: Node.js, Express, Socket.IO, MongoDB, Mongoose
- **Authentication**: JSON Web Tokens (JWT), bcryptjs

## Project Structure

```
chatapp/
├── server/                  # Backend Node.js application (Express + Socket.IO)
│   ├── models/              # MongoDB models (User, Message)
│   ├── routes/              # REST API routes (auth, users, messages)
│   ├── middleware/          # JWT auth middleware
│   ├── public/              # Basic web client for testing
│   ├── scripts/             # Utility scripts (e.g., seed.js)
│   ├── app.js               # Server entrypoint
│   ├── package.json
│   └── .env                 # Environment variables (PORT, MONGODB_URI, JWT_SECRET, RESET_DB_ON_START)
│
├── mobile/                  # Legacy React Native project (native). Not required for Expo/web.
│   └── android/             # Native Android project (can be ignored if using Expo)
│
└── mobile-expo/             # React Native (Expo) app used for development
    ├── app.json             # Expo config with public env vars (API/SOCKET URLs)
    ├── package.json
    ├── App.js               # App root, navigation container
    └── src/
        ├── navigation/      # Stack navigator (Auth, Home, Chat)
        ├── screens/         # Login, Register, Home, Chat screens
        └── services/        # api.js (Axios), socket.js (Socket.IO client)
```

## MVP Checklist

- __Auth__: Register, Login (JWT-based)
- __User List__: Show all users, tap to start chat, last message preview
- __Chat Screen__:
  - Real-time messaging (Socket.IO)
  - Messages persist in DB
  - Typing indicator
  - Online/Offline status
  - Delivery/Read receipts (✔ sent, ✔✔ delivered, ✔✔ blue = read)
  - Scrollable messages, input box at bottom
- __Basic UI__:
  - Auth screens
  - Home (user list + last message)
  - Chat (scrollable messages, input box, typing, ticks)

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)

### Setup and Run

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd chatapp
    ```

2.  **Setup the Backend:**
    - Navigate to the server directory: `cd server`
    - Install dependencies: `npm install`
    - Create a `.env` file and configure the variables (see below).
    - Start the server: `npm start`

3.  Mobile app (Expo)
    - Use the Expo app under `mobile-expo/`.
    - The legacy native project under `mobile/` remains in the repo but is not required for running via Expo or the web client.

### Environment Variables

Create a `.env` file in the `server` directory with the following configuration:

```dotenv
# Server port
PORT=5000

# Your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/chatapp

# A strong, unique secret for signing JWTs
JWT_SECRET=your_jwt_secret_key_here

# Optional: drop database on server start (use only for development)
RESET_DB_ON_START=false
```

## API Endpoints

- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Log in an existing user.
- `GET /users`: Get a list of all users.
- `GET /conversations/:userId/messages`: Retrieve message history for a conversation.
- `PUT /messages/conversations/:userId/read`: Mark messages in a conversation as read.

## Socket Events

- `message:send` → send new msg. Payload: `{ receiverId, text }`
- `message:new` → receive msg. Emitted to receiver (and general broadcast when applicable)
- `typing:start` | `typing:stop` → typing indicators. Payload: `{ receiverId }`
- `message:read` → mark as read and notify sender. Payload: `{ messageId, senderId }`

## Styling Guidelines (Mobile)

- Clean, simple, WhatsApp-like layout
- No gradients or flashy/bright colors
- Soft, eye-friendly palette (subtle blues/teals/greys), clear contrast
- Smooth, uncluttered screens: Auth, Home (user list + last message), Chat (scroll + input + ticks)
- Preferred fonts: Poppins, Nunito, or Inter for readability

## React Native (Expo) Setup

This repo includes a lightweight Expo app under `mobile-expo/` to satisfy the mobile deliverable without native Android/iOS build steps.

1. Backend must be running on `PORT=5000` (see Environment Variables above)
2. Find your PC LAN IP (Windows): `ipconfig` → e.g. `192.168.x.x`
3. Edit `mobile-expo/app.json` and set:
   - `EXPO_PUBLIC_API_BASE_URL`: `http://<YOUR_LAN_IP>:5000`
   - `EXPO_PUBLIC_SOCKET_URL`: `http://<YOUR_LAN_IP>:5000`
4. Install and run the Expo app:
   ```bash
   cd mobile-expo
   npm install
   npx expo start
   ```
   - Press `a` for Android emulator, `w` for web, or scan QR in Expo Go app

MVP in Expo app:
- Auth screens (Register/Login, JWT)
- Home (user list + last message)
- Chat (real-time via Socket.IO, typing, ✓/✓✓ receipts, persistence)

## Deliverables

- GitHub repo with main folders:
  - `/server` → Node.js backend (Express + Socket.IO)
  - `/mobile-expo` → Expo app used for development and testing
  - `/mobile` → Legacy native React Native project (kept, not required for Expo/web)
- README includes setup, run steps, env vars, and sample users

## Sample Users

For quick testing, you can register with the following credentials or create your own:

- **User 1:**
  - **Email:** `alice@test.com`
  - **Password:** `password123`
- **User 2:**
  - **Email:** `bob@test.com`
  - **Password:** `password123`

### Seed Script (optional)

You can pre-create sample users:

```bash
cd server
npm run seed
```

## Future Ideas

- Group chat functionality
- File and image sharing
- Push notifications
- User profile customization

## License

This project is for personal use. Feel free to use and modify it.
