$(document).ready(function(){
	$.ajax({
		type : "GET",
		url : "http://192.168.30.218:8086/yiye/rest/article/findAll",
		xhrFields:{
            withCredentials:true
        },
        crossDomain:true,
		success : function(result) {
			 console.log(result)
		},
		error : function(data) {
			  console.log(data)
		}
	})
})