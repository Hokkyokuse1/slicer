# Cloud Slicer 🚀
**Modular 3D Printing Quote Engine & API**

A professional, cloud-native application for slicing 3D models and generating material/cost estimates. Developed as a showcase for technical excellence in full-stack development, DevOps, and cloud architecture.

![License](https://img.shields.io/badge/license-MIT-blue)
![Firebase](https://img.shields.io/badge/Firebase-Free_Tier-orange)
![Podman](https://img.shields.io/badge/Podman-OCI_Compliant-purple)

## 🌟 Key Features
- **Premium UX**: A glassmorphic React dashboard with real-time 3D STL previews and live job tracking.
- **Serverless API**: Modular Node.js backend hosted on Firebase Functions, optimized for free-tier usage.
- **Containerized Slicing**: Uses a custom Slic3r implementation running in OCI-compliant containers (Podman/Cloud Run).
- **Intelligent Queuing**: Firestore-backed job management that enforces concurrency limits to stay within cloud free tiers.
- **Programmatic Access**: Built-in toggle to enable/disable API key access for external developers.
- **Google Auth**: Secure user authentication and per-user instance management.

## 🏗️ Architecture
Cloud Slicer follows a decoupled, service-oriented architecture:

1.  **Frontend (React/Vite)**: Deployed to Firebase Hosting. Communicates with the API via Firebase ID Tokens.
2.  **API Gateway (Firebase Functions)**: Handles authentication, job validation, and storage coordination.
3.  **Slicer Service (Cloud Run/Podman)**: An independent microservice that accepts STL files and returns G-code/metadata.
4.  **Persistence (Firestore & Storage)**: Real-time job status updates and secure file storage.

## 🛠️ Tech Stack
- **Frontend**: React, Three.js (R3F), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Firebase (Auth, Firestore, Functions, Storage).
- **Core Engine**: Slic3r (C++/Perl) wrapped in a Node.js API.
- **DevOps**: Podman for local development and containerization.

## 🚦 Getting Started

### Local Development (Slicer)
```bash
cd slicer
podman build -t cloudslicer-engine .
podman run -p 8080:8080 cloudslicer-engine
```

### Backend Setup
```bash
cd functions
npm install
# Set your environment variables
firebase functions:config:set slicer.url="http://YOUR_CLOUD_RUN_URL"
```

### Frontend Setup
```bash
cd web
npm install
npm run dev
```

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Created for a Senior Tech Interview Showcase.*
