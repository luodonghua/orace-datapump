# Oracle Data Pump to DBMS_DATAPUMP API Converter

A web-based tool to convert Oracle Data Pump command line syntax (expdp/impdp) to equivalent DBMS_DATAPUMP API PL/SQL scripts.

## 🎯 Purpose

This tool helps Oracle DBAs and developers:
- Convert existing expdp/impdp commands to PL/SQL scripts using DBMS_DATAPUMP API
- Generate PL/SQL scripts directly based on requirements
- Learn the DBMS_DATAPUMP API by seeing command line equivalents

## 🚀 Features

### 1. Command Line Converter
Convert your existing Data Pump commands to PL/SQL:
```bash
expdp scott/tiger@orcl directory=DATA_PUMP_DIR dumpfile=scott.dmp schemas=scott
```
- Exact parameter mapping from command line
- No extra parameters added
- Supports encryption, compression, and all standard parameters

### 2. Direct PL/SQL Generator
Generate PL/SQL scripts by filling in a simple form with:
- Operation type (Export/Import)
- Job mode (Schema/Table/Full/Tablespace)
- Directory object
- Dump file name
- Object names
- Parallel degree (default: 1)
- Max file size (Export only, default: 100GB)
- Remap schema (Import only)
- Remap tablespace (Import only)
- Enhanced with SCN, timestamps, and monitoring scripts

## 📖 Usage

### Online Tool
Visit: [https://luodonghua.github.io/orace-datapump/](https://luodonghua.github.io/orace-datapump/)

### Local Usage
1. Clone this repository
2. Open `index.html` in your web browser
3. No installation or dependencies required!

## 🔧 Supported Parameters

### Export (expdp) Parameters
- `directory` - Directory object for dump files
- `dumpfile` - Dump file name(s)
- `logfile` - Log file name
- `schemas` - Schema names to export
- `tables` - Table names to export
- `tablespaces` - Tablespace names to export
- `full` - Full database export
- `parallel` - Parallel degree
- `compression` - Compression type
- `encryption` - Encryption type (ALL/DATA_ONLY/METADATA_ONLY/ENCRYPTED_COLUMNS_ONLY)
- `encryption_password` - Encryption password
- `encryption_algorithm` - Encryption algorithm (AES128/AES192/AES256)
- `encryption_mode` - Encryption mode (DUAL/PASSWORD/TRANSPARENT)
- `exclude` - Exclude objects
- `include` - Include objects
- `query` - Query filter
- `content` - Content type (ALL/DATA_ONLY/METADATA_ONLY)
- `filesize` - Maximum file size
- `flashback_scn` - Flashback SCN (auto-generated in Direct Generator)

### Import (impdp) Parameters
All export parameters plus:
- `remap_schema` - Remap schema names (source:target)
- `remap_tablespace` - Remap tablespace names (source:target)
- `remap_table` - Remap table names
- `table_exists_action` - Action when table exists (SKIP/APPEND/TRUNCATE/REPLACE)
- `transform` - Metadata transformations

## 📝 Examples

### Example 1: Schema Export
**Command Line:**
```bash
expdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp schemas=scott logfile=scott.log
```

**Generated PL/SQL:**
```sql
DECLARE
  h1 NUMBER;
  job_state VARCHAR2(30);
BEGIN
  h1 := DBMS_DATAPUMP.OPEN(
    operation => 'EXPORT',
    job_mode  => 'SCHEMA',
    job_name  => 'EXPORT_JOB'
  );
  
  DBMS_DATAPUMP.ADD_FILE(
    handle    => h1,
    filename  => 'scott.dmp',
    directory => 'DATA_PUMP_DIR',
    filetype  => DBMS_DATAPUMP.KU$_FILE_TYPE_DUMP_FILE
  );
  
  DBMS_DATAPUMP.METADATA_FILTER(
    handle => h1,
    name   => 'SCHEMA_EXPR',
    value  => 'IN (''SCOTT'')'
  );
  
  DBMS_DATAPUMP.START_JOB(handle => h1);
  DBMS_DATAPUMP.WAIT_FOR_JOB(handle => h1, job_state => job_state);
END;
/
```

### Example 2: Table Import with Remap
**Command Line:**
```bash
impdp scott/tiger directory=DATA_PUMP_DIR dumpfile=scott.dmp tables=scott.emp,scott.dept remap_schema=scott:hr table_exists_action=replace
```

## 🛠️ Technical Details

### Technologies Used
- Pure HTML5, CSS3, and JavaScript
- No external dependencies
- Client-side processing only
- Works offline after initial load

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## ✨ Key Differences

### Command Line Converter
- Converts exactly what you specify
- No extra parameters added
- Preserves your command line logic
- Extracts schema from username if not specified

### Direct Generator
- Adds enhancements for best practices:
  - Auto-generates unique job names with timestamp
  - Sets FLASHBACK_SCN for consistent exports
  - Creates timestamped log files
  - Includes monitoring scripts
  - Default parallel degree: 1
  - Default max file size: 100GB

## 📚 References

- [Oracle Data Pump Export Utility](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html)
- [Oracle Data Pump Import Utility](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html)
- [DBMS_DATAPUMP Package](https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_DATAPUMP.html)
- [Using Oracle Data Pump API](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/using-oracle_datapump-api.html)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool generates PL/SQL scripts based on command line parameters. Always review and test generated scripts in a non-production environment before using in production.

## 🔮 Future Enhancements

- [ ] Support for more Data Pump parameters
- [ ] Export/Import of generated scripts
- [ ] Script validation
- [ ] Example library
- [ ] Dark mode
- [ ] Parameter descriptions and tooltips

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.
