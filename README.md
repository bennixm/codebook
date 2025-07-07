# Codebook Project

**Codebook** is a dynamic blog platform tailored for developers, offering a dedicated space to share code snippets, technical insights, and thoughts. Built with a modern MERN stack variant — **MongoDB, Express.js, Node.js, and Vue.js** — it delivers a robust and interactive experience for users.

---

##  Key Features

###  User Management & Authentication
- **Register**: Seamless user registration.
- **Secured Authentication**: Robust mechanisms to protect user credentials.
- **OAuth with Google**: Sign up and sign in using Google accounts.
- **Email Confirmation**: Verifies user email for enhanced account security.
- **Password Reset**: Secure password recovery via email with a "Set New Password" page.

---

###  User Dashboard & Settings
- **Dashboard**: Central hub for user activity.
- **Settings Page**:
  - **Set Password**: Change password securely.
  - **Profile Settings**: Update profile information.

---

###  Blog Management & Interaction
- **Create Blog**: Intuitive interface to publish new posts.
- **Edit Blog**: Modify existing posts.
- **My Blogs**: View all posts authored by the logged-in user.
- **Blog Page**: Individual page for each blog post.
- **Comments Section**: Leave feedback and engage in discussions.
- **Threaded Replies**: Reply to specific comments.
- **Likes**: Like blog posts.
- **Views**: Track and display blog view counts.
- **Feed Blogs**: View posts from all users in a centralized feed.

---

###  User Profiles
- **Profile Page**: View other users’ profiles.
  - **Followers**: See who follows the user.
  - **User’s Blogs**: Display all blogs authored by the user.

---

### Real-Time Notifications
- **Notifications Page**: Dedicated section to view all alerts.
- **Navbar Drawer**: Access real-time notifications via the top nav.
- **Triggers**:
  - A followed user publishes a new blog.
  - A user likes your blog post.
  - A user comments on your blog.
  - A user replies to your comment.

---

## Authentication with JWT (JSON Web Tokens)

* Sessions are managed using **JWT tokens**, signed with a server-side secret.
* The JWT is stored in a **secure, HTTP-only cookie**, which:

  * Prevents JavaScript access (protects against XSS)
  * Is automatically sent with requests
* Cookie configuration:

  * `HttpOnly: true`
  * `Secure: false` (set to `true` in production over HTTPS)
  * `SameSite: Lax` (or `Strict` for stronger CSRF mitigation)

---

## CSRF Protection

* All **state-changing requests** (`POST`, `PUT`, `DELETE`) are protected against CSRF attacks.
* CSRF tokens:

  * Are generated using the `csurf` middleware
  * Are available via the endpoint: `GET /security/csrf-token`
  * Must be sent by the frontend in a custom header: `X-CSRF-Token`
* The server enforces CSRF validation only on relevant methods (e.g. POST).

---

## Socket.IO

* Realtime communication uses Socket.IO.
* Socket authentication:

  * JWT token is extracted from cookies during handshake
  * Verified using the same JWT secret as the REST API
  * If valid, the user ID is attached to the socket instance
* This enables user-specific room joins and secure messaging.

---

## ✅ Summary

| Feature     | Implementation                        |
| ----------- | ------------------------------------- |
| Auth        | JWT in HTTP-only cookie               |
| CSRF        | `csurf` middleware + custom header    |
| Socket Auth | JWT token in cookies during handshake |


## Technologies Used

- **Frontend**: Vue.js  
- **Backend**: Node.js with Express.js  
- **Database**: MongoDB  

---

## Getting Started

> not so complicated : npm install for both sides (for dependencies) , configure local.env + .env and the DB connection details

---

