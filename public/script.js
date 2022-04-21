
URL='http://localhost:5555'
const THEADERS=['model_year','make','model','rejection_percentage','reason_1','reason_2','reason_3'];



// form uploaded file
const form =document.getElementById('uploaded-form');
// spinner
const spinner=document.getElementById("container__spinner");
spinner.style.display='none'; // initially set to hidden
// noti
const notification=document.getElementById("noti");
// vehicle table
const table=document.getElementById("vehicle__table");
// search bar
const liveSearch=document.getElementById("live-search");
// instruction
const instructionBtn=document.getElementById("inst-button");
const instructions=document.getElementById("instruction");

// records counter
const tableFooter=document.getElementsByClassName("table-footer")[0];
const recordsNum=document.getElementById("records-num");

// set notification timer
const setNotiTimer=(err,shade='danger')=>{
    notification.style.display='block';
    notification.innerHTML=err;

    notification.classList.remove('success');
    notification.classList.remove('danger');

    notification.classList.add(`${shade}`);
    const timer=setTimeout(()=>{
        notification.style.display='none';
    },5000);
}
// set spinner on/off
const setSpinner=(state)=>{
    if(state)
    {
        spinner.style.display='block';
        tableFooter.style.display='none';
    }
    else
    {
        spinner.style.display='none';
        tableFooter.style.display='block';

    }
}
// pop up
const popUp=(e)=>{
    if(instructions.style.display==='block')
        instructions.style.display='none';
    else
        instructions.style.display='block';
}

// records counter for table
const updateTableFooter=(num)=>{
    recordsNum.innerHTML=`#Total record(s): ${num}`;

}

// update table
const updateTable=(newData)=>{

    let blankBody= document.createElement('tbody');
    // update table footer
    updateTableFooter(newData.length);
    // populate new rows
    newData.forEach((element,id) => {
        let row=document.createElement('tr');
        // loop over each row and append to new tbody
        for(let key in element)
        {

            if(THEADERS.includes(key.toLowerCase()))
            {

                let td=row.appendChild(document.createElement('td'));
                if(key === 'rejection_percentage')
                {
                    td.innerHTML=parseFloat(element[key]).toFixed(2)+"%";
                }
                else td.innerHTML=element[key];
            }

        }
        blankBody.appendChild(row);
    });
    let oldBody= table.getElementsByTagName('tbody')[0];
    // drop and append new tbody
    table.replaceChild(blankBody,oldBody);

}
// fetch all rows in the db + update table
const fetchAllData=async()=>{
    setSpinner(true);
    try{
        const res=await axios.get(`${URL}/api/all`);
        //console.log(res);
        const data=res.data.vehicles_data;
        if(data)
        {
            updateTable(data);
        }

    }catch(err)
    {
        setNotiTimer(err.response.data.error)
    }
    setSpinner(false);
}

// search input handler
const inputHandler=(e)=>{

    const keyword=e.target.value;// take keyword
    (async()=>{
        try{
            if(keyword)
            {
                // check for present
                const res=await axios.get(`${URL}/api?search=${keyword}`)
                if(res.status == 200)
                {
                    const data=res.data.vehicles_data;
                    updateTable(data);
                    setSpinner(false);
                }
            }
            else{
                //empty keyword means all data
                await fetchAllData();
            }
        }catch(err)
        {
            // set the noti box
            setSpinner(false);
            setNotiTimer(err.response.data.error);
            console.error(err.response.data.error);
        }
    })();
}


// upload form
const submitForm= async(e)=>{
    e.preventDefault();
    try{
        const file=document.getElementById('uploaded-file').files[0];
        //create form
        let config={
            headers:{
                'Content-Type':'multipart/form-data'
            }
        }
        let body = new FormData();
        body.append('uploadFile',file)
        setSpinner(true);
        const res=await axios.post(`${URL}/api/upload`,body,config)
        if(res.status == 200)
        {
            // set success noti and fetch data
            setNotiTimer(res.data.msg,'success');
            await fetchAllData();
        }
    }catch(err)
    {
        // set the noti box
        setSpinner(false);
        //console.log(err.response);
        setNotiTimer(err.response.data.error);
    }
}

// initially it loads current records in the db
(async()=>{
    await fetchAllData();
})()

form.addEventListener('submit',submitForm);
liveSearch.addEventListener('input',inputHandler);
instructionBtn.addEventListener('click',popUp);
