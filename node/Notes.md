#Tempory notes on data structure

###PrimaryWorkitem
* Name
* Scope (?)
* BlockingIssues -> Issue
  *                   Name
  *                   IsClosed
  *                   IsInactive
  *                   IsDead
  *                   IsDeleted
* Description
* Estimate
* Status -> StoryStatus
  *           Name
  *           Description
* Team  -> 
  *           Name
  *           Description
* ToDo

###Story <- PrimaryWorkitem
* Estimate
* Status -> StoryStatus
  *           Name
  *           Description
* Team  -> 
  *           Name
  *           Description
* Timebox
* ToDo
* Value

###Defect <- PrimaryWorkitem
* Estimate
* Status -> StoryStatus
  * Name
  * Description
* Team  -> 
  * Name
  * Description
* Timebox
* ToDo
* Value

##For a sprint

    Work Complete: %
    Blockers:      %
    Burn down:     over time
    Backlog:       stories (where status is "", Analysis, Ready) total story points
    WIP:           stories (where status is In Progress) total story points
    Done:          stories (where status is Done | Accepted) total story points

    Backlog: tasks (where complete) total hours estimated
    WIP:     tasks (where complete) total hours estimated
    Done:    tasks (where complete) total hours performed + tasks (in progress) hours estimated - hours remaining

##Sample Data

Story (B-47379)
  Status (Done)
  Estimate: 
  Total Done: 28.00
  Project: 2014 Q3 PSI - Ellipse 8.5
  Sprint: SprintAug1314
  Team: Ellipse - Materials Development
  Feature Group: Ellipse - Materials

Story (B-45305)

*  Status (In Progress)
*  Estimate: 8
*  Blocking Issues: blocked
*  Total Detail Estimate: 54
*  Total To DO: 0.00
*  Total Done: 143.00
*  Project: 2014 Q3 PSI - Ellipse 8.5
*  Sprint: SprintAug1314
*  Team: Ellipse - Materials Development
*  Feature Group: Ellipse - Materials

Story (B-45733)

*  Status (In Progress)
*  Estimate: 3
*  Blocking Issues: 
*  Total Detail Estimate: 44
*  Total To Do: 2.00
*  Total Done: 67.00
*  Project: 2014 Q3 PSI - Ellipse 8.5
*  Sprint: SprintAug1314
*  Team: Ellipse - Finance Development
*  Feature Group: FIN - GL Queries

Tasks:
     
    Name                   ID        Status      Detail Est  Done   To Do
    Architects Analysis    TK-181022             
    Development            TK-181032 Completed   12          24     0
    Code Review            TK-181033 In Progress  2                 2
    Service Tests          TK-181054 Completed    6          12     0

Tests:

    Name                   ID        Status      Detail Est  Done   To Do
    Testing                AT-49409  Passed      24          31     0

