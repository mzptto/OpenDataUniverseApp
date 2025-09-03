// OSDU Response Parser
// Handles double-encoded JSON strings from OSDU GraphQL responses

const parseOsduItem = (rawItem) => {
  try {
    // Step 1: Parse the outer JSON string
    const firstParse = JSON.parse(rawItem);
    
    // Step 2: Parse the inner JSON string (if it's still a string)
    if (typeof firstParse === 'string') {
      return JSON.parse(firstParse);
    }
    
    return firstParse;
  } catch (error) {
    console.error('Failed to parse OSDU item:', error);
    return { error: 'Parse failed', raw: rawItem };
  }
};

const parseOsduResponse = (osduResponse) => {
  if (!osduResponse?.items) return osduResponse;
  
  return {
    ...osduResponse,
    items: osduResponse.items.map(parseOsduItem)
  };
};

// Test with your sample data
const testRawItem = `"{\\"id\\":\\"osdu:work-product-component:77976761b9a213b3:\\",\\"source\\":{\\"ancestry\\":{\\"children\\":[],\\"parents\\":[]},\\"version\\":1,\\"dataPartition\\":\\"osdu\\",\\"kind\\":\\"osdu:wks:work-product-component--WellLog:1.0.0\\",\\"data\\":{\\"Description\\":\\"Volve field data: WL_RAW_GR_MWD_1.DLIS\\",\\"FileSizeBytes\\":149208,\\"WellName\\":\\"15/9-F\\",\\"FileSource\\":\\"Well_logs/02.LWD_EWL/15_9-F-7/WL_RAW_GR_MWD_1.DLIS\\",\\"DatasetProperties\\":{\\"Operator\\":\\"Equinor\\",\\"Field\\":\\"Volve\\",\\"Country\\":\\"Norway\\",\\"FileType\\":\\"DLIS\\",\\"OriginalPath\\":\\"Well_logs/02.LWD_EWL/15_9-F-7\\",\\"Basin\\":\\"North Sea\\"},\\"MeasurementType\\":\\"Continuous\\",\\"FileLastModified\\":\\"2025-04-18T16:21:15.000Z\\",\\"WellboreID\\":\\"osdu:wellbore:15/9-F:\\",\\"LogType\\":\\"Gamma Ray\\",\\"Source\\":\\"Volve Field Dataset\\",\\"Name\\":\\"WL_RAW_GR_MWD_1.DLIS\\"},\\"meta\\":{\\"modifyUser\\":\\"volve-conversion-service\\",\\"modifyTime\\":\\"2025-08-15T13:17:04.080Z\\",\\"createTime\\":\\"2025-08-15T13:17:04.080Z\\",\\"createUser\\":\\"volve-conversion-service\\",\\"ingestedTime\\":\\"2025-08-15T13:18:05.191Z\\",\\"sourceFile\\":\\"volve-osdu-converted/Well_logs_02.LWD_EWL_15_9-F-7_WL_RAW_GR_MWD_1.DLIS.json\\",\\"ingestedBy\\":\\"volve-conversion-ingestion\\"},\\"acl\\":{\\"viewers\\":[\\"data.default.viewers@osdu.osdu.example.com\\"],\\"owners\\":[\\"data.default.owners@osdu.osdu.example.com\\"]},\\"id\\":\\"osdu:work-product-component:77976761b9a213b3:\\",\\"legal\\":{\\"legaltags\\":[\\"osdu-public-usa-dataset-1\\"],\\"otherRelevantDataCountries\\":[\\"US\\"],\\"status\\":\\"compliant\\"}},\\"score\\":0.029108338}"`;

console.log('Parsed result:', parseOsduItem(testRawItem));

export { parseOsduItem, parseOsduResponse };