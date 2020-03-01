$(function(){
    
    $("#submit").click(function(){
        var username = $("#username").val();
        var psd = $("#password").val();
        var errMsg = "";
        if(username == ""){
            errMsg = "用户名不能为空！";
        }else if(psd == ""){
            errMsg ="密码不能为空！";
        }
        if(errMsg != ""){
            $(".err-message").show().text(errMsg);
            return false;
        }else{
            $.ajax({
                url:"http://localhost:8088/api/login",
                type:"post",
                dataType:"json",
                data:{
                    "username":username,
                    "psd":psd
                },
                success(data){
                    if(data.resCode == 1){
                        setCookie("user",username);
                        var dialog2 = new Dialog({
                            maskOpacity: "0.6",
                            closeBtn: true,
                            type: "note",
                            header: " ",
                            message: "登录成功！",
                            buttons: [{
                                type: "netColor",
                                text: "确认",
                                callBack:function(){
                                    window.location.href = `http://localhost:8088/admin/adminBanner.html`;
                                }
                            }],
                            effect: true,
                            maskClick: true,
                            delay: null
                        });
                        
                    }else{
                        alert(data.data.msg);
                    };
                },
                fail(err){
                    alert(err)
                }
            });
        }
    });
    $('input').focus(function(){
        $(".err-message").hide();
    })


});