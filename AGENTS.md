# Architecture rules

- Mount the single BrowserRouter in src/main.tsx, outside App and all providers, so navigation context remains available throughout the application and during App refreshes.