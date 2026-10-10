Setup & Installation Instructions
Prerequisites
Node.js & npm installed on your system.

Python & Pipenv installed.

PostgreSQL installed natively on Windows.

Step 1: Clone and Set Up the Backend (/server)
Navigate into your server directory:

Bash
cd server
Create a .env file in the server root with your configuration:

Code snippet
DATABASE_URL=postgresql+psycopg2://postgres:your_password@localhost:5432/hhr_data
JWT_SECRET_KEY=your-super-secret-jwt-key
CLIENT_ORIGIN=http://localhost:5173

(A valid JWT Secret Key can be generated online.)
(Replace your_password with your PostgreSQL superuser password).

Ensure your PostgreSQL Windows service is running (services.msc -> postgresql-x64-<version>).

Open a terminal, log into psql, and create your database:

PowerShell
psql -U postgres
CREATE DATABASE hhr_data;
\q
Install Python dependencies and start the Flask server:

Bash
pipenv install
pipenv run python app.py
The Flask backend will run locally at http://localhost:5555.

Step 2: Set Up and Run the Frontend (/client)
Open a new terminal tab and navigate into your client directory:

Bash
cd client
Install Node dependencies:

Bash
npm install
Start the Vite development server:

Bash
npm run dev
The React client will run locally at http://localhost:5173.