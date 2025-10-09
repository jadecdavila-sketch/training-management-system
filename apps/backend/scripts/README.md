# Database Backup & Restore Scripts

## Overview

This directory contains scripts for backing up and restoring the PostgreSQL database used by the Training Management System.

## Scripts

### backup-database.sh

Creates a timestamped backup of the database with automatic compression and retention management.

**Features:**
- Timestamped backups (YYYYMMDD_HHMMSS format)
- Automatic gzip compression
- Retention policy (keeps last 30 days by default)
- Custom PostgreSQL format for flexibility

**Usage:**
```bash
# From backend directory
pnpm run db:backup

# Or directly
./scripts/backup-database.sh
```

**Output:**
Backups are stored in `backups/database/` as `tms_backup_YYYYMMDD_HHMMSS.sql.gz`

### restore-database.sh

Restores the database from a backup file with confirmation prompt.

**Features:**
- Automatic decompression of gzipped backups
- Confirmation prompt to prevent accidental overwrites
- Terminates existing database connections
- Clean restore process

**Usage:**
```bash
# List available backups
pnpm run db:restore

# Restore a specific backup
pnpm run db:restore backups/database/tms_backup_20251009_120000.sql.gz

# Or directly
./scripts/restore-database.sh backups/database/tms_backup_20251009_120000.sql.gz
```

## Automated Backups

### Using Cron (macOS/Linux)

To schedule automated daily backups at 2 AM:

1. Open crontab editor:
```bash
crontab -e
```

2. Add this line:
```
0 2 * * * cd /path/to/training-management-system/apps/backend && ./scripts/backup-database.sh >> logs/backup.log 2>&1
```

Replace `/path/to/training-management-system` with your actual project path.

### Using launchd (macOS)

For more reliable scheduling on macOS:

1. Create a plist file at `~/Library/LaunchAgents/com.tms.database-backup.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.tms.database-backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/training-management-system/apps/backend/scripts/backup-database.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/training-management-system/apps/backend</string>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/path/to/training-management-system/apps/backend/logs/backup.log</string>
    <key>StandardErrorPath</key>
    <string>/path/to/training-management-system/apps/backend/logs/backup-error.log</string>
</dict>
</plist>
```

2. Load the job:
```bash
launchctl load ~/Library/LaunchAgents/com.tms.database-backup.plist
```

3. Verify it's running:
```bash
launchctl list | grep tms
```

### Using Node.js (node-cron)

For cross-platform scheduling within the application:

1. Install node-cron:
```bash
pnpm add node-cron
pnpm add -D @types/node-cron
```

2. Create `src/services/backupScheduler.ts`:
```typescript
import cron from 'node-cron';
import { exec } from 'child_process';
import { logger } from '../lib/logger.js';

export const startBackupScheduler = () => {
  // Run backup every day at 2 AM
  cron.schedule('0 2 * * *', () => {
    logger.info('Starting scheduled database backup...');

    exec('./scripts/backup-database.sh', (error, stdout, stderr) => {
      if (error) {
        logger.error('Backup failed', { error: error.message, stderr });
        return;
      }
      logger.info('Backup completed', { output: stdout });
    });
  });

  logger.info('Backup scheduler initialized (daily at 2 AM)');
};
```

3. Import in `src/index.ts`:
```typescript
import { startBackupScheduler } from './services/backupScheduler.js';

// Start backup scheduler in production
if (process.env.NODE_ENV === 'production') {
  startBackupScheduler();
}
```

## Retention Policy

The default retention policy keeps backups for 30 days. To change this, edit the `RETENTION_DAYS` variable in `backup-database.sh`:

```bash
RETENTION_DAYS=30  # Change this value
```

## Best Practices

1. **Regular Backups**: Schedule daily backups at off-peak hours
2. **Off-site Storage**: Copy critical backups to cloud storage (S3, Google Cloud Storage)
3. **Test Restores**: Periodically test restore process to verify backup integrity
4. **Monitor Space**: Ensure sufficient disk space for retention policy
5. **Secure Backups**: Restrict file permissions on backup directory
6. **Production**: Always backup before migrations or major deployments

## Troubleshooting

### Permission Denied
```bash
chmod +x scripts/backup-database.sh scripts/restore-database.sh
```

### pg_dump not found
Install PostgreSQL client tools or add to PATH

### Authentication Failed
Ensure DATABASE_URL in `.env` has correct credentials

### Disk Space Issues
Reduce RETENTION_DAYS or move old backups to archival storage

## Security Notes

- Backup files contain sensitive data - keep them secure
- Never commit backup files to version control
- Use encrypted storage for production backups
- Restrict access to backup directory (chmod 700)
- Consider encrypting backups with GPG for additional security
