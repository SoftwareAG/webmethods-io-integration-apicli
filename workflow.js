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
    dbg.message("<WORKFLOW> " + message);
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

function downloadCompleted(data,status,filename)
{
    debug("Download Completed");
    if(status!=0){
        console.log('{');
        console.log('  workflow-export":"error", "filename":"'+ filename +',');
        console.log(JSON.stringifydata);
        console.log('}');
        process.exit(status);
    }
    else{
        console.log('{"workflow-export":"success", "filename":"'+ filename + '"}');
    }
}

function exportwf(wfId, filename){
    debug("Exporting Workflow");
    url+="/workflows/" + wfId + "/export";
    var data={};
    rest.postDownloadFile(url,username,password,timeout,data,filename,downloadExport);
}

function importwf(filename){
    debug("Importing Workflow");
    url+="/workflow-import";
    rest.postUploadFile(url,username,password,timeout,undefined,filename,processResponse);
    
}

function runwf(workflowId){
    debug("Running Workflow with ID [" + workflowId + "]");
    url += "/workflows/" + workflowId + "/run";
    rest.post(url,username,password,timeout,undefined,processResponse);
    
}

function statuswf(runId){
    debug("Getting Workflow Status with run id [" + runId + "]");
    url += "/workflow-run/" + runId ;
    debug("URL is: " + url);
    rest.get(url,username,password,timeout,processResponse);
}

function deletewf(workflowId){
    debug("Deleting Workflow with ID [" + workflowId + "]");
    url += "/workflows/" + workflowId;
    rest.del(url,username,password,timeout,{},processResponse);
}

module.exports = { init, exportwf, importwf, runwf, statuswf, deletewf };
