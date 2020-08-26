$(function () {
    $("#username").text(getCookie("user"));
    $("#addBtn").click(function (event) {
        $(".addMak").show();
    });
    hideMask(".common-dialog-mask", ".common-dialog-container", ".dialog-close-btn", "#addCancle");
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
    /* 获取banner 数据 */
    function getBannerList() {
        $.ajax({
            url: "http://localhost:8088/api/getBanner",
            type: 'get',
            dataType: "json",
            success(res) {
                if (res.resCode == 1) {
                    var banners = res && res.data && res.data.banners;
                    console.log(banners)
                    if (banners == 0) {
                        $("#empty").addClass("active").siblings(".banner-con-wrap table").removeClass("active");
                    } else {
                        $(".banner-con-wrap table").addClass("active").siblings("#empty").removeClass("active");
                        var h = [];
                        for (var i = 0; i < banners.length; i++) {
                            h[h.length] = "<tr data-id='" + banners[i].ID + "'><td class='bannerID'>" + (i + 1) + "</td><td>" + banners[i].title + "</td><td><img src='http://localhost:8088/uploads/" + banners[i].src + "'></td><td>" + banners[i].src + "</td><td class='btnWrap'><button class='modifyBtn'>编辑</button><button class='cancleBtn'>删除</button></td></tr>";
                        }
                        $("tbody").html(h.join(""));
                    }

                } else if (res.resCode == 0) {
                    alert(res.data.msg);
                }
            },
            fail(err) {
                alert(err)
            }
        })
    }
    getBannerList();

    /* 新增banner */
    $("#addSubmit").click(function (e) {
        var title = $("#title").val();
        var src = $("#bannerSrc").val();
        var errMsg = "";
        if (title == "") {
            errMsg = "请输入标题！"
        } else if (src == "") {
            errMsg = "请选择要上传的图片"
        }
        if (errMsg != "") {
            alert(errMsg);
            return false;
        };
        e.preventDefault();
        var formData = new FormData($("#addForm")[0]); 
        alert(111)
        alert(JSON.stringify($("#addForm")[0]))
        $.ajax({
            type: "POST",
            url: "http://localhost:8088/api/banner?active=addBanner",
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                if(res.resCode == 1){
                    $(".addMak").hide();
                    var dialog = new Dialog({
                        maskOpacity: "0.6",
                        closeBtn: true,
                        type: "",
                        header: " ",
                        message: "添加成功",
                        buttons: [{
                            type: "netColor",
                            text: "确认",
                            callBack: () => {
                                getBannerList();
                                $("#title").val("");
                                $("#bannerSrc").val("");
                            }
                        }],
                        effect: true,
                        maskClick: true,
                        delay: null
                    });
                }
            },
            fail:function(err){
                console.error(err);
            }
        });

    });
    /* 编辑banner */
    $("tbody").on("click", "tr .btnWrap .modifyBtn", function () {
        var bannersId = $(this).parents("tr").attr("data-id");
        $(".editorMsk").show();
        $.ajax({
            type: "get",
            url:`http://localhost:8088/api/getIDbanners?ID=${bannersId}`,
            dataType: "json",
            success: function (res) {
               $("#title1").val(res.data.data[0].title);
               $("#editorForm").attr("data-id",bannersId);
            },
            fail:function(err){
                console.error("err")
            }
        });
    
    });

    $("#editorSubmit").click(function(e){
        var bannersId = $(this).parents("#editorForm").attr("data-id");
        var title1 = $("#title1").val();
        var src1 = $("#bannerSrc1").val();
        var errMsg = "";
        if (title1 == "") {
            errMsg = "请输入标题！"
        } else if (src1 == "") {
            errMsg = "请选择要上传的图片"
        }
        if (errMsg != "") {
            alert(errMsg);
            return false;
        };
        e.preventDefault();
        var formData = new FormData($("#editorForm")[0]); 
        $.ajax({
            type: "POST",
            url: `http://localhost:8088/api/banner?active=editBanner&ID=${bannersId}`,
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                if(res.resCode == 1){
                    $(".editorMsk").hide();
                    var dialog = new Dialog({
                        maskOpacity: "0.6",
                        closeBtn: true,
                        type: "",
                        header: " ",
                        message: "编辑成功",
                        buttons: [{
                            type: "netColor",
                            text: "确认",
                            callBack: () => {
                                getBannerList();
                                $("#title1").val("");
                                $("#bannerSrc1").val("");
                            }
                        }],
                        effect: true,
                        maskClick: true,
                        delay: null
                    });
                }
            },
            fail:function(err){
                console.error(err);
            }
        });
    });
    $('#editorCancle').click(function(){
        $(this).parents(".editorMsk").hide();
    })
    /* 删除banner */
    $("tbody").on("click", "tr .btnWrap .cancleBtn", function () {
        var bannerID = $(this).parents("tr").attr("data-id");
        var dialog = new Dialog({
            maskOpacity: "0.6",
            closeBtn: true,
            type: "warn",
            header: " ",
            message: "是否删除该条banner？",
            buttons: [{
                type: "netColor",
                text: "确认",
                callBack: () => {
                    $.ajax({
                        url: `http://localhost:8088/api/bannerDel?ID=${bannerID}`,
                        type: 'GET',
                        dataType: "json",
                        success(res) {
                            if (res.resCode == 1) {
                                alert(res.data.msg);
                                getBannerList();
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
});