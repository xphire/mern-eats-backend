require('dotenv').config();
module.exports = {
    port : 7000,
    mongoUri : process.env["MONGODB_CONNECTION_STRING"],
    sentry_dsn : process.env["SENTRY_DSN"],
    auth0_audience : process.env["AUTH0_AUDIENCE"],
    auth0_issuer_base_url : process.env["AUTH0_ISSUER_BASE_URL"]
}