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
		var xObj = this.setParam("GET", callback, "", "");
		this.xhrService(xObj);
	},

	sAdd : function(todo, callback){
		var xObj = this.setParam("PUT", callback, "", "todo="+todo);
		this.xhrService(xObj);
	},

	sComplete : function(param, callback){
		var xObj = this.setParam("POST", callback, "/"+param.key, "completed=" + param.completed);
		this.xhrService(xObj);
	},

	sDestroy : function(param, callback){
		var xObj = this.setParam("DELETE", callback, "/"+param.key, "");
		this.xhrService(xObj);
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
				(this.parentNode != null)?(this.parentNode.removeChild(this)):false;
			}, false);
			li.style.opacity = "0";
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
			var clsName = bChecked === "1"?"completed":"";
			li.className = clsName;
		});
	},

	setNewTodoEvent : function(newTodo){
		newTodo.style.opacity = "1";
		newTodo.addEventListener('click',function(e){
			this.buttonEvent(e, newTodo);
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
	}
};

Todo.init();


