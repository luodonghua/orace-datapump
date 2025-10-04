# Troubleshooting Guide

## Common Issues and Solutions

### Tool Issues

#### Issue: Generated Script Has Syntax Errors

**Symptoms:**
- PL/SQL script won't compile
- Missing semicolons or quotes
- Invalid parameter names

**Solutions:**
1. Check input command syntax
2. Ensure parameter values don't contain special characters
3. Verify schema/table names are valid
4. Review generated script for obvious errors
5. Report bug with example input

#### Issue: Copy to Clipboard Not Working

**Symptoms:**
- Copy button doesn't work
- No feedback when clicking

**Solutions:**
1. Try different browser (Chrome/Firefox/Edge)
2. Check browser permissions for clipboard access
3. Manually select and copy text
4. Use Ctrl+C / Cmd+C keyboard shortcut

#### Issue: Tab Switching Not Working

**Symptoms:**
- Clicking tabs doesn't change view
- Both tabs visible at once

**Solutions:**
1. Refresh the page
2. Clear browser cache
3. Check JavaScript console for errors (F12)
4. Try different browser

### Oracle Database Issues

#### Issue: ORA-39001: invalid argument value

**Cause:** Invalid parameter value in generated script

**Solutions:**
1. Check directory object exists:
   ```sql
   SELECT * FROM DBA_DIRECTORIES WHERE DIRECTORY_NAME = 'DATA_PUMP_DIR';
   ```
2. Verify directory has proper permissions
3. Ensure dump file path is valid
4. Check parameter values are correct

#### Issue: ORA-39002: invalid operation

**Cause:** Invalid operation or job mode combination

**Solutions:**
1. Verify operation is 'EXPORT' or 'IMPORT'
2. Check job mode is valid (FULL, SCHEMA, TABLE, TABLESPACE)
3. Ensure parameters match operation type
4. Review Oracle documentation for valid combinations

#### Issue: ORA-39070: Unable to open the log file

**Cause:** Directory doesn't exist or no permissions

**Solutions:**
1. Create directory object:
   ```sql
   CREATE DIRECTORY DATA_PUMP_DIR AS '/path/to/directory';
   ```
2. Grant permissions:
   ```sql
   GRANT READ, WRITE ON DIRECTORY DATA_PUMP_DIR TO username;
   ```
3. Verify OS directory exists and is writable

#### Issue: ORA-39087: directory name is invalid

**Cause:** Directory object doesn't exist

**Solutions:**
1. Check existing directories:
   ```sql
   SELECT * FROM DBA_DIRECTORIES;
   ```
2. Create directory if needed
3. Use correct directory name in script

#### Issue: ORA-31626: job does not exist

**Cause:** Job name conflict or invalid job name

**Solutions:**
1. Use unique job name (tool generates timestamp-based names)
2. Check for existing jobs:
   ```sql
   SELECT * FROM DBA_DATAPUMP_JOBS;
   ```
3. Drop old job if needed:
   ```sql
   BEGIN
     DBMS_DATAPUMP.STOP_JOB('JOB_NAME');
   END;
   ```

#### Issue: ORA-39125: Worker unexpected fatal error

**Cause:** Various issues (space, permissions, corruption)

**Solutions:**
1. Check tablespace space:
   ```sql
   SELECT TABLESPACE_NAME, SUM(BYTES)/1024/1024 MB_FREE 
   FROM DBA_FREE_SPACE GROUP BY TABLESPACE_NAME;
   ```
2. Verify temp space available
3. Check alert log for details
4. Ensure sufficient OS disk space

### Parameter-Specific Issues

#### Issue: REMAP_SCHEMA Not Working

**Symptoms:**
- Objects imported to wrong schema
- Schema not remapped

**Solutions:**
1. Ensure using IMPORT operation (not EXPORT)
2. Check schema names are correct
3. Verify target schema exists
4. Use uppercase schema names:
   ```sql
   DBMS_DATAPUMP.METADATA_REMAP(
     handle => h1,
     name => 'REMAP_SCHEMA',
     old_value => 'SCOTT',
     value => 'SCOTT_DEV'
   );
   ```

#### Issue: PARALLEL Not Improving Performance

**Symptoms:**
- Job runs slow despite parallel setting
- Only one worker process

**Solutions:**
1. Check CPU availability
2. Verify I/O capacity
3. Ensure multiple dump files for parallel:
   ```sql
   -- Use %U for multiple files
   DBMS_DATAPUMP.ADD_FILE(h1, 'export_%U.dmp', 'DIR', KU$_FILE_TYPE_DUMP_FILE);
   ```
4. Monitor parallel processes:
   ```sql
   SELECT * FROM V$DATAPUMP_SESSION;
   ```

#### Issue: COMPRESSION Not Working

**Symptoms:**
- Dump file not compressed
- Same size as uncompressed

**Solutions:**
1. Check Oracle version (11g+ for COMPRESSION=ALL)
2. Verify Advanced Compression option licensed
3. Use correct compression value:
   - ALL (requires license)
   - METADATA_ONLY (free)
   - DATA_ONLY (requires license)

#### Issue: EXCLUDE/INCLUDE Filters Not Working

**Symptoms:**
- Objects not excluded/included as expected
- All objects exported/imported

**Solutions:**
1. Check object type name is correct
2. Use uppercase for object types
3. Verify filter syntax:
   ```sql
   DBMS_DATAPUMP.METADATA_FILTER(
     handle => h1,
     name => 'EXCLUDE_PATH_EXPR',
     value => 'STATISTICS'
   );
   ```
4. Check Oracle documentation for valid object types

### Performance Issues

#### Issue: Job Running Very Slow

**Solutions:**
1. Increase parallel degree
2. Use multiple dump files
3. Check I/O performance
4. Verify network speed (for network_link)
5. Monitor system resources:
   ```sql
   SELECT * FROM V$SESSION_LONGOPS 
   WHERE OPNAME LIKE 'DATAPUMP%';
   ```

#### Issue: Job Hangs or Freezes

**Solutions:**
1. Check for locks:
   ```sql
   SELECT * FROM DBA_BLOCKERS;
   ```
2. Verify space available
3. Check alert log
4. Monitor job status:
   ```sql
   SELECT * FROM DBA_DATAPUMP_JOBS;
   ```
5. Attach to job and check status:
   ```sql
   DECLARE
     h1 NUMBER;
     status KU$_STATUS;
   BEGIN
     h1 := DBMS_DATAPUMP.ATTACH('JOB_NAME', 'OWNER');
     DBMS_DATAPUMP.GET_STATUS(h1, 8, 0, 'JOB_NAME', status);
   END;
   ```

### GitHub Pages Issues

#### Issue: Site Not Loading

**Solutions:**
1. Wait 2-3 minutes after enabling Pages
2. Check Actions tab for build status
3. Verify Pages is enabled in Settings
4. Clear browser cache
5. Try incognito/private mode

#### Issue: 404 Error

**Solutions:**
1. Verify URL format: `https://username.github.io/repo-name/`
2. Check repository name matches URL
3. Ensure index.html is in root directory
4. Verify branch is set correctly in Pages settings

#### Issue: CSS/JavaScript Not Loading

**Solutions:**
1. Check file paths are relative (not absolute)
2. Verify file names match exactly (case-sensitive)
3. Check browser console for 404 errors
4. Clear browser cache
5. Verify files are committed to repository

### Browser Issues

#### Issue: Tool Not Working in Internet Explorer

**Solution:** Internet Explorer is not supported. Use modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

#### Issue: Mobile Display Issues

**Solutions:**
1. Rotate device to landscape
2. Zoom out if needed
3. Use desktop mode in browser
4. Report specific device/browser combination

## Debugging Tips

### Enable Browser Console
1. Press F12 (Windows/Linux) or Cmd+Option+I (Mac)
2. Go to Console tab
3. Look for JavaScript errors
4. Report errors with screenshot

### Test Generated Script
1. Copy generated PL/SQL
2. Test in SQL*Plus or SQL Developer
3. Check for compilation errors
4. Run with DBMS_OUTPUT enabled:
   ```sql
   SET SERVEROUTPUT ON
   -- paste script here
   ```

### Validate Parameters
1. Check Oracle documentation for parameter
2. Verify parameter is supported in your Oracle version
3. Test with simple example first
4. Add complexity gradually

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Review Oracle error message
3. Search Oracle documentation
4. Test with simple example
5. Gather error details

### When Reporting Issues

Include:
- Input command or form values
- Generated PL/SQL script
- Oracle error message (if any)
- Oracle version
- Browser and OS
- Steps to reproduce

### Resources

- [Oracle Data Pump Documentation](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/)
- [DBMS_DATAPUMP Package Reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_DATAPUMP.html)
- [GitHub Issues](https://github.com/YOUR_USERNAME/orace-datapump/issues)
- [Oracle Support](https://support.oracle.com)

## Quick Fixes

### Reset Tool
1. Refresh browser page
2. Clear all input fields
3. Try simple example first

### Reset Oracle Job
```sql
-- Find job
SELECT * FROM DBA_DATAPUMP_JOBS;

-- Stop job
BEGIN
  DBMS_DATAPUMP.STOP_JOB('JOB_NAME');
END;
/

-- Or attach and stop
DECLARE
  h1 NUMBER;
BEGIN
  h1 := DBMS_DATAPUMP.ATTACH('JOB_NAME', 'OWNER');
  DBMS_DATAPUMP.STOP_JOB(h1, 1, 0);
END;
/
```

### Clean Up Failed Jobs
```sql
-- Drop master table
DROP TABLE SCHEMA.JOB_NAME;

-- Remove from catalog
BEGIN
  DBMS_DATAPUMP.STOP_JOB('JOB_NAME', 1, 0);
END;
/
```

## Prevention Tips

1. **Test in Development First**: Always test generated scripts in non-production
2. **Validate Input**: Check command syntax before converting
3. **Review Output**: Always review generated PL/SQL before running
4. **Start Simple**: Test with simple examples before complex scenarios
5. **Monitor Jobs**: Watch job progress and check for errors
6. **Keep Backups**: Always have backups before import operations
7. **Check Space**: Verify sufficient space before starting
8. **Read Logs**: Always check log files after completion
