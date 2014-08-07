//각각의 돔을 생성하고 돔을 반환하는 것
//템플릿 라이브러리를 활용해서 개선하기
//템플릿을 추가해서 로직을 만들기

//둘의 차이를 알아야함
//window.addEventListener("load", fp);
// document.addEventListener("DOMContentLoaded", function(){
// 	//# keydown 이벤트에 li를 추가하는 함수를 등록한다.	
// 	document.getElementById("new-todo").addEventListener("keydown", addTODO);
// });


//3주차 실습중
//페이지가 로딩 됐을때 get으로 불러옴

var todo = {
	

};


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

	var todoFunc = {
		make : function(todoitem){
			/*
			template id = toDoTemplate
			<li>
				<div class="view">
					<input class="toggle" type="checkbox">
					<label>{{todo}}</label>
					<button class="destroy"></button>
				</div>
			</li>
			*/

			var template = doc.getEId("toDoTemplate").innerHTML;
			var rendered = Mustache.render(template, {todo : todoitem});
			console.log(rendered);
			return rendered;

			// var li = doc.creEle("li");
			// var div = doc.creEle("div");

			// var input = "<input class =\"toggle\" type=\"checkbox\" {}>"
			// var label = "<label>" + todo + "</label>";
			// var button = "<button class=\"destroy\"></button>";
			// var cont = input + label + button;
			// li.appendChild(div);
			// div.insertAdjacentHTML('afterend', cont);
			// return li;
		},

		add : function(e){
			var ENTER_KEY_CODE = 13;
			if (e.keyCode === ENTER_KEY_CODE){
				var newTodoEle = doc.getEId("new-todo");
				var toDoListEle = doc.getEId("todo-list");

				var to_be_done = newTodoEle.value;
				var todoli = this.make(to_be_done);
				toDoListEle.insertAdjacentHTML("afterbegin", todoli);
				newTodoEle.value = "";
			}
		}

	}

 	//document.getElementById("new-todo").addEventListener("keydown", todoFunc.add.bind(todoFunc));
});






