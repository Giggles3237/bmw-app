# BMW & MINI of Pittsburgh Sales Management Application

This project implements a full‑stack web application that replicates the
functionality of the Excel workbook **Einstein3.0.xlsx** used by the
finance team at BMW & MINI of Pittsburgh.  It consists of a
Node.js/Express backend, a MySQL database and a React frontend.  The
application supports the full workflow described by Chris Lasko:

1. **Deal Entry** – A finance coordinator creates a minimal deal
   record containing the customer name, salesperson, bank, fund date
   and other basic information.
2. **Deal Scrub** – Management or back‑office staff add gross and
   product information to the deal via the same API.  Additional
   fields such as FE/BE Gross, reserve, warranty products and
   accessory sales are recorded.
3. **Data Master & Reporting** – The combined data is stored in the
   `deals` table.  Robust reporting APIs provide aggregated
   information for payroll (Salesperson report) and for summarising
   vehicle output (Unit report).  Each salesperson can view only
   their own performance by supplying their salesperson ID.
4. **User Management** – The application now includes a complete user authentication system with role-based access control. Users can have different roles (admin, manager, salesperson, finance, viewer) and may or may not be associated with salesperson records.

## Project structure

```
bmw-app/
├── backend/          # Express API and migration script
│   ├── db.js         # Database connection pool
│   ├── index.js      # Entry point for the API server
│   ├── migrate.js    # Imports the Data Master sheet into MySQL
│   ├── create-admin.js # Creates initial admin user
│   ├── package.json  # Backend dependencies and scripts
│   ├── .env.example  # Example environment variables
│   ├── schema.sql    # SQL to create the database schema
│   └── routes/       # API route handlers
│       ├── auth.js   # Authentication and user management routes
│       ├── deals.js  # Deal management routes
│       ├── reports.js # Reporting routes
│       └── salespersons.js # Salesperson management routes
├── frontend/         # React application (Create React App layout)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── components/
│   │       ├── Login.js
│   │       ├── UserManagement.js
│   │       ├── DealForm.js
│   │       ├── DealList.js
│   │       ├── SalespersonReport.js
│   │       └── UnitReport.js
│   └── package.json  # Frontend dependencies
└── README.md         # This file
```

## Prerequisites

* **Node.js** 18 or later
* **npm** for installing JavaScript dependencies
* **MySQL** 8.0 or Azure Database for MySQL (flexible server recommended)
* Optional: **Git** for source control and **Azure CLI** if you wish to
  deploy to Azure App Service

## Backend setup

1. Change into the `backend` directory and install dependencies:

   ```sh
   cd backend
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your MySQL connection
   details.  For example:

   ```ini
   MYSQL_HOST=localhost
   MYSQL_USER=chris
   MYSQL_PASSWORD=supersecret
   MYSQL_DATABASE=bmw
   PORT=3001
   EXCEL_PATH=./data/Einstein3.0.xlsx
   ```

   If you are running your database on Azure, use the host name of
   your Azure MySQL server, the admin username, and the generated
   password.  Make sure to allow IP access from your web app or
   development machine in the Azure firewall settings.

3. Create the database and tables by running the schema script.  The
   following command assumes you have the `mysql` client installed:

   ```sh
   mysql -u$MYSQL_USER -p -h$MYSQL_HOST < schema.sql
   ```

   Replace `$MYSQL_USER` and `$MYSQL_HOST` with your actual
   values.  You will be prompted for your password.

4. Create an initial admin user:

   ```sh
   npm run create-admin
   ```

   This creates a default admin user with:
   - Username: `admin`
   - Password: `admin123`
   - Email: `admin@bmw.com`
   
   **Important**: Change the password after first login for security.

5. (Optional) Import your existing Excel data.  Copy
   `Einstein3.0.xlsx` into the `backend/data` folder (create it if
   necessary).  Then run the migration script:

   ```sh
   node migrate.js
   ```

   The script reads the **Data Master** sheet, normalises
   salespeople and finance manager names into their own tables, and
   inserts each deal into the `deals` table.  You can run this
   script multiple times; duplicates are not currently de‑duped, so
   ensure your database is empty before importing.

6. Start the API server:

   ```sh
   npm start
   ```

   The server listens on the port specified in `.env` (default
   3001).  It exposes the following endpoints:

   **Authentication endpoints:**
   * `POST /api/auth/login` – user login
   * `POST /api/auth/register` – user registration (admin only)
   * `GET /api/auth/profile` – get current user profile
   * `GET /api/auth/users` – list all users (admin only)
   * `PUT /api/auth/users/:id` – update user (admin only)
   * `PUT /api/auth/change-password` – change user password

   **Deal management endpoints:**
   * `GET /api/deals` – list deals, optional `month`, `year` and
     `limit` query parameters
   * `POST /api/deals` – create a new deal
   * `GET /api/deals/:id` – retrieve a single deal
   * `PUT /api/deals/:id` – update an existing deal
   * `DELETE /api/deals/:id` – delete a deal

   **Salesperson management endpoints:**
   * `GET /api/salespersons` – list salespeople
   * `POST /api/salespersons` – create a salesperson

   **Reporting endpoints:**
   * `GET /api/reports/salesperson` – aggregated totals per
     salesperson; supports `month`, `year` and `salesperson_id` query
     parameters
   * `GET /api/reports/unit` – unit summary grouped by vehicle type
   * `GET /api/reports/data-master` – list deals, like `/api/deals`

## Frontend setup

1. Change into the `frontend` directory and install dependencies:

   ```sh
   cd ../frontend
   npm install
   ```

2. Start the development server:

   ```sh
   npm start
   ```

   The frontend runs on port 3000 by default.  It proxies API
   requests to the backend using the relative `/api` path.  If you
   host the backend elsewhere, you can configure a proxy in
   `package.json` or adjust the API base URLs in the React code.

3. Navigate to `http://localhost:3000` in your browser to use the app.

   **Login**: You'll be prompted to log in with your username and password. Use the admin credentials created in step 4 of the backend setup.

   **Role-based Access**: The application now supports different user roles:
   * **Admin**: Full access to all features including user management
   * **Manager**: Can view all deals, add deals, and access reports
   * **Salesperson**: Can view deals, add deals, and view their own reports
   * **Finance**: Can view deals and access funding and unit reports
   * **Viewer**: Read-only access to deals and unit reports

   **Features by Role**:
   * **Deals** – Displays a list of existing deals.  You can filter
     by month and year using the inputs above the table.
   * **Add Deal** – Allows entry of a basic deal record similar to
     the Deal Entry sheet.  Additional fields can be added by
     extending the form and the API.
   * **Funding** – Finance team can track funding status and details
   * **Salesperson Report** – Summarises gross and product totals
     per salesperson for a selected month and year.  Enter your
     salesperson ID in the field at the top of the page and click
     **Save ID** to restrict the report to your own deals.  Leaving
     the field blank will display totals for all salespeople.
   * **Unit Report** – Shows how many units of each vehicle type were
     delivered in a given month and year, along with the total FE and
     BE gross.
   * **Admin** – System administration features
   * **User Management** – Create and manage user accounts (admin only)

## Deploying to Azure

The application can be deployed to Azure App Service and Azure
Database for MySQL.  A high‑level overview of the steps is:

1. **Provision a MySQL database** using Azure Database for MySQL.
   Create a new Flexible Server, choose your region, and configure
   the admin username and password.  Enable public access and add
   your IP and your App Service’s outbound IP addresses to the
   firewall rules.

2. **Create an App Service** for the backend.  You can deploy
   directly from your GitHub repository or via zip deployment.  Set
   the following Application Settings in the App Service to match
   your database:

   * `MYSQL_HOST` – the host name of your MySQL server
   * `MYSQL_USER` – the admin or application user
   * `MYSQL_PASSWORD` – the database password
   * `MYSQL_DATABASE` – the database name (e.g. `bmw`)
   * `PORT` – the port your Express server will listen on (e.g. `80`)

   Deploy the contents of the `backend` folder and ensure that
   `npm install` is run during deployment.  The App Service will
   automatically start your server if `PORT` is set.

3. **Create a second App Service** for the frontend or use a
   static web hosting service such as Azure Storage Static Web Apps.
   Build the React application (`npm run build`) and upload the
   contents of the `build` folder to your static site.  Configure
   your frontend to communicate with the backend via the public URL
   of your API App Service.

4. **Import existing data** by uploading `Einstein3.0.xlsx` to
   your backend server (for example via SSH or Azure CLI) and running
   `node migrate.js` against your production database.  Alternatively
   you can perform the import locally and then export the MySQL
   database to Azure using `mysqldump`.

## Notes

* This project now includes a complete user authentication system with role-based access control. Users can have different roles and may or may not be associated with salesperson records. The system uses JWT tokens for authentication and bcrypt for password hashing.
* Additional reporting can be built upon the `deals` table.  For
  example, you could produce custom dashboards, track funding
  timelines, or export data to CSV.  The MySQL schema is
  intentionally normalised and easy to query.
* For production use, consider implementing additional security measures such as:
  * Password complexity requirements
  * Account lockout after failed login attempts
  * Two-factor authentication
  * Session timeout and automatic logout
  * Audit logging for user actions

We hope this application helps streamline your finance process and
provides your team with the robust reporting capability you need.