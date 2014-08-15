

var TodoSync = {
	init : function(){
		this.networkListener.bind(this)();
		window.addEventListener("online", this.networkListener.bind(this));
		window.addEventListener("offline", this.networkListener.bind(this));
	},
 
	networkListener : function(){
		var on = $0.is.Online();
		var clsState = on?"remove":"add";
		$0.D.getEId("header").classList[clsState]("offline");		
		if(on) this.localDataToRemoteServer.service(this);
	},

	localDataToRemoteServer : {
		actionList : {
			completed : "ChangeCompleteState",
			destroyed : "DestroyTodo"
		},

		service : function(that){
			if(localStorage.length != 0){
				console.log("localStorage 데이터를 원격 저장소로 옮기기");
				for(var dataKey in localStorage){
					var valueObj = $0.to.JSN(localStorage[dataKey]);
					var objOriginPos = $0.is.localData(dataKey)?"local":"remote";
					this[objOriginPos+"RootedData"].bind(that)(dataKey,valueObj,this.actionList);
				}
			}
		},

		localRootedData : function(dataKey, localSavedData, actionList){
			var params = {
				todo : localSavedData.todo,
				callback : function(respObj, originTodo){
					var localData = $0.to.JSN(localStorage[dataKey]);
					localData.insertId = respObj.insertId;
					localStorage.setItem(dataKey, $0.to.STR(localData));
					for(var action in localData){
						if($0.is.Undef(actionList[action])){
							var actionFunc = actionList[action];
							this["Remote"][actionFunc].bind(this.support)({
								key : localData.insertId,
								callback : function(){
									delete localStorage[dataKey];
								},
								completed : localData.completed,
 							});
						};
					}
					var changeDataKey = (function(){
						var list = $0.D.getEId("todo-list");
						var localSavedDatas = $0.D.getECN("localSaved");
						for (var i=0 ; localSavedDatas.length ; i++){
							var data = localSavedDatas[i];
							var locDataKey = data.getAttribute("data-key");
							if(locDataKey === dataKey){
								data.setAttribute("data-key", localData.insertId);
								data.classList.remove("localSaved");
								break;
							}
						}
					})();
				}.bind(this)
			};
			this.Remote.AddTodo.bind(this.support,params)();
		},

		remoteRootedData : function(dataKey, editedData, actionList){
			for(var item in editedData){
				var obj = {
					key : dataKey, 
					callback : function(){},
					completed : item==="completed"?editedData[item]:""
				};
				var func = actionList[item];
				this["Remote"][func].bind(this.support,obj)();
				delete localStorage[dataKey];
			}
		}
	},

	support : {
		dispatcher : function(params){
			var notOnline =  !($0.is.Online());
			var notStoraging = !($0.is.Storaging());
			var func = $0.is.Online()?"Remote":"Local";
			if (notOnline && notStoraging){
				alert("저장을 할 수 없습니다.");
			} else {
				var actionObj = this[func];
				actionObj[params.action].bind(this.support,params)();
			}
		},

		setRemoteParam : function(pMethod, pCallback, pKey, pSend){
			var obj = {
				method : pMethod,
				callback : pCallback,
				key : pKey,
				send : pSend
			}
			return obj;
		},

		remoteService : function(remoteParam, originTodo){
			console.log("통신 시작(" + $0.to.STR(remoteParam) + ")");
			var _ = remoteParam;
			var URL = "http://ui.nhnnext.org:3333/kjhwee91";
			var xhr = new XMLHttpRequest();
			xhr.open( _.method, URL + _.key , true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
			xhr.addEventListener("load", function(){
				var respObj = $0.to.JSN(xhr.responseText);
				_.callback(respObj, originTodo);
				console.log("통신 성공");
			});
			xhr.send(_.send);
		}
	},

	Remote : {
		DestroyTodo : function(originParam){
			var remoteParam = this.setRemoteParam(
				"DELETE", originParam.callback, "/"+originParam.key, "");
			this.remoteService(remoteParam);
		},

		GetTodoList : function(callback){
			var remoteParam = this.setRemoteParam(
				"GET", callback, "", "");
			this.remoteService(remoteParam);
		},

		ChangeCompleteState : function(originParam){
			var remoteParam = this.setRemoteParam(
				"POST", originParam.callback, "/"+originParam.key, "completed=" + originParam.completed);
			this.remoteService(remoteParam);
		},

		AddTodo : function(originParam){
			var remoteParam = this.setRemoteParam(
				"PUT", originParam.callback, "", "todo="+originParam.todo);
			this.remoteService(remoteParam, originParam.todo);
		}
	},

	Local : {
		DestroyTodo : function(params){
			var notLocalData = !$0.is.LocalData(params.key);
			if(notLocalData){
				localStorage.setItem(params.key,"{}");
			}

			var dataInLocal = $0.to.JSN(localStorage.getItem(params.key));
			dataInLocal.destroyed = 1;
			var modifiedData = $0.to.STR(dataInLocal);
			localStorage.setItem(params.key, modifiedData);
			params.callback();
		},

		ChangeCompleteState : function(params){
			var notLocalData = !$0.is.LocalData(params.key);
			if(notLocalData){
				localStorage.setItem(params.key,"{}");
			}

			var dataInLocal = $0.to.JSN(localStorage.getItem(params.key));
			dataInLocal.completed = params.completed;
			var modifiedData = $0.to.STR(dataInLocal);
			localStorage.setItem(params.key, modifiedData);
			params.callback();
		},

		AddTodo : function(params){
			var value = localStorage.length + 1;
			var locId = "loc" + value;
			var toSaveData = {todo : params.todo, completed : 0};
			localStorage.setItem(locId, $0.to.STR(toSaveData));
			params.callback({
				insertId : locId,
				needClass : "localSaved"
			}, params.todo);
		}
	},
}

var Todo = {
	init : function(){
		document.addEventListener("DOMContentLoaded", function(){
			$0.D.getEId("new-todo").addEventListener("keydown", this.addTodo.bind(this));
			$0.D.getEId("filters").addEventListener("click", this.filterTodoList.bind(this));
			window.addEventListener("popstate", this.filterTodoListByURL.bind(this));
		}.bind(this));
		TodoSync.Remote.GetTodoList.bind(TodoSync.support, this.showInitPage.bind(this))();
	},

	showInitPage : function(initParam){
		var todoListWrap = $0.D.getEId("todo-list");
		var fullList = "";
		for(var i in initParam){
			var completedCheck = initParam[i].completed?"completed":"";
			var todoObj = {
				todo : initParam[i].todo,
				id : initParam[i].id, 
				needClass : completedCheck,
				checked : initParam[i].completed?"checked":""
			};
			var list = this.makeTodoDom(todoObj);
			fullList = fullList + list;
		}
		todoListWrap.insertAdjacentHTML("beforeend", fullList);
		for(var i in todoListWrap.children){
			var list = todoListWrap.children[i];
			var isDom = typeof list.tagName != "undefined" && list.tagName.toLowerCase() === "li";
			if(isDom){
				list.style.opacity = 1;
				this.setNewTodoEvent(list);
			}
		}
	},

	makeTodoDom : function(todoObj){
		var template = $0.D.getEId("todoTemplate").innerHTML;
		var rendered = Mustache.render(template, {
			todo : todoObj.todo, 
			key : todoObj.id,
			needClass : todoObj.needClass,
			checked : todoObj.checked
		});
		return rendered;
	},

	addTodo : function(e){
		var ENTER_KEY_CODE = 13;
		if (e.keyCode === ENTER_KEY_CODE){
			var newTodoEle = $0.D.getEId("new-todo");
			var newTodo = newTodoEle.value;
			TodoSync.support.dispatcher.bind(TodoSync,{
				action : "AddTodo", 
				todo : newTodo, 
				callback : this.addTodoDom.bind(this)
			})();
			newTodoEle.value = "";
		}
	},

	replaceDataKey : function(respText){
		console.log(respText);
	},

	addTodoDom : function(params, originTodo){
		var toDoListEle = $0.D.getEId("todo-list");
		var toDoLi = this.makeTodoDom({
			todo : originTodo, 
			id : params.insertId, 
			needClass : params.needClass
		});
		toDoListEle.insertAdjacentHTML("afterbegin", toDoLi);
		this.setNewTodoEvent(toDoListEle.children[0]);
	},

	destroyTodo : function(e){
		var button = e.target;
		var li = button.parentNode.parentNode;

		TodoSync.support.dispatcher.bind(TodoSync,{
			action : "DestroyTodo", 
			key : li.dataset.key,
			callback : function(){
				li.addEventListener('webkitTransitionEnd', function(e){
					if (this.parentNode != null){
						this.parentNode.removeChild(this);
					}
				}, false);
				li.style.opacity = "0";
			}
		})();
	},

	completeTodo : function(e){
		var button = e.target;
		var li = button.parentNode.parentNode;
		var bChecked = button.checked?1:0;

		TodoSync.support.dispatcher.bind(TodoSync,{
			action : "ChangeCompleteState",
			key : li.dataset.key,
			completed : bChecked,
			callback : function(){
				var clsAction = bChecked===1?"add":"remove";
				li.classList[clsAction]("completed");
			}
		})();
	},

	setNewTodoEvent : function(newTodo){
		newTodo.style.opacity = "1";
		newTodo.addEventListener('click',function(e){
			this.buttonEvent(e, newTodo);
			}.bind(this), false);
	},

	buttonEvent : function(e, newTodo){
		var completeBtn = $0.D.getECN("toggle", newTodo)[0];
		var destoryBtn = $0.D.getECN("destroy", newTodo)[0];
		if($0.is.Target(e.target, completeBtn)){
			this.completeTodo(e);
		} else if($0.is.Target(e.target, destoryBtn)){
			this.destroyTodo(e);
		}
	},
	
	// 하단의 필터링
	filterTodoListByURL : function(e){
		if(e.state){
			var method = e.state.method;
			var func = "filtered" + method[0].toUpperCase() + method.substring(1);
			this[func]();
		} else {
			this.filteredAll();
		}
	},

	filterTodoList : function(e){
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
		$0.D.getEId("todo-list").className = "";
		this.changeSelectedFilter(0);
	},

	filteredActive : function(){
		$0.D.getEId("todo-list").className = "all-active";
		this.changeSelectedFilter(1);
	},

	filteredCompleted : function(){
		$0.D.getEId("todo-list").className = "all-completed";
		this.changeSelectedFilter(2);
	},

	changeSelectedFilter : function(targetIndex){
		var naviBar = $0.D.getEId("filters");
		var btns = $0.D.getETN("a", naviBar);
		for (var i=0 ; i<btns.length ; i++){
			btns[i].className = "";
		}
		btns[targetIndex].className = "selected";
	}
};
