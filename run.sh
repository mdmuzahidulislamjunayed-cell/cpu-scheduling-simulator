#!/bin/bash
# ══════════════════════════════════════════════
#  CPU Scheduling Simulator — Project Launcher
#  OS Lab Project
# ══════════════════════════════════════════════

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════╗"
echo "║      CPU SCHEDULING SIMULATOR            ║"
echo "║      OS Laboratory Project               ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${RESET}"

echo -e "  ${BOLD}What would you like to do?${RESET}"
echo ""
echo -e "  ${CYAN}1.${RESET} Run Shell Scheduler (Terminal)"
echo -e "  ${CYAN}2.${RESET} Start System Monitor"
echo -e "  ${CYAN}3.${RESET} Start Backend Server (Flask)"
echo -e "  ${CYAN}4.${RESET} Open Frontend (Browser)"
echo -e "  ${CYAN}0.${RESET} Exit"
echo ""
read -p "  Choose: " choice

case $choice in
  1)
    bash scheduler.sh
    ;;
  2)
    bash monitor.sh --continuous
    ;;
  3)
    echo -e "${YELLOW}Starting Flask backend...${RESET}"
    cd backend && pip install -r requirements.txt -q && python app.py
    ;;
  4)
    echo -e "${GREEN}Opening frontend in browser...${RESET}"
    xdg-open frontend/index.html 2>/dev/null || \
    open frontend/index.html 2>/dev/null || \
    echo "Open frontend/index.html manually in your browser."
    ;;
  0)
    echo -e "${GREEN}Goodbye!${RESET}"
    exit 0
    ;;
  *)
    echo "Invalid option."
    ;;
esac
