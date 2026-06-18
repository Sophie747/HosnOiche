# Hosn Obi - Fullstack Project
**Student:** Sophie Öttl

## Setup & Run
I have deployed a cloud PostgreSQL database for this project so you don't need to set up a local database! The tables and a few test players are already initialized.

### 1. Backend
1. Open a terminal and navigate to the `backend` folder.
2. Run `npm install`.
3. Create a `.env` file in the `backend` folder and add this provided connection string:
   `DATABASE_URL=postgresql://neondb_owner:npg_mDHJeNzEG97w@ep-tiny-term-asap7dr7.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require`

   `SOCKET_IO_PORT=3002`
   
4. Start the backend with `npm run dev`.

### 2. Frontend
1. Open a second terminal and navigate to the `frontend` folder.
2. Run `npm install`.
3. Start the Vue development server with `npm run dev`.
4. Open http://localhost:5173 in your browser.