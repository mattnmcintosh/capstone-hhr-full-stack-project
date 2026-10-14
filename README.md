A full-stack web application designed to organize events and checklist items through aggressive prioritization and calendar integration. The app features a dual-axis priority queue based on task staleness and urgency, live .ics calendar feed synchronization, visual grid views, and secure JWT authentication.

Tech Stack
Backend: Python, Flask, Flask-SQLAlchemy, Flask-Bcrypt, Flask-JWT-Extended, Flask-CORS, iCalendar, Psycopg2

Database: PostgreSQL (Native Windows Service)

Frontend: React (Vite), Material-UI (MUI), React Router DOM, FullCalendar

Project Structure
heavy-handed-reminders/
├── server/
│   ├── app.py            # Main Flask application and API routes
│   ├── models.py         # SQLAlchemy database models (User, ChecklistItem, Event)
│   ├── config.py         # Environment and app configuration
│   ├── Pipfile           # Python dependencies
│   └── .env              # Backend environment variables
└── client/
├── src/
│   ├── components/   # Layout and structural components
│   ├── views/        # Home, Login, Checklist, Calendar, and 404 views
│   ├── utils/        # Centralized API fetch helper
│   ├── App.jsx       # Root router and authentication state manager
│   └── main.jsx      # Vite entry point
└── package.json      # Node dependencies

Setup & Installation Instructions
Prerequisites
Node.js and npm installed on your system.

Python and Pipenv installed.

PostgreSQL installed natively on your system.

Step 1: Clone and Set Up the Backend (/server)
Navigate into your server directory:
cd server

Create a .env file in the server root with your configuration:
DATABASE_URL=postgresql+psycopg2://postgres:your_password@localhost:5432/hhr_data
JWT_SECRET_KEY=your-super-secret-jwt-key
CLIENT_ORIGIN=http://localhost:5173
(Replace your_password with your PostgreSQL superuser password).

Ensure your PostgreSQL service is running.

Open a terminal, log into psql, and create your database:
psql -U postgres
CREATE DATABASE hhr_data;
\q

Install Python dependencies and start the Flask server via Pipenv:
pipenv install
pipenv run python app.py
The Flask backend will run locally at http://localhost:5555.

Step 2: Set Up and Run the Frontend (/client)
Open a new terminal tab and navigate into your client directory:
cd client

Install Node dependencies (including FullCalendar and MUI):
npm install

Start the Vite development server:
npm run dev
The React client will run locally at http://localhost:5173.

Features & Architecture
Secure Authentication: User accounts are protected using flask-bcrypt for password hashing and flask-jwt-extended for stateful API authorization via Bearer tokens.

Dynamic Priority Queue: Automatically sorts tasks by computed priority scores, factoring in how long a task has been sitting untouched (staleness) versus approaching deadlines (urgency).

Visual Grid & Calendar Sync: Features FullCalendar month, week, and day grids overlaying custom scheduled blocks alongside color-coded priority queue deadlines.

Live .ics Feed: Generates a secure calendar subscription URL (/api/calendar.ics?token=...) to plug straight into Apple Calendar, Google Calendar, or Outlook.