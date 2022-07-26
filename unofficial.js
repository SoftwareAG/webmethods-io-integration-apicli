/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

// ------------------------------------------------------------------------------
//  PLEASE NOTE - These functions are NOT provided by NON public APIs, and
//  therefore unsupported - use these at your own risk!
// ------------------------------------------------------------------------------

const request = require('request');
const rest = require('./rest.js');
const fs = require('fs');


var domainName, username,password,timeout;
var prettyprint = false;
var url;

var authtoken="";
var uid="";
var csrf="";
var projectId;
var nextUrl,formUrl;
var finalCall;
var loginStageCounter = 0;

function debug(message){
    dbg.message("<UNOFFICIAL> " + message);
}

function init(inDomainName, inUsername, inPassword,inTimeout,inPrettyprint){
    
    dbg.message("UNSUPPORTED APIs - USE THESE AT YOUR OWN RISK");
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;
    url = "https://" + domainName;
    dbg.message("Username [" + username + "]");
    dbg.message("URL      [" + url + "]");
    dbg.message("Timeout  [" + timeout + "]");
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


function stageInfo()
{
    debug("Stage Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/stages?allRegion=false";
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"authtoken",value:authtoken},
        {name:"accept",value:"application/json"},
        {name:"x-csrf-token",value:csrf},
    ];
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",processResponse,undefined,headers,true,false);   
}

function getProjectAccountConfigInfo()
{
    debug("PRojet Account Config Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/configdata";
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"authtoken",value:authtoken},
        {name:"accept",value:"application/json"},
        {name:"project_uid",value:projectId},
        {name:"x-csrf-token",value:csrf},
    ];
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",processResponse,undefined,headers,true,false);  
}


function usedConnectorAccountsInfo()
{
    debug("Used Connectors Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/user/auths";
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"authtoken",value:authtoken},
        {name:"accept",value:"application/json"},
        {name:"project_uid",value:projectId},
        {name:"x-csrf-token",value:csrf},
    ];
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",processResponse,undefined,headers,true,false);  
}

function projectWorkflowsInfo()
{

    debug("Project Workflows Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/flows?limit=1000&skip=0&filter=recent&tags=&query=";
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"authtoken",value:authtoken},
        {name:"accept",value:"application/json"},
        {name:"project_uid",value:projectId},
        {name:"x-csrf-token",value:csrf},
    ];
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",processProjectsResponse,undefined,headers,true,false);   
}

function projectFlowServicesInfo()
{

    debug("Project FlowServices Info");
    var endPoint = "https://" + domainName + "/integration/rest/ut-flow/flow-metadata/" + projectId + "?skip=0&limit=1000";
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"authtoken",value:authtoken},
        {name:"accept",value:"application/json"},
        {name:"project_uid",value:projectId},
        {name:"x-csrf-token",value:csrf},
    ];
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",processResponse,undefined,headers,true,false);   
}


function execUserInfo()
{
    debug("Exec User Info");
    var endPoint = "https://" + domainName + "/enterprise/v1/user";
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"authtoken",value:authtoken},
        {name:"accept",value:"application/json"},
    ];
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",processResponse,undefined,headers,true,false);   
}

/** Logs in via Software AG Cloud! */
function loginPhase1()
{    
    debug("LOGIN Phase 1")
    var endPoint = url + "/integration/sagcloud/";
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",loginResponse,undefined,undefined,true,false);
    
}

function loginPhase2()
{   
    debug("LOGIN Phase 2")
    var endPoint = nextUrl;
    debug("Next URL [" + endPoint + "]");
    formUrl = endPoint;
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",loginResponse,undefined,undefined,true,false);   
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
    
    rest.custom(endPoint,undefined,undefined,60,undefined,form,"POST",loginResponse,undefined,undefined,true,false);
}

function loginRedirectPhase(inId)
{
    debug("LOGIN (Redirect) Phase " + inId);
    var endPoint = nextUrl;
    debug("Next URL [" + endPoint + "]");

    var headers = [
        {name:"Accept",value:"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"},
    ];
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",loginResponse,undefined,undefined,true,false);   
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
    rest.custom(endPoint,undefined,undefined,60,undefined,undefined,"GET",processUserResponse,undefined,headers,true,false);   
}

function checkResponse(res,body)
{
    debug("Response Status Code =" + res.statusCode);
    if(res.statusCode == 302){
        nextUrl = res.headers.location;
        debug("Redirect URL [" + nextUrl + "]");
    }

    if(res.statusCode == 200){
        //debug(body);
    }

    if(res.statusCode == 400 || res.statusCode == 404 || res.statusCode == 500 || res.statusCode == 502 || res.statusCode == 403 || res.statusCode == 401)
    {
        debug("Failed to login via Software AG Cloud - exiting")
        console.log(res);   
        process.exit(99);
    }

}

function processProjectsResponse(url,err,body,res){
    //console.log(body);

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
            console.log(JSON.stringify(output,null,4));
        }
        else{
            console.log(JSON.stringify(output));
        }        
    }
    else
    {
        debug("Failed to login via Software AG Cloud - exiting")
        process.exit(99);
    }
}

function processResponse(url,err,body,res){
    //console.log(body);
    if(res.statusCode==200)
    {
        if(prettyprint==true){
            console.log(JSON.stringify(body,null,4));
        }
        else{
            console.log(JSON.stringify(body));
        }        
    }
    else
    {
        debug("Failed to login via Software AG Cloud - exiting")
        process.exit(99);
    }
}

function processUserResponse(url,err,body,res){
    //console.log(body);
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
    if(finalCall!==undefined)finalCall();
    else debug("No final call set");
    
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
            checkResponse(res,body);
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
    if(nextCall!==undefined)nextCall();

    
}


module.exports = {init,user,stages,projectWorkflows,projectFlowservices,connectorAccounts,getProjectAccountConfig};