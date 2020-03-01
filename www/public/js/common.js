function commonSearch(){
	var father = $("#search"),
		input = father.find('input'),
		btn = father.find("a"),
		inputVal;

	btn.on("click",function(){
		father.addClass("on");
		inputVal = input.val().replace(/\s+/g, "");
		if ( inputVal != "" ) {
			window.location.href = "law.html?inputVal=" + inputVal;
		}
		//return false;
	});
	$(document).on("click",function(e){
		father.removeClass("on");
	});
	father.on("click",function(e){
		e.stopPropagation();
	})

}

function cutStr(els,num){
			
	for(let i=0; i< $(els).length;i++){
		var el = $(els).eq(i).find("a");
		var text = el.text();
		if(text.length > num){
			el.text(text.substr(0,num) + "...");
		}
	}
	
}
function query(name){
    return location.search.match(new RegExp('(?:\\?|&)' + name + '=(.*?)(?:$|&)', 'i')) ? decodeURIComponent(RegExp.$1) : ''; 
}
$(document).ready(function(){

	commonSearch();

})