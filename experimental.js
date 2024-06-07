/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

// ------------------------------------------------------------------------------
//  PLEASE NOTE - These functions are provided by NON public APIs, and
//  therefore unsupported - use these at your own risk!
// ------------------------------------------------------------------------------

const rest_fetch = require("./rest-fetch.js");
const crypto = require ('crypto');
const { info } = require("console");

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
var subscriberName;
var subscriberState;
var nextUrl,formUrl;
var finalCall;
var loginStageCounter = 0;
var vbid;
var format;
var flowuid; 
var payloaduid; 
var projectuid;
var data;
var type;
var flowServiceId;
var scheduleStatus;
var optionEnable;
var flowOptionType;
var incEdgeFlows;


const maxRunningWorkflows = 20;

function help() {
    return `
\x1b[4mExperimental - Projects\x1b[0m

\x1b[32mGet recipe list or individual recipe\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    project [project name]

    `;
}


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


function flowserviceDetails(inProjectId,includeEdgeFlows)
{
    projectId = inProjectId;
    incEdgeFlows = includeEdgeFlows
    finalCall = processflowDetails;
    loginPhase1();
}

function processflowDetails()
{
    debug("Process FlowService Details - Project [" + projectId + "] Include Edge flows [" + incEdgeFlows + "]");
    var endPoint = "https://" +domainName + "/integration/rest/ut-flow/flow-metadata/" + projectId + "?limit=" + returnCount+ "&skip=" + returnStart;
    var body;
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"GET",processResponse,headers,true,false);  
}

function flowserviceOption(inFlowServiceId, inEnable, inProjectId,inOptionType)
{
    flowServiceId = inFlowServiceId;
    optionEnable = inEnable;
    projectId = inProjectId;
    flowOptionType = inOptionType;
    finalCall = processflowOption;
    loginPhase1();
}

function processflowOption()
{
    var headers = setHeaders();
    debug("Process FlowService Option [" + flowOptionType + "] - Project [" + projectId + "] FlowService [" + flowServiceId + "] Enable [" + optionEnable + "]");
    if(optionEnable!==undefined&&optionEnable!==null&optionEnable.length>1){
        optionEnable = (optionEnable.toLowerCase()=="true");
    }

    
    var endPoint = "https://" +domainName + "/integration/rest";
    var body={};
    if(flowOptionType=="http")
    {
        endPoint+= "/ut-flow/flow/export/" + flowServiceId +"?projectName="+ projectId ;
        body = {"integration":{"serviceData":{"stages":[{"stageName":"stage00","markExportable":optionEnable}]}}};

        debug("Next URL [" + endPoint + "]");
        rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"PUT",processResponse,headers,true,false);  

    }
    else if(flowOptionType=="resume")
    {
        endPoint += "/assembly/resubmit/HelloFlow?markResubmittable=" + optionEnable + "&projectName=" + projectId
        body = undefined
        rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"PUT",processResponse,headers,true,false);  
    }
    else if(flowOptionType=="restart"){

        endPoint += "/assembly/restart/HelloFlow?markRestartable=" + optionEnable + "&projectName=" + projectId
        body = undefined
        rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"PUT",processResponse,headers,true,false);  
    }
    else
    {
        console.log("Unable to determine flow option type: " + flowOptionType);
        process.exit(1);
    }

}


function flowserviceScheduler(inFlowServiceId, inScheduleStatus, inProjectId)
{
    flowServiceId = inFlowServiceId;
    scheduleStatus = inScheduleStatus;
    projectId = inProjectId;
    finalCall = processScheduleStatus;
    loginPhase1();
}

function processScheduleStatus()
{
    debug("Process FlowService Schedule Status - Project [" + projectId + "] FlowService [" + flowServiceId + "] Status [" + scheduleStatus + "]");

    var endPoint = "https://" +domainName + "/integration/rest/scheduler/"+ scheduleStatus +"/" + flowServiceId +"?projectName="+ projectId ;
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    var body;
    rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processResponse,headers,true,false);  
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

function messagingSubscriberEnable(inProjectId,inSubscriberName){
    messagingSubscriber(inProjectId,inSubscriberName,"ENABLED")
}

function messagingSubscriberDisable(inProjectId,inSubscriberName){
    messagingSubscriber(inProjectId,inSubscriberName,"DISABLED")
}

function messagingSubscriber(inProjectId,inSubscriberName,state){
    debug("Starting subscriber state change");
    projectId = inProjectId;
    subscriberName = inSubscriberName;
    subscriberState = state;
    finalCall = processSubscriberState;
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


function vbidAnalysis(inVbid, inFormat)
{
    vbid = inVbid
    format = inFormat;
    finalCall = getVbidAnalysis;
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
        {name:"x-csrf-token",value:csrf},        
    ];
    if(projectId!==undefined && projectId!==null && projectId.length>0)
    {
        headers.push({name:"Project_uid",value:projectId});
    }

    return headers;
}


function getVbidAnalysis()
{
    
    dbg.message("<EXPERIMENTAL>Getting VBID analysis [" + vbid + "]");
    var endPoint = "https://" + domainName + "/enterprise/v1/tenant/logs/" + vbid + "?field=created_at&direction=asc";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processVbidResponse,headers,true,false);  

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
    rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processRunningResponse,headers,true,false);  
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
    rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processListResponse,headers,true,false);  
}

function processSingleResubmission(a,b, invbid){
    dbg.message("<EXPERIMENTAL>Processing Resubmission [" + (a+1) + " of " + b + "] Action [" + startOrResume + "] VBID [" + invbid + "]",3);
    var endPoint = "https://" + domainName + "/enterprise/v1/tenant/account/billlogs/" + invbid;
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processSingleResubmissionResponse,headers,true,false);  
}


function getThePayload(invbid){
    dbg.message("<EXPERIMENTAL>" + invbid + ":Fetching Payload For Restart - VBID [" + invbid + "]",4);
    var endPoint = "https://" + domainName + "/enterprise/v1/payloads?bill_uid=" + invbid
    dbg.message("<EXPERIMENTAL>" +invbid + ":getThePayload Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processPayloadResponse,headers,true,false);  
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

    rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processFinalSingleResubmissionResponse,headers,true,false);  
}

function processPayloadResponse(url,err,body,res){
    if(res.status==200)
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
    if(res.status==200)
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



function logsToCSV(logsJson){

    var csv="ActivityId,ActivityLabel,ActivityType,Message,ActionDate,ElapsedMilliSeconds\n";
    var activityId, activityLabel,activityType, message, actype, actionDate, prevDate;
    var sep = ",";

    for(var i=0;i<logsJson.output.objects.length;i++){
        dbg.message("<EXPERIMENTAL>"+"CSV Conversion [" + i + "]",4);
        activityId = logsJson.output.objects[i].activity_id;        
        activityLabel = logsJson.output.objects[i].activity_label;
        activityType = logsJson.output.objects[i].type;
        message = logsJson.output.objects[i].message;
        actype = logsJson.output.objects[i].type;
        actionDate = logsJson.output.objects[i].updated_at;

        if(activityType=="input")message="##DATA##";
        if(activityType=="output")message="##DATA##";
        if(activityType=="bill"){
            message="##DATA##";
            activityId = "bill";
        }
        if(activityLabel=="Logger")message="##DATA##";
        if(activityLabel===undefined)activityLabel=actype;
        activityLabel = "\"" + activityLabel  + "\"";

        activitId = "\"" + activityId + "\"";
        
        
        csv += activityId + sep + activityLabel + sep + activityType + sep + message + sep + actionDate + sep;
        if(i>0)
        {
            dbg.message("<EXPERIMENTAL>"+"CSV Conversion Calculating delta",4);
            var dateObjPrev = new Date(prevDate);
            var dateObjCurr = new Date(actionDate);
            var res = dateObjCurr.getTime() - dateObjPrev.getTime();
            csv += res;
            
        }
        else
        {
            csv += 0;
        }
        csv += "\n";

        prevDate = actionDate;
    }
    return csv;

}

function processVbidResponse(url,err,body,res){
    if(res.status==200)
    {
        if(body.output.objects)
        {
            dbg.message("<EXPERIMENTAL>"+"Found Logs for - VBID",4);
            
            var outputFormat = format.toUpperCase();

            switch(outputFormat)
            {

                case "JSON":
                    dbg.message("<EXPERIMENTAL>"+"Outputting in JSON Format",4);
                    if(prettyprint==true){
                        dbg.message(JSON.stringify(body,null,4),-1);
                    }
                    else{
                        dbg.message((JSON.stringify(body)),-1);
                    }  
                    break;
                case "CSV":
                    dbg.message("<EXPERIMENTAL>"+"Outputting in CSV Format",4);
                    var csv = logsToCSV(body);
                    dbg.message(csv,-1);
                    break;

                default: 
                    dbg.message("<EXPERIMENTAL>" + "Please provide a valid format - either JSON or CSV");
                    break;
            }
            

            
        }
        else{

            dbg.message("<EXPERIMENTAL>"+ "Unable to find logs for VBID",1);
        }
    }
    else
    {
        dbg.message("<EXPERIMENTAL>"+"Failed to get logs for VBID",1)
        dbg.message(JSON.stringify(body),1);
        process.exit(99);
    }
}


function processSingleResubmissionResponse(url,err,body,res){
    if(res.status==200)
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
    if(res.status==200)
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
    if(res.status==200){
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
    rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processResponse,headers,true,false);  
}

function processSubscriberState()
{
    debug("Messaging Subscriber State Change: " + subscriberState);
    var endPoint = "https://" +domainName + "/integration/rest/messaging/subscribers/" + subscriberName + "?projectName=" + projectId + "&prop=state&value=" + subscriberState + "&force=false";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"PATCH",processResponse,headers,true,false);  
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
    rest_fetch.custom(endPoint,undefined,undefined,60,body,undefined,"DELETE",processResponse,headers,true,false);  
}

function getMessagingStats()
{
    debug("Messaging Stats");
    var endPoint = "https://" +domainName + "/integration/rest/messaging/runtime/destinations/"+messagingName+"/metrics?projectName=" + projectId ;
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    var body;
    rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"GET",processResponse,headers,true,false);  
}

function getLogs()
{
    debugMonitorInfo();
    var endPoint = "https://" + domainName + "/enterprise/v1/metrics/workflowexecutions/logs";
    debug("Next URL [" + endPoint + "]");
    var body=processMonitorBody();
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,body,undefined,"POST",processResponse,headers,true,false);  
}


function searchProjectsByName()
{
    dbg.message("<EXPERIMENTAL>"+"Search Projects By Name [" + projectName + "]",4);
    var endPoint = "https://" + domainName + "/enterprise/v1/projects?limit=" + returnCount+ "&skip=" + returnStart + "&q=" + projectName;
    dbg.message("<EXPERIMENTAL>"+"Next URL [" + endPoint + "]",4);
    var headers = setHeaders();

    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,headers,true,false);  
}

function getProjectDeployments()
{
    dbg.message("<EXPERIMENTAL>"+"Executing Project Deployments call",4);
    var endPoint = "https://" + domainName + "/enterprise/v1/deployments";
    dbg.message("<EXPERIMENTAL>"+"Next URL [" + endPoint + "]",4);
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,headers,true,false);   
}

function stageInfo()
{
    debug("Stage Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/stages?allRegion=false";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,headers,true,false);   
}

function getProjectAccountConfigInfo()
{
    debug("Project Account Config Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/configdata";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,headers,true,false);  
}


function usedConnectorAccountsInfo()
{
    debug("Used Connectors Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/user/auths";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,headers,true,false);  
}

function projectWorkflowsInfo()
{

    debug("Project Workflows Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/flows?limit=" + returnCount+ "&skip=" + returnStart + "&filter=recent&tags=&query=";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processProjectsResponse,headers,true,false);   
}

function projectFlowServicesInfo()
{

    debug("Project FlowServices Info");
    var endPoint = "https://" + domainName + "/integration/rest/ut-flow/flow-metadata/" + projectId + "?limit=" + returnCount+ "&skip=" + returnStart;
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,headers,true,false);   
}


function execUserInfo()
{
    debug("<EXPERIMENTAL>"+"Exec User Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/user";
    debug("Next URL [" + endPoint + "]");
    var headers = setHeaders();
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processResponse,headers,true,false);   
}

/** Logs in via Software AG Cloud! */
function loginPhase1()
{    
    debug("LOGIN Phase 1")
    var endPoint = url + "/integration/sagcloud/";
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",loginResponse,undefined,true,false);
    
}

function loginPhase2()
{   
    debug("LOGIN Phase 2")
    var endPoint = nextUrl;
    debug("Next URL [" + endPoint + "]");
    formUrl = endPoint;
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",loginResponse,undefined,false,false);   
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
    //var form = {username: username, password: password};
    var form = [{
            "name": "username",
            "value": username
        },
        {
            "name": "password",
            "value": password
        }]

    

    //form.username = username;
    //form.password = password;
    
    //console.log(form);
    //var form = 
    // [{name:"username",value:username},
    //            {name:"password",value:password}];
    
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,form,"POST",loginResponse,headers,true,false);
}

function loginRedirectPhase(inId)
{
    debug("LOGIN (Redirect) Phase " + inId);
    var endPoint = nextUrl;
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"Accept",value:"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"},
    ];
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",loginResponse,undefined,true,false);   
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
    rest_fetch.custom(endPoint,undefined,undefined,timeout,undefined,undefined,"GET",processUserResponse,headers,true,false);   
}

function checkResponse(res,body)
{
    debug("Response Status Code =" + res.status);
    if(res.status == 302){
        //nextUrl = res.headers.location;
        nextUrl = res.headers.raw()['location'];
        debug("Redirect URL [" + nextUrl + "]");
        return;
    }

    if(res.status == 200){
        debug(body);
        return;
    }

    if(res.status == 400 || res.status == 404 || res.status == 500 || res.status == 502 || res.status == 403 || res.status == 401)
    {
        dbg.message("Failed to login via Software AG Cloud - exiting",4)
        dbg.message(res,4);   
        process.exit(99);
    }
}

function checkPhase3Response(res,body)
{
    debug("Response Status Code =" + res.status);
    if(res.status == 302){
        nextUrl = res.headers.raw()['location'];
        debug("Redirect URL [" + nextUrl + "]");
    }

    if(res.status == 200){
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

    if(res.status == 400 || res.status == 404 || res.status == 500 || res.status == 502 || res.status == 403 || res.status == 401)
    {
        dbg.message("Failed to login via Software AG Cloud - exiting",4)
        dbg.message(res,4);   
        process.exit(99);
    }
}


function processProjectsResponse(url,err,body,res){

    if(res.status==200)
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
    if(res.status==200)
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
        //dbg.message("Failed to login via Software AG Cloud - exiting",4)
        if(body!==null)dbg.message((JSON.stringify(body)),-1);
        else dbg.message("Failed to login via Software AG Cloud - exiting",4)
        process.exit(99);
    }
}

function processUserResponse(url,err,body,res){
    if(res.status==200)
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
    rest_fetch.addAllCookies(res,domainName);

    //Check on origin to determine action
    var origin = domainName + "/integration/sagcloud/";
    debug("Origin was [" + origin + "]");
    debug("On stage: " +loginStageCounter );
    switch(loginStageCounter)
    {
        case 1:
            debug("Phase 1");
            checkResponse(res,body);
            nextCall = loginPhase2();
            break;

        case 2:
            debug("Phase 2");
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
            debug("Phase 3");
            checkPhase3Response(res,body);
            nextCall = loginRedirectPhase(4);
            break;

        case 4:
            debug("Phase 4");
            checkResponse(res,body);
            nextCall = loginRedirectPhase(5);
            break; 
        case 5:
            debug("Phase 5");
            checkResponse(res,body);
            nextCall = loginRedirectPhase(6);
            break;    
        case 6:
            debug("Phase 6");
            checkResponse(res,body);
            debug("checked response - processing nextUrl");
            var workOn = nextUrl.toString();
            debug("Next URL is: [" + workOn + "]");
            debug(workOn.indexOf('/#/sso/success'));        
            if(workOn.indexOf('/#/sso/success')==0)
            {
                debug("Getting Authtoken details");
                authtoken = workOn.split("?sid=")[1].split("&")[0];
                uid = workOn.split("&tenant_uid=")[1];
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




module.exports = {init, help,
    user,stages,
    searchProject,
    projectDeployments,
    projectWorkflows,projectFlowservices,
    connectorAccounts,getProjectAccountConfig,
    getMonitorInfo,workflowResubmit,
    messagingCreate,messagingStats,messagingDelete, messagingSubscriber,
    vbidAnalysis, flowserviceScheduler,flowserviceOption,flowserviceDetails};
    