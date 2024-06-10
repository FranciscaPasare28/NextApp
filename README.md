# Project Setup Instructions

Welcome to the project documentation. Here, you will find detailed instructions on how to set up and run the project using Prisma, as well as how to properly manage and document your work on GitHub.

## Prisma Setup and Usage

Prisma is a powerful database toolkit that includes an ORM for handling database operations in a structured manner. Below are the steps to configure Prisma in your development environment, ensuring you can manage your database schema and data efficiently.

### 1. Initialize Prisma

Initializing Prisma sets up the necessary configuration files in your project, allowing you to define your database schema and manage connections. To begin the initialization, run the following command:

```bash
npx prisma init
```

### 2. Create and Apply Migrations

Database migrations are crucial for managing changes to the database schema over time. To create a new migration based on changes in your Prisma schema, and to apply these changes to your development database, execute:

```bash
npx prisma migrate dev --name init_migration
```
Ensure to replace init_migration with a descriptive name that reflects the nature of the changes introduced in the migration.

### 3. Populate the Database

Seeding the database with initial data is an important step for local development and testing. To seed your database using Prisma, run the following command:

```bash
npx ts-node prisma/seed.ts
```

### 4. Launch Prisma Studio

Prisma Studio provides a user-friendly GUI for your database, allowing you to visually manage your data. To start Prisma Studio, use this command:

```bash
npx prisma studio
```
This will open a web interface in your default browser where you can view and edit your database records.

### 5. Start the Project

To start your project and test its functionality, run the development server with:

```bash
npm run dev
```

Live Demo:
<iframe width="300" height="169" src="https://www.youtube.com/embed/09vukVdpr6Y" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

