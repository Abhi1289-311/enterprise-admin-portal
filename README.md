# Enterprise Admin Portal

A web application for managing users and bookings. Built with Angular, it provides a simple interface for admins to handle user data and track travel bookings.

## What This App Does

This is an Angular application that lets enterprise admins manage two main things: users and bookings. You can view lists, add new records, update existing ones, and delete what you don't need. There's also a dashboard that shows an overview of everything, and a login system to keep things secure.

## Features

### Users
- See all users in a list
- Add new users
- View details of any user
- Edit user info and change their role (Admin or Viewer)
- Delete users
- Filter by role (Admin or Viewer) or status (Active or Inactive)
- Search by name, email, or phone number
- Sort by any column
- Navigate with pagination (10 per page)

### Bookings
- View all bookings
- Create a new booking
- See details of any booking
- Update booking info
- Remove bookings
- Filter by status (Created, Confirmed, Cancelled, or Completed)
- Search by booking code or customer name
- Sort by any field
- Page through results

### Other Features
- Dashboard showing stats and recent activity
- Login page with basic authentication
- Different permissions for Admin vs Viewer roles
- Loading indicators while data is being fetched
- Toast messages to tell you when something worked or failed
- Confirmation dialogs before you delete anything
- Form validation to catch mistakes

## What You Need

- Node.js 20 or newer
- npm 10 or newer

## Getting Started

1. Clone this repository
   ```bash
   git clone <url>
   cd enterprise-admin-portal
   ```

2. Install the packages
   ```bash
   npm install
   ```

3. In one terminal, start the database server
   ```bash
   npx json-server db.json --port 3000
   ```

4. In another terminal, start the app
   ```bash
   npm start
   ```

5. Open your browser and go to `http://localhost:4200`

## How to Use It

### First Login
Use these credentials:
- Email: `abhi@123.com`
- Password: `password123`

### Managing Users
1. Click "Users Management" in the left menu
2. You'll see a table with all users
3. Use the search box to find someone
4. Use the dropdown menus to filter by role or status
5. Click "View" to see all details about a user
6. If you're an admin, click "Edit" to change their info
7. If you're an admin, click "Delete" to remove them
8. Click "+ Add New User" to create a new user

### Managing Bookings
1. Click "Bookings Management" in the left menu
2. You'll see a list of all bookings
3. Search for a specific booking by code or customer name
4. Filter by status if you want to see only confirmed bookings, for example
5. Click "View" to see the full details
6. Click "Edit" if you need to change something
7. Click "Delete" if you need to cancel a booking
8. Click "+ Add New Booking" to create a new one

## The Technology

**Frontend**
- Angular 20 (the web framework)
- TypeScript (JavaScript with types)
- RxJS (for handling async operations)
- Bootstrap 5 (for styling)
- Reactive Forms (for the forms)

**Data/Backend**
- JSON Server (a quick mock server for development)
- REST API (standard web API style)

**Tools**
- Node.js
- npm
- Angular CLI
- VS Code

## File Structure

```
src/
├── app/
│   ├── users/              # Everything for managing users
│   │   ├── list/          # The user list page
│   │   ├── detail/        # View one user's details
│   │   └── form/          # Add or edit a user
│   ├── bookings/          # Everything for managing bookings
│   │   ├── list/          # The booking list page
│   │   ├── detail/        # View one booking
│   │   └── form/          # Add or edit a booking
│   ├── dashboard/         # The home page with stats
│   ├── login/             # The login page
│   ├── services/          # Code that talks to the API
│   ├── guards/            # Code that protects routes
│   ├── models/            # Data structure definitions
│   └── shared/            # Buttons, alerts, etc. used everywhere
├── main.ts               # The file that starts the app
└── styles.css           # Overall styling
```

## Running Commands

**To start developing:**
```bash
npm start
```
The app reloads automatically when you change code.

**To build for production:**
```bash
npm run build
```
This creates optimized files in the `dist/` folder.

**To run tests:**
```bash
npm test
```

**To check your code:**
```bash
ng lint
```

## API Details

The app talks to a JSON Server on port 3000. Here are the endpoints:

**User endpoints:**
- `GET /users` - Get all users
- `GET /users/:id` - Get one user
- `POST /users` - Create a user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

**Booking endpoints:**
- `GET /bookings` - Get all bookings
- `GET /bookings/:id` - Get one booking
- `POST /bookings` - Create a booking
- `PUT /bookings/:id` - Update a booking
- `DELETE /bookings/:id` - Delete a booking

## Putting It Online

**Build first:**
```bash
npm run build
```

**Then pick a place to put it:**

With Vercel (easiest):
1. Push your code to GitHub
2. Go to vercel.com and connect your repo
3. Click deploy
4. Done

With Netlify:
1. Connect your GitHub repo
2. Tell it to build with `npm run build`
3. Tell it the output folder is `dist/enterprise-admin-portal/browser`
4. Click deploy

Anywhere else:
1. Upload the files from `dist/enterprise-admin-portal/browser` to your server
2. Make sure your server sends all routes to `index.html` (so refresh works)

## Changing the API Endpoint

When you go to production, update the API URL. Create or edit `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-real-api.com'
};
```

## Browsers That Work

- Chrome
- Firefox
- Safari
- Edge

(Basically anything modern)

## Things to Know

- The database is just JSON files. When you deploy, you'll need a real database (like PostgreSQL or MongoDB)
- Right now you can't upload files
- When you create a booking, you need to refresh to see it if you're on another page (it doesn't update in real-time)

## Ideas for Later

- Download data as Excel/CSV
- Reports and charts
- Email notifications when something happens
- Upload files
- Real-time updates
- Support for different languages
- Dark mode
- Mobile version

## If Something Goes Wrong

**JSON Server isn't working:**
```bash
npx json-server db.json --port 3000
```

**Port 4200 is already used:**
```bash
ng serve --port 4300
```

**Build is broken:**
```bash
npm ci
npm run build
```

**Delete and reinstall everything:**
```bash
rm -rf node_modules
npm install
```

## Contributing

Want to help? Here's how:

1. Fork the repo
2. Make a new branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Commit: `git commit -m "Added something cool"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

## License

MIT - use it however you want

## Questions?

1. Look at the existing issues on GitHub
2. Create a new issue and describe what's wrong
3. Tell me how to reproduce it
4. Include what version of Node you're using and what OS

## What Changed

**Version 1.0.0**
- User management system
- Booking management system
- Login system
- Dashboard
- Ability to add, edit, and delete records
- Filters and search
- Sorting and pagination

## About This Project

**Name:** Enterprise Admin Portal
**What it is:** A system for managing users and bookings
**Ready?:** Yes, ready for use

---

**Let's build something!** 🚀

Questions about Angular? Check: https://angular.io/docs

