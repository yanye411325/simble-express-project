function setCookie(c_name, value) {
    document.cookie = c_name + "=" + value + "; path=/;";
}
// 读取cookies
function getCookie(name) {	
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
    return unescape(arr[2]);
    else
    return null;
}

function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
    document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}
function clearCookie(){ 
    var keys=document.cookie.match(/[^ =;]+(?=\=)/g); 
    if (keys) { 
    for (var i = keys.length; i--;) 
        document.cookie=keys[i]+'=0;expires=' + new Date( 0).toUTCString() 
    } 
}

function cutString(el){
    var el = $(el);
    var text = $(el).text();
    for(var i = 0; i < text.length; i++){
        if(i>16){
            el.text(text.substring(0,16) + "...")
        }
    }
}
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
    return unescape(r[2]);
    return null;
}



function Dialog(config){
    var _this_ = this;
    this.config = {
        maskOpacity:"0.7",
        closeBtn:false,
        type:"waitting",
        /*如果为空配成空格*/
        header:" ",
        message:"加载中 , 请稍候......",
        buttons: [{
            type: "netColor",
            text: "确认",
            callBack: null
        }, {
            type: "grey",
            text: "取消",
            callBack: null
        }],
        effect:true,
        maskClick:true,
        delay:5000
    };

    if(config && $.isPlainObject(config)){
        $.extend(this.config,config);
    }else{
        this.isConfig = true;
    }

    this.body = $('body');
    this.mask = $('<div class="dialog-mask">');
    this.container = $('<div class="dialog-container">');
    this.closeBtn = $('<div class="dialog-closeBtn">');
    this.maskType = $('<div class="dialog-type">');
    this.header = $('<div class="dialog-header">');
    this.content = $('<div class="dialog-content">');
    this.footer = $('<div class="dialog-footer">');
    this.creat();
    this.animateFun();

}

Dialog.prototype = {

    animateFun: function() {
        var _this_ = this
        this.container.css({
            '-webkit-transform': 'scale(0,0)',
            '-moz-transform': 'scale(0,0)',
            'transform': 'scale(0,0)'
        });
        window.setTimeout(function() {
            _this_.container.css({
                '-webkit-transform': 'scale(1,1)',
                '-moz-transform': 'scale(1,1)',
                'transform': 'scale(1,1)'
            });
        }, 100)
    },
    creat:function(){
        var _this_ = this,
            config = this.config,
            body = this.body,
            mask = this.mask,
            container = this.container,
            closeBtn = this.closeBtn,
            maskType = this.maskType,
            header = this.header,
            content = this.content,
            footer = this.footer;
            if(this.isConfig){
                container.append(maskType.addClass(config.type));
                /*加载中，改变图标margin-top*/
                maskType.css('marginTop', '50px');
                content.css('marginTop', '60px');
                container.append(content.text(config.message));

                mask.append(container);
                body.append(mask);

                if(config.delay != null){
                    setTimeout(function(){
                        _this_.close();
                    },config.delay);
                }

            }else{
                if(config != ""){
                    mask.css('backgroundColor', 'rgba(51,51,51,'+ config.maskOpacity +')');
                }
                if(config.closeBtn == true){
                    container.append(closeBtn);
                    closeBtn.click(function(event) {
                        _this_.close();
                    });
                }else{
                    closeBtn.remove();
                }

                if(config.type != "waitting"){
                    container.append(maskType.addClass(config.type));
                }else{
                    maskType.remove();
                }
                if (config.type == "") {
                    maskType.remove();
                }
                if(config.header){
                  container.append(header.text(config.header));
                }
                if(config.message != ""){
                  container.append(content.text(config.message));
                }else{
                    content.remove();
                }
                if(config.buttons){
                    _this_.creatButton(footer,config.buttons);
                    container.append(footer);
                }

                /*点击mask效果隐藏mask*/
                if(config.maskClick){
                    mask.click(function(event) {
                        _this_.close();
                    });
                    /*点击container 不隐藏mask*/
                    container.click(function(event) {
                        event.stopPropagation();
                    });
                }
                /*加载中延迟 弹框隐藏*/
                if(config.delay != null){
                    setTimeout(function(){
                        _this_.close();
                    },config.delay);
                }
                if(config.effect){
                    _this_.animateFun();
                }
                mask.append(container);
                body.append(mask);

            }

    },
    /*创建按钮*/
    creatButton:function(footer,buttons){
        var _this_ = this;

        $(buttons).each(function(i) {
            var buttonType = this.type ? this.type : "",
                buttonText = this.text ? this.text : "",
                callBack = this.callBack ? this.callBack : "";
            var button = $('<button class="' + buttonType + '">' + buttonText + '</button>');
            if (callBack) {
                button.click(function(event) {
                    callBack();
                    _this_.close();
                });
            } else {
                button.click(function(event) {
                    _this_.close();
                });
            }
            footer.append(button);
        });

    },

    close: function() {
        var _this_ = this,
        mask = this.mask;
        mask.remove();
    }

}
