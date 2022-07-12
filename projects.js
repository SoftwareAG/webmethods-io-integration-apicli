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

function del(projectId){

    url += "/" + projectId;
    var data={};
    request.httpDelete(url,username,password,timeout,data,processResponse);
}



/**
 * Pushes a deployment to a destination tenant
 * @param {deployment name} name 
 * @param {tenant username} destTenantuser 
 * @param {tenant password} destTenantPw 
 * @param {tenant url} destTenantDomainName 
 * @param {assets to publish} assets 
 */
function pub(projectId,publishName,targetTenantDomainName,targetUserId,targetUserPassword,assetsJson){
    //{"output":{"workflows":["fla73a20e13dd6736cf9c355","fl3cfd145262bbc5d44acff3"],"flows":["mapLeads"],"rest_api":[],"soap_api":[],"listener":[],"messaging":[]}}
    url += "/" + projectId + "/push";
   
    var jsonStr='{';
    jsonStr+='"name": "' + publishName + '",';
    jsonStr+='"destination_tenant_detail": {';
    jsonStr+='"username": "' + targetUserId + '",';
    jsonStr+='"password": "' + targetUserPassword + '",';
    jsonStr+='"url": "' + "https://" + targetTenantDomainName + '"';
    jsonStr+='},';
    assetsJson = assetsJson.replace(/\"flows\"/g, "\"flow_services\"");
    jsonStr+=assetsJson.substring(11,assetsJson.length-2);
    jsonStr+="}";

    data = JSON.parse(jsonStr);
    request.post(url,username,password,timeout,data,processResponse)
}

/**
 * 
 * @param {publish name} publishName 
 * @param {version number} version 
 */
function deploy(projectName, version)
{
    url += "/" + projectName + "/deploy";
    data={"version":parseInt(version)};
    request.post(url,username,password,timeout,data,processResponse);
}   

module.exports = { init, list, listAssets, create, update, del, pub, deploy};
