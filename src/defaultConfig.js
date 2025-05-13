export default {
    name: 'easy-auth',
    domain: 'http://localhost',
    secret: 'MY_SECRET',
    audience: 'easy-auth',
    issuer: 'easy-auth',
    ttl: 60 * 60 * 24,
    refresh: 60,
    inputPattern: /^[A-Za-z0-9-_=.]+$/,

    onCreate: () => console.log('You need to configure a backend for user creation: fn(authphrase, data): boolean'),
    onAuth: () => console.log('You need to configure a backend for user auth: fn(authphrase): User'),
}
