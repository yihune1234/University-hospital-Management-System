# University Integrated Clinic Management System (UICMS) Frontend

## Project Description and Features

UICMS is a comprehensive frontend application designed for the University Integrated Clinic Management System. It provides role-based access and dashboards for different user roles such as Admin, Receptionist, Nurse, Doctor, Lab Technician, Pharmacist, Cashier, and Manager.

Features include:

- Secure login with input validation and error handling
- Role-based routing and access control
- Reusable UI components (Input, Form, Table, Modal, Alert)
- Accessible design with ARIA attributes and keyboard navigation
- Session management with automatic logout on inactivity
- Integration with backend API for authentication and data
- Responsive and modern UI design
- Dockerized for easy deployment

## Prerequisites

- Node.js (version 18.x recommended)
- npm (comes with Node.js)
- Docker (optional, for containerized deployment)
- A backend API endpoint (see `.env.example` for configuration)

## Installation Steps

1. Clone the repository:

    git clone https://github.com/your-org/uicms-frontend.git
    cd uicms-frontend

2. Install dependencies:

    npm install

3. Create `.env` file based on `.env.example`:

    cp .env.example .env

4. Edit `.env` to set your backend API base URL and other variables:

    REACT_APP_API_BASE_URL=https://api.uicms.university.edu
    REACT_APP_AUTH_TOKEN_KEY=authToken
    REACT_APP_SESSION_TIMEOUT_MINUTES=30

## Configuration Instructions

- `REACT_APP_API_BASE_URL`: Base URL of your backend API.
- `REACT_APP_AUTH_TOKEN_KEY`: Key used to store authentication token in localStorage.
- `REACT_APP_SESSION_TIMEOUT_MINUTES`: Session timeout duration in minutes for automatic logout.

Ensure your backend API supports the required authentication endpoints (`/auth/login` and `/auth/me`).

## How to Run the Application

### Locally (Development)

Run the React development server:

    npm start

This will start the app on [http://localhost:3000](http://localhost:3000).

### Build for Production

Build the optimized production bundle:

    npm run build

### Using Docker

To build and run the Docker container:

1. Build the Docker image:

       docker build -t uicms-frontend .

2. Run the Docker container:

       docker run -p 80:80 uicms-frontend

The app will be available at [http://localhost](http://localhost).

## Usage Examples

- Navigate to `/login` to sign in.
- After login, users are redirected to their respective dashboards based on role.
- Use the navigation sidebar to access different sections available to your role.
- Logout using the "Logout" button in the navigation.

## Troubleshooting Common Issues

- **Login fails with error**: Check your credentials and ensure the backend API is reachable.
- **Page shows blank or does not load**: Check the browser console for errors; ensure `.env` variables are correctly set.
- **Session logs out unexpectedly**: Adjust `REACT_APP_SESSION_TIMEOUT_MINUTES` in `.env` to a higher value if needed.
- **Docker container fails to start**: Verify Docker is running and ports 80 is free on your host.

## Project Structure Explanation

- `src/index.js`: Entry point of the app.
- `src/App.js`: Main routing and role-based access control.
- `src/context/AuthContext.js`: Authentication context for managing login state.
- `src/components/`: Reusable UI components and layout/navigation.
- `src/pages/`: Role-specific dashboard pages and the login page.
- `src/utils/`: Utility functions for API calls and validation.
- `src/routes/PrivateRoute.js`: Route wrapper for protected routes.
- `src/styles/global.css`: Global styles.
- `Dockerfile` and `nginx.conf`: For containerized production deployment.
- `.env.example`: Environment variable template.

## Testing

Run tests with:

    npm test

Tests cover authentication context, login page, and table component.

---

Thank you for using UICMS Frontend! For any questions or issues, please contact the development team.
