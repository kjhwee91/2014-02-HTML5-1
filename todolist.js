// # 첫번째
// 1. 할일에 넣고 엔터를 치면 할일이 추가된다.
// 	- 이벤트를 할당한다.(addEventListener)
// 	- 할일을 추가한다.(appendChild,insertAdjacentHTML)

var ENTER_KEYCODE = 13;

function addToList(e){
	if ( e.keyCode == ENTER_KEYCODE ) {
		var eNewTodo = document.getElementById("new-todo");
		var eTodoList = document.getElementById("todo-list");

		var compiled = _.template(
			"<li><div class = \"view\"><input class=\"toggle\" type=\"checkbox\"><label><%=TODO%></label><button class=\"destroy\"></button></div></li>")
		var result = compiled({TODO:eNewTodo.value});
		eTodoList.insertAdjacentHTML("beforeend", result);
		eNewTodo.value ="";
	}
}

function loadEvent (){
	document.getElementById("new-todo").addEventListener("keydown",addToList);	
}

document.addEventListener("DOMContentLoaded", loadEvent);


/* <html file에 <script type="text/template">로 format 만들어놓고 하려다 실패한 것
	
		var template = document.getElementById("template");
		var templateInnerHTML = template.innerHTML;
		var compiled = _.template(templateInnerHTML);
		console.log(templateInnerHTML);
*/