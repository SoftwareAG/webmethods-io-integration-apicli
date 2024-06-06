/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const rest = require('./rest-fetch.js');

var domainName, username, password, timeout, prettyprint;
var url;

function debug(message) {
    dbg.message("<WORKFLOW> " + message,4);
}

function help() {
    return `
\x1b[4mWorkflow\x1b[0m

\x1b[32mExport Workflow from a given project (identified from URL in webMethods.io when in workflow canvas, 
i.e. https://tenant.int-aws-us.webmethods.io/#/projects/\x1b[1mfl65d3aa87fc1783ea5cf8c8\x1b[0m\x1b[32m/workflows/\x1b[1mfl52232a2dfafbd6536963d7\x1b[0m\x1b[32m/edit):\x1b[0m\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    workflow-export fl65d3aa87fc1783ea5cf8c8 fl52232a2dfafbd6536963d7 export.zip

\x1b[32mImport Workflow from a given file into a project \x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    workflow-import fl65d3aa87fc1783ea5cf8c8 export.zip

\x1b[32mCreate a blank workflow\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    workflow-create fl65d3aa87fc1783ea5cf8c8 "name" "description"

\x1b[32mDelete Workflow from a given project\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    workflow-delete fl65d3aa87fc1783ea5cf8c8 fl52232a2dfafbd6536963d7

\x1b[32mExecute a Workflow from a given project\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    workflow-execute fl65d3aa87fc1783ea5cf8c8 fl52232a2dfafbd6536963d7          

\x1b[32mGet Workflow execution status from a given project\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    workflow-status fl65d3aa87fc1783ea5cf8c8 vbid3d247cd26aa5e19354e1fc6951766a3d19c049bee11d 
        
`;
}

function init(inDomainName, inUsername, inPassword, inTimeout, inPrettyPrint, projectId) {
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyPrint;
    url = "https://" + domainName + "/apis/v1/rest/projects/" + projectId;
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
    if(response===undefined || response === null){
        console.error("No response received");
        console.error(err);
        
        process.exit(1);
    }
    let status = response.status;
    if (prettyprint == true) {
        console.log(JSON.stringify(data, null, 4));
    }
    else {
        console.log(JSON.stringify(data));
    }

    if (status != 0) {
        process.exit(status);
    }
}

function downloadExport(restEndPoint,err,data,response,filename) {
    let status=response.status;
    debug("Downloading Export (Status=" + status + ")");
    if (status != 200) {
        console.log(JSON.stringify(data));
        process.exit(status);
    }
    else {
        rest.downloadFile(data, filename, downloadCompleted);
    }
}

function downloadCompleted(data, status, filename) {
    debug("Download Completed");
    if (status != 0) {
        console.log('{');
        console.log('  workflow-export":"error", "filename":"' + filename + ',');
        console.log(JSON.stringifydata);
        console.log('}');
        process.exit(status);
    }
    else {
        console.log('{"workflow-export":"success", "filename":"' + filename + '"}');
    }
}

function exportwf(wfId, filename) {
    debug("Exporting Workflow");
    url += "/workflows/" + wfId + "/export";
    var data = {};
    rest.postDownloadFile(url, username, password, timeout, data, filename, downloadExport);
}

function importwf(filename) {
    debug("Importing Workflow");
    url += "/workflow-import";
    rest.postUploadFile(url, username, password, timeout, undefined, filename,"recipe", processResponse);

}

function runwf(workflowId) {
    debug("Running Workflow with ID [" + workflowId + "]");
    url += "/workflows/" + workflowId + "/run";
    rest.post(url, username, password, timeout, undefined, processResponse);

}

function statuswf(runId) {
    debug("Getting Workflow Status with run id [" + runId + "]");
    url += "/workflow-run/" + runId;
    debug("URL is: " + url);
    rest.get(url, username, password, timeout, processResponse);
}

function deletewf(workflowId) {
    debug("Deleting Workflow with ID [" + workflowId + "]");
    url += "/workflows/" + workflowId;
    rest.del(url, username, password, timeout, {}, processResponse);
}

function createwf(workflowName,workflowDesc) {
    debug("Creating Workflow with Name [" + workflowName + "]");
    url += "/workflows/";
    rest.post(url, username, password, timeout, {"name":workflowName,"description":workflowDesc}, processResponse);
}

module.exports = { help, init, exportwf, importwf, runwf, statuswf, deletewf, createwf };
