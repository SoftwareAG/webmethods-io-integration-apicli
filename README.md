# Supported Verisons
This tool has been tested against
* webMethods.io v10.11

# Installation
```
git clone https://github.com/dpembo/wmiocli.git
cd wmiocli
npm install
node wmiocli.js --help
```

# Usage

```
# wmiocli
webMethods.io Integration CLI Tool

┌──────────────────────────────────────────────────────────────────────────────┐
│ webMethods.io Integration API CLI tool                                       │
│ This tool provides command line access to the webMethods.io Integration APIs │
│ Intended to aid usage within DevOps Scenarios for asset deployment           │
└──────────────────────────────────────────────────────────────────────────────┘
  

Usage: wmiocli [options] [command]

Options:
  -V, --version                                              output the version number
  -d, --domain <tenantDomain>                                Tenant Doamin Name, e.g.
                                                             "tenant.int-aws-us.webmethods.io"
  -u, --user <userid>                                        Tenant User ID
  -p, --password <password>                                  Tenant User Password
  -t, --timeout <delay>                                      timeout in seconds (default: one minute)
  --verbose                                                  Verbose output
  -h, --help                                                 display help for command

Commands:
  project [project-id]                                       Lists all projects or view an individual project
  project-create <project-name>                              Create project with given name
  project-update <project-id> <project-name>                 Update project with new name
  workflow-export <project-id> <workflow-id> <filename>      Export workflow with id <workflow-id> from project
                                                             <project-id>
  workflow-import <project-id> <filename>                    Import workflow into project <project-id> from file
                                                             <filename>
  workflow-delete <project-id> <workflow-id>                 Delete workflow <workflow-id> from project
                                                             <project-id>
  workflow-execute <project-id> <workflow-id>                Execute workflow <workflow-id> from project
                                                             <project-id>
  workflow-status <project-id> <run-id>                      Gets Execution status for workflow execution <run-id>
  flowservice-export <project-id> <flow-name> <file-name>    Export FlowService with name <flow-name> from project
                                                             <project-id>
  flowservice-import <project-id> <filename>                 Import FlowService from <filename> into project
                                                             <project-id>
  flowservice-delete <project-id> <flow-name>                Delete FlowService <flow-name> from project
                                                             <project-id>
  flowservice-execute <project-id> <flow-name> [input-json]  Execute FlowService <flow-name> from project
                                                             <project-id> with data <input-json>
  help [command]                                             display help for command


Examples:

  Help

  Show the command line help:
    $ node wmiocli.js --help


  Projects

  List projects in a tenant:
  $ node wmiocli.js -d tenant.int-aws-us.webmethods.io -u user -p password project

  View individual project using project ID (indentified from URL in webMethods.io when in a project, i.e. https://tenant.int-aws-us.webmethods.io/#/projects/fl65d3aa87fc1783ea5cf8c8/workflows):
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project

  Update Project name:
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-update fl65d3aa87fc1783ea5cf8c8 "my New Name"

  Delete Project:
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-delete fl65d3aa87fc1783ea5cf8c8


  Workflow

  Export Workflow from a given project (identified from URL in webMethods.io when in workflow canvas,
  i.e. https://tenant.int-aws-us.webmethods.io/#/projects/fl65d3aa87fc1783ea5cf8c8/workflows/fl52232a2dfafbd6536963d7/edit):
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-export fl65d3aa87fc1783ea5cf8c8 fl52232a2dfafbd6536963d7 export.zip

  Import Workflow from a given file into a project
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-import fl65d3aa87fc1783ea5cf8c8 export.zip

  Delete Workflow from a given project
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-delete fl65d3aa87fc1783ea5cf8c8 fl52232a2dfafbd6536963d7

  Execute a Workflow from a given project
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-execute fl65d3aa87fc1783ea5cf8c8 fl52232a2dfafbd6536963d7

  Get Workflow execution status from a given project
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-status fl65d3aa87fc1783ea5cf8c8 vbid3d247cd26aa5e19354e1fc6951766a3d19c049bee11d


  FlowService

  Export FlowService from a given project (identified from URL in webMethods.io when in FlowEditor
  i.e. https://tenant.int-aws-us.webmethods.io/#/projects/fl65d3aa87fc1783ea5cf8c8/flow-editor/myFlowService):
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    flowservice-export fl65d3aa87fc1783ea5cf8c8 myFlowService export.zip

  Import Flowservice from a given file into a project
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    flowservice-import fl65d3aa87fc1783ea5cf8c8 export.zip

  Delete FlowService from a given project
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    flowservice-delete fl65d3aa87fc1783ea5cf8c8 myFlowService

  Execute a FlowService from a given project
  $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    flowservice-execute fl65d3aa87fc1783ea5cf8c8 myFlowService
```
