# Quick Reference Guide

## Command Line to DBMS_DATAPUMP API Mapping

### Basic Structure

**Command Line:**
```bash
expdp/impdp username/password@database [parameters]
```

**PL/SQL API:**
```sql
DECLARE
  h1 NUMBER;
BEGIN
  h1 := DBMS_DATAPUMP.OPEN(operation, job_mode, job_name);
  -- Add files, filters, parameters
  DBMS_DATAPUMP.START_JOB(h1);
  DBMS_DATAPUMP.WAIT_FOR_JOB(h1, job_state);
END;
```

## Parameter Mappings

| Command Line | API Method | Notes |
|-------------|------------|-------|
| `directory=` | ADD_FILE (directory parameter) | Directory object name |
| `dumpfile=` | ADD_FILE (filename parameter) | Dump file name(s) |
| `logfile=` | ADD_FILE (filetype=LOG_FILE) | Log file name |
| `schemas=` | METADATA_FILTER (SCHEMA_EXPR) | Schema filter |
| `tables=` | METADATA_FILTER (NAME_EXPR) | Table filter |
| `tablespaces=` | METADATA_FILTER (TABLESPACE_EXPR) | Tablespace filter |
| `full=y` | job_mode='FULL' | Full database mode |
| `parallel=` | SET_PARALLEL | Parallel degree |
| `compression=` | SET_PARAMETER (COMPRESSION) | Compression type |
| `exclude=` | METADATA_FILTER (EXCLUDE_PATH_EXPR) | Exclude objects |
| `include=` | METADATA_FILTER (INCLUDE_PATH_EXPR) | Include objects |
| `content=` | SET_PARAMETER (CONTENT) | Content type |
| `remap_schema=` | METADATA_REMAP (REMAP_SCHEMA) | Schema remapping |
| `remap_tablespace=` | METADATA_REMAP (REMAP_TABLESPACE) | Tablespace remapping |
| `table_exists_action=` | SET_PARAMETER (TABLE_EXISTS_ACTION) | Import action |

## Job Modes

| Mode | Description | Command Line |
|------|-------------|--------------|
| FULL | Full database | `full=y` |
| SCHEMA | Schema(s) | `schemas=` |
| TABLE | Table(s) | `tables=` |
| TABLESPACE | Tablespace(s) | `tablespaces=` |

## Common Patterns

### Export Schema
```bash
# Command Line
expdp scott/tiger directory=DPUMP_DIR dumpfile=scott.dmp schemas=scott

# API Equivalent
h1 := DBMS_DATAPUMP.OPEN('EXPORT', 'SCHEMA', 'JOB_NAME');
DBMS_DATAPUMP.ADD_FILE(h1, 'scott.dmp', 'DPUMP_DIR', KU$_FILE_TYPE_DUMP_FILE);
DBMS_DATAPUMP.METADATA_FILTER(h1, 'SCHEMA_EXPR', 'IN (''SCOTT'')');
```

### Import with Remap
```bash
# Command Line
impdp system/password directory=DPUMP_DIR dumpfile=scott.dmp 
remap_schema=scott:scott_dev

# API Equivalent
h1 := DBMS_DATAPUMP.OPEN('IMPORT', 'SCHEMA', 'JOB_NAME');
DBMS_DATAPUMP.ADD_FILE(h1, 'scott.dmp', 'DPUMP_DIR', KU$_FILE_TYPE_DUMP_FILE);
DBMS_DATAPUMP.METADATA_REMAP(h1, 'REMAP_SCHEMA', 'SCOTT', 'SCOTT_DEV');
```

### Export with Exclude
```bash
# Command Line
expdp scott/tiger directory=DPUMP_DIR dumpfile=scott.dmp 
schemas=scott exclude=statistics

# API Equivalent
h1 := DBMS_DATAPUMP.OPEN('EXPORT', 'SCHEMA', 'JOB_NAME');
DBMS_DATAPUMP.ADD_FILE(h1, 'scott.dmp', 'DPUMP_DIR', KU$_FILE_TYPE_DUMP_FILE);
DBMS_DATAPUMP.METADATA_FILTER(h1, 'SCHEMA_EXPR', 'IN (''SCOTT'')');
DBMS_DATAPUMP.METADATA_FILTER(h1, 'EXCLUDE_PATH_EXPR', 'STATISTICS');
```

## File Types

| Constant | Description |
|----------|-------------|
| KU$_FILE_TYPE_DUMP_FILE | Dump file |
| KU$_FILE_TYPE_LOG_FILE | Log file |
| KU$_FILE_TYPE_SQL_FILE | SQL file |

## Content Types

| Value | Description |
|-------|-------------|
| ALL | Metadata and data (default) |
| DATA_ONLY | Only data |
| METADATA_ONLY | Only DDL |

## Table Exists Actions (Import)

| Value | Description |
|-------|-------------|
| SKIP | Skip existing tables |
| APPEND | Append data |
| TRUNCATE | Truncate and load |
| REPLACE | Drop and recreate |

## Compression Types

| Value | Description |
|-------|-------------|
| ALL | Compress everything |
| DATA_ONLY | Compress data only |
| METADATA_ONLY | Compress metadata only |
| NONE | No compression |

## Tips

1. **Always specify directory object** - Required for file operations
2. **Use meaningful job names** - Helps identify jobs in DBA_DATAPUMP_JOBS
3. **Include exception handling** - Always detach handle in exceptions
4. **Monitor job progress** - Use WAIT_FOR_JOB or GET_STATUS
5. **Check job state** - Verify completion status
6. **Use parallel wisely** - Based on CPU and I/O capacity
7. **Test in non-production first** - Always validate scripts

## Useful Queries

### Check Running Jobs
```sql
SELECT * FROM DBA_DATAPUMP_JOBS WHERE STATE = 'EXECUTING';
```

### Check Job Status
```sql
SELECT * FROM DBA_DATAPUMP_SESSIONS;
```

### Attach to Existing Job
```sql
DECLARE
  h1 NUMBER;
BEGIN
  h1 := DBMS_DATAPUMP.ATTACH('JOB_NAME', 'SCHEMA_NAME');
  -- Perform operations
END;
```

### Stop Job
```sql
DECLARE
  h1 NUMBER;
BEGIN
  h1 := DBMS_DATAPUMP.ATTACH('JOB_NAME', 'SCHEMA_NAME');
  DBMS_DATAPUMP.STOP_JOB(h1);
END;
```
