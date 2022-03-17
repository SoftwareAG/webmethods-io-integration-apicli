/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const request = require('./rest.js');

var domainName, username,password,timeout;
var prettyprint = false;
var url;

function checkForErrors(inBody)
{
    //Error Codes
    //Any error response
    
}

function init(inDomainName, inUsername, inPassword,inTimeout,inPrettyprint){
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;

    url = "https://" + domainName + "/apis/v1/rest/projects";
    //console.log("Username [" + username + "]");
    //console.log("URL      [" + url + "]");
    //console.log("Timeout  [" + timeout + "]");
}

/**
 * Call back function to process REST response
 * @param {return data from REST request} data 
 * @param {status} status 
 */
function processResponse(data,status){
    if(prettyprint==true){
        console.log(JSON.stringify(data,null,4));
    }
    else{
        console.log(JSON.stringify(data));
    }
    
    if(status!=0){
        process.exit(status);
    }
}

function list(projectId){

    if(projectId)url+="/" + projectId;
    request.get(url,username,password,timeout,processResponse);
}

function listAssets(projectId){
    if(projectId)url+="/" + projectId + "/assets";
    request.get(url,username,password,timeout,processResponse); 
}

function create(projectName){
    var data={"name":projectName};
    request.post(url,username,password,timeout,data,processResponse);
}

function update(projectId, projectName){

    url += "/" + projectId;
    var data={"name":projectName};
    request.put(url,username,password,timeout,data,processResponse);
}

/**
 * Pushes a deployment to a destination tenant
 * @param {deployment name} name 
 * @param {tenant username} tenantUn 
 * @param {tenant password} tenantPw 
 * @param {tenant url} tenantUrl 
 * @param {array of workflow ids} workflows 
 * @param {array of flowservice names} flowServices 
 * @param {array of restAPIs} restAPIs 
 * @param {array of soapAPIs} soapAPIs 
 * @param {array of listeners} listeners 
 * @param {array of messaging subscribers} messagings 
 */
function push(name,tenantUn,tenantPw,tenantUrl,workflows,flowServices,restAPIs,soapAPIs,listeners,messagings)
{

}



module.exports = { init, list, listAssets, create, update };
