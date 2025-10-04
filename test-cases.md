# Test Cases for Oracle Data Pump Converter

Use these test cases to verify the tool is working correctly.

## Test Case 1: Simple Schema Export
**Input:**
```
expdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp schemas=scott
```

**Expected Output:**
- Operation: EXPORT
- Job Mode: SCHEMA
- Should include METADATA_FILTER for SCOTT schema
- Should include ADD_FILE for dump file

## Test Case 2: Multiple Schemas
**Input:**
```
expdp system/password directory=DPUMP_DIR dumpfile=multi.dmp schemas=scott,hr,oe
```

**Expected Output:**
- Multiple METADATA_FILTER calls for each schema
- All schemas in uppercase

## Test Case 3: Table Export
**Input:**
```
expdp scott/tiger directory=DATA_PUMP_DIR dumpfile=tables.dmp tables=scott.emp,scott.dept
```

**Expected Output:**
- Job Mode: TABLE
- METADATA_FILTER with NAME_EXPR
- Multiple filters for each table

## Test Case 4: Full Database Export
**Input:**
```
expdp system/password directory=DATA_PUMP_DIR dumpfile=full.dmp full=y
```

**Expected Output:**
- Job Mode: FULL
- No schema filters

## Test Case 5: Export with Parallel
**Input:**
```
expdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp schemas=scott parallel=4
```

**Expected Output:**
- Should include SET_PARALLEL call with degree=4

## Test Case 6: Export with Compression
**Input:**
```
expdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp schemas=scott compression=all
```

**Expected Output:**
- Should include SET_PARAMETER for COMPRESSION with value 'ALL'

## Test Case 7: Import with Remap Schema
**Input:**
```
impdp system/password directory=DATA_PUMP_DIR dumpfile=scott.dmp remap_schema=scott:scott_dev
```

**Expected Output:**
- Operation: IMPORT
- Should include METADATA_REMAP call
- old_value: SCOTT, value: SCOTT_DEV

## Test Case 8: Import with Table Exists Action
**Input:**
```
impdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp table_exists_action=replace
```

**Expected Output:**
- Should include SET_PARAMETER for TABLE_EXISTS_ACTION
- Value: REPLACE

## Test Case 9: Export with Exclude
**Input:**
```
expdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp schemas=scott exclude=statistics
```

**Expected Output:**
- Should include METADATA_FILTER with EXCLUDE_PATH_EXPR
- Value: STATISTICS

## Test Case 10: Export Metadata Only
**Input:**
```
expdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp schemas=scott content=metadata_only
```

**Expected Output:**
- Should include SET_PARAMETER for CONTENT
- Value: METADATA_ONLY

## Test Case 11: Tablespace Export
**Input:**
```
expdp system/password directory=DATA_PUMP_DIR dumpfile=users.dmp tablespaces=users
```

**Expected Output:**
- Job Mode: TABLESPACE
- METADATA_FILTER with TABLESPACE_EXPR

## Test Case 12: Multiple Parameters
**Input:**
```
expdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp logfile=scott.log schemas=scott parallel=2 compression=all exclude=statistics
```

**Expected Output:**
- Should include all parameters
- Proper log file handling
- All filters and settings applied

## Direct Generator Test Cases

### Test Case 13: Direct Export - Schema Mode
**Input:**
- Operation: Export
- Job Mode: Schema
- Directory: DATA_PUMP_DIR
- Dump File: test.dmp
- Objects: SCOTT

**Expected Output:**
- Valid PL/SQL with EXPORT operation
- SCHEMA mode
- METADATA_FILTER for SCOTT

### Test Case 14: Direct Import - Table Mode
**Input:**
- Operation: Import
- Job Mode: Table
- Directory: DATA_PUMP_DIR
- Dump File: tables.dmp
- Objects: SCOTT.EMP,SCOTT.DEPT

**Expected Output:**
- Valid PL/SQL with IMPORT operation
- TABLE mode
- Multiple NAME_EXPR filters

### Test Case 15: Direct Export - Full Mode
**Input:**
- Operation: Export
- Job Mode: Full Database
- Directory: DATA_PUMP_DIR
- Dump File: full.dmp
- Objects: (empty)

**Expected Output:**
- Valid PL/SQL with EXPORT operation
- FULL mode
- No object filters

## Validation Checklist

For each generated script, verify:
- [ ] Proper DECLARE section with handle variable
- [ ] DBMS_DATAPUMP.OPEN call with correct operation and mode
- [ ] ADD_FILE calls for dump file and log file
- [ ] Appropriate METADATA_FILTER calls
- [ ] START_JOB call
- [ ] WAIT_FOR_JOB call
- [ ] Exception handling with DETACH
- [ ] Proper PL/SQL syntax (ends with /)
- [ ] All string values in single quotes
- [ ] Uppercase for Oracle keywords and identifiers

## Browser Compatibility Testing

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

## Functionality Testing

- [ ] Tab switching works
- [ ] Command line parsing works
- [ ] Direct generator form works
- [ ] Copy to clipboard works
- [ ] Error handling for invalid input
- [ ] Examples page loads correctly
