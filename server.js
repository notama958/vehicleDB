const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs=require('fs');
const path= require('path');
// database
const {findAllRecords,findFileByMD5,insertVehicle, insertFile, textSearch, removeJSON}=require("./db/controller");


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
const saveToDB=async(vehicles, fileId)=>{
    let count=0;
    for(const row in vehicles )
    {
        let obj=JSON.parse(JSON.stringify(vehicles[row]));
        obj.file_id=fileId;
        obj.rejection_percentage=vehicles[row].rejection_percentage.replace(/,/g, '.'); // replace , with . in number
        try{

            const objId=await insertVehicle(obj);
            count++;
        }catch(err)
        {
            console.error(err);
        }
    }
    return count;
}
/** OK
 * @route  POST /api/upload
 * @desc    upload json file
 * @access  public
 */
app.post('/api/upload',async (req,res)=>{
    try{
        if(!req.files)
        {
            return res.status(404).json({error:'File not found'})
        }
        let file=req.files.uploadFile;
        let md5=file.md5
        let fileType=file.mimetype;
        // check file type
        if(!fileType.includes('json'))
        {
            return res.status(400).json({error:'Sorry NOT a JSON file'})
        }
        // check file duplicated
        const findOne= await findFileByMD5(md5);
        if(findOne)
        {
            return res.status(400).json({error:'File Duplicated'})
        }
        const newFile= {
            md5:md5
        }
        // insert new file
        const fileId=await insertFile(newFile);
        file.mv(path.join(__dirname,"files",file.name),(err)=>{
            if(err)
                throw 'Cannot save new local file';
            // read file and parse
            const content=fs.readFileSync(path.join(__dirname,"files",file.name));
            let vehicles=JSON.parse(content);
            // save file into DB
            saveToDB(vehicles,fileId).then((count)=>{
                // remove file from local storage
                console.log(count);
                removeFile(path.join(__dirname,"files",file.name));
                return res.status(200).json({msg:"file added"})
            }).catch((err)=>{
                // remove file from local storage
                removeFile(path.join(__dirname,"files",file.name));
                removeJSON(md5); // allows the file can be re-uploaded
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

/** OK
 * @route  GET /api/all
 * @desc    show all records
 * @access  public
 */
app.get("/api/all",async(req,res)=>{
    try{
        const vehicles=await findAllRecords();
        return res.status(200).json({vehicles_data:vehicles});
    }catch(err)
    {
        console.log(err);
        return res.status(500).json({error:err})

    }
})

/** OK
 * @route  GET /api?search=xxxx
 * @desc    search by text
 * @access  public
 */
app.get('/api',async(req,res)=>{
    try{

        const text=req.query.search;
        if(text)
        {

            const data=await textSearch(text.split(' ').join(" & "));
            const formatedData=data.map((e,id)=>{
                let newObj=JSON.parse(JSON.stringify(e));
                return newObj
            })
            return res.status(200).json({vehicles_data:formatedData});
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

