/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

var project = require('./projects.js');
var role = require('./roles.js');
var user = require('./users.js');
var wf = require('./workflow.js');
var theme = require('./themes.js');
var recipe = require('./recipe.js');
var dbg = require('./debug.js');
var flowservice = require('./flowservice.js');
var prettyprint = false;
var compat = false;

var tenantDomain;
var tenantUser;
var tenantPw;

const { Command, Option } = require('commander');
const { exit } = require('process');
const readline = require('readline-sync');

function readFromConsole(question,isPassword)
{
  var answer;
  if(isPassword !== undefined && isPassword!==null && isPassword==true)
  {
    answer = readline.question("\x1b[32m" + question + "\x1b[0m",{hideEchoBack: true});
  }
  else
  {
    answer = readline.question("\x1b[32m" + question + "\x1b[0m");
  }
  return answer;
}

function checkOptions(){
  if(program.opts().verbose==true){
    dbg.enableDebug();
  }

  if(program.opts().prettyprint == true)
  {
    prettyprint = true;
  }

  if(program.opts().domain == undefined){
    tenantDomain = readFromConsole('Please type your tenant domain name: ');
  }
  else{
    tenantDomain = program.opts().domain
  }

  if(program.opts().user == undefined){
    tenantUser = readFromConsole('Please type your tenant User ID: ');
  }
  else{
    tenantUser = program.opts().user
  }

  if(program.opts().password == undefined){
    tenantPw = readFromConsole('Please type your tenant User Password: ',true);
  }
  else{
    tenantPw = program.opts().password
  }

}

function debug(message){
  dbg.message("<WMIOCLI> " + message)
}
const program = new Command();
program

//Program Info
  .version('2022.07.1')

//required options
  .option('-d, --domain <tenantDomain>', 'Tenant Doamin Name, e.g. "tenant.int-aws-us.webmethods.io"')
  .option('-u, --user <userid>', 'Tenant User ID')
  .option('-p, --password <password>', 'Tenant User Password')
  //.requiredOption('-p, --password <password>', 'Tenant User Password')
  
//options
  .addOption(new Option('-t, --timeout <delay>', 'timeout in seconds').default(60, 'one minute'))
  .option('--prettyprint','Pretty Print JSON output')
  .option('--verbose','Verbose output useful for diagnosing issues')

  
//Additional help
  .addHelpText('before', `
\x1b[34m┌──────────────────────────────────────────────────────────────────────────────┐
│\x1b[36m webMethods.io Integration API CLI tool\x1b[0m\x1b[34m                                       │
│\x1b[0m This tool provides command line access to the webMethods.io Integration APIs\x1b[34m │
│\x1b[0m Intended to aid usage within DevOps Scenarios for asset deployment          \x1b[34m │
└──────────────────────────────────────────────────────────────────────────────┘\x1b[0m
`)

  .addHelpText('after', `

Examples:

  \x1b[4mHelp\x1b[0m

  \x1b[32mShow the command line help:\x1b[0m
  $ node wmiocli.js --help


  \x1b[4mProjects\x1b[0m

  \x1b[32mList projects in a tenant:\x1b[0m
  $ node wmiocli.js -d tenant.int-aws-us.webmethods.io -u user -p password project

  \x1b[32mView individual project using project ID (indentified from URL in webMethods.io when in a project, i.e. https://tenant.int-aws-us.webmethods.io/#/projects/\x1b[1mfl65d3aa87fc1783ea5cf8c8\x1b[32m/workflows):\x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project fl65d3aa87fc1783ea5cf8c8

  \x1b[32mView individual project with given project name:\x1b[0m
    $ node wmiocli.js 
      -d tenant.int-aws-us.webmethods.io 
      -u user 
      -p password 
      project Default

  \x1b[32mView Project assets from project with given name:\x1b[0m
    $ node wmiocli.js 
      -d tenant.int-aws-us.webmethods.io 
      -u user 
      -p password 
      project-assets Default      
  
  \x1b[32mUpdate Project name:\x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-update fl65d3aa87fc1783ea5cf8c8 "my New Name"

  \x1b[32mDelete Project:\x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-delete fl65d3aa87fc1783ea5cf8c8
  
  \x1b[32mGet Project Assets:\x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
     project-assets fl65d3aa87fc1783ea5cf8c8

  \x1b[32m/Publish Project to another tenant:\x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
     project-publish fl65d3aa87fc1783ea5cf8c8 'My deployment' 'target.int-aws-us.webmethods.io' 'targetuser' 'targetpassword' '{"output":{"workflows":["fla73a20e13dd6736cf9c355","fl3cfd145262bbc5d44acff3"],"flows":["mapLeads"],"rest_api":[],"soap_api":[],"listener":[],"messaging":[]}}'  

  
  \x1b[32m/Deploy published Project in the tenant with the given name and deploy version:\x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    project-deploy projectName 1   

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
          
          
  \x1b[4mFlowService\x1b[0m

  \x1b[32mExport FlowService from a given project (identified from URL in webMethods.io when in FlowEditor
  i.e. https://tenant.int-aws-us.webmethods.io/#/projects/\x1b[1mfl65d3aa87fc1783ea5cf8c8\x1b[0m\x1b[32m/flow-editor/\x1b[1mmyFlowService\x1b[0m\x1b[32m):\x1b[0m\x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    flowservice-export fl65d3aa87fc1783ea5cf8c8 myFlowService export.zip

  \x1b[32mImport Flowservice from a given file into a project \x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    flowservice-import fl65d3aa87fc1783ea5cf8c8 export.zip

  \x1b[32mDelete FlowService from a given project\x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    flowservice-delete fl65d3aa87fc1783ea5cf8c8 myFlowService

  \x1b[32mExecute a FlowService from a given project\x1b[0m
  $ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    flowservice-execute fl65d3aa87fc1783ea5cf8c8 myFlowService     

    
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
`)

  .showSuggestionAfterError()
;

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * PROJECT
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
program.command('project [project-name]')
.description('Lists all projects or view an individual project, specified via project name or uid')
.action((projectName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = project.list(projectName);
  if(resp)console.log(resp);
});  

program.command('project-assets <project-name>')
.description('Lists project assets from given project name or uid')
.action((projectName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = project.listAssets(projectName);
  if(resp)console.log(resp);
});  

program.command('project-create <project-name>')
.description('Create project with given name')
.action((projectName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.create(projectName);
});

program.command('project-update <project-id> <project-name>')
.description('Update project with new name')
.action((projectId, projectName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.update(projectId, projectName);
});

program.command('project-delete <project-id>')
.description('Delete project with given id')
.action((projectId) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.del(projectId);
});

program.command('project-publish <project-id> <publish-name> <target-tenant-domain-name> <target-user-id> <target-user-password> <assets-json>')
.description('Pubilsh project to another tenant with given id')
.action((projectId,publishName,targetTenantDomainName,targetUserId,targetUserPassword,assetsJson) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.pub(projectId,publishName,targetTenantDomainName,targetUserId,targetUserPassword,assetsJson);
        
});

program.command('project-deploy <projectName> <version>')
.description('deploy published project with given version into tenant')
.action((projectName, version) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.deploy(projectName,version);
});

program.command('project-param <project-name> [param-uid]')
.description('Lists all project parameters from given project name, or specific parameter with given paramater uid')
.action((projectName,paramName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = project.listParam(projectName,paramName);
  if(resp)console.log(resp);
});  

program.command('project-param-create <project-name> <param-name> <param-value> <required> <is-password>')
.description('Creates a project parameter with given values')
.action((projectName,paramName,paramValue,required,isPassword) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  boolReq = false;
  boolIsPass = false;
  if(required.toUpperCase()=="TRUE")boolReq = true;
  if(isPassword.toUpperCase()=="TRUE")boolIsPass = true;
  var resp = project.createParam(projectName,paramName,paramValue,boolReq,boolIsPass);
  if(resp)console.log(resp);
});  

program.command('project-param-update <project-name> <param-uid> <param-name> <param-value> <required> <is-password>')
.description('Updates a project parameter matching the provided UID with given values')
.action((projectName,paramUid,paramName,paramValue,required,isPassword) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  boolReq = false;
  boolIsPass = false;
  if(required.toUpperCase()=="TRUE")boolReq = true;
  if(isPassword.toUpperCase()=="TRUE")boolIsPass = true;
  var resp = project.updateParam(projectName,paramUid,paramName,paramValue,boolReq,boolIsPass);
  if(resp)console.log(resp);
});

program.command('project-param-delete <project-name> <param-uid>')
.description('Deletes a project parameter mathcing the given paramater uid')
.action((projectName,paramUid) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = project.deleteParam(projectName,paramUid);
  if(resp)console.log(resp);
}); 


program.command('project-webhooks-list <project-id>')
.description('List webhooks in a project')
.action((projectId) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.listWebhooks(projectId);
});

program.command('project-webhooks-regenerate <project-id> <workflow-uid>')
.description('Regenerate a webhook in a project for a given workflow UID')
.action((projectId,workflowUid) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.regenWebhook(projectId,workflowUid);
});

program.command('project-webhooks-auth <project-id> <workflow-uid> <auth-type>')
.description('Set authenatication type (none,login,token) for a webhook in a project for a given workflow UID')
.action((projectId,workflowUid,authType) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.setWebhookAuth(projectId,workflowUid,authType);
});


/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * ROLES
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
program.command('role [role-id]')
.description('Lists all roles or views an individual role')
.action((roleId) => {
  checkOptions();
  role.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = role.list(roleId);
  if(resp)console.log(resp);
});  

program.command('role-create <role-name> <role-description> <roles-list>')
.description('Create roles and specify the permissions for that role. Roles-list should be provided as follows projectName,r,w,e;project name 2,r;')
.action((roleName,roleDescription,rolesList) => {
  checkOptions();
  role.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  role.insert(roleName,roleDescription, rolesList);
});  

program.command('role-update <role-id> <role-name> <role-description> <roles-list>')
.description('Create roles and specify the permissions for that role. Roles-list should be provided as follows projectName,r,w,e;project name 2,r;')
.action((roleId, roleName,roleDescription,rolesList) => {
  checkOptions();
  role.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  role.update(roleId, roleName,roleDescription, rolesList);
});

program.command('role-delete <roleId>')
.description('Delete a roles with the given role id')
.action((roleId) => {
  checkOptions();
  role.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  role.del(roleId);
});  

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * USERS
 * ------------------------------------------------------------------------------------------------------------------------------------
 */

/**
 * Needs user-id adding.
 */
program.command('user')
.description('Lists all users')
.action(() => {
  checkOptions();
  user.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  user.list(undefined);
});

program.command('user-role-assignment <user-id> <role-names>')
.description('Assigns a user to roles')
.action((userId,roleNames) => {
  checkOptions();
  debug("userId: " + userId);
  debug("Roles: " + roleNames);
  user.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  user.assignRoles(userId,roleNames);
});

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * WORKFLOW IMPORT/EXPORT/DELETE/EXECUTE/STATUS
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
program.command('workflow-export <project-id> <workflow-id> <filename>')
.description('Export workflow with id <workflow-id> from project <project-id>')
.action((projectId, workflowId, filename) => {
  checkOptions();
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  wf.exportwf(workflowId,filename);
});

program.command('workflow-import <project-id> <filename>')
.description('Import workflow into project <project-id> from file <filename>')
.action((projectId, filename) => {
  checkOptions();
  debug("Importing Workflow");
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  wf.importwf(filename);
});

program.command('workflow-delete <project-id> <workflow-id>')
.description('Delete workflow <workflow-id> from project <project-id>')
.action((projectId, workflowId) => {
  checkOptions();
  debug("Deleting Workflow [" + workflowId + "]");
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  wf.deletewf(workflowId);
});

program.command('workflow-execute <project-id> <workflow-id>')
 .description('Execute workflow <workflow-id> from project <project-id>')
.action((projectId, workflowId) => {
  checkOptions();
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  wf.runwf(workflowId)
});

program.command('workflow-status <project-id> <run-id>')
.description('Gets Execution status for workflow execution <run-id>')
.action((projectId, runId) => {
  checkOptions();
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,projectId);
  wf.statuswf(runId);
});

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * FLOW SERVICE IMPORT/EXPORT/DELETE/EXECUTE
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
program.command('flowservice-export <project-id> <flow-name> <file-name>')
.description('Export FlowService with name <flow-name> from project <project-id>')
.action((projectId, flowName,filename) => {
  checkOptions();
  flowservice.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  flowservice.exportFlowService(flowName,filename);
});

program.command('flowservice-import <project-id> <filename>')
.description('Import FlowService from <filename> into project <project-id>')
.action((projectId, filename) => {
  checkOptions();
  flowservice.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  flowservice.importFlowService(filename);
});

program.command('flowservice-delete <project-id> <flow-name>')
.description('Delete FlowService <flow-name> from project <project-id>')
.action((projectId, flowName) => {
  checkOptions();
  flowservice.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  flowservice.deleteFlowService(flowName);
});

program.command('flowservice-execute <project-id> <flow-name> [input-json]')
 .description('Execute FlowService <flow-name> from project <project-id> with data <input-json>')
.action((projectId, flowName,inputJson) => {
  checkOptions();
  flowservice.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  flowservice.runFlowService(flowName,inputJson);
});

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * THEMES
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
 program.command('theme [theme-uid]')
 .description('Lists themes or views an individual theme, specified via uid')
 .action((themeUid) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.list(themeUid);
 });  
 
 
 program.command('theme-create <theme-name> <theme-description> <theme-object> [footer-text] [about-page]')
 .description('Create theme with given data')
 .action((themeName,themeDescription,themeObject,footerText,aboutPage) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.create(themeName,themeDescription,themeObject,footerText,aboutPage);
 });

 program.command('theme-update <theme-uid> <theme-name> <theme-description> <theme-object> [footer-text] [about-page]')
 .description('Update theme with the given UID with given data')
 .action((themeUid, themeName,themeDescription,themeObject,footerText,aboutPage) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.update(themeUid, themeName,themeDescription,themeObject,footerText,aboutPage);
 });

 program.command('theme-delete <theme-uid>')
 .description('Delete theme with the given UID')
 .action((themeUid) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.del(themeUid);
 });

 /**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * Recipes
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
 
 program.command('recipe [recipe-uid]')
 .description('List all Workflow recipes, or get a single recipe with a given recipe UID')
 .action((recipeUid) => {
   checkOptions();
   recipe.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   recipe.list(recipeUid);
 });

 program.command('recipe-delete <recipe-uid>')
 .description('Delete Workflow recipe with a given recipe UID')
 .action((recipeUid) => {
   checkOptions();
   recipe.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   recipe.del(recipeUid);
 });

 program.command('recipe-create <filename>')
.description('Create Workfllow Receipt from file <filename>')
.action((filename) => {
  checkOptions();
  debug("Importing Workflow");
  recipe.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  recipe.create(filename);
});

 /*
 program.command('project-delete <project-id>')
 .description('Delete project with given id')
 .action((projectId) => {
   checkOptions();
   project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   project.del(projectId);
 });*/
 
program.parse();



