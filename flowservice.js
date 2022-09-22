/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const rest = require('./rest.js');
const dbg = require('./debug.js');


var domainName, username,password,timeout,prettyprint;
var url;

function debug(message){
    dbg.message("<FLOWSERVICE> " + message,4);
}

function help(){
    return `
\x1b[4mFlowService\x1b[0m

\x1b[32mExport FlowService from a given project (identified from URL in webMethods.io when in FlowEditor
i.e. https://tenant.int-aws-us.webmethods.io/#/projects/\x1b[1mfl65d3aa87fc1783ea5cf8c8\x1b[0m\x1b[32m/flow-editor/\x1b[1mmyFlowService\x1b[0m\x1b[32m):\x1b[0m\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    flowservice-export fl65d3aa87fc1783ea5cf8c8 myFlowService export.zip

\x1b[32mImport Flowservice from a given file into a project \x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    flowservice-import fl65d3aa87fc1783ea5cf8c8 export.zip

\x1b[32mDelete FlowService from a given project\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    flowservice-delete fl65d3aa87fc1783ea5cf8c8 myFlowService

\x1b[32mExecute a FlowService from a given project\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    flowservice-execute fl65d3aa87fc1783ea5cf8c8 myFlowService 

`;
}

function init(inDomainName, inUsername, inPassword,inTimeout,inPrettyPrint,projectId){
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyPrint;

    url = "https://" + domainName + "/enterprise/v1/rest/projects/" + projectId ;
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

module.exports = {help, init, exportFlowService, importFlowService, runFlowService, deleteFlowService };
