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
    dbg.message("<MONITOR> " + message,4);
}

function help() {
    return `
\x1b[4mMonitor\x1b[0m

\x1b[32mRetrieve Monitor Summary:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    monitor from count startDate endDate projectsList workflowsList executionStatus
    e.g.
    monitor 1 10 2023-01-01 2023-01-10 myProject workflow1,workflow2 failed,timeout,stopped
    monitor 11 10 2023-01-01 2023-01-10 myProject workflow1,workflow2 failed,timeout,stopped
    monitor 


\x1b[32mView an Execution Log:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    monitor-workflow-log billUid

`;
}
function init(inDomainName, inUsername, inPassword, inTimeout, inPrettyprint) {
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;

    url = "https://" + domainName + "/apis/v1/rest/monitor";
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

    if (status != 0) {
        process.exit(status);
    }
}

/* Monitor */
function list(startDate,endDate,projectsList,workflowsList,executionStatusList) {

    url +="/summary";

    //debug("################### Get Monitor Summary " + "[" + startDate + "," + endDate + "," + projectsList +"," + workflowsList +"," + executionStatusList +"]");
    
    var start_date = startDate;
    var end_date = endDate;
    var projects = [];
    var workflows = [];
    var execution_status=[];



    if(end_date===undefined)
    {
        var now = new Date();
        var month = now.getMonth()+1;
        
        
        if(month.toString().length==1)month = "0" + month.toString();


        end_date=now.getFullYear() + "-" + month + "-" + now.getDate();
        
        now.setDate(now.getDate()-30);
        month = now.getMonth()+1;
        if(month.toString().length==1)month = "0" + '' + month;
        start_date=now.getFullYear() + "-" + month + "-" + now.getDate();
        
    }
    
    debug("***** START POSITION: " + returnStart);
    debug("***** COUNT         : " + returnCount);

    debug("***** START_DATE: " + start_date);
    debug("*****   END_DATE: " + end_date);

    if(projectsList!== undefined && projectsList!==null)projects = projectsList.split(",");
    if(workflowsList!== undefined && workflowsList!==null)workflows = workflowsList.split(",");
    if(executionStatusList!== undefined && executionStatusList!==null)execution_status = executionStatusList.split(",");
    
    var data={};
    data.start_date=start_date;
    data.end_date=end_date;
    
    if(projects.length>0)data.projects=projects;
    if(workflows.length>0)data.workflows=workflows;
    if(execution_status.length>0)data.execution_status=execution_status;

    //var data = { "start_date": start_date, "end_date": end_date, "projects": projects, "workflows": workflows, "execution_status":execution_status };

    if(returnStart!==undefined && returnCount !==undefined)
    {
        url+="?skip="+returnStart + "&limit=" + returnCount;
    }
    request.post(url, username, password, timeout,data, processResponse);
}

function logDetail(billUid) {

    url +="/workflow-execution/logs/" + billUid;
    debug("############################ getLog Detail");
    request.get(url, username, password, timeout, processResponse);
}



module.exports = {
    help, init, list, logDetail
};
