const express = require("express");
const fs = require("fs");
const urlLib = require("url");
const pathObj = require("path");
const myStatic = require("express-static");
const bodyParser = require("body-parser");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const cookieSesison = require("cookie-session");
const consolidate = require("consolidate");
const ejs = require("ejs");
const mysql = require("mysql");
const moment = require("moment");
const multerObj = multer({
    dest: './www/uploads'
});
var server = express();
server.listen(8088);
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "lkk411325",
    database: "zydata"
});

server.use(bodyParser.urlencoded({
    extended: false
}));
server.use(cookieParser());
var sessArr = [];
for (let i = 0; i < 1000000; i++) {
    sessArr.push(`sdkfnsdf${i*Math.random()}`);
};
server.use(cookieSesison({
    name: "swsSessID",
    keys: sessArr
}));
server.use(multerObj.any());
server.set("view engine", "html");
server.set("views", "./views");
server.engine("html", consolidate.ejs);
server.use("/", function (req, res, next) {
    db.query("SELECT * FROM banners", (err, data) => {
        if (err) {
            res.status(500).send("database error").end();
        } else {
            res.banners = data;
            next();
        }
    });
});
server.use('/', function (req, res, next) {
    db.query("SELECT * FROM news", (err, data) => {
        if (err) {
            res.status(500).send("database error").end();
        } else {
            res.news = data;
            next();

        }
    });
});
server.use('/', function (req, res, next) {
    db.query("SELECT * FROM zcjd", (err, data) => {
        if (err) {
            res.status(500).send("database error").end();
        } else {
            res.zcData = data;
            next();
        }
    });
});
server.use('/', function (req, res, next) {
    db.query("SELECT * FROM anli", (err, data) => {
        if (err) {
            res.status(500).send("database error").end();
        } else {
            res.anliData = data;
            next();
        }
    });
});
server.use("/index.html", (req, res) => {
    res.render("index.ejs", {
        banners: res.banners,
        anliData:res.anliData
    });
    res.end();
});
server.use("/introduce.html", (req, res) => {
    res.render("introduce.ejs", {
        news: res.news
    });
    res.end();
});
server.use("/law.html", (req, res) => {
    res.render("law.ejs", {
        zcData: res.zcData
    });
    res.end();
});
server.use("/contact.html", (req, res) => {
    res.render("contact.ejs");
    res.end();
});
server.use("/case.html", (req, res) => {
    res.render("case.ejs");
    res.end();
});
server.use("/news", require("./router/web/news")());
server.use("/zcjd", require("./router/web/zcjd")());
server.use("/anli", require("./router/web/anli")());
server.use("/api/login", (req, res) => {
    var user = req.body.username;
    var psd = req.body.psd;
    db.query(`SELECT * FROM user WHERE username='${user}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "用户名不存在!"
                    }
                }).end();
            } else {
                if (data1[0].password != psd) {
                    res.status(200).send({
                        resCode: 0,
                        data: {
                            msg: "密码不正确!"
                        }
                    }).end();
                } else {
                    res.status(200).send({
                        resCode: 1,
                        data: {
                            msg: "登陆成功!"
                        }
                    }).end();
                }
            }
        }
    });
});
/* 获取banner 列表 */
server.use("/api/getBanner", (req, res) => {
    db.query("SELECT * FROM banners", (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            res.status(200).send({
                resCode: 1,
                data: {
                    banners: data1
                }
            }).end();

        }
    });
});
/* 获取单条banner */
server.use("/api/getIDbanners", (req, res) => {
    var id = req.query.ID;
    db.query(`SELECT * FROM banners where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                // console.log(data1)
                res.status(200).send({
                    resCode: 1,
                    data: {
                        data: data1
                    }
                }).end();
            }
        }
    });
})
/* banner新增 编辑 */
server.use("/api/banner", (req, res) => {
    var bannerActive = urlLib.parse(req.url, true).query.active;
    if (bannerActive == "addBanner") {
        const title = req.body.title;
        const oldPath = req.files[0].path;
        const ext = pathObj.parse(req.files[0].originalname).ext;
        const newPath = req.files[0].path + ext;
        const fileName = req.files[0].filename + ext;
        const src = `${fileName}`;
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error("file operation err")
            } else {
                db.query(`INSERT INTO banners (title,src) VALUE('${title}','${src}')`, (err) => {
                    if (err) {
                        res.status(500).send({
                            resCode: 0,
                            data: {
                                msg: "添加失败"
                            }
                        }).end();
                    } else {
                        res.send({
                            resCode: 1,
                            data: {
                                msg: "添加成功"
                            }
                        }).end();
                    }
                })
            }
        });
    } else if (bannerActive == "editBanner") {
        const id = req.query.ID;
        db.query(`SELECT src FROM banners WHERE ID = ${id}`, (err2, data2) => {
            if (err2) {
                console.error(err2);
                res.status(500).send({
                    resCode: 0,
                    data: {
                        msg: err2
                    }
                }).end();
            } else {
                fs.unlink(`www/uploads/${data2[0].src}`, (err3) => {
                    if (err3) {
                        console.error(err3);
                        res.status(500).send({
                            resCode: 0,
                            data: {
                                msg: err3
                            }
                        }).end();
                    } else {
                        const title = req.body.title1;
                        const oldPath = req.files[0].path;
                        const ext = pathObj.parse(req.files[0].originalname).ext;
                        const newPath = req.files[0].path + ext;
                        const fileName = req.files[0].filename + ext;
                        const src = `${fileName}`;
                        fs.rename(oldPath, newPath, (err) => {
                            if (err) {
                                console.error(err)
                                res.status(500).send({
                                    resCode: 0,
                                    data: {
                                        msg: "file operation err"
                                    }
                                }).end();
                            } else {
                                db.query(`UPDATE banners SET title='${title}',src='${src}' where id= ${id}`, (err) => {
                                    if (err) {
                                        res.status(500).send({
                                            resCode: 0,
                                            data: {
                                                msg: "编辑失败"
                                            }
                                        }).end();
                                    } else {
                                        res.send({
                                            resCode: 1,
                                            data: {
                                                msg: "编辑成功"
                                            }
                                        }).end();
                                    }
                                })
                            }
                        });
                    }
                })
            }
        })
    }
})

/* banner删除 */
server.use("/api/bannerDel", (req, res) => {
    var id = req.query.ID;
    db.query(`SELECT src FROM banners WHERE ID = ${id}`,(err2,data2)=>{
        if(err2){
            console.error(err2);
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: err2
                }
            }).end();
        }else{
            
            fs.unlink(`www/uploads/${data2[0].src}`,(err3)=>{
                if(err3){
                    console.error(err3);
                    res.status(500).send({
                        resCode: 0,
                        data: {
                            msg: err3
                        }
                    }).end();
                }else{
                    db.query(`DELETE FROM banners where ID = ${id}`, (err1) => {
                        if (err1) {
                            res.status(500).send({
                                resCode: 0,
                                data: {
                                    msg: err1
                                }
                            }).end();
                        } else {
                            res.status(200).send({
                                resCode: 1,
                                data: {
                                    msg: "删除成功！"
                                }
                            }).end();
                        }
                    })
                }
            })
        }
    })
    
})
/* 获取新闻列表 */
server.use("/api/getNews", (req, res) => {
    db.query("SELECT * FROM news", (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "请添加新闻"
                    }
                }).end();
            } else {

                res.status(200).send({
                    resCode: 1,
                    data: {
                        news: data1
                    }
                }).end();
            }

        }
    });
})
/* 获取单条新闻 */
server.use("/api/getIDNews", (req, res) => {
    var id = req.query.ID;
    db.query(`SELECT * FROM news where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                res.status(200).send({
                    resCode: 1,
                    data: {
                        data: data1
                    }
                }).end();
            }
        }
    });
})
/* 新增新闻 */
server.use("/api/newsAdd", (req, res) => {
    var title = req.query.title;
    var content = req.query.content;
    var date = new Date(req.query.date.replace(/-/g, '/')).getTime() / 1000;
    var summary = req.query.summary;
    var source = req.query.source;
    db.query(`INSERT INTO news (title,content,date,summary,source) VALUE('${title}','${content}','${date}','${summary}','${source}')`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "添加失败"
                }
            }).end();
        } else {
            res.status(200).send({
                resCode: 1,
                data: {
                    msg: "添加成功"
                }
            }).end();
        }
    })
})
/* 新闻编辑 */
server.use("/api/newsEdit", (req, res) => {
    var id = req.query.ID;
    var title = req.query.title;
    var content = req.query.content;
    var date = new Date(req.query.date.replace(/-/g, '/')).getTime() / 1000;
    var summary = req.query.summary;
    var source = req.query.source;
    db.query(`SELECT * FROM news where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                db.query(`UPDATE news SET title='${title}',content='${content}',date='${date}',summary='${summary}',source='${source}' where id= ${id}`, (err, data1) => {
                    if (err) {
                        res.status(500).send({
                            resCode: 0,
                            data: {
                                msg: "编辑失败"
                            }
                        }).end();
                    } else {
                        res.status(200).send({
                            resCode: 1,
                            data: {
                                msg: "编辑成功"
                            }
                        }).end();
                    }
                })
            }
        }
    });
})
/* 删除新闻 */
server.use("/api/newsDel", (req, res) => {
    var id = req.query.ID;
    db.query(`SELECT * FROM news where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                db.query(`DELETE FROM news where ID = '${id}'`, (err, data1) => {
                    if (err) {
                        res.status(500).send({
                            resCode: 0,
                            data: {
                                msg: "删除失败"
                            }
                        }).end();
                    } else {
                        res.status(200).send({
                            resCode: 1,
                            data: {
                                msg: "删除成功"
                            }
                        }).end();
                    }
                })
            }
        }
    });
})


/* 获取政策解读列表 */
server.use("/api/getZcjd", (req, res) => {
    db.query("SELECT * FROM zcjd", (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "请添加政策解读"
                    }
                }).end();
            } else {

                res.status(200).send({
                    resCode: 1,
                    data: {
                        zcjdLists: data1
                    }
                }).end();
            }

        }
    });
})
/* 获取单条政策解读 */
server.use("/api/getIDZcjd", (req, res) => {
    var id = req.query.ID;
    db.query(`SELECT * FROM zcjd where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                res.status(200).send({
                    resCode: 1,
                    data: {
                        data: data1
                    }
                }).end();
            }
        }
    });
})
/* 新增政策解读 */
server.use("/api/zcjdAdd", (req, res) => {
    var title = req.query.title;
    var content = req.query.content;
    var tz = req.query.tz;
    db.query(`INSERT INTO zcjd (title,content,tz) VALUE('${title}','${content}','${tz}')`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "添加失败"
                }
            }).end();
        } else {
            res.status(200).send({
                resCode: 1,
                data: {
                    msg: "添加成功"
                }
            }).end();
        }
    })
})
/* 新闻政策解读 */
server.use("/api/zcjdEdit", (req, res) => {
    var id = req.query.ID;
    var title = req.query.title;
    var content = req.query.content;
    var tz = req.query.tz;
    db.query(`SELECT * FROM zcjd where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                db.query(`UPDATE zcjd SET title='${title}',content='${content}',tz='${tz}' where id= ${id}`, (err, data1) => {
                    if (err) {
                        res.status(500).send({
                            resCode: 0,
                            data: {
                                msg: "编辑失败"
                            }
                        }).end();
                    } else {
                        res.status(200).send({
                            resCode: 1,
                            data: {
                                msg: "编辑成功"
                            }
                        }).end();
                    }
                })
            }
        }
    });
})
/* 删除政策解读 */
server.use("/api/zcjdDel", (req, res) => {
    var id = req.query.ID;
    db.query(`SELECT * FROM zcjd where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                db.query(`DELETE FROM zcjd where ID = '${id}'`, (err, data1) => {
                    if (err) {
                        res.status(500).send({
                            resCode: 0,
                            data: {
                                msg: "删除失败"
                            }
                        }).end();
                    } else {
                        res.status(200).send({
                            resCode: 1,
                            data: {
                                msg: "删除成功"
                            }
                        }).end();
                    }
                })
            }
        }
    });
});

/* 获取成功案例列表 */
server.use("/api/getAnli", (req, res) => {
    db.query("SELECT * FROM anli", (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "请添加政策解读"
                    }
                }).end();
            } else {

                res.status(200).send({
                    resCode: 1,
                    data: {
                        anliLists: data1
                    }
                }).end();
            }

        }
    });
})
/* 获取单条成功案例 */
server.use("/api/getIDAnli", (req, res) => {
    var id = req.query.ID;
    db.query(`SELECT * FROM zcjd where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                res.status(200).send({
                    resCode: 1,
                    data: {
                        data: data1
                    }
                }).end();
            }
        }
    });
})
/* 新增成功案例 */
server.use("/api/anliAdd", (req, res) => {
    var title = req.query.title;
    var content = req.query.content;
    db.query(`INSERT INTO anli (title,content) VALUE('${title}','${content}')`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "添加失败"
                }
            }).end();
        } else {
            res.status(200).send({
                resCode: 1,
                data: {
                    msg: "添加成功"
                }
            }).end();
        }
    })
})
/* 成功案例解读 */
server.use("/api/anliEdit", (req, res) => {
    var id = req.query.ID;
    var title = req.query.title;
    var content = req.query.content;
    db.query(`SELECT * FROM anli where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                db.query(`UPDATE zcjd SET title='${title}',content='${content}' where id= ${id}`, (err, data1) => {
                    if (err) {
                        res.status(500).send({
                            resCode: 0,
                            data: {
                                msg: "编辑失败"
                            }
                        }).end();
                    } else {
                        res.status(200).send({
                            resCode: 1,
                            data: {
                                msg: "编辑成功"
                            }
                        }).end();
                    }
                })
            }
        }
    });
})
/* 删除成功案例 */
server.use("/api/anliDel", (req, res) => {
    var id = req.query.ID;
    db.query(`SELECT * FROM anli where ID = '${id}'`, (err, data1) => {
        if (err) {
            res.status(500).send({
                resCode: 0,
                data: {
                    msg: "database err"
                }
            }).end();
        } else {
            if (data1.length == 0) {
                res.status(200).send({
                    resCode: 0,
                    data: {
                        msg: "数据为空"
                    }
                }).end();
            } else {
                db.query(`DELETE FROM anli where ID = '${id}'`, (err, data1) => {
                    if (err) {
                        res.status(500).send({
                            resCode: 0,
                            data: {
                                msg: "删除失败"
                            }
                        }).end();
                    } else {
                        res.status(200).send({
                            resCode: 1,
                            data: {
                                msg: "删除成功"
                            }
                        }).end();
                    }
                })
            }
        }
    });
})
server.use(myStatic("./www"));