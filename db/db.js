const {Sequelize}=require("sequelize");

const dotenv = require('dotenv');
dotenv.config();
const envr = process.env.NODE_ENV || 'development';
const config= require("./config")[envr];


const sequelize= new Sequelize(config);

(async ()=>{
    try{
        await sequelize.authenticate();
    }catch(err)
    {
        console.error(`Fail to connect =>${err}`)
    }
})();



module.exports=sequelize;
