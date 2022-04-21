const mongoose=require('mongoose');
const Vehicle= new mongoose.Schema({
    model_year:{
        type:String,
        default:""
    },
    make:{
        type:String,
        default:""
    },

    model:{
        type:String,
        default:""
    },
    rejection_percentage:{
        type:String,
        default:""
    },
    reason_1:{
        type:String,
        default:""
    },
    reason_2:{
        type:String,
        default:""
    },
    reason_3:{
        type:String,
        default:""
    },
    file_md5:{
        type:String,
    }

})
Vehicle.index({model:'text',make:'text',model_year:'text',rejection_percentage:'text'},{name:"my_index",weights:{model:2,make:2,model_year:1,rejection_percentage:1}});
module.exports=VehicleSchema=mongoose.model('Vehicle',Vehicle);
