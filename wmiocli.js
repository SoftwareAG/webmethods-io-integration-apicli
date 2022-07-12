/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

var project = require('./projects.js');
var role = require('./roles.js');
var user = require('./users.js');
var wf = require('./workflow.js');
var dbg = require('./debug.js');
var flowservice = require('./flowservice.js');
var prettyprint = false;
var compat = false;

const { Command, Option } = require('commander');
const { exit } = require('process');

function checkOptions(){
  if(program.opts().verbose==true){
    dbg.enableDebug();
  }

  if(program.opts().prettyprint == true)
  {
    prettyprint = true;
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
  .requiredOption('-d, --domain <tenantDomain>', 'Tenant Doamin Name, e.g. "tenant.int-aws-us.webmethods.io"')
  .requiredOption('-u, --user <userid>', 'Tenant User ID')
  .requiredOption('-p, --password <password>', 'Tenant User Password')
  
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
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint)
  var resp = project.list(projectName);
  if(resp)console.log(resp);
});  

program.command('project-assets <project-name>')
.description('Lists project assets from given project name or uid')
.action((projectName) => {
  checkOptions();
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint)
  var resp = project.listAssets(projectName);
  if(resp)console.log(resp);
});  

program.command('project-create <project-name>')
.description('Create project with given name')
.action((projectName) => {
  checkOptions();
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint)
  project.create(projectName);
});

program.command('project-update <project-id> <project-name>')
.description('Update project with new name')
.action((projectId, projectName) => {
  checkOptions();
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint)
  project.update(projectId, projectName);
});

program.command('project-delete <project-id>')
.description('Delete project with given id')
.action((projectId) => {
  checkOptions();
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint)
  project.del(projectId);
});

program.command('project-publish <project-id> <publish-name> <target-tenant-domain-name> <target-user-id> <target-user-password> <assets-json>')
.description('Pubilsh project to another tenant with given id')
.action((projectId,publishName,targetTenantDomainName,targetUserId,targetUserPassword,assetsJson) => {
  checkOptions();
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint)
  project.pub(projectId,publishName,targetTenantDomainName,targetUserId,targetUserPassword,assetsJson);
        
});

program.command('project-deploy <projectName> <version>')
.description('deploy published project with given version into tenant')
.action((projectName, version) => {
  checkOptions();
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint)
  project.deploy(projectName,version);
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
  role.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint)
  var resp = role.list(roleId);
  if(resp)console.log(resp);
});  

program.command('role-create <role-name> <role-description> <roles-list>')
.description('Create roles and specify the permissions for that role. Roles-list should be provided as follows projectName,r,w,e;project name 2,r;')
.action((roleName,roleDescription,rolesList) => {
  checkOptions();
  role.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint);
  role.insert(roleName,roleDescription, rolesList);
});  

program.command('role-update <role-id> <role-name> <role-description> <roles-list>')
.description('Create roles and specify the permissions for that role. Roles-list should be provided as follows projectName,r,w,e;project name 2,r;')
.action((roleId, roleName,roleDescription,rolesList) => {
  checkOptions();
  role.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint);
  role.update(roleId, roleName,roleDescription, rolesList);
});

program.command('role-delete <roleId>')
.description('Delete a roles with the given role id')
.action((roleId) => {
  checkOptions();
  role.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint);
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
  user.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint);
  user.list(undefined);
});

program.command('user-role-assignment <user-id> <role-names>')
.description('Assigns a user to roles')
.action((userId,roleNames) => {
  checkOptions();
  debug("userId: " + userId);
  debug("Roles: " + roleNames);
  user.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,program.opts().prettyprint);
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
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  wf.exportwf(workflowId,filename);
});

program.command('workflow-import <project-id> <filename>')
.description('Import workflow into project <project-id> from file <filename>')
.action((projectId, filename) => {
  checkOptions();
  debug("Importing Workflow");
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  wf.importwf(filename);
});

program.command('workflow-delete <project-id> <workflow-id>')
.description('Delete workflow <workflow-id> from project <project-id>')
.action((projectId, workflowId) => {
  checkOptions();
  debug("Deleting Workflow [" + workflowId + "]");
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  wf.deletewf(workflowId);
});

program.command('workflow-execute <project-id> <workflow-id>')
 .description('Execute workflow <workflow-id> from project <project-id>')
.action((projectId, workflowId) => {
  checkOptions();
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  wf.runwf(workflowId)
});

program.command('workflow-status <project-id> <run-id>')
.description('Gets Execution status for workflow execution <run-id>')
.action((projectId, runId) => {
  checkOptions();
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
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
  flowservice.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  flowservice.exportFlowService(flowName,filename);
});

program.command('flowservice-import <project-id> <filename>')
.description('Import FlowService from <filename> into project <project-id>')
.action((projectId, filename) => {
  checkOptions();
  flowservice.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  flowservice.importFlowService(filename);
});

program.command('flowservice-delete <project-id> <flow-name>')
.description('Delete FlowService <flow-name> from project <project-id>')
.action((projectId, flowName) => {
  checkOptions();
  flowservice.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  flowservice.deleteFlowService(flowName);
});

program.command('flowservice-execute <project-id> <flow-name> [input-json]')
 .description('Execute FlowService <flow-name> from project <project-id> with data <input-json>')
.action((projectId, flowName,inputJson) => {
  checkOptions();
  flowservice.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  flowservice.runFlowService(flowName,inputJson);
});

program.parse();

