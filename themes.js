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
    dbg.message("<THEMES> " + message);
}


function checkForErrors(inBody)
{
    //Error Codes
    //Any error response
    
}

function init(inDomainName, inUsername, inPassword,inTimeout,inPrettyprint){
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;
    url = "https://" + domainName + "/apis/v1/rest/themes";
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

function list(themeUid){
    debug("List themeUid["+ themeUid + "]")
    if(themeUid)url+="/" + themeUid;
    request.get(url,username,password,timeout,processResponse);
}

function create(themeName,themeDescription,theme,footerContent,aboutPageContent){
    debug("Create Name [" + themeName + "] Desc [" + themeDescription + "]");
    debug("Theme [" + theme + "]");
    debug("Footer [" + footerContent + "]");
    debug("About Page [" + aboutPageContent + "]");
    themeObj = JSON.parse(theme);
    var footer;
    var about;
    
    //If footer is not specified get it from the theme
    if(footerContent!==undefined && footerContent !==null)footer=footerContent
    else footer = themeObj.footerContent;
    
    //If about is not specified get it from the theme
    if(aboutPageContent!==undefined && aboutPageContent !==null)about=aboutPageContent
    else about = themeObj.aboutPageContent;

    //Remove footer/about page from the theme
    themeObj.footerContent = undefined;
    themeObj.aboutPageContent = undefined;

    //Remove default favIcon - causes issues
    if(themeObj.favIconFileName=="default-favicon.svg")
    {
        themeObj.favIconFileName=undefined;
        themeObj.favIconImage=undefined;
    }

    theme = JSON.stringify(themeObj);
    
    var jsonStr = "{";
    jsonStr+='"name":' + '"' + themeName + '",';
    jsonStr+='"description":' + '"' + themeDescription + '",';
    jsonStr+='"theme":' + theme;
    jsonStr+= ',';
    jsonStr+='"footerContent":' + '"' + footerContent + '",';
    jsonStr+='"aboutPageContent":' + '"' + aboutPageContent + '"';
    jsonStr+="}";
    data = JSON.parse(jsonStr);
    request.post(url,username,password,timeout,data,processResponse);
}

function update(themeUid, themeName,themeDescription,theme,footerContent,aboutPageContent){
    debug("Update Theme UID [" + themeUid + "]");
    url += "/" + themeUid;

    themeObj = JSON.parse(theme);
    var footer;
    var about;
    
    //If footer is not specified get it from the theme
    if(footerContent!==undefined && footerContent !==null)footer=footerContent
    else footer = themeObj.footerContent;
    
    //If about is not specified get it from the theme
    if(aboutPageContent!==undefined && aboutPageContent !==null)about=aboutPageContent
    else about = themeObj.aboutPageContent;

    //Remove footer/about page from the theme
    themeObj.footerContent = undefined;
    themeObj.aboutPageContent = undefined;

    //Remove default favIcon - causes issues
    if(themeObj.favIconFileName=="default-favicon.svg")
    {
        themeObj.favIconFileName=undefined;
        themeObj.favIconImage=undefined;
    }

    theme = JSON.stringify(themeObj);
    
    var jsonStr = "{";
    jsonStr+='"name":' + '"' + themeName + '",';
    jsonStr+='"description":' + '"' + themeDescription + '",';
    jsonStr+='"theme":' + theme;
    jsonStr+= ',';
    jsonStr+='"footerContent":' + '"' + footerContent + '",';
    jsonStr+='"aboutPageContent":' + '"' + aboutPageContent + '"';
    jsonStr+="}";
    data = JSON.parse(jsonStr);
    request.put(url,username,password,timeout,data,processResponse);
}

function del(themeUid){
    debug("Delete Theme UID [" + themeUid + "]");
    url += "/" + themeUid;
    var data={};
    request.httpDelete(url,username,password,timeout,data,processResponse);
}

function activate(themeUid){
    debug("Activate Theme UID [" + themeUid + "]");
    url += "/" + themeUid + "/activate";
    var data={};
    request.put(url,username,password,timeout,data,processResponse);
}

function deactivate(themeUid){
    debug("Deactivate Theme UID [" + themeUid + "]");
    url += "/" + themeUid + "/deactivate";
    var data={};
    request.put(url,username,password,timeout,data,processResponse);
}

//, update, del, default, activate, deactivate
module.exports = {init, list, create,update,del,activate,deactivate};
