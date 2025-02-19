Assignment A4 - Web Component Framework
===

## To-Do List Manager

[VercelLink](https://a4-keluliu.vercel.app)

The To-Do List Manager is a full-stack web application that allows users to create, update, and delete their tasks efficiently. It supports user authentication (local and GitHub OAuth) and sorting by due date, creation date, and description. Users can only view and manage their own tasks, ensuring personalized task management.

Test Credentials:
- Email: test@exmaple.com
- Password: test

### Changes from A3 to A4
1. Enhanced Authentication & Security:
- More robust session management with `connect-mongo` for session persistence.
2. UI & UX Enhancements
- Used Toast notifications for real-time feedback when users log in, register, or perform task actions.
- The Responsive Design Fixes improved layout issues on mobile screens, enhanced button alignment and input field responsiveness.
3. Refactored Frontend
- React-based frontend with cleaner state management.
4. Mark as Complete
- Improves task management by allowing users to track completed tasks separately.
