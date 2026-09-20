# Hosn Oichi - Real-Time Score Tracker

A full-stack web application for tracking scores in the traditional card game "Hosn Obi". Built with Vue 3, Node.js, Express, and PostgreSQL, featuring real-time synchronization across clients using Socket.io.

## Tech Stack

* **Frontend:** Vue 3 (Composition API), Pinia, Vue Router, Tailwind CSS
* **Backend:** Node.js, Express.js, Socket.io
* **Database:** PostgreSQL (utilizing relational tables and JSONB)

## Prerequisites

* [Node.js](https://nodejs.org/) installed
* A local or cloud [PostgreSQL](https://www.postgresql.org/) database

## Quick Start

Configure the .env file in the Top Level Directory. Populate the keys:

```
DATABASE_URL=
DATABASE_HOST=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_PORT=
```

Create and populate tables:

```
npm run seed
npm run migrate
```

Start the frontend and backend servers:

```
cd backend && npm run dev && cd -
cd frontend && npm run dev && cd -
```
