/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const { user } = require('./experimental.js');
const rest = require('./rest-fetch.js');
const sync_rest = require('./sync-rest-fetch.js');

var domainName, username, password, timeout, prettyprint;
var url;
var bearerToken;

function debug(message) {
    dbg.message("<IDM> " + message,4);
}
function help() {
    return `
\x1b[4mwebMethods Cloud IDM\x1b[0m

\x1b[32mProvides an IDM authtoken for subsequent calls\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    idm-authtoken

\x1b[32mGets an IDM users details\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    idm-user <username>

\x1b[32mFinds users that match the search criteria\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    idm-user-search <query> <include roles - true|false> <product>
    where product is one of: apigateway, apiportal, webmethodsioint, b2b, 
    cumulocity, cloudcontainer, devportal, mft, metering, wmapps
    e.g.
    idm-user-search Dave true webmethodsioint

\x1b[32mCounts users that match the search criteria\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    idm-user-count <query>
    where query can be a partial username, e.g.
    idm-user-count dave

\x1b[32mLists environment available roles\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    idm-roles

\x1b[32mGets user role mappings for the given userid\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    idm-user-role-mappings <userid>
    where userid is the unique ID returned from the idm-user call

\x1b[32mCreates a user\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    idm-user-create <first-name> <last-name> <email> <username>
 
\x1b[32mDeletes a user\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    idm-user-delete <userid>
    where userid is the unique ID returned from the idm-user call

\x1b[32mUnlocks a user\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    idm-user-unlock <userid>
    where userid is the unique ID returned from the idm-user call
`;
}

async function init(inDomainName, inUsername, inPassword, inTimeout, inPrettyPrint) {
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyPrint;
    debug("Started Init");
    url = getApiUrl() + "/authtoken";
    debug("Username [" + username + "]");
    debug("URL      [" + url + "]");
    debug("Timeout  [" + timeout + "]");
    
    try {
        debug("Going to call the sync_rest/get call");
        const result = await sync_rest.get(url, inUsername, inPassword, inTimeout, "text/plain");
        //debug("Setting bearer Token: " + result.data.substr(0, 10));
        bearerToken = result;
        if (result.error) {
            console.error("Error:", result.error);
        }
    } catch (error) {
        console.error("Unhandled error:", error);
    }

    debug("done");
}

function getApiUrl()
{
    var idmBaseUrl;
    if(domainName.indexOf('int-aws-de')>0)idmBaseUrl="https://idmas-eu-central-1.softwareag.cloud";
    if(domainName.indexOf('int-aws-us')>0)idmBaseUrl="https://idmas-us-west-2.softwareag.cloud";
    if(domainName.indexOf('int-aw-au')>0)idmBaseUrl="https://idmas-aw-au.softwareag.cloud";
    if(domainName.indexOf('int-az-au')>0)idmBaseUrl="https://idmas-az-au.softwareag.cloud";
    if(domainName.indexOf('int-az-us')>0)idmBaseUrl="https://idmas-az-us.softwareag.cloud";
    if(domainName.indexOf('int-az-eu')>0)idmBaseUrl="https://idmas-az-eu.softwareag.cloud";
    idmBaseUrl+="/idm/environments/";
    "https://idmas-eu-central-1.softwareag.cloud/idm/environments/"

    var env = domainName.split(".")[0];
    return idmBaseUrl + env;
}

function setHeaders()
{
    var headers = [
        {"name":"Authorization","value":"Bearer " + bearerToken},
    ];
    return headers;
}

async function authToken(){
    debug("Getting authtoken");
    url=getApiUrl() + "/authtoken";
    await sync_rest.get(url, username, password, timeout, "text/plain");
}


function searchUserInfo(query,includeRoles,products)
{
    headers = setHeaders();
    
    url=getApiUrl()+"/users/search?query=" + query + "&includeRoles=" + includeRoles + "&products=" + products;
    rest.get(url, username, password, timeout, processResponse);
}

function getUserInfo(inUsername)
{
    url=getApiUrl()+"/users?username=" + inUsername;
    rest.get(url, username, password, timeout, processResponse);
}

function countUsers(query)
{
    var params="";
    if(query!==undefined)params="?query=" + query;
    url=getApiUrl()+"/users/count" + params;
    rest.get(url, username, password, timeout, processTextResponse,"text/plain");
}

function roleMappings(userId)
{
    url=getApiUrl()+"/users/" + userId + "/role-mappings";
    rest.get(url, username, password, timeout, processResponse);
}

function allRoles()
{
    url=getApiUrl()+"/roles/all";
    rest.get(url, username, password, timeout, processResponse);
}

async function resetPassword(userId,newPassword)
{
    url=getApiUrl()+"/users/" + userId + "/resetPassword";
    const base64Pw = Buffer.from(`${newPassword}`).toString('base64');
    var data={};
    data.password = base64Pw;
    headers = setHeaders();
    response = await sync_rest.custom(url, undefined, undefined, timeout,data,undefined,"PUT", headers,true,false,undefined,undefined);
    console.log(JSON.stringify({"response":response}));
}

async function createUser(firstName,lastName,email,username)
{
    debug("Started Create User");
    url=getApiUrl()+"/users";
    var data={};
    data.firstName = firstName;
    data.lastName = lastName;
    data.email = email;
    data.username = username;
    headers = setHeaders();
    response = await sync_rest.custom(url, undefined, undefined, timeout,data,undefined,"POST", headers,true,false,undefined,undefined);
    //console.log(response);
    console.log(JSON.stringify({"response":response}));
}

async function deleteUser(userId)
{
    url=getApiUrl()+"/users/" + userId;
    headers = setHeaders();
    response = await sync_rest.custom(url, undefined, undefined, timeout,undefined,undefined,"DELETE", headers,true,false,undefined,undefined);
    console.log(JSON.stringify({"response":"deleted"}));
}

async function unlockUser(userId)
{
    url=getApiUrl()+"/users/" + userId + "/unlock-user";
    headers = setHeaders();
    response = await sync_rest.custom(url, undefined, undefined, timeout,undefined,undefined,"DELETE", headers,true,false,undefined,undefined);
    console.log(JSON.stringify({"response":"unlocked"}));
}


/**
 * Call back function to process REST response
 * @param {return data from REST request} data 
 * @param {status} status 
 */
function processTextResponse(restEndPointUrl, err, data, response) {
    let status = response.status;
    //console.log(status);
    //console.log(response.text);
    console.log(JSON.stringify({"response":data}));

    if (status != 200) {
        console.log("Error: " + status);
        process.exit(status);
    }
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

    if (status != 200) {
        process.exit(status);
    }
}



module.exports = { help, init, authToken, getUserInfo, deleteUser, unlockUser, resetPassword, searchUserInfo,countUsers,roleMappings,allRoles,createUser  };
