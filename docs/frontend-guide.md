# Frontend guide

The frontend is a React + Vite application focused on invoice workflows and authenticated API access.

## Run locally

```bash
cd invoice-frontend
npm install
npm run dev
```

Default dev URL: `http://localhost:5173`

## Build for production

```bash
npm run build
npm run preview
```

## Frontend architecture

```text
src/
  api/client.js          axios instance and API methods
  contexts/AuthContext.jsx
  components/            shared UI and error boundaries
  pages/                 route-level screens
  App.jsx
```

## Engineering conventions

- Keep page-level data orchestration in `pages`.
- Keep generic UI in `components`.
- Keep auth state in `AuthContext`.
- Keep HTTP details in API client wrappers.
- Always show explicit loading and error states.

## Environment variables

Use `.env.local` for local development and `.env.production` for deployment.

Typical values:

```bash
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Invoice Management System
VITE_ENV=development
```

## Release checks

- `npm run lint`
- `npm run build`
- Manual login flow validation
- Invoice list, create, update, delete smoke pass

---

Edited by K Dhiraj ([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))  
GitHub: KDhiraj152
