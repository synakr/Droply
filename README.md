# Droply 🚀  
**(Under development)**

[![GitHub stars](https://img.shields.io/github/stars/your-username/droply?style=social)](https://github.com/your-username/droply/stargazers)  
[![GitHub forks](https://img.shields.io/github/forks/your-username/droply?style=social)](https://github.com/your-username/droply/network/members)  
[![GitHub issues](https://img.shields.io/github/issues/your-username/droply)](https://github.com/your-username/droply/issues)  
[![GitHub license](https://img.shields.io/github/license/your-username/droply)](LICENSE) 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![License](https://img.shields.io/badge/license-MIT-green)  
![Status](https://img.shields.io/badge/status-active-brightgreen)  
![Made with Node.js](https://img.shields.io/badge/made%20with-Node.js-blue)  
![Database](https://img.shields.io/badge/database-MySQL-orange)

*A simple, temporary file sharing platform*  

Droply is a lightweight web application that allows users to quickly upload files, access them from anywhere with a simple login, and have them automatically deleted after a short time. Think of it as your personal, no-hassle file vault.  
No Google Drive. No hassle. Just upload your files, set a short expiry, and download them from anywhere.


## Major Update: AI Chat Bot Integration 🤖
- Integrated **DeepSeek AI Chat Bot** for an interactive experience.  
- Chat bot speaks like **Ethan Hunt**, giving guidance and tips while you navigate Droply.  
- Completely **free to use** through the platform.  
- Enhances the **Mission Impossible theme**, making your file-sharing experience more thrilling.  



## Features ✨
- 🔑 Simple username + password based login  
- 📂 Upload and download files from anywhere  
- ⏳ Automatic file expiry (1–2 days)  
- 🌍 Accessible from any device, anywhere  
- 🗑️ Files auto-deleted after expiry  

## Tech Stack 🛠️
- **Backend:** Node.js + Express  
- **Database:** MySQL  
- **Frontend:** HTML, CSS, JavaScript (basic)  
- **File Handling:** Multer  
- **Authentication:** bcrypt (password hashing), JWT  

## Installation ⚡

1. Clone the repository  
```bash
git clone https://github.com/yourusername/droply.git
cd droply
````

2. Install dependencies

```bash
npm install
```

3. Setup MySQL database

* Create a database `droply`
* Run the SQL script in `db.sql` (to be provided)

4. Configure environment variables
   Create a `.env` file in the root folder:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=droply
JWT_SECRET=supersecretkey
```

5. Run the server

```bash
npm start
```

6. Open frontend
   Open `index.html` in your browser or host it using any static server.

---


## Future Improvements 🚧

* Cloud storage integration (AWS S3, GCP, etc.)
* Better UI with React or Vue
* End-to-end encryption for files
* Expiry notifications
* Better AI personality customization

---

## License 📄

This project is licensed under the MIT License.

---

## Author 👨‍💻

Developed by Md Sayan Akram – learning MERN & MySQL, building cool stuff.

---