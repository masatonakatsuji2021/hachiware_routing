/**
 * ====================================================================
 * Hachiware_routing
 * 
 * Client(SPA) And Framework Routing.
 * 
 * License : MIT License. 
 * Since   : 2022.01.15
 * Author  : Nakatsuji Masato 
 * Email   : nakatsuji@teastalk.jp
 * HP URL  : https://hachiware-js.com/
 * GitHub  : https://github.com/masatonakatsuji2021/Hachiware_routing
 * npm     : https://www.npmjs.com/package/Hachiware_routing
 * 
 * ====================================================================
 */

module.exports = function(mode, routings){

    const convertRoutings = function(params){

        var response = {};

        var colums = Object.keys(params);
        for(var n = 0 ; n < colums.length ; n++){
            var url = colums[n];
            var value = params[url];

            if(url.substring(url.length - 1) == "*"){
                url = url.replace("*","{:?}/{:?}/{:?}/{:?}/{:?}/{:?}/{:?}/{:?}/{:?}/{:?}");
            }

            if(typeof value == "string"){
                response[url] = value;
                continue;
            }

            var buff = convertRoutings(value);
            var colums2 = Object.keys(buff);
            for(var n2 = 0 ; n2 < colums2.length ; n2++){
                var url2 = colums2[n2];
                var value2 = buff[url2];

                var _url = url;
                if(url2 != "/"){
                    _url += url2;
                }

                response[_url] = value2;
            }
        }

        return response;
    };

    const getErrorRouting = function(targetUrl){

        var result = null;

        var colums = Object.keys(routings.error);
        for(var n = 0 ; n < colums.length ; n++){
            var url = colums[n];
            var value = routings.error[url];

            if(targetUrl == url){
                result = value;
            }
        }

        if(!result){
            var t2 = targetUrl.split("/");
            t2.pop();
            t2 = t2.join("/");
            if(!t2){
                t2 = "/";
            }
            var search = getErrorRouting(t2);
            result = search;
        }

        return result;
    };

    const getQuery = function(targetUrl){

        var queryStr = targetUrl.split("?");

        if(!queryStr[1]){
            return {
                url: queryStr[0],
                query: null,
            };
        }

        var queryBuff = queryStr[1].split("&");

        var query = {};

        for(var n = 0 ; n < queryBuff.length ; n++){
            var sect = queryBuff[n].split("=");

            query[sect[0]] = sect[1];
        }

        return {
            url: queryStr[0],
            query: query,
        };
    };

    const convertMode = function(target, result){

        if(mode == "client"){
            result.page = target;
        }
        else if(mode == "server"){
            var buff = target.split("@");
            result.controller = buff[0];
            result.action = buff[1];
        }

        return result;
    };

    var routingBuffer = convertRoutings(routings.release);

    /**
     * get
     * @param {*} targetUrl 
     * @returns 
     */
    this.get = function(targetUrl){

        var query = null;

        if(!targetUrl){
            targetUrl = "/";
        }
    
        if(targetUrl.substring(0,1) != "/"){
            targetUrl = "/" + targetUrl;
        }
     
        var buff = getQuery(targetUrl);

        targetUrl = buff.url;
        query = buff.query;

        var colums = Object.keys(routingBuffer);
    
        var checkList = {};
        var aregments = {};
        for(var n = 0 ; n < colums.length ; n++){
            var url = colums[n];
    
            aregments[url] = {};
    
            var urls = url.split("/");
            if(!urls[urls.length - 1]){
                urls.pop();
            }
    
            var targetUrls = targetUrl.split("/");
            if(!targetUrls[targetUrls.length - 1]){
                targetUrls.pop();
            }
    
            checkList[url] = [];
    
            for(var n2 = 0 ; n2 < urls.length ; n2++){
                var urld1 = urls[n2];
                var urld2 = targetUrls[n2];
    
                if(urld1 == urld2){
                    checkList[url].push(1);
                }
                else{
                    if(
                        urld1.indexOf("{:") > -1 && 
                        urld1.indexOf("}") > -1
                    ){
                        if(urld2){
                            var argKey = urld1.split("{:").join("").
                                split("}").join("").
                                split("?").join("")
                            ;
    
                            if(argKey){
                                aregments[url][argKey] = targetUrls[n2];
                            }
                            else{
                                if(!Object.keys(aregments[url]).length){
                                    aregments[url] = [];
                                }
                                aregments[url].push(targetUrls[n2]);
                            }
                            checkList[url].push(1);
                        }
                        else{
                            if(
                                urld1.indexOf("{:") > -1 && 
                                urld1.indexOf("}") > -1 && 
                                urld1.indexOf("?") > -1
                            ){
                                targetUrls[n2] = "??";
                                checkList[url].push(1);
                            }
                            else{
                                checkList[url].push(0);
                            }    
                        }
                    }
                    else{
                        checkList[url].push(0);
                    }    
                }
            }
    
            if(urls.length == targetUrls.length){
                checkList[url].push(1);
            }
            else{
                checkList[url].push(0);
            }
        }
    
        var desitionUrl = null;
        var colums = Object.keys(checkList);
    
        for(var n = 0 ; n < colums.length ; n++){
            var url = colums[n];
            var value = checkList[url];
    
            var juge = true;
            for(var n2 = 0 ; n2 < value.length ; n2++){
                var v_ = value[n2];
    
                if(!v_){
                    juge = false;
                    break;
                }
            }
    
            if(juge){
                desitionUrl = url;
            }
        }
    
        var response = {
            base: targetUrl,
            query : query,
        };
    
        if(desitionUrl){
            response.mode = "success";
            response = convertMode(routingBuffer[desitionUrl], response);
            response.aregment = aregments[desitionUrl];
        }
        else{
            response.mode = "error";
            response = convertMode(getErrorRouting(targetUrl), response);
            response.aregment = {};
            response.exception = new Error("Page not found.");
        }
    
        return response;
    };

    this.getError = function(targetUrl){

        var routes = getErrorRouting(targetUrl);

        var response = {
            base: targetUrl,
            query : null,
        };
    
        response.mode = "error";
        response = convertMode(routes, response);
        response.aregment = {};
    
        return response;
    };

};