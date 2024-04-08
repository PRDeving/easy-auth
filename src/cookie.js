export default (res, value, config) => res.cookie('eat', value, {
    maxAge: config.ttl * 1000,
    ...(config.domain ? { domain: config.domain } : {}),
    httpOnly: true,
})
