const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const fs=require('fs');
const path= require('path');
// database
const File=require('./db/models/File');
const connectDb = require('./db/dbConfig');
const Vehicle=require('./db/models/Vehicle');
connectDb();

const app=express();
// enable files upload
app.use(fileUpload({
    createParentPath: true
}));


// set up exress
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

// config static files
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname, 'public')));

const removeFile=(path)=>{
    fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
            throw 'Something went wrong';
        }
    })
}
const saveToDB=async(vehicles, md5)=>{
    let count=0;
    for(const row in vehicles )
    {
        let obj=new Vehicle(vehicles[row]);
        obj.file_id=md5;
        await obj.save((err,event)=>{
            if (err) throw 'Cannot save new document';
        })
        count++;
    }
    return count;
}
// file handler request
app.post('/api/upload',async (req,res)=>{
    try{
        if(!req.files)
        {
            return res.status(404).json({error:'File not found'})
        }
        let file=req.files.uploadFile;
        let md5=file.md5
        let fileType=file.mimetype;
        if(!fileType.includes('json'))
        {
            return res.status(400).json({error:'Sorry not a JSON file'})
        }
        const findOne= await File.findOne({md5:md5});
        if(findOne)
        {
            return res.status(400).json({error:'File Duplicated'})
        }
        const newFile= new File({
            createdAt:Date.now(),
            md5:md5
        });
        await newFile.save((err,event)=>{
            if (err) throw 'Cannot save new file';
        });
        file.mv(path.join(__dirname,"files",file.name),(err)=>{
            if(err)
                throw 'Cannot save new local file';
            // read file and parse
            const content=fs.readFileSync(path.join(__dirname,"files",file.name));
            let vehicles=JSON.parse(content);
            // save file into DB
            saveToDB(vehicles,md5).then((res)=>{
                // remove file from local storage
                removeFile(path.join(__dirname,"files",file.name));
                return res.status(200).json({msg:"file added"})
            }).catch((err)=>{
                // still remove file when failed
                removeFile(path.join(__dirname,"files",file.name));
                throw 'Cannot save new document';
            })
        });
    }
    catch(err){
        console.error(err)
        removeFile(path.join(__dirname,"files",req.name));
        return res.status(500).json({error:err})
    }
})

app.get("/api/all",async(req,res)=>{
    try{
        const vehicles=await Vehicle.find({},{_id:0,__v:0}).sort({model_year:-1,make:1,model:1,rejection_percentage:1});
        const formated=vehicles.map((e,id)=>{
            let newObj=JSON.parse(JSON.stringify(e))
            // console.log(newObj);
            newObj.rejection_percentage=e.rejection_percentage.replace(/,/g, '.');
            return newObj;
        });

        return res.status(200).json({msg:formated});
    }catch(err)
    {
        return res.status(500).json({error:err})

    }
})

app.get('/api',async(req,res)=>{
    try{

        const text=req.query.search;
        if(text)
        {
            const data=await Vehicle.find({$text:{$search:text}},{score:{$meta:"textScore"}},{lean:true}).sort({score:{$meta:"textScore"},model_year:-1,make:1,model:1,rejection_percentage:1}).limit(50)
            let wordNums=text.split(" ").length;
            let filteredData=data.filter((e,id)=>e.score > wordNums); // exclude data less than 2
            const formatedData=filteredData.map((e,id)=>{
                let newObj=JSON.parse(JSON.stringify(e));
                delete newObj['_id'];
                delete newObj['__v'];
                delete newObj['score'];
                newObj.rejection_percentage=e.rejection_percentage.replace(/,/g, '.');
                return newObj
            })
            return res.status(200).json({msg:formatedData});
        }

        return res.status(404).json({error:'Empty query'});
    }catch(err)
    {
        console.log(err);
        return res.status(500).json({error:err})
    }
})
// index endpoint
app.use('/',(req,res)=>{
    res.status(200).render('index');
})

const PORT = process.env.PORT || 5555;

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
});

