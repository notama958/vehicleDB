const {Vehicle, File}=require("./models");
const sequelize = require("./db");
const {QueryTypes}=require("sequelize");

// return all existing records of Vehicle table
const findAllRecords=async()=>{
    const vehicles=await Vehicle.findAll({
        raw:true,
        attributes:{exclude:['file_id','vehicle_ts']},
        order:[
            ['model_year','DESC'],
            ['make'],
            ['model'],
            ['rejection_percentage']
        ]
    });
    return vehicles;
}

// find JSON file based on md5 field
const findFileByMD5=async(md5)=>{
    const file=await File.findOne({
        raw:true,
        where:{"md5":md5},
    });
    return file;
}

// insert one record into Vehicle table
const insertVehicle=async(data)=>{
    const newVehicle=await Vehicle.create(data);
    return newVehicle.dataValues.vehicle_id;
}

// insert a new JSON file into File table
const insertFile=async(file)=>{
    const ret=await File.create(file);
    return ret.dataValues.file_id;
}

// full-text searching
const textSearch=async(keyword)=>{
    const ret=await sequelize.query(`SELECT model_year, make, model, rejection_percentage, reason_1, reason_2, reason_3 from vehicle where vehicle_ts @@ to_tsquery('${keyword}') order by model_year DESC, make ASC,model ASC limit 50;`,{ type: QueryTypes.SELECT });
    return ret;
}

// remove JSON file from File table
const removeJSON=async(MD5)=>{
    await File.destroy({
        where: { md5: MD5}
    })
}
module.exports={
    findAllRecords,
    findFileByMD5,
    insertVehicle,
    insertFile,
    textSearch,
    removeJSON
}
