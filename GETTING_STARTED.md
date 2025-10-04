# Getting Started with Oracle Data Pump Converter

Welcome! This guide will help you get started with the Oracle Data Pump to DBMS_DATAPUMP API converter tool.

## 🚀 Quick Start (3 Steps)

### Step 1: Access the Tool
- **Online**: Visit `https://YOUR_USERNAME.github.io/orace-datapump/`
- **Local**: Open `index.html` in your browser

### Step 2: Choose Your Method
- **Tab 1**: Command Line Converter (if you have existing expdp/impdp commands)
- **Tab 2**: Direct Generator (if you want to create from scratch)

### Step 3: Generate & Use
1. Enter your requirements
2. Click the generate button
3. Copy the PL/SQL script
4. Run it in your Oracle database

## 📖 Detailed Walkthrough

### Method 1: Command Line Converter

**When to use:** You have existing Data Pump commands and want to convert them to PL/SQL.

**Example:**
1. Click on "Command Line Converter" tab
2. Paste your command:
   ```
   expdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp schemas=scott
   ```
3. Click "Convert to PL/SQL"
4. Review the generated script
5. Click "Copy to Clipboard"

**What you get:**
```sql
DECLARE
  h1 NUMBER;
  job_state VARCHAR2(30);
BEGIN
  h1 := DBMS_DATAPUMP.OPEN(
    operation => 'EXPORT',
    job_mode  => 'SCHEMA',
    job_name  => 'EXPORT_JOB_...'
  );
  
  DBMS_DATAPUMP.ADD_FILE(...);
  DBMS_DATAPUMP.METADATA_FILTER(...);
  DBMS_DATAPUMP.START_JOB(h1);
  DBMS_DATAPUMP.WAIT_FOR_JOB(h1, job_state);
END;
/
```

### Method 2: Direct Generator

**When to use:** You want to create a new Data Pump script from scratch.

**Example:**
1. Click on "Direct Generator" tab
2. Fill in the form:
   - Operation Type: Export
   - Job Mode: Schema
   - Directory Object: DATA_PUMP_DIR
   - Dump File: scott.dmp
   - Schema Names: SCOTT
3. Click "Generate PL/SQL"
4. Review and copy the script

## 🎯 Your First Export

Let's create a simple schema export:

### Step 1: Prepare Oracle Database
```sql
-- Create directory object (as DBA)
CREATE DIRECTORY DATA_PUMP_DIR AS '/u01/app/oracle/dpump';

-- Grant permissions
GRANT READ, WRITE ON DIRECTORY DATA_PUMP_DIR TO scott;
```

### Step 2: Generate Script
Using the tool, enter:
- Operation: Export
- Job Mode: Schema
- Directory: DATA_PUMP_DIR
- Dump File: scott_backup.dmp
- Schema: SCOTT

### Step 3: Run the Script
```sql
-- Connect as SCOTT
CONNECT scott/password

-- Enable output
SET SERVEROUTPUT ON

-- Paste and run the generated script
DECLARE
  h1 NUMBER;
  ...
END;
/
```

### Step 4: Verify
```sql
-- Check the dump file was created
SELECT * FROM DBA_DIRECTORIES WHERE DIRECTORY_NAME = 'DATA_PUMP_DIR';

-- Check job completed
SELECT * FROM DBA_DATAPUMP_JOBS;
```

## 🎯 Your First Import

Let's import the schema we just exported:

### Step 1: Generate Import Script
Using the tool, enter:
- Operation: Import
- Job Mode: Schema
- Directory: DATA_PUMP_DIR
- Dump File: scott_backup.dmp
- Schema: SCOTT

### Step 2: Add Remap (Optional)
If importing to a different schema, modify the command:
```
impdp system/password directory=DATA_PUMP_DIR dumpfile=scott_backup.dmp remap_schema=scott:scott_dev
```

### Step 3: Run the Script
```sql
-- Connect as user with import privileges
CONNECT system/password

-- Run the generated script
DECLARE
  h1 NUMBER;
  ...
END;
/
```

## 📚 Learning Path

### Beginner
1. Start with simple schema export
2. Try table export
3. Add log file parameter
4. Experiment with compression

### Intermediate
1. Use parallel processing
2. Add exclude/include filters
3. Try remap_schema
4. Use table_exists_action

### Advanced
1. Full database export
2. Network import
3. Complex filtering
4. Custom transformations

## 💡 Tips for Success

### 1. Always Test First
- Use development environment
- Test with small datasets
- Verify before production use

### 2. Review Generated Scripts
- Check parameter values
- Verify directory paths
- Ensure schema names are correct

### 3. Monitor Jobs
```sql
-- Check running jobs
SELECT * FROM DBA_DATAPUMP_JOBS WHERE STATE = 'EXECUTING';

-- Monitor progress
SELECT * FROM V$SESSION_LONGOPS WHERE OPNAME LIKE 'DATAPUMP%';
```

### 4. Handle Errors
- Always check log files
- Use exception handling
- Keep job names unique

### 5. Optimize Performance
- Use parallel for large exports
- Multiple dump files for parallel
- Adequate temp space
- Sufficient I/O capacity

## 🔍 Common Scenarios

### Scenario 1: Daily Schema Backup
```sql
-- Generate script with:
-- Operation: Export
-- Mode: Schema
-- Add to cron/scheduler
```

### Scenario 2: Clone Schema
```sql
-- Export from source
-- Import with remap_schema
-- Different schema name
```

### Scenario 3: Move to Different Tablespace
```sql
-- Export schema
-- Import with remap_tablespace
-- Specify new tablespace
```

### Scenario 4: Refresh Test Environment
```sql
-- Export from production
-- Import to test with:
--   - remap_schema
--   - remap_tablespace
--   - table_exists_action=replace
```

## 📋 Checklist

Before running generated scripts:

- [ ] Directory object exists
- [ ] Proper permissions granted
- [ ] Sufficient disk space
- [ ] Sufficient temp space
- [ ] Schema/table names correct
- [ ] Tested in development
- [ ] Backup exists (for imports)
- [ ] Reviewed generated script
- [ ] Log file location specified
- [ ] Job name is unique

## 🆘 Need Help?

### Quick References
- **Examples**: Click "View Examples" link in the tool
- **Parameters**: See QUICK_REFERENCE.md
- **Troubleshooting**: See TROUBLESHOOTING.md

### Common Questions

**Q: Can I use this in production?**
A: Yes, but always test generated scripts first.

**Q: Do I need to install anything?**
A: No, it's a web-based tool. Just open in browser.

**Q: Does it work offline?**
A: Yes, after initial load it works offline.

**Q: What Oracle versions are supported?**
A: Oracle 10g and above (DBMS_DATAPUMP introduced in 10g).

**Q: Can I modify generated scripts?**
A: Yes, feel free to customize as needed.

## 🎓 Next Steps

1. **Try the Examples**: Visit examples.html for 10 real-world scenarios
2. **Read Quick Reference**: Understand parameter mappings
3. **Explore Advanced Features**: Parallel, compression, filtering
4. **Contribute**: See CONTRIBUTING.md to help improve the tool

## 📞 Support

- **Documentation**: README.md for comprehensive guide
- **Issues**: Report bugs on GitHub Issues
- **Examples**: 10 detailed examples included
- **Reference**: Quick reference for parameters

## 🎉 Success!

You're now ready to use the Oracle Data Pump Converter! Start with simple examples and gradually explore more advanced features.

**Happy Data Pumping! 🚀**

---

**Pro Tip**: Bookmark the tool for quick access whenever you need to generate Data Pump scripts!
