# Examples

## Basic Express Implementation

```javascript
import express from 'express';
import cookieParser from 'cookie-parser';
import EasyAuth from 'easy-auth';

// Simple in-memory user store for demonstration
const users = [];
const authphrases = [];

const app = express();
app.use(express.json());
app.use(cookieParser());

const easyAuth = EasyAuth({
  secret: 'MY_SUPER_SECRET_KEY',
  ttl: 60 * 60 * 24, // 24 hours in seconds
  name: 'example-app',
  onAuth: async (authphrase) => {
    const auth = authphrases.find(a => a.authphrase === authphrase);
    if (!auth) return null;
    return users.find(user => user.id === auth.userId);
  },
  onCreate: async (authphrase, data) => {
    const id = users.length + 1;
    users.push({ id, ...data });
    authphrases.push({ authphrase, userId: id });
    return true;
  },
});

// Optional: Use the built-in router for auth endpoints
app.use('/auth', easyAuth.Router);

// Custom authentication route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userData = await easyAuth.Auth(email, password);
  if (!userData) return res.status(401).json({ error: 'Invalid credentials' });
  
  const session = await easyAuth.Session(userData);
  return session.session(res).status(200).json(userData);
});

// Protected route example
app.get('/profile', [easyAuth.SessionMiddleware], (req, res) => {
  if (!req.session) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ user: req.session });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Custom Middleware Chain

```javascript
import express from 'express';
import cookieParser from 'cookie-parser';
import EasyAuth from 'easy-auth';

// User repository
const userRepository = {
  getByAuthphrase: async (authphrase) => {
    // Lookup user in database
    return user || null;
  },
  getById: async (id) => {
    // Lookup user by ID
    return user || null;
  }
};

// Setup authentication
const easyAuth = EasyAuth({
  secret: 'MY_SUPER_SECRET_KEY',
  ttl: 60 * 60 * 24,
  name: 'example-app',
  onAuth: userRepository.getByAuthphrase,
  onCreate: async (authphrase, data) => {
    // Create user in database
    return true;
  },
});

// Create Express app
const app = express();
app.use(express.json());
app.use(cookieParser());

// Use both Easy-Auth middleware and custom user middleware
app.get('/protected', [
  easyAuth.SessionMiddleware,
  async (req, res, next) => {
    if (!req.session) return next();
    
    const user = await userRepository.getById(req.session.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    // Attach user to request
    req.user = user;
    next();
  }
], (req, res) => {
  return res.json({ user: req.user });
});

app.listen(3000);
```

## Real-World Example (Simplified)

This example demonstrates a more realistic implementation with a user repository pattern:

```javascript
import express from 'express';
import cookieParser from 'cookie-parser';
import { Router } from 'express';
import EasyAuth from 'easy-auth';

// Simple user repository
const Repository = () => {
  // Mock data
  const users = [
    { id: 1, name: 'John Doe' }
  ];
  
  const auth = [
    {
      authphrase: '4f6c3f5f73c6ceff462d7f74b83b7bb69164aeec8f6e5295b3eaf3256239ec10',
      userId: 1
    }
  ];
  
  return {
    getByAuthphrase: async (authphrase) => {
      const a = auth.find(user => user.authphrase === authphrase);
      if (!a) return null;
      return users.find(user => user.id === a.userId);
    },
    getById: async (id) => users.find(user => user.id === id)
  };
};

// Create Express app
const app = express();
app.use(express.json());
app.use(cookieParser());

// Initialize repository and auth
const userRepository = Repository();
const easyAuth = EasyAuth({
  secret: 'MY_SUPER_SECRET_KEY',
  ttl: 60 * 60 * 24,
  domain: 'localhost',
  name: 'my-app',
  audience: 'my-app',
  issuer: 'my-app',
  onAuth: userRepository.getByAuthphrase,
  onCreate: async () => true
});

// Create router
const router = Router();

// Use the built-in auth router (optional)
router.use(easyAuth.Router);

// Add custom routes
router.get('/users', [easyAuth.SessionMiddleware], async (req, res) => {
  if (!req.session) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const user = await userRepository.getById(req.session.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mount router
app.use('/api', router);

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```
