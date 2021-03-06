/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const request = require('request');
const fs = require ('fs');
const dbg = require('./debug.js');

function debug(message){
    dbg.message("<REST> " + message);
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

module.exports = { get, post, put, del, postDownloadFile, postUploadFile, downloadFile, httpDelete };
