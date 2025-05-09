# API Reference

## EasyAuth Factory

The core of Easy-Auth is the `EasyAuth` factory function that returns an authentication object with methods for user creation, authentication, and session management.

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

## Core Methods

### generateAuthphrase(identifier, password)

Generates an authentication phrase from identifier (usually username or email) and password.

```javascript
const authphrase = easyAuth.generateAuthphrase('user@example.com', 'password123');
```

### validateSession(token)

Validates a JWT token and returns the decoded payload if valid.

```javascript
const sessionData = await easyAuth.validateSession(token);
if (sessionData) {
  // Token is valid
  console.log(sessionData);
} else {
  // Token is invalid
}
```

### SessionMiddleware

Express middleware for validating sessions. It sets `req.session` with the decoded token payload if valid.

```javascript
app.get('/protected', [easyAuth.SessionMiddleware], (req, res) => {
  if (!req.session) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ user: req.session });
});
```

### Router

Optional Express router that provides authentication endpoints (/auth, /create). This is a quality-of-life feature for Express applications and not required to use Easy-Auth.

```javascript
app.use('/api/auth', easyAuth.Router);
```

### Create(identifier, password, data)

Creates a new user account.

```javascript
const newUser = await easyAuth.Create('user@example.com', 'password123', { name: 'John Doe' });
if (newUser) {
  // User created successfully
} else {
  // User already exists or creation failed
}
```

### Auth(identifier, password)

Authenticates a user with identifier and password.

```javascript
const userData = await easyAuth.Auth('user@example.com', 'password123');
if (userData) {
  // Authentication successful
  console.log(userData);
} else {
  // Authentication failed
}
```

### Session(data)

Creates a new authenticated session with user data.

```javascript
const session = await easyAuth.Session(userData);
// session.data - User data
// session.token - JWT token
// session.session - Function to set token as cookie in response

// In Express:
return session.session(res).status(200).json(session.data);
```

## Internal Components

Easy-Auth is built around several internal components that work together to provide authentication functionality:

### Token Management

Handles JWT generation, verification, and refresh.

```javascript
// Internal usage
import { generateToken, verifyToken } from './token.js';

// Generate a token
const token = await generateToken(data, config);

// Verify a token
const decoded = await verifyToken(token, config);
```

### Authentication Phrase Generation

Creates unique identifiers for users based on their credentials.

```javascript
// Internal usage
import { generateAuthphrase } from './auth.js';

const authphrase = generateAuthphrase(identifier, password, secret);
```

### Cookie Management

Handles setting and retrieving authentication cookies.

```javascript
// Internal usage
import cookie from './cookie.js';

// Set a cookie in the response
cookie(res, token, config);
```

### Middleware

Intercepts HTTP requests to verify authentication.

```javascript
// Internal usage
import Middleware from './middleware.js';

const middleware = Middleware(config);
```
