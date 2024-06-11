/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 * Sync-Rest-Fetch
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { CookieJar } = require('tough-cookie');
const zlib = require('zlib');
const fs = require('fs');
const { FormData } = require('formdata-node');
const { fileFromPathSync } = require('formdata-node/file-from-path');
const { HttpsProxyAgent } = require('https-proxy-agent');
const cj = new CookieJar();
let proxyAgent = undefined;
let cookieJar = [];
let domain;

function consolelog(message, level) {
    logger.debug("<REST-FETCH>:" + message,level);
}

function debug(message) {
    consolelog(message, 4);
}

function info(message) {
    consolelog(message, 3);
}

function warning(message) {
    consolelog(message, 2);
}

function errorMsg(message) {
    consolelog(message, 1);
}

function addAllCookies(res, domainName) {
    domain = domainName;
    const setCookieHeaders = res.headers.raw()['set-cookie'];
    if (setCookieHeaders) {
        setCookieHeaders.forEach(setCookieHeader => {
            debug("Adding Cookie to Jar [" + setCookieHeader + "] domain [" + "https://" + domainName + "/]");
            addCookieToJar(setCookieHeader, "https://" + domainName + "/");
        });
    }
    displayCookies();
}

function addCookieToJar(cookie, domainName) {
    debug(".<COOKIES> adding cookie:" + cookie);
    cookieJar.push(cookie);
    cj.setCookieSync(cookie, domainName);
}

function displayCookies() {
    warning("------------------------- COOKIES -------------------------");
    warning(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠴⠶⠦⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣴⡯⠤⠴⠶⠶⠶⠿⠷⠶⠶⠦⠤⣴⠚⠛⠒⠶⣤⡀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⢀⣀⣠⣄⣤⠶⢚⣯⠭⠤⠶⠤⢤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⢦⣀⡀⠀⠈⢹⣆⠀⠀⠀⠀⠀⠀
    ⠀⢀⡴⠞⠉⠀⠀⢀⡟⠀⢯⣄⣀⣀⣀⣀⣠⠿⠀⠀⢀⡤⠤⠒⠒⠒⠶⢤⡀⠈⠉⠉⣉⣭⣭⣗⣦⣄⡀⠀⠀
    ⠀⣟⣀⣀⣠⠴⠞⠉⠀⡠⠤⠶⠾⣍⡭⠥⠤⠤⣀⠀⠘⢧⣀⠀⠀⠀⠀⣀⣽⣀⣀⣈⣧⡀⠀⠀⠈⠙⢿⣦⡀
    ⣰⠋⠁⠀⠀⣀⣀⡀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⡹⠛⠉⠀⠀⠈⠉⠻⣗⠲⠦⠤⠾⠋⢷
    ⡏⠀⣴⠋⠉⠁⠈⠉⣳⠀⠀⠀⢀⣠⠤⠶⠦⠤⣄⡀⠀⠀⠀⠀⠀⣀⠤⠴⠶⠦⣤⡀⠀⠀⠈⠓⠀⢀⣀⠀⣼
    ⢷⡀⠈⠙⠒⠒⠒⠋⠁⠈⣒⣤⣘⣧⣄⣀⠀⠀⢈⣻⠀⠀⠀⠀⠘⢥⣀⠀⠀⠀⠀⢹⡆⠀⢀⡴⠚⠉⣩⣷⠏
    ⠈⠳⣤⡀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠈⠉⠛⠫⡍⠉⠁⠀⡴⠒⠤⣤⡀⠈⠉⠉⠙⠛⠋⠁⠀⠺⠤⢖⣫⠟⠃⠀
    ⠀⠀⠈⠙⠳⢦⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠓⠒⠒⠃⠀⠀⠀⠀⠀⢀⣀⣤⠴⠞⠋⠁⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠛⠛⠛⠛⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠛⠛⠛⠛⠛⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀`);
    for (let i = 0; i < cookieJar.length; i++) {
        const cookieVal = cookieJar[i].split(";")[0];
        warning("COOKIE[" + i + "]=" + cookieVal);
    }
    warning("-----------------------------------------------------------");
}

function enableProxy(options) {
    if (proxy) {
        info("Enabling Proxy");
        proxyAgent = new HttpsProxyAgent(proxy);
        options.agent = proxyAgent;
    }
}

function enableCACert(options) {
    if (caCertFile) {
        info("Enabling CACert");
        options.agentOptions = {};
        options.agentOptions.ca = fs.readFileSync(caCertFile);
    }
}

function setignoreTLS(options) {
    if (ignoreTLS) {
        warning("***** WARNING: Ignoring TLS Errors has been enabled *****");
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    }
}

function requestModifiers(options) {
    enableProxy(options);
    enableCACert(options);
    setignoreTLS(options);
}

async function get(restEndPoint, user, pass, timeout, accept) {
    if(accept===undefined || accept===null || accept.length==0)accept="application/json";
    var headers=[];
    headers.push({"name":"accept", "value":accept});
    return custom(restEndPoint, user, pass, timeout, undefined, undefined, "GET", headers, true, undefined);
}

async function getPlain(restEndPoint, user, pass, timeout) {
    return get(restEndPoint, user, pass, timeout, "text/plain");
}

async function put(restEndPoint, user, pass, timeout, data) {
    return custom(restEndPoint, user, pass, timeout, data, undefined, "PUT", undefined, true, undefined);
}

async function httpDelete(restEndPoint, user, pass, timeout, data) {
    return custom(restEndPoint, user, pass, timeout, data, undefined, "DELETE", undefined, true, undefined);
}

async function post(restEndPoint, user, pass, timeout, data) {
    return custom(restEndPoint, user, pass, timeout, data, undefined, "POST", undefined, true, undefined);
}

async function uploadFileFormData(restEndPoint, user, pass, timeout, data, filename, method) {
    debug("postUploadFile Filename [" + filename + "] to: " + restEndPoint);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filename));
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('file_encoding', data.file_encoding);
    formData.append('field_separator', data.field_separator);
    formData.append('text_qualifier', data.text_qualifier);

    const options = {
        method: method,
        headers: {
            'Authorization': 'Basic ' + Buffer.from(user + ':' + pass).toString('base64'),
            'Accept': 'application/json',
            ...formData.getHeaders()
        },
        body: formData,
        timeout: timeout * 1000,
    };
    requestModifiers(options);

    const response = await fetch(restEndPoint, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function uploadFile(restEndPoint, user, pass, timeout, data, filename) {
    return uploadFileFormData(restEndPoint, user, pass, timeout, data, filename, "POST");
}

async function custom(restEndPoint, user, pass, timeout, data, contentType, method, headers, returnBody, filename) {
    const options = {
        method: method,
        headers: {
            'Accept': 'application/json',
        },
        timeout: timeout * 1000,
    };

    if(user!==undefined && user!==null && user.length>0){
        options.headers["Authorization"]='Basic ' + Buffer.from(user + ':' + pass).toString('base64');
    }

    if (data) {
        if (contentType) {
            options.headers['Content-Type'] = contentType;
        } else {
            options.headers['Content-Type'] = 'application/json';
            data = JSON.stringify(data);
        }
        options.body = data;
    }

    //console.log(headers);
    if(headers!==undefined && headers!==null && headers.length>0){
        for(var i=0;i<headers.length;i++){
            //console.log(headers[i]);
            //console.log("Header name:" + headers[i].name);
            headerName = headers[i].name;
            headerValue = headers[i].value;
            options.headers[headerName]=headerValue;
        }
        /*
        headers.forEach(header => {
            options.headers[header.name] = header.value;
        });*/
    }

    if (filename) {
        const file = fileFromPathSync(filename);
        options.body = new FormData();
        options.body.set('file', file);
    }

    requestModifiers(options);

    const response = await fetch(restEndPoint, options);
    const responseBody = await response.text();
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }


    try {
        // Attempt to parse the response body as JSON
        
        return JSON.parse(responseBody);
    } catch (error) {
        // If parsing fails, return as plain text
        return responseBody;
    }
}

async function downloadFile(restEndPoint, user, pass, timeout, destFile) {
    debug("GET File from: " + restEndPoint);

    const options = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(user + ':' + pass).toString('base64'),
            'Accept': 'application/octet-stream',
        },
        timeout: timeout * 1000,
    };
    requestModifiers(options);

    const response = await fetch(restEndPoint, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const dest = fs.createWriteStream(destFile);
    response.body.pipe(dest);

    return new Promise((resolve, reject) => {
        dest.on('finish', resolve);
        dest.on('error', reject);
    });
}

async function decompressPayload(payload, encoding, method) {
    return new Promise((resolve, reject) => {
        if (encoding === 'gzip') {
            zlib.gunzip(payload, (err, decoded) => {
                if (err) {
                    return reject(err);
                }
                resolve(decoded.toString());
            });
        } else if (encoding === 'deflate') {
            zlib.inflate(payload, (err, decoded) => {
                if (err) {
                    return reject(err);
                }
                resolve(decoded.toString());
            });
        } else {
            resolve(payload);
        }
    });
}

module.exports = {
    get,
    getPlain,
    post,
    put,
    delete: httpDelete,
    uploadFile,
    downloadFile,
    custom,
    addAllCookies,
    decompressPayload,
};
