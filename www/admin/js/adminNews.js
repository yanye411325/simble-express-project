$(function () {
    $("#username").text(getCookie("user"));
    $("#addBtn").click(function (event) {
        $(".addMsk").show();
    });

    hideMask(".common-dialog-mask", ".common-dialog-container", ".dialog-close-btn", ".common-dialog-footer .dialogCancleBtn");
    /*关闭弹框*/
    function hideMask(mask, container, closeBtn, btn) {
        $(mask).click(function (event) {
            maskHide();
        });
        $(btn).click(function (event) {
            maskHide();
        });
        $(closeBtn).click(function (event) {
            maskHide();
        });

        function maskHide() {
            $('.common-dialog-mask').hide();
        }
        /*阻止事件冒泡*/
        $(container).click(function (event) {
            event.stopPropagation();
        });
    }
    /* 获取新闻数据 */
    getList();

    function getList() {
        $.ajax({
            url: "http://localhost:8088/api/getNews",
            type: 'get',
            dataType: "json",
            success(res) {
                if (res.resCode == 1) {
                    var news = res.data.news;
                    if(news.length == 0){
                        $("#empty").addClass("active").siblings(".news-con-wrap table").removeClass("active");
                    }else{
                        $(".news-con-wrap table").addClass("active").siblings("#empty").removeClass("active");
                        var h = [];
                        for (var i = 0; i < news.length; i++) {
                            h[h.length] = "<tr data-id = '" + news[i].ID + "'><td>" + (i + 1) + "</td><td>" + news[i].title + "</td><td class='newsContent'>" + news[i].content.substring(0, 26) + "..." + "</td><td>" + moment(news[i].date * 1000).format("YYYY-MM-DD HH:MM:SS") + "</td><td>" + news[i].summary + "</td><td>" + news[i].source + "</td><td><button class='modifyBtn'>修改</button><button class='cancleBtn'>删除</button></td>";
                        }
                        $("tbody").html(h.join(""));
                    }
                    
                } else {
                    alert(res.msg)
                }
            },
            fail(err) {
                alert(err)
            }
        })
    }
    /* 添加新闻 */
    $(".addMsk .dialogConfirmBtn").click(function () {
        thisBtn = $(this);
        var title = $("#title").val();
        var content = $("#content").val();
        var date = $("#postDate").val();
        var summary = $("#summary").val();
        var source = $("#source").val();
        var errMsg = "";
        if (title == "") {
            errMsg = "标题不能为空！"
        } else if (content == "") {
            errMsg = "内容不能为空！"
        } else if (date == "") {
            errMsg = "日期不能为空！"
        } else if (summary == "") {
            errMsg = "摘要不能为空！"
        } else if (source == "") {
            errMsg = "来源不能为空！"
        };
        if (errMsg != "") {
            $(".err-message").show().text(errMsg)
            return false;
        }
        thisBtn.attr("disabled", true);
        $.ajax({
            url: "http://localhost:8088/api/newsAdd",
            type: 'GET',
            dataType: "json",
            data: {
                title: title,
                content: content,
                date: date,
                summary: summary,
                source: source,
            },
            success(res) {
                if (res.resCode == 1) {
                    var dialog2 = new Dialog({
                        maskOpacity: "0.6",
                        closeBtn: true,
                        type: "note",
                        header: " ",
                        message: "添加成功！",
                        buttons: [{
                            type: "netColor",
                            text: "确认"
                        }],
                        effect: true,
                        maskClick: true,
                        delay: null
                    });
                    thisBtn.attr("disabled", false);
                    $("#title").val("");
                    $("#content").val("");
                    $("#postDate").val("");
                    $("#summary").val("");
                    $("#source").val("");
                    $(".addMsk").hide();
                    getList();
                }
            },
            fail(err) {
                console.log(err)
            }

        })
    })
    /* 编辑新闻 */
    $("tbody").on("click", ".modifyBtn", function () {
        var newsId = $(this).parents("tr").attr("data-id");
        $(".editorMsk").show();
        $.ajax({
            url: `http://localhost:8088/api/getIDNews?ID=${newsId}`,
            type: 'GET',
            dataType: "json",
            success(res) {
                if (res.resCode == 1) {
                    var title = res.data.data[0].title;
                    var content = res.data.data[0].content;
                    var date = moment(res.data.data[0].date * 1000).format("YYYY-MM-DD");
                    var summary = res.data.data[0].summary;
                    var source = res.data.data[0].source;
                    $("#title1").val(title);
                    $("#content1").val(content);
                    $("#postDate1").val(date);
                    $("#summary1").val(summary);
                    $("#source1").val(source);
                } else {
                    alert(res.data.msg);
                }
            },
            fail(err) {
                alert(err);
            }
        });
        $(".editorMsk .dialogConfirmBtn").click(function () {
            thisBtn = $(this);
            var title = $("#title1").val();
            var content = $("#content1").val();
            var date = $("#postDate1").val();
            var summary = $("#summary1").val();
            var source = $("#source1").val();
            var errMsg = "";
            if (title == "") {
                errMsg = "标题不能为空！"
            } else if (content == "") {
                errMsg = "内容不能为空！"
            } else if (date == "") {
                errMsg = "日期不能为空！"
            } else if (summary == "") {
                errMsg = "摘要不能为空！"
            } else if (source == "") {
                errMsg = "来源不能为空！"
            };
            if (errMsg != "") {
                $(".err-message").show().text(errMsg)
                return false;
            }
            thisBtn.attr("disabled", true);
            $.ajax({
                url: `http://localhost:8088/api/newsEdit?ID=${newsId}`,
                type: 'GET',
                dataType: "json",
                data: {
                    title: title,
                    content: content,
                    date: date,
                    summary: summary,
                    source: source,
                },
                success(res) {
                    if (res.resCode == 1) {
                        var dialog1 = new Dialog({
                            maskOpacity: "0.6",
                            closeBtn: true,
                            type: "note",
                            header: " ",
                            message: res.data.msg,
                            buttons: [{
                                type: "netColor",
                                text: "确认",
                                callBack: () => {
                                    getList();
                                }
                            }],
                            effect: true,
                            maskClick: true,
                            delay: null
                        });
                        $(".editorMsk").hide();
                        thisBtn.attr("disabled", false);
                        $("#title1").val("");
                        $("#content1").val("");
                        $("#postDate1").val("");
                        $("#summary1").val("");
                        $("#source1").val("");
                    }
                },
                fail(err) {
                    console.log(err)
                }

            })
        })
    });

    /* 删除新闻 */
    $("tbody").on("click", ".cancleBtn", function () {
        var newsId = $(this).parents("tr").attr("data-id");
        var dialog = new Dialog({
            maskOpacity: "0.6",
            closeBtn: true,
            type: "warn",
            header: " ",
            message: "是否删除该条新闻？",
            buttons: [{
                type: "netColor",
                text: "确认",
                callBack: () => {
                    $.ajax({
                        url: `http://localhost:8088/api/newsDel?ID=${newsId}`,
                        type: 'GET',
                        dataType: "json",
                        success(res) {
                            if (res.resCode == 1) {
                                alert(res.data.msg);
                                getList();
                            } else {
                                alert(res.data.msg)
                            }
                        },
                        fail(err) {
                            console.log(err)
                        }

                    })
                }
            }, {
                type: "grey",
                text: "取消"
            }],
            effect: true,
            maskClick: true,
            delay: null
        });

    });

    $('input').focus(function () {
        $(".err-message").hide();
    })


})