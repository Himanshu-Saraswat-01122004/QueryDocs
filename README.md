# QueryDocs

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

AI-powered document query system with natural language interface

[Features](#features) • [Setup](#setup) • [Usage](#usage) • [Architecture](#architecture) • [Development](#development) • [Deployment](#deployment)

</div>

## ✨ Features

<div align="center">
  <table>
    <tr>
      <td align="center"><b>💬 Interactive</b></td>
      <td align="center"><b>🤖 Smart</b></td>
      <td align="center"><b>🔍 Contextual</b></td>
      <td align="center"><b>📱 Responsive</b></td>
    </tr>
    <tr>
      <td>Natural chat experience</td>
      <td>AI document analysis</td>
      <td>Maintains conversation context</td>
      <td>Works on all devices</td>
    </tr>
  </table>
</div>

## 🚀 Setup

```bash
# Clone and install dependencies
git clone https://github.com/yourusername/QueryDocs.git
cd QueryDocs

# Setup backend
cd server
npm install
cp .env.example .env

# Setup frontend
cd ../querydocs
npm install
```

## 📋 Usage

```bash
# Start backend (http://localhost:8000)
cd server && npm start

# Start frontend (http://localhost:3000)
cd ../querydocs && npm run dev
```

Visit `http://localhost:3000` in your browser

## 🔄 Workflow

<div align="center">
  <table>
    <tr>
      <td align="center"><b>📤 Upload</b></td>
      <td align="center"><b>⚙️ Process</b></td>
      <td align="center"><b>❓ Query</b></td>
      <td align="center"><b>✅ Results</b></td>
    </tr>
    <tr>
      <td>Add documents (PDF, DOC, TXT)</td>
      <td>Auto-indexed with AI</td>
      <td>Ask questions naturally</td>
      <td>Get answers with references</td>
    </tr>
  </table>
</div>

## 🏗️ Architecture

<div align="center">
  <table>
    <tr>
      <th>Frontend (Next.js)</th>
      <th>Backend (Node.js)</th>
    </tr>
    <tr>
      <td>
        <code>/app</code>: Core logic<br>
        <code>/components</code>: UI<br>
        <code>/public</code>: Assets<br>
        <code>/styles</code>: CSS
      </td>
      <td>
        <code>index.js</code>: API<br>
        <code>worker.js</code>: Processing<br>
        <code>.env</code>: Config
      </td>
    </tr>
  </table>
</div>

## 🛠️ Development

```bash
# Backend                           # Frontend
npm start    # Production           npm run dev    # Development
npm run dev  # Development          npm run build  # Production build
npm test     # Test suite           npm start      # Production server
                                   npm run lint   # Linting
```

<details>
  <summary><b>Tech Stack</b></summary>
  
  - **Frontend**: Next.js, React, TypeScript, TailwindCSS
  - **Backend**: Node.js, Express
  - **AI**: Vector embeddings, LLM
  - **Database**: Document & vector storage
  - **Auth**: JWT, session management
</details>

## 🚢 Deployment

```bash
# Docker
docker-compose up -d

# Frontend (Vercel)
cd querydocs && vercel

# Backend (Heroku)
cd server && git push heroku main
```

## 📝 Additional Info

- **License**: MIT
- **Support**: security@querydocs.example.com
- **Docs**: [Documentation Site](#)

---

<div align="center">
Built with ❤️ by the QueryDocs Team © 2025
</div>