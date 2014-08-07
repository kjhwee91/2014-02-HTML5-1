//3주차 실습중
//detach 하기
//4주차 실습중

/*
	변수 선언 규칙
	전역 변수 : ValueItem
	상수 변수 : VALUE_ITEM
	나머지 : valueItem
*/

var Doc = {
	creEle : function(item){
		return document.createElement(item);
	},

	getEId : function(id){
		return document.getElementById(id);
	},

	getECN : function(className, eDocument){
		if (eDocument === null){
			return document.getElementsByClassName(className);
		} else {
			return eDocument.getElementsByClassName(className);
		}
	}
};

var TodoSync = {
	setParam : function(pMethod, pCallback, pKey, pSend){
		var obj = {
			method : pMethod,
			callback : pCallback,
			key : pKey,
			send : pSend
		}
		return obj;
	},

	sGet : function(callback){
		var obj = this.setParam("GET", callback, "", "");
		this.xhrService(obj);
	},

	sAdd : function(todo, callback){
		var obj = this.setParam("PUT", callback, "", "todo="+todo);
		this.xhrService(obj);
	},

	sComplete : function(param, callback){
		var obj = this.setParam("POST", callback, "/"+param.key, "completed=" + param.completed);
		this.xhrService(obj);
	},

	sDestroy : function(param, callback){
		var obj = this.setParam("DELETE", callback, "/"+param.key, "");
		this.xhrService(obj);
	},

	xhrService : function(_){
		var URL = "http://ui.nhnnext.org:3333/kjhwee91";
		var xhr = new XMLHttpRequest();
		xhr.open( _.method, URL + _.key , true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		xhr.addEventListener("load", function(){
			_.callback(JSON.parse(xhr.responseText));
		});
		xhr.send(_.send);
	}

	// xhrService : function(method, callbackFunc ,key, send){
	// 	var xhr = new XMLHttpRequest();
	// 	xhr.open(method , "http://ui.nhnnext.org:3333/kjhwee91" + key , true);
	// 	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	// 	xhr.addEventListener("load", function(){
	// 		callbackFunc(JSON.parse(xhr.responseText));
	// 	});
	// 	xhr.send(send);
	// }
}

var Todo = {
	init : function(){
		document.addEventListener("DOMContentLoaded", function(){
			Doc.getEId("new-todo").addEventListener("keydown", this.addTodo.bind(this));
		}.bind(this));
		TodoSync.sGet(this.showInitList.bind(this));
	},

	showInitList : function(initParam){
		var toDoListEle = Doc.getEId("todo-list");

		for(var i=0 ; i<initParam.length ; i++){

			var todoObj = {
				todo : initParam[i].todo,
				id : initParam[i].id, 
				completed : initParam[i].completed?"completed":"",
				checked : initParam[i].completed?"checked":""
			};
			
			var toDoLi = this.makeTodoDom(todoObj);
			toDoListEle.insertAdjacentHTML("beforeend", toDoLi);
			toDoListEle.lastElementChild.style.opacity = 1;
			this.setNewTodoEvent(toDoListEle.lastElementChild);
		}
	},

	makeTodoDom : function(todoObj){
		var template = Doc.getEId("toDoTemplate").innerHTML;
		var rendered = Mustache.render(template, {
			todo : todoObj.todo, 
			key : todoObj.id,
			completed : todoObj.completed,
			checked : todoObj.checked
		});
		return rendered;
	},

	addTodo : function(e){
		var ENTER_KEY_CODE = 13;
		if (e.keyCode === ENTER_KEY_CODE){
			var newTodoEle = Doc.getEId("new-todo");
			var toDoListEle = Doc.getEId("todo-list");
			var toBeDone = newTodoEle.value;

			TodoSync.sAdd(toBeDone, function(json){
				var toDoLi = this.makeTodoDom({todo : toBeDone, id : json.insertId});
				toDoListEle.insertAdjacentHTML("afterbegin", toDoLi);
				newTodoEle.value = "";
				this.setNewTodoEvent(toDoListEle.children[0]);
			}.bind(this)); // 비동기로 실행
		}
	},

	destroyToDo : function(e){
		var button = e.target;
		var li = button.parentNode.parentNode;

		TodoSync.sDestroy({
			"key" : li.dataset.key
		}, function(json){
			li.addEventListener('webkitTransitionEnd', function(e){
				//detatch 하기 --- ????????????????????? ㅜㅜ 모르겠으엉
				this.parentNode.removeChild(this);
			}, false);
			li.style.opacity = "0";
			// li.removeEventListener('click', function(e){
			// 	this.buttonEvent(e, newTodo)
			// }.bind(this), false);
		}.bind(this));
	},

	completeToDo : function(e){
		var button = e.target;
		var li = button.parentNode.parentNode;
		var bChecked = button.checked?"1":"0";
		TodoSync.sComplete({
			"key" : li.dataset.key,
			"completed" : bChecked
		}, function(json){
			var cn = bChecked==="1"?"completed":"";
			li.className = cn;
		});
	},

	setNewTodoEvent : function(newTodo){
		newTodo.style.opacity = "1";
		newTodo.addEventListener('click',function(e){
			this.buttonEvent(e, newTodo);
			// var completeBtn = Doc.getECN("toggle", newTodo)[0];
			// var destoryBtn = Doc.getECN("destroy", newTodo)[0];
			// if(this.connectTaget(e.target, completeBtn)){
			// 	this.completeToDo(e);
			// } else if(this.connectTaget(e.target, destoryBtn)){
			// 	this.destroyToDo(e);
			// }
		}.bind(this), false);
	},

	buttonEvent : function(e, newTodo){
		var completeBtn = Doc.getECN("toggle", newTodo)[0];
		var destoryBtn = Doc.getECN("destroy", newTodo)[0];
		if(this.connectTaget(e.target, completeBtn)){
			this.completeToDo(e);
		} else if(this.connectTaget(e.target, destoryBtn)){
			this.destroyToDo(e);
		}
	},

	connectTaget : function(clicked, target){
		return clicked === target?true:false;
		// if (clicked === target){
		// 	return true;
		// } else {
		// 	return false;
		// }
	}
};

Todo.init();


// document.addEventListener("DOMContentLoaded", function(){
// 	doc.getEId("new-todo").addEventListener("keydown", TODO.addTodo.bind(TODO));
	/*
		변수 선언 규칙
		인자로 받아온 변수 : valueitem
		상수 변수 : VALUE_ITEM
		함수 내에서 선언한 변수 : valueItem
	*/

	// 템플릿을 이용해서 DOM 구조 만들기
	// function makeTodoDom(todo_item){
	// 	var template = doc.getEId("toDoTemplate").innerHTML;
	// 	var rendered = Mustache.render(template, {todo : todo_item});
	// 	return rendered;
	// }

	// function addTodo(e){
	// 	var ENTER_KEY_CODE = 13;
	// 	if (e.keyCode === ENTER_KEY_CODE){
	// 		var newTodoEle = doc.getEId("new-todo");
	// 		var toDoListEle = doc.getEId("todo-list");

	// 		var toBeDone = newTodoEle.value;
	// 		var toDoLi = makeTodoDom(toBeDone);

	// 		toDoListEle.insertAdjacentHTML("afterbegin", toDoLi);
	// 		newTodoEle.value = "";
	// 		setNewToDoListEvent(toDoListEle.children[0]);
	// 	}
	// }

	// function setNewToDoListEvent(new_todo){
	// 	new_todo.style.opacity = "1";
	// 	setButtonEvent(new_todo);
	// 	// newtodo.style.opacity = "0";
	// 	// newtodo.style.webkitTransition = "opacity 3s";
	// 	// newtodo.style.mozTransition = "opacity 3s";
	// 	// newtodo.style.transition = "opacity 3s";
	// 	// var i = 1;
	// 	// var key = setInterval(function(){
	// 	// 	if (i == 40){
	// 	// 		clearInterval(key);
	// 	// 		newtodo.style.opacity = 1;
	// 	// 	} else {
	// 	// 		newtodo.style.opacity = i*0.05;		
	// 	// 	}
	// 	// 	i++;
	// 	// }, 16);
	// }

	// function setButtonEvent(todo_list){
	// 	//console.log(todo_list_Ele.parentNode);
	// 	//event delegate 적용
	// 	var todoParent = todo_list.parentNode;
	// 	todoParent.addEventListener('click', function(e){
	// 		var comp_button = this.getElementsByClassName("toggle")[0];
	// 		var destroy_button = this.getElementsByClassName("destroy")[0];
	// 		if(connectTaget(e.target, comp_button)){
	// 			completeToDo(e);
	// 		} else if(connectTaget(e.target, destroy_button)){
	// 			destroyToDo(e);
	// 		}
	// 	}.bind(todo_list));
	// 	/*
	// 	var comp_button = toDoListEle.getElementsByClassName("toggle")[0];
	// 	comp_button.addEventListener("click", completeToDo, false);

	// 	var destroy_button = toDoListEle.getElementsByClassName("destroy")[0];
	// 	destroy_button.addEventListener("click", destroyToDo);
	// 	*/
	// 	//detatch 하고 싶을 때는 completeToDo, destroyToDo의 메소드 레퍼런스를 알아야함
	// 	//개선하기 위해서 event delegeate 기법을 활용하여 개선 => 수업시간에할 것
	// }

	// function connectTaget(clicked, target){
	// 	if (clicked === target){
	// 		console.log(clicked, target);
	// 		return true;
	// 	} else {
	// 		return false;
	// 	}
	// }

	// function destroyToDo(e){
	// 	//e.currentTarget???
	// 	var button = e.target;
	// 	var li = button.parentNode.parentNode;
	// 	//setInterval => 시간마다
	// 	//requestAnimationFrame => 프레임이 업데이트 될 때
	// 	// var i = 0;
	// 	// var key = setInterval(function(){
	// 	// 	if (i == 40){
	// 	// 		clearInterval(key);
	// 	// 		li.parentNode.removeChild(li);
	// 	// 	} else {
	// 	// 		li.style.opacity = 1 - i*0.05;		
	// 	// 	}
	// 	// 	i++;
	// 	// }, 16);

	// 	//동기 layout , 비동기 layout
	// 	li.addEventListener('webkitTransitionEnd', function(){
	// 		this.parentNode.removeChild(this);
	// 	}, false);

	// 	// li.style.webkitTransition = "opacity 0.4s";
	// 	// li.style.mozTransition = "opacity 0.4s";
	// 	// li.style.transition = "opacity 0.4s";
		
	// 	li.style.opacity = "0";
	// }

	// function completeToDo(e){
	// 	var button = e.target;
	// 	var li = button.parentNode.parentNode;

	// 	if (button.checked){
	// 		li.className = "completed";
	// 	} else {
	// 		li.className = "";
	// 	}
	// }

// });
