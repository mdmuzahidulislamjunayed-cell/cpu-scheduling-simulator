#!/bin/bash
# ══════════════════════════════════════════════
#  CPU Scheduling Simulator — Shell Component
#  Course: Operating Systems Laboratory
# ══════════════════════════════════════════════

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

LOG_FILE="logs/scheduler.log"
mkdir -p logs

# ── Log function ──
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# ── Header ──
show_header() {
  clear
  echo -e "${CYAN}${BOLD}"
  echo "╔══════════════════════════════════════════╗"
  echo "║      CPU SCHEDULING SIMULATOR            ║"
  echo "║      OS Lab Project — Shell Module       ║"
  echo "╚══════════════════════════════════════════╝"
  echo -e "${RESET}"
}

# ══════════════════════════════════════════════
#  1. SHOW CURRENT CPU INFO
# ══════════════════════════════════════════════
show_cpu_info() {
  echo -e "${BOLD}${BLUE}── CPU Information ──${RESET}"
  echo ""

  # CPU Model
  CPU_MODEL=$(grep "model name" /proc/cpuinfo | head -1 | cut -d: -f2 | xargs)
  echo -e "  CPU Model   : ${GREEN}${CPU_MODEL}${RESET}"

  # CPU Cores
  CPU_CORES=$(nproc)
  echo -e "  CPU Cores   : ${GREEN}${CPU_CORES}${RESET}"

  # CPU Usage
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  echo -e "  CPU Usage   : ${YELLOW}${CPU_USAGE}%${RESET}"

  # Load Average
  LOAD=$(uptime | awk -F'load average:' '{print $2}' | xargs)
  echo -e "  Load Avg    : ${YELLOW}${LOAD}${RESET}"

  # RAM
  RAM_TOTAL=$(free -m | awk '/Mem/{print $2}')
  RAM_USED=$(free -m | awk '/Mem/{print $3}')
  RAM_FREE=$(free -m | awk '/Mem/{print $4}')
  echo -e "  RAM Total   : ${GREEN}${RAM_TOTAL} MB${RESET}"
  echo -e "  RAM Used    : ${YELLOW}${RAM_USED} MB${RESET}"
  echo -e "  RAM Free    : ${GREEN}${RAM_FREE} MB${RESET}"

  echo ""
  log "CPU Info checked — Usage: ${CPU_USAGE}%, RAM: ${RAM_USED}/${RAM_TOTAL} MB"
  read -p "Press Enter to continue..."
}

# ══════════════════════════════════════════════
#  2. LIST RUNNING PROCESSES
# ══════════════════════════════════════════════
list_processes() {
  echo -e "${BOLD}${BLUE}── Top 15 Running Processes (by CPU) ──${RESET}"
  echo ""
  printf "%-8s %-20s %-8s %-8s %-10s\n" "PID" "NAME" "CPU%" "MEM%" "STATUS"
  echo "────────────────────────────────────────────────────"

  ps aux --sort=-%cpu | awk 'NR>1 && NR<=16 {
    printf "%-8s %-20s %-8s %-8s %-10s\n", $2, substr($11,1,20), $3, $4, $8
  }'

  echo ""
  log "Process list viewed"
  read -p "Press Enter to continue..."
}

# ══════════════════════════════════════════════
#  3. SIMULATE FCFS (Shell version)
# ══════════════════════════════════════════════
simulate_fcfs() {
  echo -e "${BOLD}${BLUE}── FCFS Simulation (Shell) ──${RESET}"
  echo ""
  echo -e "${YELLOW}Enter number of processes:${RESET}"
  read -r N

  declare -a names arrival burst

  for ((i=0; i<N; i++)); do
    echo -e "${CYAN}Process $((i+1)):${RESET}"
    read -p "  Name (e.g. P$((i+1))): " names[$i]
    read -p "  Arrival Time: " arrival[$i]
    read -p "  Burst Time: " burst[$i]
  done

  echo ""
  echo -e "${BOLD}── FCFS Results ──${RESET}"
  printf "%-8s %-10s %-10s %-10s %-12s %-12s\n" "Process" "Arrival" "Burst" "Finish" "Turnaround" "Waiting"
  echo "────────────────────────────────────────────────────────────"

  # Sort by arrival time (simple bubble sort)
  for ((i=0; i<N-1; i++)); do
    for ((j=0; j<N-i-1; j++)); do
      if [ "${arrival[$j]}" -gt "${arrival[$((j+1))]}" ]; then
        tmp_n="${names[$j]}"; names[$j]="${names[$((j+1))]}"; names[$((j+1))]="$tmp_n"
        tmp_a="${arrival[$j]}"; arrival[$j]="${arrival[$((j+1))]}"; arrival[$((j+1))]="$tmp_a"
        tmp_b="${burst[$j]}"; burst[$j]="${burst[$((j+1))]}"; burst[$((j+1))]="$tmp_b"
      fi
    done
  done

  current_time=0
  total_wt=0
  total_tat=0

  for ((i=0; i<N; i++)); do
    if [ "$current_time" -lt "${arrival[$i]}" ]; then
      current_time="${arrival[$i]}"
    fi
    finish=$((current_time + burst[$i]))
    tat=$((finish - arrival[$i]))
    wt=$((tat - burst[$i]))
    total_wt=$((total_wt + wt))
    total_tat=$((total_tat + tat))

    printf "%-8s %-10s %-10s %-10s %-12s %-12s\n" \
      "${names[$i]}" "${arrival[$i]}" "${burst[$i]}" "$finish" "$tat" "$wt"

    current_time=$finish
  done

  echo "────────────────────────────────────────────────────────────"
  avg_wt=$(echo "scale=2; $total_wt / $N" | bc)
  avg_tat=$(echo "scale=2; $total_tat / $N" | bc)
  echo -e "  ${GREEN}Average Waiting Time    : ${avg_wt}${RESET}"
  echo -e "  ${GREEN}Average Turnaround Time : ${avg_tat}${RESET}"

  echo ""
  log "FCFS simulated — $N processes, Avg WT: $avg_wt, Avg TAT: $avg_tat"
  read -p "Press Enter to continue..."
}

# ══════════════════════════════════════════════
#  4. MONITOR & LOG CPU (Real-time)
# ══════════════════════════════════════════════
monitor_cpu() {
  echo -e "${BOLD}${BLUE}── Real-time CPU Monitor (10 seconds) ──${RESET}"
  echo ""
  echo -e "${YELLOW}Monitoring CPU every 2 seconds... (saved to logs/scheduler.log)${RESET}"
  echo ""

  for i in {1..5}; do
    CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    RAM=$(free -m | awk '/Mem/{printf "%.1f%%", $3/$2*100}')
    TIME=$(date '+%H:%M:%S')

    echo -e "  [${TIME}] CPU: ${YELLOW}${CPU}%${RESET}  |  RAM: ${YELLOW}${RAM}${RESET}"
    log "Monitor — CPU: ${CPU}%, RAM: ${RAM}"
    sleep 2
  done

  echo ""
  echo -e "${GREEN}✓ Monitoring complete! Log saved to: logs/scheduler.log${RESET}"
  echo ""
  read -p "Press Enter to continue..."
}

# ══════════════════════════════════════════════
#  5. KILL A PROCESS
# ══════════════════════════════════════════════
kill_process() {
  echo -e "${BOLD}${BLUE}── Kill Process ──${RESET}"
  echo ""
  echo -e "${YELLOW}Running processes:${RESET}"
  ps aux --sort=-%cpu | awk 'NR>1 && NR<=10 {printf "  PID: %-8s NAME: %s\n", $2, $11}'
  echo ""
  read -p "Enter PID to kill (or 0 to cancel): " PID

  if [ "$PID" == "0" ]; then
    echo "Cancelled."
  elif kill -0 "$PID" 2>/dev/null; then
    read -p "Are you sure you want to kill PID $PID? (y/n): " CONFIRM
    if [ "$CONFIRM" == "y" ]; then
      kill "$PID"
      echo -e "${GREEN}✓ Process $PID terminated.${RESET}"
      log "Process killed — PID: $PID"
    else
      echo "Cancelled."
    fi
  else
    echo -e "${RED}✗ Invalid PID or process not found.${RESET}"
  fi

  echo ""
  read -p "Press Enter to continue..."
}

# ══════════════════════════════════════════════
#  6. VIEW LOGS
# ══════════════════════════════════════════════
view_logs() {
  echo -e "${BOLD}${BLUE}── Activity Logs ──${RESET}"
  echo ""
  if [ -f "$LOG_FILE" ]; then
    tail -20 "$LOG_FILE"
  else
    echo -e "${YELLOW}No logs yet. Run some operations first.${RESET}"
  fi
  echo ""
  read -p "Press Enter to continue..."
}

# ══════════════════════════════════════════════
#  MAIN MENU
# ══════════════════════════════════════════════
main_menu() {
  while true; do
    show_header
    echo -e "  ${BOLD}Main Menu:${RESET}"
    echo ""
    echo -e "  ${CYAN}1.${RESET} Show CPU & System Info"
    echo -e "  ${CYAN}2.${RESET} List Running Processes"
    echo -e "  ${CYAN}3.${RESET} Simulate FCFS Algorithm"
    echo -e "  ${CYAN}4.${RESET} Real-time CPU Monitor"
    echo -e "  ${CYAN}5.${RESET} Kill a Process"
    echo -e "  ${CYAN}6.${RESET} View Activity Logs"
    echo -e "  ${CYAN}0.${RESET} Exit"
    echo ""
    read -p "  Choose option: " choice

    case $choice in
      1) show_cpu_info ;;
      2) list_processes ;;
      3) simulate_fcfs ;;
      4) monitor_cpu ;;
      5) kill_process ;;
      6) view_logs ;;
      0) echo -e "${GREEN}Goodbye!${RESET}"; log "Session ended"; exit 0 ;;
      *) echo -e "${RED}Invalid option!${RESET}"; sleep 1 ;;
    esac
  done
}

# Start
log "Session started"
main_menu
