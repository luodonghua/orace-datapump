// Tab switching functionality
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Toggle export-only fields
function toggleExportFields() {
    const operation = document.getElementById('operation').value;
    const filesizeGroup = document.getElementById('filesizeGroup');
    const remapSchemaGroup = document.getElementById('remapSchemaGroup');
    const remapTablespaceGroup = document.getElementById('remapTablespaceGroup');
    const fullOption = document.getElementById('fullOption');
    
    filesizeGroup.style.display = operation === 'export' ? 'block' : 'none';
    remapSchemaGroup.style.display = operation === 'import' ? 'block' : 'none';
    remapTablespaceGroup.style.display = operation === 'import' ? 'block' : 'none';
    fullOption.textContent = operation === 'export' ? 'Full Database' : 'Full Dumpfile';
}

// Command line parameter mappings
const parameterMappings = {
    'directory': 'directory',
    'dumpfile': 'dumpfile',
    'logfile': 'logfile',
    'schemas': 'schemas',
    'tables': 'tables',
    'tablespaces': 'tablespaces',
    'full': 'full',
    'parallel': 'parallel',
    'compression': 'compression',
    'exclude': 'exclude',
    'include': 'include',
    'query': 'query',
    'remap_schema': 'remap_schema',
    'remap_tablespace': 'remap_tablespace',
    'remap_table': 'remap_table',
    'content': 'content',
    'estimate': 'estimate',
    'filesize': 'filesize',
    'flashback_time': 'flashback_time',
    'network_link': 'network_link',
    'table_exists_action': 'table_exists_action',
    'transform': 'transform'
};

// Parse command line input
function parseCommand(cmdLine) {
    const params = {};
    cmdLine = cmdLine.trim();
    
    // Determine operation type
    if (cmdLine.toLowerCase().startsWith('expdp')) {
        params.operation = 'EXPORT';
        cmdLine = cmdLine.substring(5).trim();
    } else if (cmdLine.toLowerCase().startsWith('impdp')) {
        params.operation = 'IMPORT';
        cmdLine = cmdLine.substring(5).trim();
    } else {
        throw new Error('Command must start with expdp or impdp');
    }
    
    // Extract username/password@connection (optional for API)
    const connMatch = cmdLine.match(/^([^\s=]+)(\s|$)/);
    if (connMatch && !connMatch[1].includes('=')) {
        const username = connMatch[1].split('/')[0].split('@')[0];
        if (username && !params.schemas) {
            params.schemas = username.toUpperCase();
        }
        cmdLine = cmdLine.substring(connMatch[0].length).trim();
    }
    
    // Parse parameters - improved regex to handle values properly
    const parts = cmdLine.split(/\s+(?=[A-Z_]+=)/i);
    parts.forEach(part => {
        const eqIndex = part.indexOf('=');
        if (eqIndex > 0) {
            const key = part.substring(0, eqIndex).toLowerCase();
            let value = part.substring(eqIndex + 1).trim();
            
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            
            params[key] = value;
        }
    });
    
    return params;
}

// Determine job mode
function determineJobMode(params) {
    if (params.full === 'y' || params.full === 'yes') return 'FULL';
    if (params.schemas) return 'SCHEMA';
    if (params.tables) return 'TABLE';
    if (params.tablespaces) return 'TABLESPACE';
    return 'SCHEMA';
}

// Generate PL/SQL from command line
function convertCommand() {
    const cmdInput = document.getElementById('cmdInput').value;
    
    if (!cmdInput.trim()) {
        alert('Please enter a command line');
        return;
    }
    
    try {
        const params = parseCommand(cmdInput);
        const jobMode = determineJobMode(params);
        params.fromCommandLine = true; // Flag to indicate command line source
        const result = generatePLSQL(params.operation, jobMode, params);
        document.getElementById('output').innerHTML = highlightSQL(result.script);
        document.getElementById('monitor').innerHTML = highlightSQL(result.monitor);
    } catch (error) {
        alert('Error parsing command: ' + error.message);
    }
}

// Generate PL/SQL from direct input
function generateDirect() {
    const operation = document.getElementById('operation').value.toUpperCase();
    const jobMode = document.getElementById('jobMode').value;
    const directory = document.getElementById('directory').value;
    const dumpfile = document.getElementById('dumpfile').value;
    const objects = document.getElementById('objects').value;
    const parallel = document.getElementById('parallel').value;
    const filesize = document.getElementById('filesize').value;
    const useUniqueName = document.getElementById('useUniqueName').checked;
    const remapSchema = document.getElementById('remapSchema').value;
    const remapTablespace = document.getElementById('remapTablespace').value;
    
    if (!directory || !dumpfile) {
        alert('Please fill in required fields: Directory and Dump File');
        return;
    }
    
    const params = {
        directory: directory,
        dumpfile: dumpfile,
        parallel: parallel,
        filesize: filesize,
        useUniqueName: useUniqueName,
        fromCommandLine: false // Flag to indicate direct generator
    };
    
    if (objects) {
        if (jobMode === 'SCHEMA') {
            params.schemas = objects;
        } else if (jobMode === 'TABLE') {
            params.tables = objects;
        } else if (jobMode === 'TABLESPACE') {
            params.tablespaces = objects;
        }
    }
    
    if (remapSchema && remapSchema.trim()) {
        params.remap_schema = remapSchema;
    }
    
    if (remapTablespace && remapTablespace.trim()) {
        params.remap_tablespace = remapTablespace;
    }
    
    const result = generatePLSQL(operation, jobMode, params);
    document.getElementById('output').innerHTML = highlightSQL(result.script);
    document.getElementById('monitor').innerHTML = highlightSQL(result.monitor);
}

// Generate timestamp in Oracle format
function getOracleTimestamp() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

// Simple SQL syntax highlighter
function highlightSQL(code) {
    const keywords = ['DECLARE', 'BEGIN', 'END', 'IF', 'THEN', 'ELSE', 'ELSIF', 'LOOP', 'WHILE', 'FOR', 'WHEN', 'EXCEPTION', 'RAISE', 'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'IN', 'AS', 'IS', 'NULL', 'NOT', 'LIKE'];
    const functions = ['DBMS_DATAPUMP', 'DBMS_OUTPUT', 'PUT_LINE', 'OPEN', 'ADD_FILE', 'METADATA_FILTER', 'METADATA_REMAP', 'SET_PARAMETER', 'SET_PARALLEL', 'START_JOB', 'DETACH', 'ATTACH', 'WAIT_FOR_JOB', 'STOP_JOB', 'GET_SCN', 'CURRENT_SCN', 'ROUND', 'SYSDATE', 'USER'];
    const types = ['NUMBER', 'VARCHAR2', 'DATE', 'TIMESTAMP'];
    
    let highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Comments
    highlighted = highlighted.replace(/(--[^\n]*)/g, '<span class="sql-comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="sql-comment">$1</span>');
    
    // Strings
    highlighted = highlighted.replace(/('(?:[^']|'')*')/g, '<span class="sql-string">$1</span>');
    
    // Keywords
    keywords.forEach(kw => {
        const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="sql-keyword">$1</span>');
    });
    
    // Functions
    functions.forEach(fn => {
        const regex = new RegExp(`\\b(${fn})\\b`, 'g');
        highlighted = highlighted.replace(regex, '<span class="sql-function">$1</span>');
    });
    
    // Types
    types.forEach(tp => {
        const regex = new RegExp(`\\b(${tp})\\b`, 'g');
        highlighted = highlighted.replace(regex, '<span class="sql-type">$1</span>');
    });
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="sql-number">$1</span>');
    
    return highlighted;
}

// Core PL/SQL generation function
function generatePLSQL(operation, jobMode, params) {
    const timestamp = getOracleTimestamp();
    const fromCmdLine = params.fromCommandLine;
    const objectName = (params.schemas || params.tables?.split(',')[0]?.split('.')[0] || params.tablespaces || 'DB').replace(/[^A-Z0-9]/gi, '').substring(0, 10);
    const jobName = params.job_name || `${operation}_${objectName}_${timestamp}`.substring(0, 30).toUpperCase();
    const handleVar = 'h1';
    const scnVar = 'v_scn';
    
    let script = `DECLARE
  ${handleVar} NUMBER;`;
    
    // Only add SCN for export and if not from command line OR if command line doesn't specify encryption
    if (operation === 'EXPORT' && (!fromCmdLine || !params.encryption)) {
        script += `
  ${scnVar} NUMBER;`;
    }
    
    script += `
BEGIN`;
    
    // Only add SCN logic for export and if not from command line OR if command line doesn't specify encryption
    if (operation === 'EXPORT' && (!fromCmdLine || !params.encryption)) {
        script += `
  -- Get current SCN for consistent export
  SELECT CURRENT_SCN INTO ${scnVar} FROM V$DATABASE;
  DBMS_OUTPUT.PUT_LINE('Using SCN: ' || ${scnVar});
  -- To use a specific SCN instead: ${scnVar} := 12345678;
`;
    }
    
    script += `
  -- Create Data Pump job
  ${handleVar} := DBMS_DATAPUMP.OPEN(
    operation => '${operation}',
    job_mode  => '${jobMode}',
    job_name  => '${jobName}'
  );
  
`;

    // Add file specifications
    if (params.dumpfile) {
        let dumpfile = params.dumpfile;
        if (!fromCmdLine && params.useUniqueName && !dumpfile.includes('%U')) {
            dumpfile = dumpfile.replace('.dmp', '%U.dmp');
        }
        const dumpfiles = dumpfile.split(',');
        dumpfiles.forEach(file => {
            script += `  -- Add dump file\n`;
            script += `  DBMS_DATAPUMP.ADD_FILE(\n`;
            script += `    handle    => ${handleVar},\n`;
            script += `    filename  => '${file.trim()}',\n`;
            script += `    directory => '${params.directory || 'DATA_PUMP_DIR'}',\n`;
            script += `    filetype  => DBMS_DATAPUMP.KU\$_FILE_TYPE_DUMP_FILE\n`;
            script += `  );\n\n`;
        });
    }
    
    // Add log file
    if (params.logfile || !fromCmdLine) {
        const baseLogName = (params.logfile || params.dumpfile?.replace('.dmp', '') || 'datapump').replace('.log', '');
        const logfile = fromCmdLine && params.logfile ? params.logfile : `${baseLogName}_${timestamp}.log`;
        script += `  -- Add log file\n`;
        script += `  DBMS_DATAPUMP.ADD_FILE(\n`;
        script += `    handle    => ${handleVar},\n`;
        script += `    filename  => '${logfile}',\n`;
        script += `    directory => '${params.directory || 'DATA_PUMP_DIR'}',\n`;
        script += `    filetype  => DBMS_DATAPUMP.KU\$_FILE_TYPE_LOG_FILE\n`;
        script += `  );\n\n`;
    }
    
    // Add metadata filters based on job mode
    if (jobMode === 'SCHEMA' && params.schemas) {
        const schemas = params.schemas.split(',');
        schemas.forEach(schema => {
            script += `  -- Filter for schema\n`;
            script += `  DBMS_DATAPUMP.METADATA_FILTER(\n`;
            script += `    handle => ${handleVar},\n`;
            script += `    name   => 'SCHEMA_EXPR',\n`;
            script += `    value  => 'IN (''${schema.trim().toUpperCase()}'')'\n`;
            script += `  );\n\n`;
        });
    }
    
    if (jobMode === 'TABLE' && params.tables) {
        const tables = params.tables.split(',');
        tables.forEach(table => {
            script += `  -- Filter for table\n`;
            script += `  DBMS_DATAPUMP.METADATA_FILTER(\n`;
            script += `    handle => ${handleVar},\n`;
            script += `    name   => 'NAME_EXPR',\n`;
            script += `    value  => 'IN (''${table.trim().toUpperCase()}'')'\n`;
            script += `  );\n\n`;
        });
    }
    
    if (jobMode === 'TABLESPACE' && params.tablespaces) {
        const tablespaces = params.tablespaces.split(',');
        tablespaces.forEach(ts => {
            script += `  -- Filter for tablespace\n`;
            script += `  DBMS_DATAPUMP.METADATA_FILTER(\n`;
            script += `    handle => ${handleVar},\n`;
            script += `    name   => 'TABLESPACE_EXPR',\n`;
            script += `    value  => 'IN (''${ts.trim().toUpperCase()}'')'\n`;
            script += `  );\n\n`;
        });
    }
    
    // Add exclude filters
    if (params.exclude) {
        const excludes = params.exclude.split(',');
        excludes.forEach(exc => {
            const parts = exc.split(':');
            script += `  -- Exclude filter\n`;
            script += `  DBMS_DATAPUMP.METADATA_FILTER(\n`;
            script += `    handle => ${handleVar},\n`;
            script += `    name   => 'EXCLUDE_PATH_EXPR',\n`;
            script += `    value  => '${parts[0].trim().toUpperCase()}'`;
            if (parts[1]) {
                script += `,\n    object_path => '${parts[1].trim()}'`;
            }
            script += `\n  );\n\n`;
        });
    }
    
    // Add include filters
    if (params.include) {
        const includes = params.include.split(',');
        includes.forEach(inc => {
            const parts = inc.split(':');
            script += `  -- Include filter\n`;
            script += `  DBMS_DATAPUMP.METADATA_FILTER(\n`;
            script += `    handle => ${handleVar},\n`;
            script += `    name   => 'INCLUDE_PATH_EXPR',\n`;
            script += `    value  => '${parts[0].trim().toUpperCase()}'`;
            if (parts[1]) {
                script += `,\n    object_path => '${parts[1].trim()}'`;
            }
            script += `\n  );\n\n`;
        });
    }
    
    // Add parallel - only if specified in command line or from direct generator
    if (params.parallel && (fromCmdLine || !fromCmdLine)) {
        const parallelDegree = params.parallel || '1';
        if (fromCmdLine && params.parallel || !fromCmdLine) {
            script += `  -- Set parallel degree\n`;
            script += `  DBMS_DATAPUMP.SET_PARALLEL(\n`;
            script += `    handle => ${handleVar},\n`;
            script += `    degree => ${parallelDegree}\n`;
            script += `  );\n\n`;
        }
    }
    
    // Add FLASHBACK_SCN for export - only if not from command line or no encryption
    if (operation === 'EXPORT' && (!fromCmdLine || !params.encryption)) {
        script += `  -- Set flashback SCN for consistent export\n`;
        script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
        script += `    handle => ${handleVar},\n`;
        script += `    name   => 'FLASHBACK_SCN',\n`;
        script += `    value  => TO_CHAR(${scnVar})\n`;
        script += `  );\n\n`;
    }
    
    // Add filesize - only if specified in command line or from direct generator
    if (operation === 'EXPORT' && params.filesize && (fromCmdLine || !fromCmdLine)) {
        if (fromCmdLine && params.filesize || !fromCmdLine) {
            const filesizeBytes = parseInt(params.filesize) * 1024 * 1024 * 1024;
            script += `  -- Set maximum file size\n`;
            script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
            script += `    handle => ${handleVar},\n`;
            script += `    name   => 'FILESIZE',\n`;
            script += `    value  => '${filesizeBytes}'\n`;
            script += `  );\n\n`;
        }
    }
    
    // Add encryption parameters if specified
    if (params.encryption) {
        script += `  -- Set encryption\n`;
        script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
        script += `    handle => ${handleVar},\n`;
        script += `    name   => 'ENCRYPTION',\n`;
        script += `    value  => '${params.encryption.toUpperCase()}'\n`;
        script += `  );\n\n`;
    }
    
    if (params.encryption_password) {
        script += `  -- Set encryption password\n`;
        script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
        script += `    handle => ${handleVar},\n`;
        script += `    name   => 'ENCRYPTION_PASSWORD',\n`;
        script += `    value  => '${params.encryption_password}'\n`;
        script += `  );\n\n`;
    }
    
    if (params.encryption_algorithm) {
        script += `  -- Set encryption algorithm\n`;
        script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
        script += `    handle => ${handleVar},\n`;
        script += `    name   => 'ENCRYPTION_ALGORITHM',\n`;
        script += `    value  => '${params.encryption_algorithm.toUpperCase()}'\n`;
        script += `  );\n\n`;
    }
    
    if (params.encryption_mode) {
        script += `  -- Set encryption mode\n`;
        script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
        script += `    handle => ${handleVar},\n`;
        script += `    name   => 'ENCRYPTION_MODE',\n`;
        script += `    value  => '${params.encryption_mode.toUpperCase()}'\n`;
        script += `  );\n\n`;
    }
    
    // Add compression
    if (params.compression) {
        const compValue = params.compression.toUpperCase();
        if (compValue !== 'NONE') {
            script += `  -- Set compression\n`;
            script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
            script += `    handle => ${handleVar},\n`;
            script += `    name   => 'COMPRESSION',\n`;
            script += `    value  => '${compValue}'\n`;
            script += `  );\n\n`;
        }
    }
    
    // Add remap_schema (import only)
    if (operation === 'IMPORT' && params.remap_schema) {
        const remaps = params.remap_schema.split(',');
        remaps.forEach(remap => {
            const [oldSchema, newSchema] = remap.split(':');
            script += `  -- Remap schema\n`;
            script += `  DBMS_DATAPUMP.METADATA_REMAP(\n`;
            script += `    handle    => ${handleVar},\n`;
            script += `    name      => 'REMAP_SCHEMA',\n`;
            script += `    old_value => '${oldSchema.trim().toUpperCase()}',\n`;
            script += `    value     => '${newSchema.trim().toUpperCase()}'\n`;
            script += `  );\n\n`;
        });
    }
    
    // Add remap_tablespace (import only)
    if (operation === 'IMPORT' && params.remap_tablespace) {
        const remaps = params.remap_tablespace.split(',');
        remaps.forEach(remap => {
            const [oldTs, newTs] = remap.split(':');
            script += `  -- Remap tablespace\n`;
            script += `  DBMS_DATAPUMP.METADATA_REMAP(\n`;
            script += `    handle    => ${handleVar},\n`;
            script += `    name      => 'REMAP_TABLESPACE',\n`;
            script += `    old_value => '${oldTs.trim().toUpperCase()}',\n`;
            script += `    value     => '${newTs.trim().toUpperCase()}'\n`;
            script += `  );\n\n`;
        });
    }
    
    // Add table_exists_action (import only)
    if (operation === 'IMPORT' && params.table_exists_action) {
        script += `  -- Set table exists action\n`;
        script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
        script += `    handle => ${handleVar},\n`;
        script += `    name   => 'TABLE_EXISTS_ACTION',\n`;
        script += `    value  => '${params.table_exists_action.toUpperCase()}'\n`;
        script += `  );\n\n`;
    }
    
    // Add content filter
    if (params.content) {
        script += `  -- Set content type\n`;
        script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
        script += `    handle => ${handleVar},\n`;
        script += `    name   => 'CONTENT',\n`;
        script += `    value  => '${params.content.toUpperCase()}'\n`;
        script += `  );\n\n`;
    }
    
    // Add network_link for network import
    if (params.network_link) {
        script += `  -- Set network link\n`;
        script += `  DBMS_DATAPUMP.SET_PARAMETER(\n`;
        script += `    handle => ${handleVar},\n`;
        script += `    name   => 'NETWORK_LINK',\n`;
        script += `    value  => '${params.network_link.toUpperCase()}'\n`;
        script += `  );\n\n`;
    }
    
    // Start the job
    script += `  -- Start the Data Pump job\n`;
    script += `  DBMS_DATAPUMP.START_JOB(handle => ${handleVar});\n\n`;
    
    const logfileForOutput = params.logfile || (params.dumpfile ? `${params.dumpfile.replace('.dmp', '')}_${timestamp}.log` : `datapump_${timestamp}.log`);
    script += `  DBMS_OUTPUT.PUT_LINE('========================================');\n`;
    script += `  DBMS_OUTPUT.PUT_LINE('Job Name: ${jobName}');\n`;
    if (operation === 'EXPORT' && (!fromCmdLine || !params.encryption)) {
        script += `  DBMS_OUTPUT.PUT_LINE('SCN: ' || ${scnVar});\n`;
    }
    script += `  DBMS_OUTPUT.PUT_LINE('Log File: ${logfileForOutput}');\n`;
    script += `  DBMS_OUTPUT.PUT_LINE('Job started successfully');\n`;
    script += `  DBMS_OUTPUT.PUT_LINE('Use monitoring script to check progress');\n`;
    script += `  DBMS_OUTPUT.PUT_LINE('========================================');\n\n`;
    
    // Detach from job
    script += `  -- Detach from job (job continues in background)\n`;
    script += `  DBMS_DATAPUMP.DETACH(handle => ${handleVar});\n\n`;
    
    // Exception handling
    script += `EXCEPTION\n`;
    script += `  WHEN OTHERS THEN\n`;
    script += `    DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);\n`;
    script += `    IF ${handleVar} IS NOT NULL THEN\n`;
    script += `      DBMS_DATAPUMP.DETACH(handle => ${handleVar});\n`;
    script += `    END IF;\n`;
    script += `    RAISE;\n`;
    script += `END;\n`;
    script += `/`;
    
    // Generate monitoring script
    const monitorScript = generateMonitorScript(jobName);
    
    return { script, monitor: monitorScript };
}

// Generate monitoring script
function generateMonitorScript(jobName) {
    return `-- Monitor Data Pump Job: ${jobName}

-- Check job status
SELECT owner_name, job_name, operation, job_mode, state, 
       degree, attached_sessions
FROM dba_datapump_jobs
WHERE job_name = '${jobName}';

-- Check job progress
SELECT username, opname, target_desc,
       sofar, totalwork,
       ROUND(sofar/totalwork*100, 2) AS percent_done,
       start_time, 
       ROUND((SYSDATE - start_time) * 24 * 60, 2) AS elapsed_min,
       ROUND(time_remaining/60, 2) AS remaining_min
FROM v$session_longops
WHERE opname LIKE 'DATAPUMP%'
  AND sofar <> totalwork;

-- Attach to job and wait for completion (if needed)
DECLARE
  h1 NUMBER;
  job_state VARCHAR2(30);
BEGIN
  h1 := DBMS_DATAPUMP.ATTACH('${jobName}', USER);
  DBMS_DATAPUMP.WAIT_FOR_JOB(h1, job_state);
  DBMS_OUTPUT.PUT_LINE('Job completed with status: ' || job_state);
  DBMS_DATAPUMP.DETACH(h1);
END;
/

-- Stop job (if needed)
/*
DECLARE
  h1 NUMBER;
BEGIN
  h1 := DBMS_DATAPUMP.ATTACH('${jobName}', USER);
  DBMS_DATAPUMP.STOP_JOB(h1, 1, 0);
END;
/
*/`;
}

// Copy to clipboard functionality
function copyToClipboard() {
    const output = document.getElementById('output');
    const text = output.innerText || output.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// Copy monitoring script to clipboard
function copyMonitorToClipboard() {
    const monitor = document.getElementById('monitor');
    const text = monitor.innerText || monitor.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}
