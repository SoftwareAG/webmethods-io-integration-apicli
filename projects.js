const request = require('./rest.js');

var domainName, username,password,timeout;
var url;

function checkForErrors(inBody)
{
    //Error Codes
    //Any error response
    
}

function init(inDomainName, inUsername, inPassword,inTimeout){
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    url = "https://" + domainName + "/enterprise/v1/rest/projects";
    //console.log("Username [" + username + "]");
    //console.log("URL      [" + url + "]");
    //console.log("Timeout  [" + timeout + "]");
}

function processResponse(data,status)
{

    console.log(JSON.stringify(data));
    if(status!=0){
        process.exit(status);
    }
}

function list(projectId){

    if(projectId)url+="/" + projectId;
    request.get(url,username,password,timeout,processResponse);
}

function create(projectName){
    var data={"name":projectName};
    request.post(url,username,password,timeout,data,processResponse);
}

function update(projectId, projectName){

    url += "/" + projectId;
    var data={"name":projectName};
    request.put(url,username,password,timeout,data,processResponse);
}




module.exports = { init, list, create, update };
