#!/bin/bash

# Database Restore Script for Training Management System
# This script restores a PostgreSQL database from a backup file
# Usage: ./scripts/restore-database.sh [backup_file]

set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Configuration
BACKUP_DIR="backups/database"

# Extract database connection details from DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Check if backup file was provided
if [ -z "$1" ]; then
  echo "Available backups:"
  ls -lh "$BACKUP_DIR"/tms_backup_*.sql.gz 2>/dev/null || echo "No backups found"
  echo ""
  echo "Usage: ./scripts/restore-database.sh <backup_file>"
  echo "Example: ./scripts/restore-database.sh backups/database/tms_backup_20251009_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will replace the current database with the backup!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

# Decompress if needed
TEMP_FILE=""
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Decompressing backup..."
  TEMP_FILE="${BACKUP_FILE%.gz}"
  gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
  RESTORE_FILE="$TEMP_FILE"
else
  RESTORE_FILE="$BACKUP_FILE"
fi

echo "Starting database restore..."

# Drop existing connections to the database
PGPASSWORD=$DB_PASSWORD psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
  2>/dev/null || true

# Restore the backup
PGPASSWORD=$DB_PASSWORD pg_restore \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -c \
  -v \
  "$RESTORE_FILE"

# Clean up temp file
if [ ! -z "$TEMP_FILE" ]; then
  rm -f "$TEMP_FILE"
fi

if [ $? -eq 0 ]; then
  echo "✓ Database restored successfully!"
else
  echo "✗ Restore failed!"
  exit 1
fi
