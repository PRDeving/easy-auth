# Easy-Auth Documentation

Easy-Auth is a lightweight authentication library for Node.js applications that simplifies user authentication using passwords. It provides a flexible and configurable system for handling authentication tokens, sessions, and user management. The library supports both cookie-based and Bearer JWT (JSON Web Token) authentication methods.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [API Reference](./api-reference.md)
- [Configuration Options](./configuration.md)
- [Examples](./examples.md)

## Overview

Easy-Auth serves developers building Node.js applications (particularly Express-based) who need to implement secure user authentication without the complexity of larger auth frameworks. It enables developers to:

1. Authenticate users with username/password credentials
2. Generate and validate JWT tokens
3. Manage user sessions with automatic token refresh
4. Protect routes with authentication middleware
5. Integrate with any user data storage mechanism through hooks

The library is designed to be minimalistic yet secure, allowing developers to implement authentication with minimal code while maintaining flexibility to customize the authentication flow to their needs.

## Getting Started

### Installation

```bash
npm install easy-auth
```

### Basic Usage

```javascript
import express from 'express';
import cookieParser from 'cookie-parser';
import EasyAuth from 'easy-auth';

const app = express();
app.use(express.json());
app.use(cookieParser());

// Create an EasyAuth instance
const easyAuth = EasyAuth({
  secret: 'MY_SUPER_SECRET_KEY',
  ttl: 60 * 60 * 24, // 24 hours in seconds
  name: 'my-app',
  onAuth: async (authphrase) => {
    // Lookup user with authphrase in your database
    return userFromDatabase || null;
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const userData = await easyAuth.Auth(req.body.email, req.body.password);
  if (!userData) return res.status(401).json({ error: 'Invalid credentials' });
  
  const session = await easyAuth.Session(userData);
  return session.session(res).status(200).json(userData);
});

// Protected route
app.get('/profile', [easyAuth.SessionMiddleware], (req, res) => {
  if (!req.session) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ user: req.session });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

For more detailed documentation, see the [API Reference](./api-reference.md), [Configuration Options](./configuration.md), and [Examples](./examples.md).
