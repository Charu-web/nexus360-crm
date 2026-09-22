export var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["UPLOADING"] = "UPLOADING";
    DocumentStatus["QUEUED"] = "QUEUED";
    DocumentStatus["PROCESSING"] = "PROCESSING";
    DocumentStatus["COMPLETED"] = "COMPLETED";
    DocumentStatus["FAILED"] = "FAILED";
})(DocumentStatus || (DocumentStatus = {}));
export var DocumentType;
(function (DocumentType) {
    DocumentType["PDF"] = "PDF";
    DocumentType["DOCX"] = "DOCX";
    DocumentType["TXT"] = "TXT";
    DocumentType["CSV"] = "CSV";
})(DocumentType || (DocumentType = {}));
