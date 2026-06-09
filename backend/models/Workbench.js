const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  fieldName: String,
  dataElement: String,
  dataType: { type: String, enum: ['CHAR', 'NUMC', 'DATS', 'TIMS', 'DEC', 'INT4', 'CURR', 'CLNT', 'MANDT', 'QUAN', 'FLTP', 'STRG'] },
  length: Number,
  decimals: { type: Number, default: 0 },
  isKey: { type: Boolean, default: false },
  description: String,
  domainName: String
});

const abapTableSchema = new mongoose.Schema({
  tableName: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  tableType: { type: String, enum: ['TRANSP', 'POOL', 'CLUSTER', 'VIEW'], default: 'TRANSP' },
  deliveryClass: { type: String, enum: ['A', 'C', 'L', 'G', 'E', 'S', 'W'], default: 'A' },
  fields: [fieldSchema],
  tableData: [mongoose.Schema.Types.Mixed],
  createdBy: String,
  package: { type: String, default: '$TMP' },
  status: { type: String, enum: ['Active', 'Inactive', 'Modified'], default: 'Active' }
}, { timestamps: true });

const abapProgramSchema = new mongoose.Schema({
  programName: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  programType: { type: String, enum: ['1-Report', 'I-Include', 'M-Module Pool', 'F-Function Group', 'K-Class Pool'], default: '1-Report' },
  sourceCode: { type: String, default: 'REPORT zprogramname.\n\nSTART-OF-SELECTION.\n  WRITE: / \'Hello, SAP World!\'.' },
  lastOutput: [String],
  runtimeErrors: [String],
  package: { type: String, default: '$TMP' },
  createdBy: String
}, { timestamps: true });

const paramSchema = new mongoose.Schema({
  paramName: String,
  type: { type: String, enum: ['IMPORTING', 'EXPORTING', 'CHANGING', 'TABLES', 'EXCEPTIONS'] },
  dataType: String,
  passBy: { type: String, enum: ['VALUE', 'REFERENCE'], default: 'VALUE' },
  optional: { type: Boolean, default: false }
});

const functionModuleSchema = new mongoose.Schema({
  functionName: { type: String, required: true, unique: true, uppercase: true },
  functionGroup: String,
  description: String,
  parameters: [paramSchema],
  sourceCode: { type: String, default: 'FUNCTION zfunction_name.\n*"--------------------------------------------------------------\n*"  IMPORTING\n*"     VALUE(IV_INPUT) TYPE  CHAR50\n*"  EXPORTING\n*"     VALUE(EV_OUTPUT) TYPE  CHAR50\n*"--------------------------------------------------------------\n  EV_OUTPUT = IV_INPUT.\nENDFUNCTION.' },
  package: { type: String, default: '$TMP' },
  createdBy: String
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  messageClass: { type: String, required: true, uppercase: true },
  description: String,
  messages: [{
    msgNo: String,
    msgType: { type: String, enum: ['E', 'W', 'I', 'S', 'A'] },
    text: String
  }],
  createdBy: String
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  jobName: { type: String, required: true },
  programName: String,
  status: { type: String, enum: ['Scheduled', 'Running', 'Finished', 'Cancelled', 'Error'], default: 'Scheduled' },
  scheduledAt: Date,
  startedAt: Date,
  finishedAt: Date,
  duration: Number,
  createdBy: String,
  spoolOutput: [String]
}, { timestamps: true });

const dumpSchema = new mongoose.Schema({
  errorType: String,
  programName: String,
  includeProgram: String,
  errorText: String,
  lineNo: Number,
  sourceExtract: String,
  errorTime: { type: Date, default: Date.now },
  user: String,
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
  ABAPTable: mongoose.model('ABAPTable', abapTableSchema),
  ABAPProgram: mongoose.model('ABAPProgram', abapProgramSchema),
  FunctionModule: mongoose.model('FunctionModule', functionModuleSchema),
  MessageClass: mongoose.model('MessageClass', messageSchema),
  BackgroundJob: mongoose.model('BackgroundJob', jobSchema),
  ABAPDump: mongoose.model('ABAPDump', dumpSchema)
};
