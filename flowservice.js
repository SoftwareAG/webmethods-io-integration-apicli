01 /*
02  * webMethods.io CLI
03  * Copyright 2021 Software AG
04  * Apache-2.0
05  */

const rest = require('./rest.js');
const dbg = require('./debug.js');


var domainName, username,password,timeout;
var url;

function debug(message){
    dbg.message("<FLOWSERVICE> " + message);
}

function init(inDomainName, inUsername, inPassword,inTimeout,projectId){
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    url = "https://" + domainName + "/enterprise/v1/rest/projects/" + projectId ;
    debug("Username [" + username + "]");
    debug("URL      [" + url + "]");
    debug("Timeout  [" + timeout + "]");
}

function processResponse(data,status,filename){
    debug("Processing response message");
    console.log(JSON.stringify(data));
    if(status!=0){
        process.exit(status);
    }
}

function downloadExport(data,status,filename){
    debug("Downloading Export");
    if(status!=0){
        console.log(JSON.stringify(data));
        process.exit(status);
    }
    else{
        rest.downloadFile(data,filename,downloadCompleted);
    }
}

function downloadCompleted(data,status,filename){
    debug("Download Completed");
    if(status!=0){
        console.log('{');
        console.log('  flowservice-export":"error", "filename":"'+ filename +',');
        console.log(JSON.stringifydata);
        console.log('}');
        process.exit(status);
    }
    else{
        console.log('{"flowservice-export":"success", "filename":"'+ filename + '"}');
    }
}

function exportFlowService(flowId, filename){
    debug("Exporting FlowService");
    url+="/flows/" + flowId + "/export";
    var data={};
    rest.postDownloadFile(url,username,password,timeout,data,filename,downloadExport);
}

function importFlowService(filename){
    debug("Importing FlowService");
    url+="/flow-import";
    rest.postUploadFile(url,username,password,timeout,undefined,filename,processResponse);
}

function runFlowService(flowId,data){
    debug("Running Flowservice with Name [" + flowId + "]");
    url += "/flows/" + flowId + "/run";
    rest.post(url,username,password,timeout,data,processResponse);
}

function deleteFlowService(flowId){
    debug("Deleting FlowService with ID [" + flowId + "]");
    url += "/flows/" + flowId;
    rest.del(url,username,password,timeout,{},processResponse);
}

module.exports = { init, exportFlowService, importFlowService, runFlowService, deleteFlowService };
