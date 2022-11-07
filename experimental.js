/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

// ------------------------------------------------------------------------------
//  PLEASE NOTE - These functions are provided by NON public APIs, and
//  therefore unsupported - use these at your own risk!
// ------------------------------------------------------------------------------

const request = require("request");
const rest = require("./rest.js");
const crypto = require ('crypto');

var domainName, username,password,timeout;
var prettyprint = false;
var url;

var authtoken="";
var uid="";
var csrf="";
var projectId;
var workflowId;
var projectName ;
var executionStatus;
var startDate;
var endDate;
var startOrResume;
var queueOrTopic;
var messagingName;
var nextUrl,formUrl;
var finalCall;
var loginStageCounter = 0;
var vbid;
var flowuid; 
var payloaduid; 
var projectuid;
var data;
var type;


const maxRunningWorkflows = 20;



function generateUUID(){
    var hexstring = crypto.randomBytes(16).toString("hex"); 
    var guidstring = "UI-" + hexstring.substring(0,8) + "-" + hexstring.substring(8,12) + "-" + hexstring.substring(12,16) + "-" + hexstring.substring(16,20) + "-" + hexstring.substring(20);
    return guidstring;
}

function debug(message){
    dbg.message("<EXPERIMENTAL> " + message,4);
}

function init(inDomainName, inUsername, inPassword,inTimeout,inPrettyprint){
    
    dbg.message("EXPERIMENTAL/UNSUPPORTED APIs - USE THESE AT YOUR OWN RISK",3);
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;
    url = "https://" + domainName;
    dbg.message("<EXPERIMENTAL>Username [" + username + "]",4);
    dbg.message("<EXPERIMENTAL>URL      [" + url + "]",4);
    dbg.message("<EXPERIMENTAL>Timeout  [" + timeout + "]",4);
}

function user()
{
    finalCall = execUserInfo; 
    loginPhase1();   
}

function stages()
{
    finalCall = stageInfo;
    loginPhase1();
}

function projectWorkflows(inProjectId)
{
    projectId = inProjectId;
    finalCall = projectWorkflowsInfo;
    loginPhase1();
}

function projectFlowservices(inProjectId)
{
    projectId = inProjectId;
    finalCall = projectFlowServicesInfo;
    loginPhase1();
}

function connectorAccounts(inProjectId)
{
    projectId = inProjectId;
    finalCall = usedConnectorAccountsInfo;
    loginPhase1();
}

function getProjectAccountConfig(inProjectId)
{
    projectId = inProjectId;
    finalCall = getProjectAccountConfigInfo;
    loginPhase1();
}

function projectDeployments(inProjectId)
{
    dbg.message("<EXPERIMENTAL>Listing project deployments for projectId [" + inProjectId + "]",4);
    projectId = inProjectId;
    finalCall = getProjectDeployments;
    loginPhase1();
}

function searchProject(inProjectName)
{
    projectName = inProjectName;
    finalCall = searchProjectsByName;
    loginPhase1();
}

function getMonitorInfo(inExecutionStatus,inStartDate,inEndDate,inProjectId,inWorkflowId)
{
    projectId = inProjectId;
    workflowId = inWorkflowId;
    executionStatus = inExecutionStatus;
    startDate = inStartDate;
    endDate = inEndDate;
    finalCall = getLogs;
    loginPhase1();
}

function messagingDelete(inQueueOrTopic, inProjectId,inMessagingName)
{
    projectId = inProjectId;
    messagingName = inMessagingName;
    queueOrTopic = inQueueOrTopic;
    finalCall = doMessagingDelete;
    loginPhase1();    
} 

function messagingCreate(inQueueOrTopic, inProjectId,inMessagingName)
{
    projectId = inProjectId;
    messagingName = inMessagingName;
    queueOrTopic = inQueueOrTopic;
    finalCall = doMessagingCreate;
    loginPhase1();
}

function messagingStats(inProjectId,inMessagingName)
{
    projectId = inProjectId;
    messagingName = inMessagingName;
    finalCall = getMessagingStats;
    loginPhase1();
}


function workflowResubmit(instartOrResume, inStartDate,inEndDate, inProjectId,inWorkflowId)
{
    projectId = inProjectId;
    workflowId = inWorkflowId;
    startDate = inStartDate;
    endDate = inEndDate;
    startOrResume = instartOrResume;
    finalCall = checkResubmissions;
    loginPhase1();
}

function debugMonitorInfo()
{
    debug("Monitor Project:         [" + projectName + "]");
    debug("Monitor Project ID:      [" + projectId  + "]");
    debug("Monitor workflowId:      [" + workflowId + "]");
    debug("Monitor executionStatus: [" + executionStatus + "]");
    debug("Monitor startDate:       [" + startDate + "]");
    debug("Monitor endDate:         [" + endDate + "]");
}

function processMonitorBody()
{
    var body={};
    
    
    if(startDate)body.start_date = startDate;
    else
    {
        startDate = new Date();
        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        if(!endDate)
        {
            endDate = new Date;
            endDate.setHours(23);
            endDate.setMinutes(59);
            endDate.setSeconds(59);
            endDate.setMilliseconds(999);
        }
        body.start_date=startDate;
        body.end_date=endDate;
    }
    if(endDate)body.end_date = endDate;
    if(projectId)body.projects=[projectId]
    if(workflowId)body.workflows = [workflowId];
    else body.workflows=[];
    if(executionStatus)body.execution_status = [executionStatus];
    body.limit=20;
    body.skip=0;
    return body;
}

function setHeaders()
{
    var headers = [
        {name:"authtoken",value:authtoken},
        {name:"accept",value:"application/json"},
        {name:"X-Requested-With",value:"XMLHttpRequest"},
        {name:"X-Request-ID",value:generateUUID()},
        {name:"project_uid",value:projectId},
    ];
    return headers;
}

function checkResubmissions()
{
    debug("Check Resubmissions")
    debugMonitorInfo();
    //Check running
    var endPoint = "https://" + domainName + "/enterprise/v1/metrics/workflowexecutions/logs";
    debug("Next URL [" + endPoint + "]");
    var body=processMonitorBody();
    body.execution_status=["running"];
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processRunningResponse,undefined,headers,true,false);  
}

function processResubmissions(fetchSize,reprocessCount){
    debug("Process Resubmissions")
    debugMonitorInfo();
    //Check running
    var endPoint = "https://" + domainName + "/enterprise/v1/metrics/workflowexecutions/logs";
    debug("Next URL [" + endPoint + "]");
    var body=processMonitorBody();
    body.limit=reprocessCount;
    body.execution_status=["failed"];
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processListResponse,undefined,headers,true,false);  
}

function processSingleResubmission(a,b, invbid){
    dbg.message("<EXPERIMENTAL>Processing Resubmission [" + (a+1) + " of " + b + "] Action [" + startOrResume + "] VBID [" + invbid + "]",3);
    var endPoint = "https://" + domainName + "/enterprise/v1/tenant/account/billlogs/" + invbid;
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processSingleResubmissionResponse,undefined,headers,true,false);  
}


function getThePayload(invbid){
    dbg.message("<EXPERIMENTAL>" + invbid + ":Fetching Payload For Restart - VBID [" + invbid + "]",4);
    var endPoint = "https://" + domainName + "/enterprise/v1/payloads?bill_uid=" + invbid
    dbg.message("<EXPERIMENTAL>" +invbid + ":getThePayload Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processPayloadResponse,undefined,headers,true,false);  
}

function finishProcessSingleResubmission(invbid,inwfuid,inPayloaduid,projectuid,data)
{
    dbg.message("<EXPERIMENTAL>" +invbid + ":Actioning Resubmission Action [" + startOrResume + "] VBID [" + invbid + "]",4);
    var endPoint
    
    if (startOrResume == "resume") endPoint = "https://" + domainName + "/enterprise/v1/execute/" + inwfuid + "/resume";
    else endPoint = "https://" + domainName + "/enterprise/v1/execute/" + invbid + "/restart";
    
    dbg.message("<EXPERIMENTAL>" +invbid + ":Next URL [" + endPoint + "]",4);
    var headers = setHeaders();
    var body;
    if(startOrResume=="resume"){ 
        body = {"bill_uid":invbid,"__is_checkpoint_run__":true,"payload_uid":inPayloaduid,"checkpointLogs":[]};
    }
    else{
       body={"payload": {data,"type":type,"bill_uid":invbid,"flow_uid":inwfuid,"tenant_uid":uid,"uid":inPayloaduid}};
    }

    rest.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processFinalSingleResubmissionResponse,undefined,headers,true,false);  
}

function processPayloadResponse(url,err,body,res){
    if(res.statusCode==200)
    {
        data={};
        dbg.message("<EXPERIMENTAL>Processing Payload Response",4);
        dbg.message("<EXPERIMENTAL>URL" + url,4);
        if(body)dbg.message("<EXPERIMENTAL>JSON RESP\n" + JSON.stringify(body),4);
        if(res) dbg.message("<EXPERIMENTAL>RES\n" + JSON.stringify(res),4);
        if(body.output.length==1 && body.output[0].data){
            data = body.output[0].data;
        }
        else {
            dbg.message("<EXPERIMENTAL>Found no payload response",4);
            if(body!=null)dbg.message(JSON.stringify(body),4);
        }

        if(body.output.length==1 && body.output[0].type)
        {
            type = body.output[0].type;
            if(body)dbg.message("<EXPERIMENTAL>Payload Resp: " + JSON.stringify(body),4);
            finishProcessSingleResubmission(vbid,flowuid,payloaduid,projectuid,data);
        }
        else{
            if(body!=null)dbg.message(JSON.stringify(body),2);
            dbg.message("<EXPERIMENTAL>Unable to determine type",2);
        }

        
    }
    else
    {
        dbg.message("<EXPERIMENTAL>Failed to " + "restart" + " entry",1)
        if(body!=null)dbg.message(JSON.stringify(body),1);
        if(err!=null)dbg.message(JSON.stringify(err),1);
        process.exit(99);
    }
}


function processFinalSingleResubmissionResponse(url,err,body,res){
    if(body!=null)dbg.message("<EXPERIMENTAL> Submission Resp:" + JSON.stringify(body),4);
    if(res.statusCode==200)
    {
        var respvbid,respstatus;
        if(body.output.run){
            respvbid = body.output.run.bill_uid
            respstatus = body.output.run.status
        }
        else{
            respvbid = body.output.bill_uid;
            respstatus = body.output.status;
        }
        
        dbg.message("<EXPERIMENTAL>Processed VBID: " + respvbid + " - New Status [" + respstatus + "]",3);
    }
    else
    {
        dbg.message("<EXPERIMENTAL>Failed to " + startOrResume + " Monitor item",1)
        if(body!=null)dbg.message("<EXPERIMENTAL>" + JSON.stringify(body),1);
        if(err!=null)dbg.message("<EXPERIMENTAL>"+ JSON.stringify(err),1);
        process.exit(99);
    }
}

function processSingleResubmissionResponse(url,err,body,res){
    if(res.statusCode==200)
    {
        if(body.output.uid)
        {
            dbg.message("<EXPERIMENTAL>"+"Found Monitor Entry - VBID[" + body.output.uid +"]",4);
            dbg.message("<EXPERIMENTAL>"+"Flow UID     [" + body.output.flow_uid + "]",4);
            dbg.message("<EXPERIMENTAL>"+"Payload UID  [" + body.output.payload_uid + "]",4);
            dbg.message("<EXPERIMENTAL>"+"Project_UID  [" + body.output.project_uid + "]",4);
            dbg.message("<EXPERIMENTAL>"+"Flow Name    [" + body.output.flow_name + "]",4);
            dbg.message("<EXPERIMENTAL>"+"Stop time    [" + body.output.stop_time + "]",4);
            dbg.message("<EXPERIMENTAL>"+"Restarted    [" + body.output.restarted + "]",4)
            dbg.message("<EXPERIMENTAL>"+"Manual Run    [" + body.output.manual_run + "]",4)
            dbg.message("<EXPERIMENTAL>"+"hide_resume    [" + body.output.hide_resume + "]",4)
            dbg.message("<EXPERIMENTAL>"+"JSON RESPONSE\n" + JSON.stringify(body) + "\n",4);

            

 
            vbid = body.output.uid;
            flowuid = body.output.flow_uid;
            payloaduid = body.output.payload_uid;
            projectuid = body.output.project_uid;


            if(startOrResume.indexOf("restart")==0){
                debug("In restart procedure");
                if(body.output.manual_run == true){
                    dbg.message("<EXPERIMENTAL>"+ "Skipped [" + body.output.uid + "]. Restart Not Available",2);
                }
                else {
                    if(startOrResume=="restart-all"){
                        debug("is a restart all)");
                        if(body.output.restarted==true)dbg.message("<EXPERIMENTAL>"+ "Restarting [" + body.output.uid + "] when this has been done previously.",2);
                        getThePayload(body.output.uid);
                    }
                    else{
                        debug("is a normal restart)");
                        if(body.output.restarted != true){
                            dbg.message("<EXPERIMENTAL>"+ "Restarting [" + body.output.uid + "]",4);
                            getThePayload(body.output.uid);
                        }
                        else{
                            dbg.message("<EXPERIMENTAL>"+ "Skipped [" + body.output.uid + "]. Has been restarted previously. Use restart-all as the option if you need to restart this",2);
                        }
                    }
                }
            }
            
            if(startOrResume=="resume"){
                if(body.output.hide_resume == false){
                    dbg.message("<EXPERIMENTAL>"+ "Resuming [" + body.output.uid + "]",4);
                    finishProcessSingleResubmission(body.output.uid,body.output.flow_uid,body.output.payload_uid,body.output.project_uid); 
                }
                else
                {
                    dbg.message("<EXPERIMENTAL>"+ "Skipped [" + body.output.uid + "]. Resume is not available",4);
                }

            } 
        }
        else{

            dbg.message("<EXPERIMENTAL>"+ "Not able to find monitor entry",1);
        }
    }
    else
    {
        dbg.message("<EXPERIMENTAL>"+"Failed to get Monitor entry",1)
        dbg.message(JSON.stringify(body),1);
        process.exit(99);
    }
}



function processListResponse(url,err,body,res){
    if(res.statusCode==200)
    {
        resubmitExecutions = maxRunningWorkflows;
        //... do something next      
        if(body.output.count==0)
        {
            dbg.message("<EXPERIMENTAL>"+"No Workflows To Resubmit",3);
            process.exit(0);
        }
        else{

            dbg.message("<EXPERIMENTAL>"+"Workflow Instances To Resubmit [" + body.output.logs.length + " of " + body.output.count + "]",3);
            for(var i=0;i<body.output.logs.length;i++)
            {
                processSingleResubmission(i,body.output.logs.length,body.output.logs[i].uid);
            }
           
        }
    }
    else
    {
        dbg.message("<EXPERIMENTAL>"+"Failed to get Running Workflows",1)
        if(body!=null)dbg.message(JSON.stringify(body),1);
        if(err!=null)dbg.message(JSON.stringify(err),2);
        process.exit(99);
    }
}

function processRunningResponse(url,err,body,res){
    if(res.statusCode==200){
        //... do something next      
        if(body.output.count==0){
            dbg.message("<EXPERIMENTAL>"+"No Workflows Running",3)
            dbg.message("<EXPERIMENTAL>"+"Can Resubmit [" + (maxRunningWorkflows - body.output.count) + "] executions",3);
        }
        else{
            dbg.message("<EXPERIMENTAL>"+"Workflows Running [" +body.output.count + "]",3)
            if(body.output.count<maxRunningWorkflows){
                dbg.message("<EXPERIMENTAL>"+"Can Resubmit [" + (maxRunningWorkflows - body.output.count) + "] executions",3);
            }
            else{
                dbg.message("<EXPERIMENTAL>"+"Maximum Workflow Executions Currently in progress - exiting",2);
                process.exit(0);
            }
        }
        processResubmissions(100, maxRunningWorkflows - body.output.count);
    }
    else{
        dbg.message("<EXPERIMENTAL>"+"Failed to get Running Workflows",1)
        if(body!=null)dbg.message(JSON.stringify(body),1);
        if(err!=null)dbg.message(JSON.stringify(err),2);
        process.exit(99);
    }
}

function doMessagingCreate()
{
    debug("Messaging Item Creation")
    var endPoint = "https://" +domainName + "/integration/rest/messaging/admin/destinations?projectName=" + projectId + "&type=" + queueOrTopic;
    debug("Next URL [" + endPoint + "]");
    var body;
    if(queueOrTopic=="queue")body={"queueName":messagingName};
    else if (queueOrTopic=="topic")body={"topicName":messagingName}
    else dbg.message("<EXPERIMENTAL>"+"Please provide either 'queue' or 'topic'",1);
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processResponse,undefined,headers,true,false);  
}

function doMessagingDelete()
{
    debug("Messaging Item Deletion")
    var endPoint = "https://" +domainName + "/integration/rest/messaging/admin/destinations/" + messagingName + "?projectName=" + projectId + "&type=" + queueOrTopic;
    debug("Next URL [" + endPoint + "]");
    var body;
    if(queueOrTopic=="queue")body={"queueName":messagingName};
    else if (queueOrTopic=="topic")body={"topicName":messagingName}
    else dbg.message("<EXPERIMENTAL>"+"Please provide either 'queue' or 'topic'",1);
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,60,body,undefined,"DELETE",processResponse,undefined,headers,true,false);  
    //rest.del(endPoint,undefined,undefined,timeout,undefined,processResponse);
}

function getMessagingStats()
{
    debug("Messaging Stats");
    var endPoint = "https://" +domainName + "/integration/rest/messaging/runtime/destinations/"+messagingName+"/metrics?projectName=" + projectId ;
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    var body;
    rest.custom(endPoint,undefined,undefined,timeout,body,undefined,"GET",processResponse,undefined,headers,true,false);  
}

function getLogs()
{
    debugMonitorInfo();
    var endPoint = "https://" + domainName + "/enterprise/v1/metrics/workflowexecutions/logs";
    debug("Next URL [" + endPoint + "]");
    var body=processMonitorBody();
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processResponse,undefined,headers,true,false);  
}


function searchProjectsByName()
{
    dbg.message("<EXPERIMENTAL>"+"Search Projects By Name [" + projectName + "]",4);
    var endPoint = "https://" + domainName + "/enterprise/v1/projects?limit=1000&skip=0&q=" + projectName;
    dbg.message("<EXPERIMENTAL>"+"Next URL [" + endPoint + "]",4);
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,undefined,headers,true,false);  
}

function getProjectDeployments()
{
    dbg.message("<EXPERIMENTAL>"+"Executing Project Deployments call",4);
    var endPoint = "https://" + domainName + "/enterprise/v1/deployments";
    dbg.message("<EXPERIMENTAL>"+"Next URL [" + endPoint + "]",4);
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,undefined,headers,true,false);   
}

function stageInfo()
{
    debug("Stage Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/stages?allRegion=false";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,undefined,headers,true,false);   
}

function getProjectAccountConfigInfo()
{
    debug("Project Account Config Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/configdata";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,undefined,headers,true,false);  
}


function usedConnectorAccountsInfo()
{
    debug("Used Connectors Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/user/auths";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,undefined,headers,true,false);  
}

function projectWorkflowsInfo()
{

    debug("Project Workflows Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/flows?limit=1000&skip=0&filter=recent&tags=&query=";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processProjectsResponse,undefined,headers,true,false);   
}

function projectFlowServicesInfo()
{

    debug("Project FlowServices Info");
    var endPoint = "https://" + domainName + "/integration/rest/ut-flow/flow-metadata/" + projectId + "?skip=0&limit=1000";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,undefined,headers,true,false);   
}


function execUserInfo()
{
    debug("<EXPERIMENTAL>"+"Exec User Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/user";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,undefined,headers,true,false);   
}

/** Logs in via Software AG Cloud! */
function loginPhase1()
{    
    debug("LOGIN Phase 1")
    var endPoint = url + "/integration/sagcloud/";
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",loginResponse,undefined,undefined,true,false);
    
}

function loginPhase2()
{   
    debug("LOGIN Phase 2")
    var endPoint = nextUrl;
    debug("Next URL [" + endPoint + "]");
    formUrl = endPoint;
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",loginResponse,undefined,undefined,true,false);   
}

function loginPhase3()
{
    debug("LOGIN Phase 3")
    var endPoint = nextUrl;
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"Referer",value:formUrl},
        {name:"content-type",value:"application/x-www-form-urlencoded"},
        {name:"Accept",value:"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"},
    ];
    var form = [{name:"username",value:username},
                {name:"password",value:password}];
    
    rest.custom(endPoint,undefined,undefined,timeout,undefined,form,"POST",loginResponse,undefined,undefined,true,false);
}

function loginRedirectPhase(inId)
{
    debug("LOGIN (Redirect) Phase " + inId);
    var endPoint = nextUrl;
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"Accept",value:"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"},
    ];
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",loginResponse,undefined,undefined,true,false);   
}

function loginUserPhase(inId)
{
    debug("LOGIN (USER) Phase " + inId);
    var endPoint = "https://" + domainName + "/enterprise/v1/user";
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"authtoken",value:authtoken},
        {name:"accept",value:"application/json"},
    ];
    rest.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processUserResponse,undefined,headers,true,false);   
}

function checkResponse(res,body)
{
    debug("Response Status Code =" + res.statusCode);
    if(res.statusCode == 302){
        nextUrl = res.headers.location;
        debug("Redirect URL [" + nextUrl + "]");
    }

    if(res.statusCode == 200){
        debug(body);
    }

    if(res.statusCode == 400 || res.statusCode == 404 || res.statusCode == 500 || res.statusCode == 502 || res.statusCode == 403 || res.statusCode == 401)
    {
        dbg.message("Failed to login via Software AG Cloud - exiting",4)
        dbg.message(res,4);   
        process.exit(99);
    }
}

function checkPhase3Response(res,body)
{
    debug("Response Status Code =" + res.statusCode);
    if(res.statusCode == 302){
        nextUrl = res.headers.location;
        debug("Redirect URL [" + nextUrl + "]");
    }

    if(res.statusCode == 200){
        //debug(body);
        //find <span class="kc-feedback-text"> .... </span>
        //extract the error and return error message
        err = body.split('<span class="kc-feedback-text">')[1];
        err = err.split('</span>')[0];

        error ={}
        error.message = err;
        dbg.message("Failed to login via Software AG Cloud [" + err + "] - exiting",4)
        dbg.message(JSON.stringify(error),4);
        
        process.exit(401);
    }

    if(res.statusCode == 400 || res.statusCode == 404 || res.statusCode == 500 || res.statusCode == 502 || res.statusCode == 403 || res.statusCode == 401)
    {
        dbg.message("Failed to login via Software AG Cloud - exiting",4)
        dbg.message(res,4);   
        process.exit(99);
    }
}


function processProjectsResponse(url,err,body,res){

    if(res.statusCode==200)
    {
        var output = {};
        output.workflows=[];
    
        for(var i=0;i<body.output.objects.length;i++)
        {
            var workflow={};
            workflow.uid = body.output.objects[i].uid;
            workflow.sid = body.output.objects[i].sid;
            workflow.createdAt = body.output.objects[i].created_at;
            workflow.updatedAt = body.output.objects[i].updated_at;
            workflow.name = body.output.objects[i].name;
            workflow.description = body.output.objects[i].description;
            workflow.active = body.output.objects[i].active;
            workflow.total_run_count = body.output.objects[i].total_run_count;
            output.workflows.push(workflow);     
        }

        
        if(prettyprint==true){
            dbg.message(JSON.stringify(output,null,4),-1);
        }
        else{
            dbg.message((JSON.stringify(output)),-1);
        }        
    }
    else
    {
        dbg.message("Failed to login via Software AG Cloud - exiting",4)
        process.exit(99);
    }
}

function processResponse(url,err,body,res){
    if(res.statusCode==200)
    {
        if(prettyprint==true){
            dbg.message(JSON.stringify(body,null,4),-1);
        }
        else{
            dbg.message((JSON.stringify(body)),-1);
        }        
    }
    else
    {
        dbg.message("Failed to login via Software AG Cloud - exiting",4)
        process.exit(99);
    }
}

function processUserResponse(url,err,body,res){
    if(res.statusCode==200)
    {
        csrf = body.output.csrf;        
    }
    else
    {
        debug("Failed to login via Software AG Cloud - exiting")
        process.exit(99);
    }

    //Now run the final call
    dbg.message("<EXPERIMENTAL>Logged in",3);
    if(finalCall!==undefined)finalCall();
    else dbg.message("No final call set",4);
    
}

function loginResponse(url,err,body,res){
    loginStageCounter++;
    var nextCall = undefined;
    //Preseve any cookies
    cookies = res.headers["set-cookie"];
    if(cookies!==undefined && cookies!==null && cookies.length>0)
    {
        for(var i=0;i<cookies.length;i++){
            debug("Adding Cookie to Jar [" + cookies[i] + "] domain [" + "https://" + domainName + "/]");
            rest.addCookieToJar(cookies[i],"https://" + domainName +"/");
        }
    }

    rest.displayCookies();

    //Check on origin to determine action
    var origin = domainName + "/integration/sagcloud/";
    debug("Origin was [" + origin + "]");
    debug("On stage: " +loginStageCounter );
    switch(loginStageCounter)
    {
        case 1:
            checkResponse(res,body);
            nextCall = loginPhase2();
            break;

        case 2:
            checkResponse(res,body);

            //Parse Next URL from HTML Form
            var str = body.split("<form id=\"kc-form-login\"")[1];
            str = str .split(">")[0];
            str = str.split("action=\"")[1];
            str = str.split("\"")[0];
            str = str.replace(/&amp;/g,"&");
            nextUrl = str;
            nextCall = loginPhase3();
            break;

        case 3:
            checkPhase3Response(res,body);
            nextCall = loginRedirectPhase(4);
            break;

        case 4:
            checkResponse(res,body);
            nextCall = loginRedirectPhase(5);
            break; 
        case 5:
            checkResponse(res,body);
            nextCall = loginRedirectPhase(6);
            break;    
        case 6:
            checkResponse(res,body);
            if(nextUrl.indexOf('/#/sso/success?')==0)
            {
                authtoken = nextUrl.split("?sid=")[1].split("&")[0];
                uid = nextUrl.split("&tenant_uid=")[1];
                debug("authtoken [" + authtoken +"]");
                debug("tenantuid [" + uid +"]");
                nextCall=loginUserPhase(7);
            }

    }



    //Invoke next call in chain
    if(nextCall!==undefined)
    {
        debug("Found target call... initiating");
        nextCall();
    }
    
}

module.exports = {init,user,stages,projectWorkflows,projectFlowservices,connectorAccounts,
    getProjectAccountConfig,searchProject,getMonitorInfo,workflowResubmit,
    projectDeployments,messagingCreate,messagingStats,messagingDelete};