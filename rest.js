/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const request = require('request');
const fs = require ('fs');
const cj = request.jar();
cookieJar = [];

function debug(message){
    dbg.message("<REST> " + message);
}

function addCookieToJar(cookie,domainName)
{
    debug(".<COOKIES> adding cookie:" + cookie);
    cookieJar.push(cookie);
    cj.setCookie(cookie,domainName);
}

function displayCookies()
{
    for(var i=0;i<cookieJar.length;i++)
    {
        var cookieVal = cookieJar[i].split(";")[0];
        debug("COOKIE[" + i + "] :" + cookieVal);
    }
}

function enableProxy(options){
    if(proxy)
    {
        debug("Enabling Proxy");
        options.proxy = proxy;
    }
}

function enableCACert(options){
    if(proxy)
    {
        debug("Enabling CACert");
        options.agentOptions={};
        options.agentOptions.ca = fs.readFileSync(caCertFile)
    }
}

function ignoreTLS(options)
{
    if(ignoreTLS)
    {
        debug("\x1b[31m***** WARNING: Ignoring TLS Errors has been enabled *****\x1b[0m");
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    }
}

function requestModifiers(options){
    enableProxy(options);
    enableCACert(options);
    ignoreTLS(options);
}

function get(restEndPoint,user,pass,timeout,callback)
{
    debug("GET:" + restEndPoint);
    var options = {
        url: restEndPoint,
        json: true,
        method: 'GET',
        timeout: timeout*1000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        auth: {
            username: user,
            password: pass
        }
    };
    requestModifiers(options);
    debug(JSON.stringify(options));
    request(options, (err, res, body) => {
        if(body)debug("BODY:" + JSON.stringify(body));
        if(err)debug("ERR:" + JSON.stringify(err));
        if(res)debug("RES:" + JSON.stringify(res));
        if(res && res.statusCode != 200)
        {
            return callback(body,99)
        }
        
        if (err) {
            return callback(err,99);

        }
        if (body){
            return callback(body,0);
        }
        else{
            var error="unknown";
            return callback(error,98);
        }
    });
}

function put(restEndPoint,user,pass,timeout,data,callback){
    sendBody(restEndPoint,user,pass,timeout,data,'PUT',callback);
}

function httpDelete(restEndPoint,user,pass,timeout,data,callback){
    sendBody(restEndPoint,user,pass,timeout,data,'DELETE',callback);
}


function post(restEndPoint,user,pass,timeout,data,callback){
    sendBody(restEndPoint,user,pass,timeout,data,'POST',callback);
}
function sendBody(restEndPoint,user,pass,timeout,data,type,callback){
    debug(type + " - " + restEndPoint);
    var options = {
        url: restEndPoint,
        json: true,
        method: type,
        timeout: timeout*1000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        auth: {
            username: user,
            password: pass
        },
        body: data
    };
    requestModifiers(options);
    debug(JSON.stringify(options));

    request(options, (err, res, body) => {
        if(body)debug("BODY:" + JSON.stringify(body));
        if(err)debug("ERR:" + JSON.stringify(err));
        if(res)debug("RES:" + JSON.stringify(res));
        if(res && res.statusCode != 200){
            return callback(body,99)
        }
        
        if (err) {
            return callback(err,99)
        }
        if (body){
            return callback(body,0)
        }
        else{
            var error="unknown";
            return callback(error,98);
        }
    });
}


function postUploadFile(restEndPoint,user,pass,timeout,data,filename,callback){
    debug("postUploadFile Filename ["+ filename + "] to: " + restEndPoint);
    var options = {
        url: restEndPoint,
        json: true,
        method: 'POST',
        timeout: timeout*1000,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
        },
        formData : {
            'recipe' : fs.createReadStream(filename)
        },
        auth: {
            username: user,
            password: pass
        },
        body: data
    };
    requestModifiers(options);
    debug(JSON.stringify(options));

    request(options, (err, res, body) => {
        if(body)debug("BODY:" + JSON.stringify(body));
        if(err)debug("ERR:" + JSON.stringify(err));
        if(res)debug("RES:" + JSON.stringify(res));
        
        if(res && res.statusCode != 200){ 
            return callback(body,99)
        }
        
        if (err) {
            return callback(err,99)
        }
        if (body){
            return callback(body,0)
        }
        else{
            var error="unknown";
            return callback(error,98);
        }
    });
}

function postDownloadFile(restEndPoint,user,pass,timeout,data,filename,callback){
    debug("postDownloadFile Filename [" + filename + "] to " + restEndPoint);
    var options = {
        url: restEndPoint,
        json: true,
        method: 'POST',
        timeout: timeout*1000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        auth: {
            username: user,
            password: pass
        },
        body: data
    };
    requestModifiers(options);
    debug(JSON.stringify(options));

    request(options, (err, res, body) => {
        if(body)debug("BODY:" + JSON.stringify(body));
        if(err)debug("ERR:" + JSON.stringify(err));
        if(res)debug("RES:" + JSON.stringify(res));

        if(res && res.statusCode != 200){
            return callback(body,99);
        }
        
        if (err) {
            return callback(err,99);
        }
        if (body){
            return callback(body,0,filename);
        }
        else{
            var error="unknown";
            return callback(error,98);
        }
    });
}

function downloadFile(data,filename,downloadCallback){
    debug("Download File [" + filename +"] from: " + data.output.download_link);
    var link = data.output.download_link;
    let file = fs.createWriteStream(filename);

    new Promise((resolve, reject) => {
        let stream = request({
            uri: link,
            headers: {
                //'Accept': 'application/json',
                //'Accept-Encoding': 'gzip, deflate, br',
                //'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                //'Cache-Control': 'max-age=0',
                //'Connection': 'keep-alive',
                //'Upgrade-Insecure-Requests': '1',
                //'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
            },
            gzip: true
        })
        .pipe(file)
        .on('finish', () => {
            resolve();
            downloadCallback({"completed":"true"},0,filename);
        })
        .on('error', (error) => {
            reject(error);
        })
    })
    .catch(error => {
        downloadCallback(error,0,filename);
    });


}

function del(restEndPoint,user,pass,timeout,data,callback){
    debug("del to " + restEndPoint);
    var options = {
        url: restEndPoint,
        json: true,
        method: 'DELETE',
        timeout: timeout*1000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: data,
        auth: {
            username: user,
            password: pass
        }
    };
    requestModifiers(options);
    debug(JSON.stringify(options));
    request(options, (err, res, body) => {
        if(body)debug("BODY:" + JSON.stringify(body));
        if(err)debug("ERR:" + JSON.stringify(err));
        if(res)debug("RES:" + JSON.stringify(res));
        if(res && res.statusCode != 200){
            return callback(body,99)
        }
        
        if (err) {
            return callback(err,99);

        }
        if (body){
            return callback(body,0);
        }
        else{
            var error="unknown";
            return callback(error,98);
        }
    });
}

function custom(restEndPoint,user,pass,timeout,jsonBody,formBody,type,callback,cookies,headers,jsonFlag,redirect){
    var options = {
        url: restEndPoint,
        method: type,
        followRedirect: false,
        followAllRedirects: false,
        followOriginalHttpMethod: false,
        timeout: timeout*1000,
        headers: {
        },
        jar:cj 
    };
    requestModifiers(options);

    //Redirects
    if(redirect && redirect==true){
        options.followAllRedirects=true;
        options.followRedirect=true;
        options.followOriginalHttpMethod = true;
    }

    //Use JSON Based data/responses
    if(jsonFlag===undefined) options.json = true; 
    else options.json = jsonFlag;
    
    //Authentication
    if(user!==undefined)
    {
        options.auth={};
        options.auth.username = user;
        options.auth.password = pass;
    }

    //Body Content
    if(jsonBody!==undefined)options.body=jsonBody;
    if(formBody!==undefined)
    {
        debug("Processing Form");
        options.form={};
        for(var i=0;i<formBody.length;i++)
        {
            debug(" - FormData Item " + i + "[" + formBody[i].name + "] value [" + formBody[i].value + "]");
            options.form[formBody[i].name]=formBody[i].value;
        }
    }

    //Headers
    if(headers!==undefined){
        debug("Processing Headers");
        //enumerate through headers nvp and add them
        for(var i=0;i<headers.length;i++)
        {
            debug(" - Header [" + headers[i].name + "] Val[" + headers[i].value + "]");
            options.headers[headers[i].name]=headers[i].value;
        }
    }

    //Default Content Type if not set
    if(options.headers['content-type']===undefined )
    {
        options.headers['content-type']='application/json';
    }

    //Defauly accept if not se
    if(options.headers['Accept']===undefined )
    {
        options.headers['Accept']='application/json';

    }

    //Cookies
    if(cookies!==undefined)
    {

        debug("Processing Cookies");
        var cookieStr = "";
        for(var i=0;i<cookies.length;i++)
        {
            debug(" - Adding: " +cookies[i]);
            var cookie = request.cookie(JSON.stringify(cookies[i]));
            //if(i!=cookies.length-1)cookieStr+="; ";
            cj.setCookie(cookie,domainName);
        }
        options.jar = cj;
    }

    request(options, (err, res, body) => {

        //if(body)console.log("BODY:" + JSON.stringify(body));
        
        if(err)console.log(err);
        //if(res)console.log("RES:" + JSON.stringify(res));
        
        return callback(restEndPoint,err,body,res);
    });
}

module.exports = { get, post, put, del, postDownloadFile, postUploadFile, downloadFile, httpDelete, custom, addCookieToJar, displayCookies };
