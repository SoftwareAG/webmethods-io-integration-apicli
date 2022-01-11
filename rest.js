01 /*
02  * webMethods.io CLI
03  * Copyright 2021 Software AG
04  * Apache-2.0
05  */

const request = require('request');
const fs = require ('fs');

function get(restEndPoint,user,pass,timeout,callback)
{
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
    request(options, (err, res, body) => {
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

function post(restEndPoint,user,pass,timeout,data,callback){
    sendBody(restEndPoint,user,pass,timeout,data,'POST',callback);
}
function sendBody(restEndPoint,user,pass,timeout,data,type,callback){
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

    request(options, (err, res, body) => {
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

    request(options, (err, res, body) => {
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

    request(options, (err, res, body) => {
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
    request(options, (err, res, body) => {
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

module.exports = { get, post, put, del, postDownloadFile, postUploadFile, downloadFile };