const mongoose=require('mongoose');

const File= new mongoose.Schema({
    uploadedAt:{
        type:Date,
        default:Date.now
    },
    md5:{
        type:String,
    }
})

module.exports=FileSchema=mongoose.model('Upload',File);
