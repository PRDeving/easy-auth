# EASY-AUTH

Easy-Auth is a lightweight boilerplate utility library to manage user/password authentication with as little code as possible.

Easy-Auth is based on cookie and bearer JWT auth, supporting both.

Users and Auth repositories are in the clients control, Easy-Auth provides a hook to look for users in the auth lifecycle.

# How to use Easy Auth

### Create an instance with desired configuration

```
const easyAuth = EasyAuth({
secret: 'MY_SUPER_SECRET_KEY',
    ttl: 1000 * 60 * 60 * 24,
    name: 'test',
    onAuth: async (authphrase) => UserRepository.findUserByAuthphrase(authphrase),
})

```

onAuth is a hook that will be called with an authphrase when a user tries to log in, you are expected to have a method to check the users storage for a user with said authphrase.

Authphrases are kinda like user ids, authphrases are unique per user login, are constructed with user identifier (email, username, etc) and a password.

onAuth is required to return falsy (false, null, 0, undefined...) if theres no users for the authphrase or a data object,
this object is the one stored in the JWT and the one you will have back when a user session is verified.

### Create a login endpoint

```
app.post('/login', async (req, res) => {
    const auth = await easyAuth.credentialsAuth(req.body.email, req.body.password)
    if (!auth) return res.status(401).json({ error: 1 })

    return auth.session(res).status(200).json(auth.data)
})
```

when a user calls this endpoint, Easy-Auth will try to reach the users repository through the onAuth hook and fetch a data object, if it works, the `.credentialsAuth` method is going 
to return an object with the data returned by the repo, the token and a `.session` method to set the cookies.

Using the session cookie wrapper is recommended but not mandatory.

### Verify your session anywhere

```
app.patch('/users/:userId', [easyAuth.SessionMiddleware], (req, res) => {
    if (!req.session || req.session.userId != req.params.userId) return res.status(403).send('Forbidden')
    ...
})

```

# API Reference

### EasyAuth <constructor>(config)

** returns easyauth instance **

- secret: used as JWT secret and to generate authphrase salt

- ttl: session expiration in miliseconds, used for both jwt and cookies

- name: project name, used as audience for jwt

- onAuth function(authphrase <string>): repository interaction hook

### easyauth<instance>.credentialsAuth(identificator, password)

this is the simplest auth method, it's used to login users in the system

```
app.post('/login', (req, res) => {
    const auth = await easyAuth.credentialsAuth(req.body.email, req.body.password)
    if (!auth) return res.status(401).json({ error: 1})
    return res.status(200).set('token', auth.token).json(auth.data)
})
```

it returns the data object and generates a JWT token that contains the data

`return auth.session(res).status(200).json(auth.data)`

also returns a `.session(res <Response>)` method that can be used to wrap API responses with the jwt as a cookie in express

### easyauth<instance>.validateSession(token)

This method can be used to validate if the token is valid and extract it's content

### easyauth<instance>.SessionMiddleware(req <Request>, res, next)

This is a simple express session middleware that gets the token from either cookies or as authorization bearer token and uses `validateSession` to verify it and return its content

```
app.get('/session', [easyAuth.SessionMiddleware], (req, res) => {
    res.status(200).json({ status: 'OK', session: req.session })
})
```

SessionMiddleware also refreshes the token and cookie ttl
