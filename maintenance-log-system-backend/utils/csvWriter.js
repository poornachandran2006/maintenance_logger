const {createObjectCsvWriter}=require('csv-writer');
const Maintenance=require('../models/maintenance.model');
const path=require('path');
const fs=require('fs');
const { title } = require('process');

exports.exportCSV =async(req,res)=>{
    try{
        const data=await Maintenance.find().lean();

        const processed=data.map(item=>({
            machineId: item.machineId,
            department: item.department,
            status : item.status,
            durationMinutes : (new Date(item.finishTime)- new Date(item.startTime))/(1000*60),
            startTime: new Date(item.startTime).toLocaleString(),
            finishTime: new Date(item.finishTime).toLocaleString()
        }));

        const exportsDir=path.join(__dirname,'../exports');
        if(!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir);
        
        const fileName=`maintenance_report_${Date.now()}.csv`;
        const csvpath=path.join(exportsDir,fileName);

        const csvwriter=createObjectCsvWriter({
            path: csvpath,
            header : [
                {id:'machineid', title:'Machine Id'},
                {id:'department', title:'Department'},
                {id:'status',title:'Status'},
                {id:'durationMinutes',title:'Duration(min)'},
                {id:'startTime',title:'StartTime'},
                {id:'finishTime',title:'FinishTime'}
            ]
        });
        await csvwriter.writeRecords(processed);
        res.download(csvpath,(err)=>{
            if(!err) fs.unlinkSync(csvpath);
        });
    }

    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}