# EASY-AUTH

Easy-Auth is a lightweight authentication library for Node.js applications that simplifies user authentication using passwords. It provides a flexible and configurable system for handling authentication tokens, sessions, and user management.

Easy-Auth is based on cookie and bearer JWT auth, supporting both methods for maximum flexibility.

Users and Auth repositories are in the client's control, Easy-Auth provides hooks to integrate with your user storage during the authentication lifecycle.

## Installation

```
npm install easy-auth
```

## Quick Start

### Create an instance with desired configuration

```javascript
import EasyAuth from 'easy-auth';

const easyAuth = EasyAuth({
  secret: 'MY_SUPER_SECRET_KEY',
  ttl: 60 * 60 * 24, // 24 hours in seconds
  name: 'my-app',
  onAuth: async (authphrase) => {
    // Lookup user with authphrase in your database
    return userFromDatabase || null;
  },
  onCreate: async (authphrase, data) => {
    // Create a new user in your database
    return true; // Return true if successful
  }
});
```

The `onAuth` hook is called with an authphrase when a user tries to log in. You are expected to have a method to check your user storage for a user with this authphrase.

Authphrases are unique identifiers for users, constructed from the user identifier (email, username, etc.) and a password.

### Create a login endpoint

```javascript
app.post('/login', async (req, res) => {
  const userData = await easyAuth.Auth(req.body.email, req.body.password);
  if (!userData) return res.status(401).json({ error: 'Invalid credentials' });
  
  const session = await easyAuth.Session(userData);
  return session.session(res).status(200).json(userData);
});
```

When a user calls this endpoint, Easy-Auth will try to reach the users repository through the `onAuth` hook and fetch a data object. If successful, the `.Auth` method will return the user data.

The `Session` method creates a JWT token containing the user data, and the `.session(res)` method sets this token as a cookie.

### Verify your session anywhere

```javascript
app.get('/profile', [easyAuth.SessionMiddleware], (req, res) => {
  if (!req.session) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ user: req.session });
});
```

## API Reference

### EasyAuth(config)

**Returns an easyAuth instance**

- `secret`: used as JWT secret and to generate authphrase salt
- `ttl`: session expiration in seconds (for JWT) or milliseconds (for cookies)
- `name`: project name, used as audience for JWT
- `onAuth`: function(authphrase) - repository interaction hook for authentication
- `onCreate`: function(authphrase, data) - repository interaction hook for user creation

### easyAuth.Auth(identifier, password)

Authenticates a user with the given identifier and password.

```javascript
const userData = await easyAuth.Auth('user@example.com', 'password123');
if (userData) {
  // Authentication successful
} else {
  // Authentication failed
}
```

### easyAuth.Create(identifier, password, data)

Creates a new user account.

```javascript
const success = await easyAuth.Create('user@example.com', 'password123', { name: 'John Doe' });
if (success) {
  // User created successfully
} else {
  // User already exists or creation failed
}
```

### easyAuth.Session(data)

Creates a new authenticated session with the given user data.

```javascript
const session = await easyAuth.Session(userData);
// Use session.session(res) to set the cookie in an Express response
return session.session(res).status(200).json(session.data);
```

### easyAuth.validateSession(token)

Validates a JWT token and returns the decoded payload if valid.

```javascript
const sessionData = await easyAuth.validateSession(token);
if (sessionData) {
  // Token is valid
} else {
  // Token is invalid
}
```

### easyAuth.SessionMiddleware

Express middleware that validates the session token from cookies or Authorization header and attaches the decoded payload to `req.session`.

```javascript
app.get('/protected', [easyAuth.SessionMiddleware], (req, res) => {
  if (!req.session) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ user: req.session });
});
```

The middleware also automatically refreshes tokens that are nearing expiration.

### easyAuth.Router

Optional Express router that provides authentication endpoints (/auth, /create). This is a quality-of-life feature for Express applications and is not required to use Easy-Auth.

```javascript
// Mount the router at your desired path
app.use('/api/auth', easyAuth.Router);
```

## Documentation

For more detailed documentation, examples, and configuration options, see the [doc directory](./doc).
