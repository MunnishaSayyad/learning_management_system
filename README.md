# 📚 Learning Management System (LMS)

A full-featured Learning Management System built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It allows instructors to create and manage courses and students to browse and enroll in them. Includes JWT authentication, role-based access, file uploads, and dynamic curriculum management.

---

## 🔗 Live Demo

🚧 _Add link here when deployed_

---

## ✨ Features

### ✅ General

- Responsive UI (Tailwind CSS + ShadCN)
- Protected routes (JWT-based)
- RESTful APIs
- Cloudinary integration for file uploads

### 👨‍🏫 Instructor

- Create, update, delete courses
- Course curriculum management (sections & lectures)
- Upload videos and PDFs
- Preview content
- Real-time form validation (React Hook Form + Yup)

### 👨‍🎓 Student

- Browse available courses
- Enroll in courses
- View curriculum
- Watch lectures (if enrolled)

### 🛠 Tech Stack

| Technology           | Role            |
| -------------------- | --------------- |
| React.js             | Frontend UI     |
| Tailwind + ShadCN    | Styling         |
| React Hook Form +YUP | Form management |
| Node.js + Express    | Backend & API   |
| MongoDB + Mongoose   | Database ORM    |
| JWT                  | Authentication  |
| Cloudinary           | File hosting    |
| TypeScript           | Type safety     |

## 🏁 Getting Started

### 🔧 Backend Setup

cd backend
npm install
cp .env.example .env # Add MongoDB URI, JWT_SECRET, Cloudinary keys
npm run dev

### ⚙️ Frontend Setup

cd frontend
npm install
cp .env.example .env # Add VITE_API_URL and google clinet id keys
npm run dev

### 🔐 Environment Variables

.env for backend:
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

.env for frontend:
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=google_client_id

### 📂 Folder Structure

├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middlewares/
│ └── utils/
├── frontend/
│ ├── components/
│ ├── pages/
│ ├── context/
│ ├── hooks/
│ └── types/

### 🧪 Testing

✅ Manual testing through UI

✅ Postman for API testing

✅ Client-side form validation with Yup

### 👩‍💻 Author

Hemalatha Pallem
