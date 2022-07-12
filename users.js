/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 * [users.js] Users APIs
 */

const request = require('./rest.js');
const dbg = require('./debug.js');

var domainName, username,password,timeout;
var prettyprint;
var url;

function checkForErrors(inBody)
{
    //Error Codes
    //Any error response
    
}

function debug(message){
    dbg.message("<USERS> " + message);
}


function init(inDomainName, inUsername, inPassword,inTimeout,inPrettyprint){
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;
    url = "https://" + domainName + "/apis/v1/rest";
    //console.log("Username [" + username + "]");
    //console.log("URL      [" + url + "]");
    //console.log("Timeout  [" + timeout + "]");
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


function list(userId){
    url+="/users";
    if(userId)url+="/" + userId
    debug("USERS URL: " + url);
    request.get(url,username,password,timeout,processResponse);
}

function parseRoleListInput(rolesList) {
    var arr = rolesList.split(";");
    var jsonStr = '[';
    for (var rolesCount = 0; rolesCount < arr.length; rolesCount++) {
        var roleDetail = arr[rolesCount].split(",");
        jsonStr += '{"' + roleDetail[0] + '": [';
        for (var permsCount = 1; permsCount < roleDetail.length; permsCount++) {
            jsonStr += '"' + roleDetail[permsCount] + '"';
            if (permsCount < roleDetail.length - 1)
                jsonStr += ",";
        }
        jsonStr += "]}";
        if (rolesCount < arr.length - 1)
            jsonStr += ",";
    }
    jsonStr += "]";
    var projects = JSON.parse(jsonStr);
    return projects;
}

function assignRoles(userid, roles){
    url += "/assign-roles";
    debug("URL is [" + url + "]");
    roles = roles.split(",");
    data={"username":userid,roles};
    console.log(data);
    request.put(url,username,password,timeout,data,processResponse);
}

module.exports = { init, list, assignRoles };
