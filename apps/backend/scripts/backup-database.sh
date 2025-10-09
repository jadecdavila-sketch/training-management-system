#!/bin/bash

# Database Backup Script for Training Management System
# This script creates timestamped backups of the PostgreSQL database
# Usage: ./scripts/backup-database.sh

set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Configuration
BACKUP_DIR="backups/database"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="tms_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Extract database connection details from DATABASE_URL
# Format: postgresql://username@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "Timestamp: $TIMESTAMP"

# Create backup using pg_dump
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -F c \
  -b \
  -v \
  -f "$BACKUP_DIR/$BACKUP_NAME" 2>&1 | grep -v "^$"

# Check if backup was successful
if [ $? -eq 0 ]; then
  # Compress the backup
  gzip "$BACKUP_DIR/$BACKUP_NAME"
  BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.gz" | cut -f1)

  echo "✓ Backup completed successfully!"
  echo "  Location: $BACKUP_DIR/${BACKUP_NAME}.gz"
  echo "  Size: $BACKUP_SIZE"

  # Clean up old backups (older than RETENTION_DAYS)
  echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
  find "$BACKUP_DIR" -name "tms_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

  REMAINING_BACKUPS=$(ls -1 "$BACKUP_DIR"/tms_backup_*.sql.gz 2>/dev/null | wc -l)
  echo "✓ Backup retention complete. ${REMAINING_BACKUPS} backup(s) retained."
else
  echo "✗ Backup failed!"
  exit 1
fi
