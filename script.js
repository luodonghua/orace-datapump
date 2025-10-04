// Tab switching functionality
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
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
    const connMatch = cmdLine.match(/^(\S+?)(\s|$)/);
    if (connMatch) {
        cmdLine = cmdLine.substring(connMatch[0].length).trim();
    }
    
    // Parse parameters
    const paramRegex = /(\w+)=([^\s]+(?:\s+[^\s=]+(?!=))*)/g;
    let match;
    
    while ((match = paramRegex.exec(cmdLine)) !== null) {
        const key = match[1].toLowerCase();
        let value = match[2].trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        
        params[key] = value;
    }
    
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
        const script = generatePLSQL(params.operation, jobMode, params);
        document.getElementById('output').value = script;
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
    
    if (!directory || !dumpfile) {
        alert('Please fill in required fields: Directory and Dump File');
        return;
    }
    
    const params = {
        directory: directory,
        dumpfile: dumpfile
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
    
    const script = generatePLSQL(operation, jobMode, params);
    document.getElementById('output').value = script;
}

// Core PL/SQL generation function
function generatePLSQL(operation, jobMode, params) {
    const jobName = `${operation}_JOB_${Date.now()}`.substring(0, 30);
    const handleVar = 'h1';
    
    let script = `DECLARE
  ${handleVar} NUMBER;
  job_state VARCHAR2(30);
  status ku\$_Status;
BEGIN
  -- Create Data Pump job
  ${handleVar} := DBMS_DATAPUMP.OPEN(
    operation => '${operation}',
    job_mode  => '${jobMode}',
    job_name  => '${jobName}'
  );
  
`;

    // Add file specifications
    if (params.dumpfile) {
        const dumpfiles = params.dumpfile.split(',');
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
    const logfile = params.logfile || params.dumpfile?.replace('.dmp', '.log') || 'datapump.log';
    script += `  -- Add log file\n`;
    script += `  DBMS_DATAPUMP.ADD_FILE(\n`;
    script += `    handle    => ${handleVar},\n`;
    script += `    filename  => '${logfile}',\n`;
    script += `    directory => '${params.directory || 'DATA_PUMP_DIR'}',\n`;
    script += `    filetype  => DBMS_DATAPUMP.KU\$_FILE_TYPE_LOG_FILE\n`;
    script += `  );\n\n`;
    
    // Add metadata filters based on job mode
    if (jobMode === 'SCHEMA' && params.schemas) {
        const schemas = params.schemas.split(',');
        schemas.forEach(schema => {
            script += `  -- Filter for schema\n`;
            script += `  DBMS_DATAPUMP.METADATA_FILTER(\n`;
            script += `    handle => ${handleVar},\n`;
            script += `    name   => 'SCHEMA_EXPR',\n`;
            script += `    value  => 'IN (''${schema.trim().toUpperCase()}'')';\n`;
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
            script += `    value  => 'IN (''${table.trim().toUpperCase()}'')';\n`;
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
            script += `    value  => 'IN (''${ts.trim().toUpperCase()}'')';\n`;
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
    
    // Add parallel
    if (params.parallel) {
        script += `  -- Set parallel degree\n`;
        script += `  DBMS_DATAPUMP.SET_PARALLEL(\n`;
        script += `    handle => ${handleVar},\n`;
        script += `    degree => ${params.parallel}\n`;
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
    
    // Start the job
    script += `  -- Start the Data Pump job\n`;
    script += `  DBMS_DATAPUMP.START_JOB(handle => ${handleVar});\n\n`;
    
    // Monitor job progress
    script += `  -- Monitor job until completion\n`;
    script += `  DBMS_DATAPUMP.WAIT_FOR_JOB(handle => ${handleVar}, job_state => job_state);\n\n`;
    
    script += `  DBMS_OUTPUT.PUT_LINE('Job completed with status: ' || job_state);\n\n`;
    
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
    
    return script;
}

// Copy to clipboard functionality
function copyToClipboard() {
    const output = document.getElementById('output');
    output.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}
