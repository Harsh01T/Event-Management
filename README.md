🏁 Installation & Setup

Prerequisites Node.js (v18.17 or higher recommended) MySQL Server (Ensure it is running locally or via a cloud provider)

Environment Configuration Create a .env file in the root directory and add your database connection string: DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/event_manager"

Install Dependencies: npm install npx prisma generate

Database Initialization This command creates the physical tables in your MySQL instance and applies all relational constraints: npx prisma db push

Seeding the Data Run the automated seed script to populate the database with initial users and events. Note: This script also automatically updates src/lib/config.ts with the generated User ID for the frontend: npx prisma db seed

Run the Development Server: npm run dev

📮 Postman Collection A pre-configured Postman collection is included in the root folder: Event_Management.postman_collection.json. To use it: Open Postman and click Import. Select the JSON file from this project. Ensure the base_url variable is set to http://localhost:3000/api. Run requests in order: Get Events -> Book Ticket -> Check Attendance.
