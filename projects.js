/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const request = require('./rest-fetch.js');


var domainName, username, password, timeout;
var prettyprint = false;
var url;

function debug(message) {
    dbg.message("<PROJECTS> " + message,4);
}

function help() {
    return `
\x1b[4mProjects\x1b[0m

\x1b[32mList projects in a tenant:\x1b[0m
$ node wmiocli.js -d tenant.int-aws-us.webmethods.io -u user -p password project

\x1b[32mView individual project using project ID (indentified from URL in webMethods.io when in a project, i.e. https://tenant.int-aws-us.webmethods.io/#/projects/\x1b[1mfl65d3aa87fc1783ea5cf8c8\x1b[32m/workflows):\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project fl65d3aa87fc1783ea5cf8c8

\x1b[32mView individual project with given project name:\x1b[0m
    $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project Default

\x1b[32mView Project assets from project with given name:\x1b[0m
    $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-assets Default

\x1b[32mView Project assets (All Details) from project with given name:\x1b[0m
    $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-assets-detailed Default    

\x1b[32mUpdate Project name:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-update fl65d3aa87fc1783ea5cf8c8 "my New Name"

\x1b[32mDelete Project:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-delete fl65d3aa87fc1783ea5cf8c8

\x1b[32mGet Project Assets:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-assets fl65d3aa87fc1783ea5cf8c8

\x1b[32mPublish Project to another tenant:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-publish fl65d3aa87fc1783ea5cf8c8 'My deployment' 'target.int-aws-us.webmethods.io' 
    'targetuser' 'targetpassword' 
    '{"output":{"workflows":["fla73a20e13dd6736cf9c355","fl3cfd145262bbc5d44acff3"],
    "flows":["mapLeads"],"rest_api":[],"soap_api":[],"listener":[],"messaging":[]}}'  


\x1b[32mDeploy published Project in the tenant with the given name and deploy version:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-deploy projectName 1  
    

\x1b[32mList Project Workflow Parameters or gets an individual where name is specified\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-param projectName [param-name]

\x1b[32mCreate Project Workflow Parameter\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-param-create projectName param-name param-value required isPassword
    
    e.g. node wmiocli.js -d env -u user -p pass project-param-create project name dave false false

\x1b[32mUpdate Project Workflow Parameter\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-param-update projectName param-uid param-name param-value required isPassword

\x1b[32mDelete Project Workflow Parameter matching the provided parameter id\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-param-delete projectName param-uid

\x1b[32mProject webhooks List\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-webhooks-list [project-uid]

\x1b[32mRegenerate webhook token\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-webhooks-regenerate project-uid webhook-uid

\x1b[32mChange webhook Auth\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-webhooks-auth project-uid webhook-uid auth-type<none,login,token>

    e.g.
    node wmiocli.js -d env -u user -p pass project-webhooks-auth flf1111 flf2222 login

\x1b[32mList triggers in project\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-triggers-list project-uid
    
\x1b[32mDelete trigger in project\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-triggers-delete project-uid trigger-uid

\x1b[32mList Reference Data List:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    referencedata project_name
    e.g.
    project-ref-data project-uid

\x1b[32mList Reference Data Get Item:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-ref-data project-uid ref-data-name <json/csv>

    e.g.
    project-ref-data project-uid ref-data-name
    project-ref-data project-uid ref-data-name json  
    project-ref-data project-uid ref-data-name csv

\x1b[32mAdd Reference Data:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-ref-data-add project-uid name description filepath <field separator> <text_qualifier> <file_encoding>
    
    e.g.
    project-ref-data-add flf1111 reflookup description test.csv

\x1b[32mUpdate Reference Data:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-ref-data-add project-uid name description filepath <field separator> <text_qualifier> <file_encoding>
    
    e.g.
    project-ref-data-update flf1111 reflookup description test.csv
`;

}
function init(inDomainName, inUsername, inPassword, inTimeout, inPrettyprint) {
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
function processResponse(restEndPointUrl, err, data, response) {
    let status = response.status;
    if (prettyprint == true) {
        console.log(JSON.stringify(data, null, 4));
    }
    else {
        console.log(JSON.stringify(data));
    }

    if (status != 200) {
        process.exit(status);
    }
}

/* reference data */
function listRefData(projectId){
    debug("List Reference Data - Project [" + projectId + "]");
    url += "/" + projectId + "/referencedata";
    request.get(url, username, password, timeout, processResponse);
}

function getRefData(projectId,refDataName,format){
    debug("Getting Reference Data - Project [" + projectId + "] name [" + refDataName + "] format [" + format + "]");
    url += "/" + projectId + "/referencedata/" + refDataName;
    debug("URL is: " + url);
    if(format && format.toLowerCase()=="csv")request.getPlain(url, username, password, timeout, processResponse);
    else request.get(url, username, password, timeout, processResponse);
}

function deleteRefData(projectId,refDataName){
    debug("Deleting Reference Data - Project [" + projectId + "] name [" + refDataName + "]");
    url += "/" + projectId + "/referencedata/" + refDataName;
    debug("URL is: " + url);
    request.del(url, username, password, timeout,undefined, processResponse);
}

function addRefData(projectId,name,description,filename,separator,qualifier,encoding){
    debug("Adding Reference Data to project [" + projectId + "]");
    debug(`Fields: ${projectId},${name},${description},${filename},${separator},${qualifier},${encoding}`);
    url += "/" + projectId + "/referencedata";

    var data={};
    data.name = name;
    data.description = description;
    data.file = filename;
    data.file_encoding = encoding;
    data.field_separator = separator;
    data.text_qualifier = qualifier;

    // var formdata=[];
    // formdata.push({"name":data.name});
    // formdata.push({"description":data.descript`ion});
    // formdata.push({"encoding":data.encoding});
    // formdata.push({"separator":data.separator});
    // formdata.push({"text_qualifier":data.qualifier});

    //request.uploadFileFormData(url,username,password,timeout,data,filename,processResponse,"POST");

    request.postUploadFile(url,username,password,timeout,data,filename,"file", processResponse);
}

function updateRefData(projectId,name,description,filename,separator,qualifier,encoding){
    debug("Adding Reference Data to project [" + projectId + "]");
    debug(`Fields: ${projectId},${name},${description},${filename},${separator},${qualifier},${encoding}`);
    url += "/" + projectId + "/referencedata/" + name;

    var data={};
    data.name = name;
    data.description = description;
    data.file = filename;
    data.file_encoding = encoding;
    data.field_separator = separator;
    data.text_qualifier = qualifier;

    request.postUploadFile(url,username,password,timeout,data,filename,"file", processResponse,"PUT");
}


/* Projects */
function list(projectId) {

    debug("List Projects ID[" + projectId + "]");
    if (projectId) url += "/" + projectId;
    request.get(url, username, password, timeout, processResponse);
}

function create(projectName) {
    debug("Create Project ID[" + projectName + "]");
    var data = { "name": projectName };
    request.post(url, username, password, timeout, data, processResponse);
}

function update(projectId, projectName) {
    debug("Update Project ID[" + projectId + "] Name[" + projectName + "]");
    url += "/" + projectId;
    var data = { "name": projectName };
    request.put(url, username, password, timeout, data, processResponse);
}

function del(projectId) {
    debug("Create Project ID[" + projectId + "]");
    url += "/" + projectId;
    var data = {};
    request.httpDelete(url, username, password, timeout, data, processResponse);
}

/* Project Assets */
function listAssets(projectId) {
    debug("List Assets [" + projectId + "]");
    if (projectId) url += "/" + projectId + "/assets";
    request.get(url, username, password, timeout, processResponse);
}

function listAssetsDetailed(projectId) {
    debug("List Assets [" + projectId + "]");
    if (projectId) url += "/" + projectId + "/assets?complete=true" ;
    request.get(url, username, password, timeout, processResponse);
}

/* Project Params */
function listParam(projectId, paramId) {
    debug("List Params [" + projectId + "] Param ID [" + paramId + "]");
    if (projectId) url += "/" + projectId + "/params";
    if (paramId) url += "/" + paramId;
    request.get(url, username, password, timeout, processResponse);
}

function createParam(projectId, paramName, paramValue, required, isPassword) {
    debug("Create Param Project ID[" + projectId + "] Name [" + paramName + "] value [" + paramValue + "] required [" + required + "] isPassword [" + isPassword + "]");
    if (projectId) url += "/" + projectId + "/params";
    var data = { "key": paramName, "value": paramValue, "required": required, "isPassword": isPassword };
    request.post(url, username, password, timeout, data, processResponse);
}

function updateParam(projectId, paramId, paramName, paramValue, required, isPassword) {
    debug("Update Param ProjectId [" + projectId + "] Param ID[" + paramId + "] Name [" + paramName + "] value [" + paramValue + "] required [" + required + "] isPassword [" + isPassword + "]");
    if (projectId) url += "/" + projectId + "/params";
    if (paramId) url += "/" + paramId;
    var data = { "key": paramName, "value": paramValue, "required": required, "isPassword": isPassword };
    request.put(url, username, password, timeout, data, processResponse);
}

function deleteParam(projectId, paramId) {
    debug("Delete Param ProjectId [" + projectId + "] Param ID[" + paramId + "]");
    if (projectId) url += "/" + projectId + "/params";
    if (paramId) url += "/" + paramId;
    var data = {};
    request.httpDelete(url, username, password, timeout, data, processResponse);
}


/* Webhook APIs */
function listWebhooks(projectId) {
    debug("List webhooks ProjectId [" + projectId + "]");
    if (projectId) url += "/" + projectId + "/webhook-flows";
    request.get(url, username, password, timeout, processResponse);
}

function regenWebhook(projectId, workflowUid) {
    debug("List webhooks ProjectId [" + projectId + "] workflowUid [" + workflowUid + "]");
    if (projectId) url += "/" + projectId + "/webhook-flows";
    if (workflowUid) url += "/" + workflowUid + "/reset";
    request.put(url, username, password, timeout, {}, processResponse);
}

function setWebhookAuth(projectId, workflowUid, authType) {
    debug("List webhooks ProjectId [" + projectId + "] workflowUid [" + workflowUid + "] auth type [" + authType + "]");
    if (projectId) url += "/" + projectId + "/webhook-flows";
    if (workflowUid) url += "/" + workflowUid + "/auth";
    var data = { "auth": authType };
    request.post(url, username, password, timeout, data, processResponse);
}

function exportProj(projectId){
    debug("Exporting Project [" + projectId + "]");
    url += "/" + projectId + "/export";
    data = undefined;
    request.post(url, username, password, timeout, data, processResponse);
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
function pub(projectId, publishName, targetTenantDomainName, targetUserId, targetUserPassword, assetsJson) {
    debug("Project Pub ProjectId [" + projectId + "] publishName [" + publishName + "] target Tenant [" + targetTenantDomainName + "]");
    //{"output":{"workflows":["fla73a20e13dd6736cf9c355","fl3cfd145262bbc5d44acff3"],"flows":["mapLeads"],"rest_api":[],"soap_api":[],"listener":[],"messaging":[]}}
    url += "/" + projectId + "/push";

    var jsonStr = '{';
    jsonStr += '"name": "' + publishName + '",';
    jsonStr += '"destination_tenant_detail": {';
    jsonStr += '"username": "' + targetUserId + '",';
    jsonStr += '"password": "' + targetUserPassword + '",';
    jsonStr += '"url": "' + "https://" + targetTenantDomainName + '"';
    jsonStr += '},';
    assetsJson = assetsJson.replace(/\"flows\"/g, "\"flow_services\"");
    jsonStr += assetsJson.substring(11, assetsJson.length - 2);
    jsonStr += "}";

    data = JSON.parse(jsonStr);
    request.post(url, username, password, timeout, data, processResponse)
}

/**
 * 
 * @param {publish name} publishName 
 * @param {version number} version 
 */
function deploy(projectName, version) {
    debug("Project Deploy ProjectName [" + projectName + "] Version [" + version + "]");
    url += "/" + projectName + "/deploy";
    data = { "version": parseInt(version) };
    request.post(url, username, password, timeout, data, processResponse);
}

function listTriggers(projectId) {
    debug("List Triggers for ProjectId [" + projectId + "]");
    if (projectId) url += "/" + projectId + "/trigger-flows";
    request.get(url, username, password, timeout, processResponse);
}

function deleteTrigger(projectId,triggerId) {
    debug("Deete Triggers for ProjectId [" + projectId + "] with triggerID [" + triggerId + "]");
    if (projectId) url += "/" + projectId + "/triggers";
    if(triggerId) url += "/" + triggerId;
    var data;
    request.httpDelete(url, username, password, timeout, data, processResponse);
}



module.exports = {
    help, init, list, create, update, del,
    listAssets, listAssetsDetailed, pub, deploy,
    createParam, updateParam, listParam, deleteParam,
    listWebhooks, regenWebhook, setWebhookAuth,
    listTriggers, deleteTrigger,
    listRefData, getRefData, addRefData, updateRefData, deleteRefData,
    exportProj
};
