#!/bin/bash
# Automated PostgreSQL Backup Script for CMS Platform

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cms_backup_${TIMESTAMP}.sql.gz"

mkdir -p ${BACKUP_DIR}

echo "📦 Starting automated database backup at ${TIMESTAMP}..."

docker exec -t cms_postgres pg_dumpall -c -U postgres | gzip > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
  echo "✅ Database backup created successfully: ${BACKUP_FILE}"
else
  echo "❌ Database backup failed!"
  exit 1
fi
