#!/bin/bash
# ══════════════════════════════════════════════
#  System Resource Monitor
#  CPU Scheduling Simulator — OS Lab Project
# ══════════════════════════════════════════════

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/monitor.log"
REPORT_FILE="$LOG_DIR/report.txt"
mkdir -p "$LOG_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Thresholds ──
CPU_THRESHOLD=80
RAM_THRESHOLD=80
DISK_THRESHOLD=90

# ── Monitor once and log ──
monitor_once() {
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  # CPU
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d'.' -f1)

  # RAM
  RAM_TOTAL=$(free -m | awk '/Mem/{print $2}')
  RAM_USED=$(free -m | awk '/Mem/{print $3}')
  RAM_PCT=$(free | awk '/Mem/{printf "%.0f", $3/$2*100}')

  # Disk
  DISK_PCT=$(df / | awk 'NR==2{print $5}' | tr -d '%')
  DISK_USED=$(df -h / | awk 'NR==2{print $3}')
  DISK_TOTAL=$(df -h / | awk 'NR==2{print $2}')

  # Log
  echo "[$TIMESTAMP] CPU:${CPU_USAGE}% RAM:${RAM_USED}MB(${RAM_PCT}%) DISK:${DISK_PCT}%" >> "$LOG_FILE"

  # Alert if threshold exceeded
  if [ "$CPU_USAGE" -ge "$CPU_THRESHOLD" ] 2>/dev/null; then
    echo "[$TIMESTAMP] ⚠ ALERT: CPU usage high — ${CPU_USAGE}%" >> "$LOG_FILE"
  fi
  if [ "$RAM_PCT" -ge "$RAM_THRESHOLD" ] 2>/dev/null; then
    echo "[$TIMESTAMP] ⚠ ALERT: RAM usage high — ${RAM_PCT}%" >> "$LOG_FILE"
  fi
  if [ "$DISK_PCT" -ge "$DISK_THRESHOLD" ] 2>/dev/null; then
    echo "[$TIMESTAMP] ⚠ ALERT: Disk usage high — ${DISK_PCT}%" >> "$LOG_FILE"
  fi

  echo "$TIMESTAMP $CPU_USAGE $RAM_PCT $DISK_PCT"
}

# ── Show dashboard ──
show_dashboard() {
  clear
  echo -e "${CYAN}${BOLD}"
  echo "╔══════════════════════════════════════════╗"
  echo "║      SYSTEM RESOURCE MONITOR             ║"
  echo "║      OS Lab Project                      ║"
  echo "╚══════════════════════════════════════════╝"
  echo -e "${RESET}"

  DATA=$(monitor_once)
  CPU=$(echo $DATA | awk '{print $2}')
  RAM=$(echo $DATA | awk '{print $3}')
  DISK=$(echo $DATA | awk '{print $4}')

  echo -e "  ${BOLD}Current Status:${RESET} $(date '+%H:%M:%S')"
  echo ""

  # CPU bar
  cpu_bar=""
  for ((i=0; i<CPU/5; i++)); do cpu_bar+="█"; done
  CPU_COLOR=$GREEN
  [ "$CPU" -ge 60 ] && CPU_COLOR=$YELLOW
  [ "$CPU" -ge 80 ] && CPU_COLOR=$RED
  echo -e "  CPU  [${CPU_COLOR}${cpu_bar}${RESET}] ${CPU_COLOR}${CPU}%${RESET}"

  # RAM bar
  ram_bar=""
  for ((i=0; i<RAM/5; i++)); do ram_bar+="█"; done
  RAM_COLOR=$GREEN
  [ "$RAM" -ge 60 ] && RAM_COLOR=$YELLOW
  [ "$RAM" -ge 80 ] && RAM_COLOR=$RED
  echo -e "  RAM  [${RAM_COLOR}${ram_bar}${RESET}] ${RAM_COLOR}${RAM}%${RESET}"

  # Disk bar
  disk_bar=""
  for ((i=0; i<DISK/5; i++)); do disk_bar+="█"; done
  DISK_COLOR=$GREEN
  [ "$DISK" -ge 60 ] && DISK_COLOR=$YELLOW
  [ "$DISK" -ge 80 ] && DISK_COLOR=$RED
  echo -e "  DISK [${DISK_COLOR}${disk_bar}${RESET}] ${DISK_COLOR}${DISK}%${RESET}"

  echo ""
}

# ── Generate report ──
generate_report() {
  echo "══════════════════════════════════════" > "$REPORT_FILE"
  echo "  SYSTEM MONITORING REPORT" >> "$REPORT_FILE"
  echo "  Generated: $(date)" >> "$REPORT_FILE"
  echo "══════════════════════════════════════" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "Last 20 log entries:" >> "$REPORT_FILE"
  echo "──────────────────────────────────────" >> "$REPORT_FILE"
  tail -20 "$LOG_FILE" >> "$REPORT_FILE" 2>/dev/null || echo "No logs found." >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "Report saved: $REPORT_FILE"
  cat "$REPORT_FILE"
}

# ── Run modes ──
case "$1" in
  --once)
    monitor_once
    ;;
  --report)
    generate_report
    ;;
  --continuous)
    echo -e "${YELLOW}Monitoring every 5 seconds. Press Ctrl+C to stop.${RESET}"
    while true; do
      show_dashboard
      sleep 5
    done
    ;;
  *)
    # Default: show dashboard once
    show_dashboard
    echo -e "  ${CYAN}Options:${RESET}"
    echo "  ./monitor.sh --continuous   (live monitor)"
    echo "  ./monitor.sh --once         (log once)"
    echo "  ./monitor.sh --report       (generate report)"
    echo ""
    ;;
esac
