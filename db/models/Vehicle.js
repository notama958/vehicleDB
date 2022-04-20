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
    file_id:{
        type: mongoose.Schema.Types.ObjectId, ref:'Upload'
    }

},{
    collation: { locale: 'en', strength: 2 }
})
Vehicle.index({model:'text',make:'text'},{name:"my_index",weights:{model:2,make:1}});
module.exports=VehicleSchema=mongoose.model('Vehicle',Vehicle);
