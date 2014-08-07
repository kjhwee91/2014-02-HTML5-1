//3주차 실습중
//detach 하기
//4주차 실습중
// 온라인 오프라인 이벤트 추가하기
// -- 온라인 오프라인 이벤트를 할당을 하고
// -- 오프라인 일 때 헤더 엘리먼트에 오프라인 클래스를 추가하고
// -- 온라인 일 때 헤더 엘리먼트에 오프라인 클래스를 삭제한다
// 히스토리 객체 관리하기
// 
// #todo-list 엘리먼트에 active(completed) 엘리먼트를 누르면
// 1) todo-list에 all-active(completed) 클래스를 추가하고
// 2) 기존 anchor 에 selected클래스를 삭제하고 
// 3) anchor selected  zmffotmfmf 추가한다
// 

// 동적으로 UI를 변경후 히스토리 추가 (history.pushState({"method" : "completed"}, null, active));

// 뒤로가기 할 때 이벤트를 받아서 변경
//  window.addEventListener("popstate", callback);

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
		var pre = typeof eDocument==="undefined"?document:eDocument;
		return pre.getElementsByClassName(className);
	},

	getETN : function(tagName, eDocument){
		if (eDocument === null){
			return document.getElementsByTagName(tagName);
		} else {
			return eDocument.getElementsByTagName(tagName);
		}
	}
};

var TodoSync = {
	init : function(){
		window.addEventListener("online", this.networkListener);
		window.addEventListener("offline", this.networkListener);
	},

	networkListener : function(){
		// if(navigator.onLine){
		// 	Doc.getEId("header").classList.remove("offline");
		// } else {
		// 	Doc.getEId("header").classList.add("offline");
		// }
		// a.some() == a["some"]()

		var isOnLine = navigator.onLine?"remove":"add";
		Doc.getEId("header").classList[isOnLine]("offline");

		if(isOnLine){
			// 서버에 싱크 맞추기
		}
	},

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

		if (navigator.onLine){
			// ajax 통신
		} else {
			// data를 클라이언트에 저장 -> localstorage, indexDB, websql(최근에는 잘 안씀)
		}

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
			Doc.getEId("filters").addEventListener("click", this.filteredTodoList.bind(this));
			window.addEventListener("popstate", this.filteredTodoListByURL.bind(this));
		}.bind(this));
		TodoSync.sGet(this.showInitList.bind(this));
	},

	filteredTodoListByURL : function(e){
		// 새로고침일 경우는?
		// not found 이기 때문에 서버에서 알맞은  markup 을 뿌려준다 
		if(e.state){
			var method = e.state.method;
			var func = "filtered" + method[0].toUpperCase() + method.substring(1);
			this[func]();
		} else {
			this.filteredAll();
		}
	},

	filteredTodoList : function(e){
		var target = e.target;
		var tagName = target.tagName.toLowerCase();
		if (tagName === "a"){
			var href = target.getAttribute("href");
			if (href === "index.html"){
				this.filteredAll();
				history.pushState({"method" : "all"}, null, "index.html");
			} else if (href === "active"){
				this.filteredActive();
				history.pushState({"method" : "active"}, null, "active");
			} else if (href === "completed"){
				this.filteredCompleted();
				history.pushState({"method" : "completed"}, null, "completed");
			}
		}
		e.preventDefault();
	},

	filteredAll : function(){
		Doc.getEId("todo-list").className = "";
		this.changeSelectedFilter(0);
	},

	filteredActive : function(){
		Doc.getEId("todo-list").className = "all-active";
		this.changeSelectedFilter(1);
	},

	filteredCompleted : function(){
		Doc.getEId("todo-list").className = "all-completed";
		this.changeSelectedFilter(2);
	},

	changeSelectedFilter : function(targetIndex){
		var naviBar = Doc.getEId("filters");
		var btns = Doc.getETN("a", naviBar);
		for (var i=0 ; i<btns.length ; i++){
			btns[i].className = "";
		}
		btns[targetIndex].className = "selected";
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
					// 삭제에 대한 ajax가 끝나면 --> 해당 li를 삭제한다.
					// 		li의 부모노드를 찾는다 (부모노드 = ul)
					//		부모 노드에서 해당 자식노드인 li를 삭제한다.

					// console.log(this.parentNode);
					// console.log(this);
					// 두번째 클릭할 때는 parentNode가 없음 / 그러나 li는 존재함
					// => li는 위에서 선언된 변수
					if (this.parentNode != null){
						this.parentNode.removeChild(this);
					}
					//첫번재로 listener를 호출했을 때는 if 안으로 들어가서 removeChild를 실행함
					//두번째로 listener를 호출했을 때는 this(li)가 삭제된 상태임 => li의 parentNode가 있을수 엄ㅋ슴ㅋ
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
TodoSync.init();


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
