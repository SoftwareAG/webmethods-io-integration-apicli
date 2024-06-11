/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 * Rest-Fetch
 */


const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { CookieJar } = require('tough-cookie');
//const zlib = require('zlib');
const fs = require ('fs')
const { FormData } = require('formdata-node');
const { fileFromPathSync } = require('formdata-node/file-from-path');
const { HttpsProxyAgent }= require('https-proxy-agent');
var proxyAgent = undefined;
const cj = new CookieJar();
var cookieJar = [];
var domain

function debug(message){
    logger.debug(message);
}

function info(message){
    logger.info(message);
}

function warning(message){
    logger.warn(message);
}

function error(message){
    logger.error(message);
}


function addAllCookies(res,domainName){
    domain = domainName;
    const setCookieHeaders = res.headers.raw()['set-cookie'];
    // console.log("res--->");
    // console.log(res);
    if (setCookieHeaders) {
        setCookieHeaders.forEach(setCookieHeader => {
            debug("Adding Cookie to Jar [" + setCookieHeader + "] domain [" + "https://" + domainName + "/]");
            //cookieJar.setCookieSync(setCookieHeader, restEndPoint);
            addCookieToJar(setCookieHeader,"https://" + domainName +"/")
        });
    }
    displayCookies();
}

function addCookieToJar(cookie,domainName)
{
    debug(".<COOKIES> adding cookie:" + cookie);
    cookieJar.push(cookie);
    //cj.setCookie(cookie,domainName);
    cj.setCookieSync(cookie, domainName);  
}

function displayCookies()
{
    warning("------------------------- COOKIES -------------------------");
    // warning(`
    //     ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠴⠶⠦⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    // ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣴⡯⠤⠴⠶⠶⠶⠿⠷⠶⠶⠦⠤⣴⠚⠛⠒⠶⣤⡀⠀⠀⠀⠀⠀⠀⠀
    // ⠀⠀⠀⠀⢀⣀⣠⣄⣤⠶⢚⣯⠭⠤⠶⠤⢤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⢦⣀⡀⠀⠈⢹⣆⠀⠀⠀⠀⠀⠀
    // ⠀⢀⡴⠞⠉⠀⠀⢀⡟⠀⢯⣄⣀⣀⣀⣀⣠⠿⠀⠀⢀⡤⠤⠒⠒⠒⠶⢤⡀⠈⠉⠉⣉⣭⣭⣗⣦⣄⡀⠀⠀
    // ⠀⣟⣀⣀⣠⠴⠞⠉⠀⡠⠤⠶⠾⣍⡭⠥⠤⠤⣀⠀⠘⢧⣀⠀⠀⠀⠀⣀⣽⣀⣀⣈⣧⡀⠀⠀⠈⠙⢿⣦⡀
    // ⣰⠋⠁⠀⠀⣀⣀⡀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⡹⠛⠉⠀⠀⠈⠉⠻⣗⠲⠦⠤⠾⠋⢷
    // ⡏⠀⣴⠋⠉⠁⠈⠉⣳⠀⠀⠀⢀⣠⠤⠶⠦⠤⣄⡀⠀⠀⠀⠀⠀⣀⠤⠴⠶⠦⣤⡀⠀⠀⠈⠓⠀⢀⣀⠀⣼
    // ⢷⡀⠈⠙⠒⠒⠒⠋⠁⠈⣒⣤⣘⣧⣄⣀⠀⠀⢈⣻⠀⠀⠀⠀⠘⢥⣀⠀⠀⠀⠀⢹⡆⠀⢀⡴⠚⠉⣩⣷⠏
    // ⠈⠳⣤⡀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠈⠉⠛⠫⡍⠉⠁⠀⡴⠒⠤⣤⡀⠈⠉⠉⠙⠛⠋⠁⠀⠺⠤⢖⣫⠟⠃⠀
    // ⠀⠀⠈⠙⠳⢦⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠓⠒⠒⠃⠀⠀⠀⠀⠀⢀⣀⣤⠴⠞⠋⠁⠀⠀⠀
    // ⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠛⠛⠛⠛⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠛⠛⠛⠛⠛⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀`);
    for(var i=0;i<cookieJar.length;i++)
    {
        var cookieVal = cookieJar[i].split(";")[0];
        warning("COOKIE[" + i + "]=" + cookieVal);
    }
    warning("-----------------------------------------------------------");
} 


function enableProxy(options){
    if(proxy)
    {
        info("Enabling Proxy");
        //options.proxy = proxy;
        proxyAgent = new HttpsProxyAgent(proxy)
        options.agent = proxyAgent;
    }
}

function enableCACert(options){
    if(caCertFile)
    {
        info("Enabling CACert");
        options.agentOptions={};
        options.agentOptions.ca = fs.readFileSync(caCertFile)
    }
}

function setignoreTLS(options)
{
    if(ignoreTLS)
    {
        warning("***** WARNING: Ignoring TLS Errors has been enabled *****");
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    }
}

function requestModifiers(options){
    enableProxy(options);
    enableCACert(options);
    setignoreTLS(options);
}

function get(restEndPoint,user,pass,timeout,callback,accept)
{
    if(accept===undefined)accept="application/json";
    var headers=[];
    headers.push({name:"accept", value:accept});
    custom(restEndPoint,user,pass,timeout,undefined,undefined,"GET",callback,headers,true,undefined);  
}

function getPlain(restEndPoint,user,pass,timeout,callback)
{
    get(restEndPoint,user,pass,timeout,callback,"text/plain")
}

function put(restEndPoint,user,pass,timeout,data,callback){
    custom(restEndPoint,user,pass,timeout,data,undefined,"PUT",callback,undefined,true,undefined); 
}

function httpDelete(restEndPoint,user,pass,timeout,data,callback){
    custom(restEndPoint,user,pass,timeout,data,undefined,"DELETE",callback,undefined,true,undefined); 
}

function post(restEndPoint,user,pass,timeout,data,callback){
    custom(restEndPoint,user,pass,timeout,data,undefined,"POST",callback,undefined,true,undefined); 
}

async function uploadFileFormData(restEndPoint, user, pass, timeout, data, filename, callback, method) {
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
            'Authorization': 'Basic ' + btoa(user + ':' + pass),
            'Accept': 'application/json',
            ...formData.getHeaders()
        },
        body: formData,
        timeout: timeout * 1000
    };

    debug(JSON.stringify(options));

    try {
        const response = await fetch(restEndPoint, options);
        const body = await response.json();
        
        debug("BODY:" + JSON.stringify(body));
        debug("RES:" + JSON.stringify(response));

        if (response.status !== 200) {
            return callback(body, 99);
        }

        return callback(body, 0);

    } catch (err) {
        debug("ERR:" + JSON.stringify(err));
        return callback(err, 99);
    }
}


// Function to debug FormData contents
function debugFormData(form) {
    debug(">>> FORM DATA >>>");
    for (let pair of form.entries()) {
        debug(`${pair[0]}: ${pair[1]}`);
    }
}


function postUploadFile(restEndPoint,user,pass,timeout,data,filename,filenameField,callback,verb){

    debug("postUploadFile Filename ["+ filename + "] for EndPoint: " + restEndPoint);
    debug("Filename Field          ["+ filenameField + "]");
    
    // Create a FormData instance and append the file and other data
    if(verb===undefined) verb="POST";
   
     const form = new FormData();
     form.append(filenameField, fileFromPathSync(filename));
  
     // Add the other data fields to the form
     for (const key in data) {
         if (data.hasOwnProperty(key)) {
             form.append(key, data[key]);
         }
     }
    // const form = new FormData();
    // form.append('recipe', fs.createReadStream(filename));

    
    // // Add the other data fields to the form
    // for (const key in data) {
    //     if (data.hasOwnProperty(key)) {
    //         form.append(key, data[key]);
    //     }
    // }

    
    //var headers=[];
    //headers.push({name:"content-type",value:"multipart/form-data"});
    //headers.push({name:"accept",value:"application/json"});


    custom(restEndPoint,user,pass,timeout,undefined,undefined,verb,callback,undefined,false,false,filename,form);
}

function postDownloadFile(restEndPoint,user,pass,timeout,data,filename,callback){
    debug("postDownloadFile Filename [" + filename + "] to " + restEndPoint);
    custom(restEndPoint,user,pass,timeout,data,undefined,"POST",callback,undefined,true,false,filename);
}

async function downloadFile(data, filename, downloadCallback) {
    debug("Download File [" + filename + "] from: [" + data.output.download_link + "]");
    const link = data.output.download_link;
    const fileStream = fs.createWriteStream(filename);

    try {
        const response = await fetch(link, {
            headers: {
                // Headers can be uncommented if needed
                //'Accept': 'application/json',
                //'Accept-Encoding': 'gzip, deflate, br',
                //'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                //'Cache-Control': 'max-age=0',
                //'Connection': 'keep-alive',
                //'Upgrade-Insecure-Requests': '1',
                //'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${link}, status: ${response.status}`);
        }

        response.body.pipe(fileStream);

        response.body.on('end', () => {
            debug("Download finished successfully.");
            downloadCallback({"completed": "true"}, 0, filename);
        });

        response.body.on('error', (error) => {
            debug("Error during download: ", error);
            downloadCallback(error, 0, filename);
        });

    } catch (error) {
        debug("Download failed: ", error);
        downloadCallback(error, 0, filename);
    }
}


function del(restEndPoint,user,pass,timeout,data,callback){
    debug("del to " + restEndPoint);
    custom(restEndPoint,user,pass,timeout,data,undefined,"DELETE",callback,undefined,true,false,undefined,undefined);
}


async function custom(restEndPoint,user,pass,timeout,jsonBody,formBody,type,callback,headers,jsonFlag,redirect,filename,formObject){
    info("FETCH Custom REST call Started");
    
    //debug("User: " + user);
    var options = {
        url: restEndPoint,
        method: type,
        redirect: 'manual',
        timeout: timeout*1000,
        headers: {
        },
        jar:cj 
    };
    requestModifiers(options);

    //If an actual form object is passed, set this
    if(formObject!==undefined){
        debugFormData(formObject);
        options.body = formObject;
    }

    //Redirects
    if(redirect && redirect==true){
        options.redirect = 'follow'
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
        const base64Credentials = Buffer.from(`${user}:${pass}`).toString('base64');
        options.headers['Authorization']= `Basic ${base64Credentials}`;

    }

    //Body Content
    if(jsonBody!==undefined)
    {
        info("Processing JSON Body");
        debug("Body is [" + JSON.stringify(jsonBody) + "]");
        options.body=JSON.stringify(jsonBody);        
    }

    if(formBody!==undefined)
    {
        info("Processing Form");
        debug("Form is [" + formBody + "]");
        const params = new URLSearchParams();
        formBody.forEach(item => {
            const name = item.name;
            const value = item.value;
            params.append(name, value);
            // Do whatever you want with the name and value here
            debug(`FormData Item - Name: ${name}, Value: ${value}`);
        });
        options.body=params;    
    }

    //Headers
    if(headers!==undefined){
        info("Processing Headers");
        //enumerate through headers nvp and add them
        for(var i=0;i<headers.length;i++)
        {
            debug(" - Header [" + headers[i].name + "] Val[" + headers[i].value + "]");
            options.headers[headers[i].name]=headers[i].value;
        }
    }

      //Default Content Type if not set
    if(options.headers['content-type']===undefined && formObject===undefined)
    {
        info("Defaulting content-type to application/json");
        options.headers['Content-Type']='application/json';
    }

    //Defauly accept if not se
    if(options.headers['Accept']===undefined )
    {
        info("Defaulting accept to application/json");
        options.headers['Accept']='application/json';

    }

    //options.headers['User-Agent']=undefined;

    var cookieStr = "";
    for(var i=0;i<cookieJar.length;i++)
    {
        var cookieVal = cookieJar[i].split(";")[0];
        cookieStr = cookieStr + cookieVal + "; ";
    }

    if(cookieStr.length>0)options.headers['Cookie']= cookieStr;

    //debug("Options\n " + JSON.stringify(options) + "\n -----");
    var response;
    var data;
    var err=undefined;
    try{
        response = await fetch(restEndPoint,options);
        // Check if the response has a Content-Type header
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            // Response is JSON
            //data = await response.json();
            body = await response.text();
            warning(body);
            data = JSON.parse(body);

        } else {
            // Response is HTML or plain text
            data = await response.text();
        }
    }
    catch (error){
        err=error;
    }
    finally{
        //Implement if needed
    }
    
    return callback(restEndPoint,err,data,response,filename);
}


function isJSONObject(obj) {
    return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}


module.exports = { custom, addCookieToJar, displayCookies, addAllCookies, get, getPlain, post, put, del, httpDelete, postDownloadFile,downloadFile,postUploadFile };
//get, getPlain, post, put, del, postDownloadFile, postUploadFile,uploadFileFormData, downloadFile, httpDelete, 
