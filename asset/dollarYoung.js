var $0 = {

	to : {
		JSN : function(string){
			return JSON.parse(string);
		},

		STR : function(json){
			return JSON.stringify(json);
		}

	},

	D : {
		creEle : function(item){
			return document.createElement(item);
		},

		getEId : function(id){
			return document.getElementById(id);
		},	

		getECN : function(className, eDocument){
			var pre = typeof eDocument === "undefined"?document:eDocument;
			return pre.getElementsByClassName(className);
		},

		getETN : function(tagName, eDocument){
			var pre = typeof eDocument ==="undefined"?document:eDocument;
			return pre.getElementsByTagName(tagName);
		}
	},

	is : { 
		localData : function(str){
			var front = str.substring(0,3) === "loc";
			var rear = !isNaN(str[3]);
			return front && rear;
		},

		Online : function(){
			return navigator.onLine;
		},

		Target : function(clicked, target){
			return clicked === target?true:false;
		},

		Storaging : function(){
			return typeof(Storage) != "undefined";
		},

		LocalData : function(key){
			var result = (localStorage.getItem(key)!=null)?true:false;
			return result;
		},

		Num : function(item){
			var result = isNaN(item)?false:true;
			return result;
		},

		Undef : function(item){
			var result = typeof item!="undefined"?true:false;
			return result;
		}
	}
};
