const dotenv = require('dotenv');
dotenv.config();
const pg = require('pg');


module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: "vehicledb",
        host: process.env.DB_HOST,
        port: 5433,
        dialect: "postgres",
        logging:false

    },
    // for HEROKU
    production: {
        dialect: "postgres",
        use_env_variable: process.env.DATABASE_URL,
        logging:false,
        dialectOptions: {
            ssl: {
              "require": true,
              "rejectUnauthorized": false
            }
        }
    },
};
