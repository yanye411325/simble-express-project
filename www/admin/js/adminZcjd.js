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
    /* 获取政策解读 数据 */
    getList();

    function getList() {
        $.ajax({
            url: "http://localhost:8088/api/getZcjd",
            type: 'get',
            dataType: "json",
            success(res) {
                if (res.resCode == 1) {
                    var zcjdLists = res.data.zcjdLists;
                    if(zcjdLists.length == 0){
                        $("#empty").addClass("active").siblings(".news-con-wrap table").removeClass("active");
                    }else{
                        $(".news-con-wrap table").addClass("active").siblings("#empty").removeClass("active");
                        var h = [];
                        for (var i = 0; i < zcjdLists.length; i++) {
                            h[h.length] = "<tr data-id = '" + zcjdLists[i].ID + "'><td>" + (i + 1) + "</td><td>" + zcjdLists[i].title + "</td><td class='newsContent'>" + zcjdLists[i].content.substring(0, 26) + "..." + "</td><td>" + zcjdLists[i].tz + "</td><td><button class='modifyBtn'>修改</button><button class='cancleBtn'>删除</button></td>";
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
    /* 添加政策解读 */
    $(".addMsk .dialogConfirmBtn").click(function () {
        thisBtn = $(this);
        var title = $("#title").val();
        var content = $("#content").val();
        var tz = $("#tz").val();
        var errMsg = "";
        if (title == "") {
            errMsg = "标题不能为空！"
        } else if (content == "") {
            errMsg = "内容不能为空！"
        }else if (tz == "") {
            errMsg = "题注不能为空！"
        };
        if (errMsg != "") {
            $(".err-message").show().text(errMsg)
            return false;
        }
        thisBtn.attr("disabled", true);
        $.ajax({
            url: "http://localhost:8088/api/zcjdAdd",
            type: 'GET',
            dataType: "json",
            data: {
                title: title,
                content: content,
                tz: tz,
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
                    $("#tz").val("");
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
            url: `http://localhost:8088/api/getIDZcjd?ID=${newsId}`,
            type: 'GET',
            dataType: "json",
            success(res) {
                if (res.resCode == 1) {
                    var title = res.data.data[0].title;
                    var content = res.data.data[0].content;
                    var tz = res.data.data[0].tz;
                    $("#title1").val(title);
                    $("#content1").val(content);
                    $("#tz").val(tz);
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
            var tz = $("#tz").val();
            var errMsg = "";
            if (title == "") {
                errMsg = "标题不能为空！"
            } else if (content == "") {
                errMsg = "内容不能为空！"
            }  else if (tz == "") {
                tz = "题注不能为空！"
            };
            if (errMsg != "") {
                $(".err-message").show().text(errMsg)
                return false;
            }
            thisBtn.attr("disabled", true);
            $.ajax({
                url: `http://localhost:8088/api/zcjdEdit?ID=${newsId}`,
                type: 'GET',
                dataType: "json",
                data: {
                    title: title,
                    content: content,
                    tz: tz,
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
                        $("#tz").val("");
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
            message: "是否删除该条政策解读？",
            buttons: [{
                type: "netColor",
                text: "确认",
                callBack: () => {
                    $.ajax({
                        url: `http://localhost:8088/api/zcjdDel?ID=${newsId}`,
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