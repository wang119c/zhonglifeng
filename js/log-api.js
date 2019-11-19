(function() {

    var logVersion = "1.0.0";
    var cookieEnabled = navigator.cookieEnabled, javaEnabled = navigator.javaEnabled(), browserLanguage = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage || "", resolution = window.screen.width + "x" + window.screen.height, validateHosts = ["zhan.zcool.com.cn"], isIE = /msie (\d+\.\d+)/i.test(navigator.userAgent), serverUrl = "https://zhan.zcool.com.cn/api/log.do?", unsendLogStrKey = "SA_Unsend_Log_Str",  counter = 0,  loadLog = "", showLog = "show.gif?"; 
   
   
    function getSessionStorageData(key) {
        if (window.sessionStorage) {
            return window.sessionStorage.getItem(key);
        }

        return null;
    }

    function setSessionStorageData(key, value) {
        if (window.sessionStorage) {
            try {
                window.sessionStorage.setItem(key, value);
            } catch (e) {
            }
        }
    }

    var userDataDomElement;

    function createUserDataDomElement() {
        if (!userDataDomElement) {
            try {
                userDataDomElement = document.createElement("input");
                userDataDomElement.type = "hidden";
                userDataDomElement.style.display = "none";
                userDataDomElement.addBehavior("#default#userData");
                document.getElementsByTagName("head")[0].appendChild(userDataDomElement);
            } catch (e) {
                return false;
            }

            return true;
        }
    }

	
    function sendRequest(url, clearUnsendRequest) {
    	$.ajax({
			url : url,
			type : "get",
			dataType : 'jsonp',
			jsonp: "jsonpcallback",
			success : function(data) {
				 clearUnsendRequest && clearUnsendRequest(url);
			}
		})
    }
    
    function randomZhanId(randomFlag, min, max){
        var str = "",
            range = min,
            arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
     
        // 随机产生
        if(randomFlag){
            range = Math.round(Math.random() * (max-min)) + min;
        }
        for(var i=0; i<range; i++){
            pos = Math.round(Math.random() * (arr.length-1));
            str += arr[pos];
        }
        return str;
    }


    var variableKeys = [
        "uid",      //标识唯一用户
        "sr",      //屏幕分辨率
        "ln",      //浏览器语言
        "ca",      //是否启用cookie
        "ja",      //是否启用java
        "re",      //referer
        "lo",      //当前页面的location
        "rand",     //随机字符串
        "v"       //统计代码版本

        ];

    function ZcoolLogAnalytics() {
        this.valueStack = {};

        this.beginAnalyse();
    }


    ZcoolLogAnalytics.prototype = {

        init: function() {
            var zcoolUser = this.getData();
			this.valueStack["v"] = logVersion;  
            this.valueStack["uid"] = zcoolUser;
            this.valueStack["re"]= document.referrer;
            this.valueStack["sr"] = resolution;
            this.valueStack["ln"] =  browserLanguage;
            this.valueStack["ca"] = cookieEnabled ? 1 : 0;
            this.valueStack["ja"] = javaEnabled ? 1 : 0;
            this.valueStack["lo"] = window.location.href;
        },

        beginAnalyse: function() {
            try {
                this.init();
                this.sendLogToServer(serverUrl);

             
            } catch (e) {
                var errorMsg = [];
                errorMsg.push("n=" + encodeURIComponent(e.name));
                errorMsg.push("m=" + encodeURIComponent(e.message));
                errorMsg.push("r=" + encodeURIComponent(document.referrer));
                sendRequest(serverUrl + errorMsg.join("&"))
            }

        },

        checkHostName: function(str, hostname) {
            str = str.replace(/:\d+/, "");
            hostname = hostname.replace(/:\d+/, "");
            pos = str.indexOf(hostname);

            return pos > -1 && pos + hostname.length == str.length;
        },

        getCookieDomain: function() {
            var hostname = window.location.hostname;
            for(i = 0; i < validateHosts.length; i++) {
                if (this.checkHostName(hostName, validateHosts[i])) {
                    return validateHosts.replace(/(:\d+)?[\/\?#].*/, "");
                }
            }

            return hostname;
        },


        checkPath: function(path, hostname) {
            path = path.replace(/^https?:\/\//, "");
            return path.indexOf(hostname) == 0;
        },
		


        getCookiePath: function() {

            for (var i = 0; i < validateHosts.length; i++) {
                var hostname = validateHosts[i];
                if (hostname.indexOf("/") > -1 && this.checkPath(window.location.href, hostname))
                    return hostname.replace(/^[^\/]+(\/.*)/, "$2") + "/"
            }
            return "/";
        },



        getData: function() {
            var str = "";
 			var allcookie = document.cookie.split('; ');
 			var uid = "0";
 			var zid = "0";
 			for(var i=0;i<allcookie.length;i++){
 				var cookiearray = allcookie[i].split('=');
 				var cookiename = cookiearray[0];
 				var cookievalue = cookiearray[1];
 				
 				if(cookiename=='zhanid'){
 					//获取用户id
 					 uid = cookievalue;
 					 break;
 				}
 			}
 			if(uid == '0'){
 				uid = randomZhanId(false, 32);
 				var date=new Date(); 
 				date.setTime(date.getTime()+157680000000); 
 				document.cookie="zhanid="+uid+";path=/;expires="+date.toGMTString(); 
 			}
 			str = uid; 
 			return str;
         },
        
        buildLogStr: function() {
            var result = [];
           
            for (var i = 0; i < variableKeys.length; i++) {
               var key = variableKeys[i], value = this.valueStack[key];
               
                if (typeof value == "undefined" || value == null) {
                    value = "";
                }
                result.push(key + "=" +  encodeURIComponent(value))
              
            }    

            return result.join("&");
        },

      

       
        sendLogToServer: function(serverUrl) {
            
            var context = this;
            context.valueStack["rand"] = Math.round(Math.random() * 2147483647);
            var url = serverUrl + context.buildLogStr();
            sendRequest(url);

        },

       
        clearUnsendRequest:function(url) {
            var historyLogStr = getSessionStorageData(unsendLogStrKey) || "";
            if (historyLogStr) {
                historyLogStr = historyLogStr.replace(RegExp(encodeURIComponent(url.replace(/^https?:\/\//, "")) + "(%26u%3D[^,]*)?,?", "g"), "").replace(/,$/, "");
                if (historyLogStr) {
                    setSessionStorageData(unsendLogStrKey, historyLogStr);
                } else {
                    window.sessionStorage && window.sessionStorage.removeItem(unsendLogStrKey)
                }
            }
        },

        resendUnSendRequest: function() {
            //console && console.log("resendUnSendRequest ---");
            var context = this;
            var logsInStorage = getSessionStorageData(unsendLogStrKey);
            if (logsInStorage) {
                for (var logStrs = logsInStorage.split(","), i = 0; i < logStrs.length; i++) {
                    sendRequest("http://" + decodeURIComponent(logStrs[i]).replace(/^https?\/\//, ""), function(logsInStorage) {
                            context.clearUnsendRequest(logsInStorage);
                            });
                }
            }
        }

    }

    new ZcoolLogAnalytics();
})();