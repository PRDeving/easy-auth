# Configuration Options

Easy-Auth can be configured with various options to customize its behavior.

## Default Configuration

```javascript
{
  name: 'easy-auth',
  domain: 'http://localhost',
  secret: 'MY_SECRET',
  audience: 'easy-auth',
  issuer: 'easy-auth',
  ttl: 60 * 60 * 24, // 24 hours in seconds
  refresh: 60, // 60 seconds

  onCreate: () => console.log('You need to configure a backend for user creation: fn(authphrase, data): boolean'),
  onAuth: () => console.log('You need to configure a backend for user auth: fn(authphrase): User'),
}
```

## Options

### name
Project name, used as audience for JWT if audience is not specified.

```javascript
name: 'my-app'
```

### domain
Domain for cookies, defaults to http://localhost.

```javascript
domain: 'example.com'
```

### secret
Secret key used for JWT signing and authphrase generation. This should be a strong, unique value.

```javascript
secret: 'MY_SUPER_SECRET_KEY'
```

### audience
JWT audience claim, defaults to name. This identifies the intended recipient of the token.

```javascript
audience: 'my-app'
```

### issuer
JWT issuer claim, defaults to name. This identifies who created the token.

```javascript
issuer: 'my-app'
```

### ttl
Token time-to-live in seconds, determines session expiration.

```javascript
ttl: 60 * 60 * 24 // 24 hours in seconds
```

### refresh
Time window in seconds before token expiration when tokens should be refreshed.

```javascript
refresh: 60 // 60 seconds
```

### inputPattern
Regular expression pattern used to validate user input. This helps prevent injection attacks by ensuring all user input matches the expected format. Defaults to a pattern that allows alphanumeric characters, hyphens, underscores, equals signs, and periods (compatible with JWT tokens).

```javascript
inputPattern: /^[A-Za-z0-9-_=.]+$/
```

## Hooks

### onAuth(authphrase)
Function called to retrieve user data based on authphrase. Must return user data object if found, or falsy value if not found.

```javascript
onAuth: async (authphrase) => {
  // Example implementation
  const user = await db.findUserByAuthphrase(authphrase);
  return user || null;
}
```

### onCreate(authphrase, data)
Function called to create a new user account. Must return boolean indicating success or failure.

```javascript
onCreate: async (authphrase, data) => {
  // Example implementation
  try {
    await db.createUser({ authphrase, ...data });
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
}
```

## Environment Variables

Easy-Auth also supports configuration through environment variables. Any environment variable will override the corresponding configuration option.

```
SECRET=my-secret
TTL=86400
NAME=my-app
DOMAIN=example.com
AUDIENCE=my-app
ISSUER=my-app
REFRESH=60
```

## Example Configuration

```javascript
const easyAuth = EasyAuth({
  secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY',
  ttl: 60 * 60 * 24, // 24 hours in seconds
  name: 'my-app',
  domain: 'example.com',
  audience: 'my-app-audience',
  issuer: 'my-app-issuer',
  refresh: 300, // 5 minutes
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
