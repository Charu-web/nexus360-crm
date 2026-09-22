export var WorkflowTriggerType;
(function (WorkflowTriggerType) {
    WorkflowTriggerType["LEAD_CREATED"] = "LEAD_CREATED";
    WorkflowTriggerType["LEAD_UPDATED"] = "LEAD_UPDATED";
    WorkflowTriggerType["LEAD_SCORE_CHANGED"] = "LEAD_SCORE_CHANGED";
    WorkflowTriggerType["TASK_COMPLETED"] = "TASK_COMPLETED";
    WorkflowTriggerType["DOCUMENT_PROCESSED"] = "DOCUMENT_PROCESSED";
})(WorkflowTriggerType || (WorkflowTriggerType = {}));
export var WorkflowActionType;
(function (WorkflowActionType) {
    WorkflowActionType["AI_ANALYZE_LEAD"] = "AI_ANALYZE_LEAD";
    WorkflowActionType["CREATE_TASK"] = "CREATE_TASK";
    WorkflowActionType["UPDATE_LEAD"] = "UPDATE_LEAD";
    WorkflowActionType["SEND_NOTIFICATION"] = "SEND_NOTIFICATION";
    WorkflowActionType["GENERATE_DRAFT_EMAIL"] = "GENERATE_DRAFT_EMAIL";
    WorkflowActionType["TRIGGER_WEBHOOK"] = "TRIGGER_WEBHOOK";
})(WorkflowActionType || (WorkflowActionType = {}));
export var WorkflowExecutionStatus;
(function (WorkflowExecutionStatus) {
    WorkflowExecutionStatus["PENDING"] = "PENDING";
    WorkflowExecutionStatus["RUNNING"] = "RUNNING";
    WorkflowExecutionStatus["COMPLETED"] = "COMPLETED";
    WorkflowExecutionStatus["FAILED"] = "FAILED";
})(WorkflowExecutionStatus || (WorkflowExecutionStatus = {}));
