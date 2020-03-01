const express = require("express");
const mysql = require("mysql");
const urlLib = require("url");


const db = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"lkk411325",
    database:"zydata"
});
module.exports = function(){
    var router = express.Router();
    router.use("/anliDetail.html",(req,res)=>{
        var ID = req.query["ID"];
        db.query("SELECT * FROM anli WHERE ID= "+ID,(err,data)=>{
            if(err){
                res.status(500).send("database error").end();
            }else{
                if(data.length == 0){
                    res.status(500).send("您请求的数据不存在").end();
                }else{
                    res.render("anliDetail.ejs",{anliData:data});
                    res.end()
                }
            }
        })  
    })
    return router;
}