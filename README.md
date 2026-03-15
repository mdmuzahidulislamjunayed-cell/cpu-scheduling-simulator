# CPU Scheduling Simulator

## Project Structure

```
cpu-scheduler/
├── 📁 backend/
│   ├── app.py            → Flask server (Python)
│   ├── requirements.txt  → Python packages
│   └── history.json      → Saved simulations (auto-created)
├── 📁 frontend/
│   ├── index.html        → Main HTML
│   ├── style.css         → All styles
│   └── script.js         → Algorithms + Backend API
└── README.md
```

---

## ▶ How to Run

### Step 1 — Frontend (সবসময় কাজ করে)
`frontend` folder এ গিয়ে `index.html` double click করো।
Backend ছাড়াও সব feature কাজ করবে।

---

### Step 2 — Backend (optional, results save করার জন্য)

**Python install থাকতে হবে।**

PowerShell এ এই commands run করো:

```powershell
# backend folder এ যাও
cd cpu-scheduler\backend

# packages install করো (একবারই করতে হবে)
pip install -r requirements.txt

# server চালাও
python app.py
```

Server চালু হলে দেখবে:
```
CPU Scheduler Backend Running!
URL: http://localhost:5000
```

---

## API Endpoints

| Method | URL | কাজ |
|--------|-----|-----|
| GET | /api/history | সব saved simulations |
| POST | /api/save | নতুন simulation save |
| DELETE | /api/history/clear | সব history delete |

---

## Features
- 6 CPU Scheduling Algorithms
- Gantt Chart, Animation, Statistics
- Compare All Algorithms
- Quiz Mode
- AI Chatbot (Offline)
- Dark/Light Theme
- Export CSV & PDF
- Backend দিয়ে simulation history save
