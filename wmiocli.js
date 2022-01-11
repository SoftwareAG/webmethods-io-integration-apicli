01 /*
02  * webMethods.io CLI
03  * Copyright 2021 Software AG
04  * Apache-2.0
05  */

var project = require('./projects.js');
var wf = require('./workflow.js');
var dbg = require('./debug.js');
var flowservice = require('./flowservice.js');

const { Command, Option } = require('commander');
const { exit } = require('process');

function checkEnableDebug(){
  if(program.opts().verbose==true){
    dbg.enableDebug();
  }
}

function debug(message){
  dbg.message("<WMIOCLI> " + message)
}
const program = new Command();
program

//Program Info
  .version('2021.01.0')

//required options
  .requiredOption('-d, --domain <tenantDomain>', 'Tenant Doamin Name, e.g. "tenant.int-aws-us.webmethods.io"')
  .requiredOption('-u, --user <userid>', 'Tenant User ID')
  .requiredOption('-p, --password <password>', 'Tenant User Password')
  
//options
  .addOption(new Option('-t, --timeout <delay>', 'timeout in seconds').default(60, 'one minute'))
  .option('--verbose','Verbose output')
  
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
    project
  
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
`)

  .showSuggestionAfterError()
;

program.command('project [project-id]')
.description('Lists all projects or view an individual project')
.action((projectId) => {
  checkEnableDebug();
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout)
  var resp = project.list(projectId);
  if(resp)console.log(resp);
});  

program.command('project-create <project-name>')
.description('Create project with given name')
.action((projectName) => {
  checkEnableDebug();
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout)
  project.create(projectName);
});

program.command('project-update <project-id> <project-name>')
.description('Update project with new name')
.action((projectId, projectName) => {
  checkEnableDebug();
  project.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout)
  project.update(projectId, projectName);
});
  
program.command('workflow-export <project-id> <workflow-id> <filename>')
.description('Export workflow with id <workflow-id> from project <project-id>')
.action((projectId, workflowId, filename) => {
  checkEnableDebug();
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  wf.exportwf(workflowId,filename);
});

program.command('workflow-import <project-id> <filename>')
.description('Import workflow into project <project-id> from file <filename>')
.action((projectId, filename) => {
  checkEnableDebug();
  debug("Importing Workflow");
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  wf.importwf(filename);
});

program.command('workflow-delete <project-id> <workflow-id>')
.description('Delete workflow <workflow-id> from project <project-id>')
.action((projectId, workflowId) => {
  checkEnableDebug();
  debug("Deleting Workflow [" + workflowId + "]");
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  wf.deletewf(workflowId);
});

program.command('workflow-execute <project-id> <workflow-id>')
 .description('Execute workflow <workflow-id> from project <project-id>')
.action((projectId, workflowId) => {
  checkEnableDebug();
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  wf.runwf(workflowId)
});

program.command('workflow-status <project-id> <run-id>')
.description('Gets Execution status for workflow execution <run-id>')
.action((projectId, runId) => {
  checkEnableDebug();
  wf.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  wf.statuswf(runId);
});

program.command('flowservice-export <project-id> <flow-name> <file-name>')
.description('Export FlowService with name <flow-name> from project <project-id>')
.action((projectId, flowName,filename) => {
  checkEnableDebug();
  flowservice.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  flowservice.exportFlowService(flowName,filename);
});

program.command('flowservice-import <project-id> <filename>')
.description('Import FlowService from <filename> into project <project-id>')
.action((projectId, filename) => {
  checkEnableDebug();
  flowservice.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  flowservice.importFlowService(filename);
});

program.command('flowservice-delete <project-id> <flow-name>')
.description('Delete FlowService <flow-name> from project <project-id>')
.action((projectId, flowName) => {
  checkEnableDebug();
  flowservice.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  flowservice.deleteFlowService(flowName);
});

program.command('flowservice-execute <project-id> <flow-name> [input-json]')
 .description('Execute FlowService <flow-name> from project <project-id> with data <input-json>')
.action((projectId, flowName,inputJson) => {
  checkEnableDebug();
  flowservice.init(program.opts().domain,program.opts().user,program.opts().password,program.opts().timeout,projectId);
  flowservice.runFlowService(flowName,inputJson);
});

program.parse();