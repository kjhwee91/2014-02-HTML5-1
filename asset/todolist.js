var TodoSync = {
	init : function(){
		this.support.networkListener.bind(this)();
		window.addEventListener("online", this.support.networkListener.bind(this));
		window.addEventListener("offline", this.support.networkListener.bind(this));
	},
 
	localDataToRemoteServer : {
		actionList : {
			completed : "ChangeCompleteState",
			destroyed : "DestroyTodo"
		},

		service : function(that){
			if(localStorage.length != 0){
				if(localStorage["debug"] === "undefined"){
					localStorage.clear();
					return ;
				}
				console.log("localStorage 데이터를 원격 저장소로 옮기기");
				for(var dataKey in localStorage){
					var valueObj = $0.to.JSN(localStorage[dataKey]);
					var objOriginPos = $0.is.localData(dataKey)?"local":"remote";
					this[objOriginPos+"RootedData"].bind(that)(dataKey,valueObj,this.actionList);
				}
			}
		},

		localStorageCtr : function(actionFunc, localData, dataKey){
			this["Remote"][actionFunc].bind(this.support)({
				key : localData.insertId,
				callback : function(){
					delete localStorage[dataKey];
				},
				completed : localData.completed,
			});
		},

		changeDataKey : function(localData, dataKey){
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
		},

		localRootedData : function(dataKey, localSavedData, actionList){
			var localData = $0.to.JSN(localStorage[dataKey]);
			var params = {
				todo : localSavedData.todo,
				callback : function(respObj, originTodo){
					localData.insertId = respObj.insertId;
					localStorage.setItem(dataKey, $0.to.STR(localData));
					var ctr = this.localDataToRemoteServer;
					for(var action in localData){
						var actionFunc = actionList[action];
						if($0.is.Undef(actionFunc))
							ctr.localStorageCtr.bind(this, actionFunc, localData, dataKey)();
					}
					ctr.changeDataKey(localData, dataKey);
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
		networkListener : function(){
			var on = $0.is.Online();
			var clsState = on?"remove":"add";
			$0.D.getEId("header").classList[clsState]("offline");		
			if(on) this.localDataToRemoteServer.service(this);
		},

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
			var _ = remoteParam;
			var URL = "http://ui.nhnnext.org:3333/kjhwee91";
			var xhr = new XMLHttpRequest();
			xhr.open( _.method, URL + _.key , true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
			xhr.addEventListener("load", function(){
				var respObj = $0.to.JSN(xhr.responseText);
				_.callback(respObj, originTodo);
				console.log("conn try : " + $0.to.STR(remoteParam) + " / conn success");
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
			$0.D.getEId("new-todo").addEventListener("keydown", this.tdAction._add.bind(this));
			$0.D.getEId("filters").addEventListener("click", this.filter.service.bind(this.filter));
			window.addEventListener("popstate", this.filter.byURL.bind(this.filter));
		}.bind(this));
		TodoSync.Remote.GetTodoList.bind(TodoSync.support, this.showInitTodo.bind(this))();
	},

	showInitTodo : function(initParam){
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
			var list = this.make.domTemplete(todoObj);
			fullList = fullList + list;
		}
		todoListWrap.insertAdjacentHTML("beforeend", fullList);
		for(var i in todoListWrap.children){
			var list = todoListWrap.children[i];
			var isDom = typeof list.tagName != "undefined" && list.tagName.toLowerCase() === "li";
			if(isDom){
				this.make.setButtonEvents.bind(this, list)();
				this.make.setUIEvnets(list);
			}
		}
	},

	createNew : function(params, originTodo){
		var template = this.make.domTemplete({
			todo : originTodo, 
			id : params.insertId,
			needClass : params.needClass
		});
		var lastInserted = this.make.insertDom(template);
		this.make.setButtonEvents.bind(this,lastInserted)();
		this.make.setUIEvnets(lastInserted);
	},

	tdAction : {
		_add : function(e){
			var ENTER_KEY_CODE = 13;
			if (e.keyCode === ENTER_KEY_CODE){
				var newTodoEle = $0.D.getEId("new-todo");
				var newTodo = newTodoEle.value;
				TodoSync.support.dispatcher.bind(TodoSync,{
					action : "AddTodo", 
					todo : newTodo, 
					callback : this.createNew.bind(this)
				})();
				newTodoEle.value = "";
			}
		},

		_destroy : function(e){
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

		_completed : function(e){
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
		}
	},

	make : {
		insertDom : function(template){
			var toDoListEle = $0.D.getEId("todo-list");
			toDoListEle.insertAdjacentHTML("afterbegin", template);
			return toDoListEle.children[0];
		},

		setButtonEvents : function(newTodo){
			newTodo.addEventListener('click', function(e){
				var completeBtn = $0.D.getECN("toggle", newTodo)[0];
				var destoryBtn = $0.D.getECN("destroy", newTodo)[0];
				if($0.is.Target(e.target, completeBtn)){
					this.tdAction._completed(e);
				} else if($0.is.Target(e.target, destoryBtn)){
					this.tdAction._destroy(e);
				}
			}.bind(this), false);
		},

		setUIEvnets : function(newTodo){
			newTodo.style.opacity = "1";
		},

		domTemplete : function(todoObj){
			var template = $0.D.getEId("todoTemplate").innerHTML;
			var rendered = Mustache.render(template, {
				todo : todoObj.todo, 
				key : todoObj.id,
				needClass : todoObj.needClass,
				checked : todoObj.checked
			});
			return rendered;
		},
	},

	filter : {
		service : function(e){
			var target = e.target;
			var tagName = target.tagName.toLowerCase();
			if (tagName === "a"){
				var href = target.getAttribute("href");
				if(href === "index.html"){
					this.ftFunc._all();
					history.pushState({"method" : "all"}, null, href);
					return ;
				}
				var _func = "_" + href;
				this.ftFunc[_func]();
				history.pushState({"method" : href}, null, href);
			}
			e.preventDefault();
		},

		byURL : function(e){
			if(e.state){
				var method ="_" + e.state.method;
				this["ftFunc"][method]();
			} else {
				this.ftFunc._all();
			}
		},

		ftFunc : {
			changeSelected : function(targetIndex){
				var naviBar = $0.D.getEId("filters");
				var btns = $0.D.getETN("a", naviBar);
				for (var i=0 ; i<btns.length ; i++){
					btns[i].className = "";
				}
				btns[targetIndex].className = "selected";
			},

			_all : function(){
				$0.D.getEId("todo-list").className = "";
				this.changeSelected(0);
			},

			_completed : function(){
				$0.D.getEId("todo-list").className = "all-completed";
				this.changeSelected(2);
			},

			_active : function(){
				$0.D.getEId("todo-list").className = "all-active";
				this.changeSelected(1);
			}
		}
	}
};