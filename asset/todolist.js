
var doc = {
	creEle : function(item){
		return document.createElement(item);
	},

	getEId : function(id){
		return document.getElementById(id);
	},

	getEsCls : function(cls_name){
		return document.getElementsByClassName(cls_name);
	}
}

document.addEventListener("DOMContentLoaded", function(){
	// 템플릿을 이용해서 DOM 구조 만들기
	function makeTodoDom(todo_item){
		var template = doc.getEId("toDoTemplate").innerHTML;
		var rendered = Mustache.render(template, {todo : todo_item});
		return rendered;
	}

	// todo 추가하기
	function addTodo(e){
		var ENTER_KEY_CODE = 13;
		if (e.keyCode === ENTER_KEY_CODE){
			var newTodoEle = doc.getEId("new-todo");
			var toDoListEle = doc.getEId("todo-list");

			var toBeDone = newTodoEle.value;
			var toDoLi = makeTodoDom(toBeDone);

			toDoListEle.insertAdjacentHTML("afterbegin", toDoLi);
			newTodoEle.value = "";
			setNewToDoListEvent(toDoListEle.children[0]);
		}
	}

	// 이벤트 등록하기
	function setNewToDoListEvent(new_todo){
		new_todo.style.opacity = "1";
		setButtonEvent(new_todo);
	}

	//event delegate 적용
	function setButtonEvent(todo_list){
		var parentOfList = todo_list.parentNode;
		parentOfList.addEventListener('click', function(e){

			var comp_button = this.getElementsByClassName("toggle")[0];
			var destroy_button = this.getElementsByClassName("destroy")[0];

			if(connectTaget(e.target, comp_button)){
				completeToDo(e);
			} else if(connectTaget(e.target, destroy_button)){
				destroyToDo(e);
			}

		}.bind(todo_list));
	}

	function connectTaget(clicked, target){
		if (clicked === target){
			return true;
		} else {
			return false;
		}
	}

	function destroyToDo(e){
		debugger;
		var button = e.target;
		var li = button.parentNode.parentNode;
		// 동기 layout , 비동기 layout
		li.addEventListener('webkitTransitionEnd', function(){
			debugger;
			this.parentNode.removeChild(this);
			console.log("delete");
		}, false);
		li.style.opacity = "0.4";
	}

	function completeToDo(e){
		var button = e.target;
		var li = button.parentNode.parentNode;
		if (button.checked){
			li.className = "completed";
		} else {
			li.className = "";
		}
	}

 	doc.getEId("new-todo").addEventListener("keydown", addTodo);
});
