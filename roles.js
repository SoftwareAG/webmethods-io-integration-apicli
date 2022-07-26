/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 * [roles.js] Project Roles APIs
 */

const request = require('./rest.js');

var domainName, username, password, timeout;
var prettyprint;
var url;

function checkForErrors(inBody) {
    //Error Codes
    //Any error response

}

function debug(message) {
    dbg.message("<ROLES> " + message);
}

function help() {
    return `
\x1b[4mRoles\x1b[0m

\x1b[32mGet roles list or individual role\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    role [role-name]

\x1b[32mCreates a role\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    role-create 'rolename' 'role description' 'project 1 name,r,w,e;project 2 name,r;'

\x1b[32mUpdates a role with a provided Id\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    role-update 'roleId' 'rolename' 'role description' 'project 1 name,r,w,e;project 2 name,r;'   

\x1b[32mDelete a role with a provided Id\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    role-delete 'roleId'
    
`;
}


function init(inDomainName, inUsername, inPassword, inTimeout, inPrettyprint) {
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;
    url = "https://" + domainName + "/apis/v1/rest";
    debug("Username [" + username + "]");
    debug("URL      [" + url + "]");
    debug("Timeout  [" + timeout + "]");
}

/**
 * Call back function to process REST response
 * @param {return data from REST request} data 
 * @param {status} status 
 */
function processResponse(data, status) {
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


function list(roleId) {
    debug("List [" + roleId + "]");
    url += "/roles";
    if (roleId) url += "/" + roleId
    request.get(url, username, password, timeout, processResponse);
}

function parseRoleListInput(rolesList) {
    debug("Parsing role List [" + rolesLists + "]");
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

function insert(name, description, projects) {
    debug("Insert [" + name + "]");
    url += "/roles";
    projects = parseRoleListInput(projects);
    var data = { "name": name, "description": description, projects };
    request.post(url, username, password, timeout, data, processResponse);
}

function update(roleId, name, description, projects) {
    debug("Update [" + roleId + "]");
    url += "/roles/" + roleId;
    projects = parseRoleListInput(projects);
    var data = { "name": name, "description": description, projects };
    request.put(url, username, password, timeout, data, processResponse);
}

function del(roleId) {
    debug("Delte [" + roleId + "]");
    url += "/roles/" + roleId;
    request.del(url, username, password, timeout, undefined, processResponse);
}

module.exports = {help, init, list, insert, update, del };
