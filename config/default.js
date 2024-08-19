require('dotenv').config();
module.exports = {
    port : 7000,
    mongoUri : process.env["MONGODB_CONNECTION_STRING"],
    sentry_dsn : process.env["SENTRY_DSN"],
    auth0_audience : process.env["AUTH0_AUDIENCE"],
    auth0_issuer_base_url : process.env["AUTH0_ISSUER_BASE_URL"],
    cloudinary_cloud_name : process.env["CLOUDINARY_CLOUD_NAME"],
    cloudinary_api_secret : process.env["CLOUDINARY_API_SECRET"],
    cloudinary_api_key : process.env["CLOUDINARY_API_KEY"],
    frontend_url : process.env["FRONTEND_URL"],
    stripe_api_key : process.env["STRIPE_API_KEY"],
    stripe_webhook_signing_secret: process.env["STRIPE_WEBHOOK_SIGNING_SECRET"]

}