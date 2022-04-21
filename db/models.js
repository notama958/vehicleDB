const sequelize =require("./db");
const {DataTypes}=require("sequelize");
const dotenv=require("dotenv");
dotenv.config();

const  Vehicle=sequelize.define("Vehicle",{
    vehicle_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    model_year:{
        type:DataTypes.STRING(4),
        allownull:true
    },
    make:{
        type:DataTypes.TEXT,
        allownull:true
    },
    model:{
        type:DataTypes.TEXT,
        allownull:true
    },
    rejection_percentage:{
        type:DataTypes.TEXT,
        allownull:true,
    },
    reason_1:{
        type:DataTypes.TEXT,
        allownull:true,
    },
    reason_2:{
        type:DataTypes.TEXT,
        allownull:true,
    },
    reason_3:{
        type:DataTypes.TEXT,
        allownull:true,
    },
    file_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
},{
    timestamps:false,
    tableName: 'vehicle',

});

const  File=sequelize.define("File",{
    file_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    md5:{
        type:DataTypes.TEXT,
        allowNull:false
    }
},{
    timestamps:true,
    updatedAt:false,
    tableName: 'file',
    indexes:[
        {fields:['file_id','md5']}
    ]
})

// define mixin associations
File.hasMany(Vehicle,{foreignKey:"file_id"});
Vehicle.belongsTo(File,{foreignKey:"file_id",foreignKeyConstraint:true});


// sync all tables
sequelize.sync({force:true}).then(async()=>{
    const vectorName='vehicle_ts';
    const fields=['model_year','make','model','rejection_percentage','reason_1','reason_2','reason_3'];
    // start transaction
    const t=await sequelize.transaction();
    try{
        // create seperate column for tsvector to hold output from to_tsvector and create index for faster search
        await sequelize.query(`ALTER TABLE vehicle ADD COLUMN ${vectorName} TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', ${fields.join(" || ' ' || ")} )) STORED`);
        await sequelize.query(`CREATE INDEX vehicle_search_idx ON vehicle USING gin(${vectorName})`);
        await t.commit();
    }catch(err)
    {
        await t.rollback();
    }
    console.log("Postgres connected")


}).catch((err)=>{
    console.error(err);
})

module.exports={
    Vehicle,
    File,
}
