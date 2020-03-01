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
    router.use("/detail.html",(req,res)=>{
        var ID = req.query["ID"];
        db.query("SELECT * FROM news WHERE ID= "+ID,(err,data)=>{
            if(err){
                res.status(500).send("database error").end();
            }else{
                if(data.length == 0){
                    res.status(500).send("您请求的数据不存在").end();
                }else{
                    var formatTime = require('../../libs/formatDate');
                    var datas = JSON.parse(JSON.stringify(data));
                    datas[0].date = formatTime(datas[0].date * 1000);
                    res.render("detail.ejs",{newsData:datas});
                    res.end()
                }
            }
        })  
    })
    return router;
}