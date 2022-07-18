/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const request = require('./rest.js');
const dbg = require('./debug.js');

var domainName, username,password,timeout;
var prettyprint = false;
var url;

function debug(message){
    dbg.message("<PROJECTS> " + message);
}


function init(inDomainName, inUsername, inPassword,inTimeout,inPrettyprint){
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;

    url = "https://" + domainName + "/apis/v1/rest/projects";
    debug("Username [" + username + "]");
    debug("URL      [" + url + "]");
    debug("Timeout  [" + timeout + "]");
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

/* Projects */
function list(projectId){

    debug("List Projects ID[" + projectId + "]");
    if(projectId)url+="/" + projectId;
    request.get(url,username,password,timeout,processResponse);
}

function create(projectName){
    debug("Create Project ID[" + projectName + "]");
    var data={"name":projectName};
    request.post(url,username,password,timeout,data,processResponse);
}

function update(projectId, projectName){
    debug("Update Project ID[" + projectId + "] Name[" + projectName + "]");
    url += "/" + projectId;
    var data={"name":projectName};
    request.put(url,username,password,timeout,data,processResponse);
}

function del(projectId){
    debug("Create Project ID[" + projectId + "]");
    url += "/" + projectId;
    var data={};
    request.httpDelete(url,username,password,timeout,data,processResponse);
}

/* Project Assets */
function listAssets(projectId){
    debug("List Assets [" + projectId + "]");
    if(projectId)url+="/" + projectId + "/assets";
    request.get(url,username,password,timeout,processResponse); 
}

/* Project Params */
function listParam(projectId,paramId){
    debug("List Params [" + projectId + "] Param ID [" + paramId + "]");
    if(projectId)url+="/" + projectId + "/params";
    if(paramId)url +="/" + paramId;
    request.get(url,username,password,timeout,processResponse); 
}

function createParam(projectId,paramName,paramValue,required,isPassword){
    debug("Create Param Project ID[" + projectId + "] Name [" + paramName + "] value ["+paramValue + "] required [" + required + "] isPassword [" + isPassword + "]" );
    if(projectId)url+="/" + projectId + "/params";
    var data={"key":paramName,"value":paramValue,"required":required,"isPassword":isPassword};
    request.post(url,username,password,timeout,data,processResponse);
}

function updateParam(projectId,paramId,paramName,paramValue,required,isPassword){
    debug("Update Param ProjectId [" + projectId + "] Param ID[" + paramId + "] Name [" + paramName + "] value ["+paramValue + "] required [" + required + "] isPassword [" + isPassword + "]" );
    if(projectId)url+="/" + projectId + "/params";
    if(paramId)url +="/" + paramId;
    var data={"key":paramName,"value":paramValue,"required":required,"isPassword":isPassword};
    request.put(url,username,password,timeout,data,processResponse);
}

function deleteParam(projectId,paramId){
    debug("Delete Param ProjectId [" + projectId + "] Param ID[" + paramId + "]");
    if(projectId)url+="/" + projectId + "/params";
    if(paramId)url +="/" + paramId;
    var data={};
    request.httpDelete(url,username,password,timeout,data,processResponse);
}


/* Webhook APIs */
function listWebhooks(projectId){
    debug("List webhooks ProjectId [" + projectId + "]");
    if(projectId)url+="/" + projectId + "/webhook-flows";
    request.get(url,username,password,timeout,processResponse); 
}

function regenWebhook(projectId,workflowUid){
    debug("List webhooks ProjectId [" + projectId + "] workflowUid [" + workflowUid + "]");
    if(projectId)url+="/" + projectId + "/webhook-flows";
    if(workflowUid)url +="/" + workflowUid + "/reset";
    request.put(url,username,password,timeout,{},processResponse); 
}

function setWebhookAuth(projectId,workflowUid,authType){
    debug("List webhooks ProjectId [" + projectId + "] workflowUid [" + workflowUid + "] auth type [" + authType + "]");
    if(projectId)url+="/" + projectId + "/webhook-flows";
    if(workflowUid)url +="/" + workflowUid + "/auth";
    var data={"auth": authType};
    request.post(url,username,password,timeout,data,processResponse); 
}

 
/* Deployment */

/**
 * Pushes a deployment to a destination tenant
 * @param {deployment name} name 
 * @param {tenant username} destTenantuser 
 * @param {tenant password} destTenantPw 
 * @param {tenant url} destTenantDomainName 
 * @param {assets to publish} assets 
 */
function pub(projectId,publishName,targetTenantDomainName,targetUserId,targetUserPassword,assetsJson){
    debug("Project Pub ProjectId [" + projectId + "] publishName [" + publishName + "] target Tenant [" + targetTenantDomainName + "]");
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
    debug("Project Deploy ProjectName [" + projectName + "] Version [" + version + "]");
    url += "/" + projectName + "/deploy";
    data={"version":parseInt(version)};
    request.post(url,username,password,timeout,data,processResponse);
}   

module.exports = { init, list, create, update, del, 
    listAssets, pub, deploy, 
    createParam,updateParam,listParam,deleteParam,
    listWebhooks, regenWebhook, setWebhookAuth
};
