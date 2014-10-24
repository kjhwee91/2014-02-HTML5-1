document.addEventListener("DOMContentLoaded", function(){
	var doc = {
		creEle : function(item){
			return document.createElement(item);
		},

		getEId : function(id){
			return document.getElementById(id);
		}
	}

	function makeTodoDom(todoitem){
		var template = doc.getEId("toDoTemplate").innerHTML;
		var rendered = Mustache.render(template, {todo : todoitem});
		return rendered;
	}

	function addTodo(e){
		var ENTER_KEY_CODE = 13;
		if (e.keyCode === ENTER_KEY_CODE){
			var newTodoEle = doc.getEId("new-todo");
			var toDoListEle = doc.getEId("todo-list");

			var to_be_done = newTodoEle.value;
			var todoli = makeTodoDom(to_be_done);
			toDoListEle.insertAdjacentHTML("afterbegin", todoli);
			newTodoEle.value = "";
		}
	}

 	document.getElementById("new-todo").addEventListener("keydown", addTodo);
 });