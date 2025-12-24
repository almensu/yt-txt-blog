#!/bin/bash

#############################################
# YouTube to Blog - 智能启动脚本
#############################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 端口配置
PORT_BACKEND=8000
PORT_NEW_SERVER=3000
PORT_FRONTEND=5173

# 日志目录（遵循资产存储约束：仅写入 .agent/ 目录）
LOG_DIR=".agent/logs"
PID_DIR=".agent/tmp/pids"
MANIFEST_DIR=".agent/manifests"
mkdir -p "$LOG_DIR" "$PID_DIR" "$MANIFEST_DIR"

#############################################
# 工具函数
#############################################

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BOLD}${CYAN}========================================${NC}"
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${BOLD}${CYAN}========================================${NC}\n"
}

# 杀掉占用指定端口的进程（优雅停机：SIGTERM → wait → SIGKILL）
kill_port() {
    local port=$1
    local service_name=$2

    # 查找占用端口的进程
    local pid=$(lsof -ti :"$port" 2>/dev/null || true)

    if [ -n "$pid" ]; then
        print_info "Stopping $service_name (port $port, PID: $pid)..."
        kill -TERM "$pid" 2>/dev/null || true
        sleep 2
        if kill -0 "$pid" 2>/dev/null; then
            print_warning "$service_name did not stop gracefully, forcing..."
            kill -KILL "$pid" 2>/dev/null || true
        fi
        print_success "$service_name stopped"
    else
        print_info "$service_name (port $port) not running"
    fi
}

# 检查端口是否可用
check_port_available() {
    local port=$1
    local service_name=$2

    if lsof -ti :"$port" >/dev/null 2>&1; then
        print_error "Port $port is still in use for $service_name"
        return 1
    fi
    return 0
}

# 等待服务启动
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_wait=${3:-15}
    local count=0

    print_info "Waiting for $service_name to start..."

    while [ $count -lt $max_wait ]; do
        if lsof -ti :"$port" >/dev/null 2>&1; then
            print_success "$service_name is running on port $port"
            return 0
        fi
        sleep 1
        count=$((count + 1))
        echo -n "."
    done

    echo ""
    print_error "$service_name failed to start within $max_wait seconds"
    return 1
}

# 检查命令是否存在
check_command() {
    local cmd=$1
    if ! command -v "$cmd" &> /dev/null; then
        print_error "$cmd is not installed"
        return 1
    fi
    return 0
}

#############################################
# 主流程
#############################################

print_header "YouTube to Blog - 服务启动"

# 检查必要的命令
print_info "Checking prerequisites..."
check_command "node" || exit 1
check_command "npm" || exit 1
print_success "Prerequisites check passed"

# Step 1: 清理旧进程
print_header "Step 1: 清理旧服务进程"

kill_port $PORT_BACKEND "Backend (Old System)"
kill_port $PORT_NEW_SERVER "New Server"
kill_port $PORT_FRONTEND "Frontend (Vite)"

# 等待端口释放
sleep 1

# Step 2: 启动后端服务 (Port 8000)
print_header "Step 2: 启动后端服务 (Port 8000)"

print_info "Starting Backend with yt-dlp..."
cd "$(dirname "$0")"

# 从 .zshrc 加载 API 密钥（避免 sourcing 整个文件）
if [ -f "$HOME/.zshrc" ]; then
  print_info "Loading API keys from ~/.zshrc..."

  # 加载 ZHIPU_API_KEY
  eval "$(grep '^export ZHIPU_API_KEY=' "$HOME/.zshrc" 2>/dev/null)"
  if [ -n "$ZHIPU_API_KEY" ]; then
    export ZHIPU_API_KEY
    print_success "ZHIPU_API_KEY loaded (${ZHIPU_API_KEY:0:10}...)"
  else
    print_warning "ZHIPU_API_KEY not found in ~/.zshrc"
  fi

  # 加载 GEMINI_API_KEY
  eval "$(grep '^export GEMINI_API_KEY=' "$HOME/.zshrc" 2>/dev/null)"
  if [ -n "$GEMINI_API_KEY" ]; then
    export GEMINI_API_KEY
    print_success "GEMINI_API_KEY loaded (${GEMINI_API_KEY:0:10}...)"
  else
    print_warning "GEMINI_API_KEY not found in ~/.zshrc"
  fi

  # 加载 DEEPSEEK_API_KEY
  eval "$(grep '^export DEEPSEEK_API_KEY=' "$HOME/.zshrc" 2>/dev/null)"
  if [ -n "$DEEPSEEK_API_KEY" ]; then
    export DEEPSEEK_API_KEY
    print_success "DEEPSEEK_API_KEY loaded (${DEEPSEEK_API_KEY:0:10}...)"
  else
    print_warning "DEEPSEEK_API_KEY not found in ~/.zshrc"
  fi
fi

nohup npx tsx watch src/backend/index.ts > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PID_DIR/backend.pid"

print_success "Backend started (PID: $BACKEND_PID)"
print_info "Log file: $LOG_DIR/backend.log"

wait_for_service $PORT_BACKEND "Backend" || {
    print_error "Backend failed to start, check logs at $LOG_DIR/backend.log"
    cat "$LOG_DIR/backend.log" | tail -20
    exit 1
}

# Step 3: 启动新服务 (Port 3000)
print_header "Step 3: 启动新服务 (Port 3000)"

print_info "Starting New Server..."
nohup npx tsx watch src/server.ts > "$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_DIR/server.pid"

print_success "New Server started (PID: $SERVER_PID)"
print_info "Log file: $LOG_DIR/server.log"

wait_for_service $PORT_NEW_SERVER "New Server" || {
    print_error "New Server failed to start, check logs at $LOG_DIR/server.log"
    cat "$LOG_DIR/server.log" | tail -20
    exit 1
}

# Step 4: 启动前端服务 (Port 5173)
print_header "Step 4: 启动前端服务 (Port 5173)"

print_info "Starting Frontend with Vite..."
cd src/frontend
nohup npm run dev > "../../$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "../../$PID_DIR/frontend.pid"
cd - > /dev/null

print_success "Frontend started (PID: $FRONTEND_PID)"
print_info "Log file: $LOG_DIR/frontend.log"

wait_for_service $PORT_FRONTEND "Frontend" || {
    print_error "Frontend failed to start, check logs at $LOG_DIR/frontend.log"
    cat "$LOG_DIR/frontend.log" | tail -20
    exit 1
}

# Step 5: 显示服务状态
print_header "Step 5: 服务状态"

echo -e "${BOLD}服务列表:${NC}"
echo ""
echo -e "  ${CYAN}1. Backend (Old System)${NC}"
echo -e "     Port: ${GREEN}$PORT_BACKEND${NC}"
echo -e "     PID:  $BACKEND_PID"
echo -e "     URL:  ${YELLOW}http://localhost:$PORT_BACKEND/health${NC}"
echo -e "     Log:  $LOG_DIR/backend.log"
echo ""
echo -e "  ${CYAN}2. New Server (Asset Management)${NC}"
echo -e "     Port: ${GREEN}$PORT_NEW_SERVER${NC}"
echo -e "     PID:  $SERVER_PID"
echo -e "     URL:  ${YELLOW}http://localhost:$PORT_NEW_SERVER/health${NC}"
echo -e "     Log:  $LOG_DIR/server.log"
echo ""
echo -e "  ${CYAN}3. Frontend (Vite Dev Server)${NC}"
echo -e "     Port: ${GREEN}$PORT_FRONTEND${NC}"
echo -e "     PID:  $FRONTEND_PID"
echo -e "     URL:  ${YELLOW}http://localhost:$PORT_FRONTEND${NC}"
echo -e "     Log:  $LOG_DIR/frontend.log"
echo ""

# 健康检查
print_header "Step 6: 健康检查"

# 检查后端
BACKEND_HEALTH=$(curl -s http://localhost:$PORT_BACKEND/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "failed")
if [ "$BACKEND_HEALTH" = "healthy" ]; then
    print_success "Backend health check: OK"
else
    print_warning "Backend health check: $BACKEND_HEALTH"
fi

# 检查新服务
NEW_SERVER_HEALTH=$(curl -s http://localhost:$PORT_NEW_SERVER/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "failed")
if [ "$NEW_SERVER_HEALTH" = "ok" ]; then
    print_success "New Server health check: OK"
else
    print_warning "New Server health check: $NEW_SERVER_HEALTH"
fi

# 完成
print_header "启动完成！"

echo -e "${GREEN}${BOLD}所有服务已成功启动！${NC}\n"

echo -e "访问应用: ${YELLOW}http://localhost:$PORT_FRONTEND${NC}"
echo -e "后端 API: ${YELLOW}http://localhost:$PORT_BACKEND/api${NC}"
echo -e "新服务 API: ${YELLOW}http://localhost:$PORT_NEW_SERVER/api${NC}"
echo ""

echo -e "${CYAN}查看日志:${NC}"
echo -e "  tail -f $LOG_DIR/backend.log"
echo -e "  tail -f $LOG_DIR/server.log"
echo -e "  tail -f $LOG_DIR/frontend.log"
echo ""

echo -e "${CYAN}停止所有服务:${NC}"
echo -e "  ./stop.sh"
echo ""

# 保存所有 PID 到一个文件，方便 stop.sh 使用
cat > "$PID_DIR/all_pids" << EOF
$BACKEND_PID
$SERVER_PID
$FRONTEND_PID
EOF

print_success "PID 文件已保存: $PID_DIR/all_pids"

# 输出 Manifest（遵循资产存储约束）
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MANIFEST_FILE="$MANIFEST_DIR/port-management-start.json"
cat > "$MANIFEST_FILE" << EOF
{
  "p_sequence": "N/A",
  "name": "port-management-start",
  "skill_id": "port-management",
  "created_at": "$TIMESTAMP",
  "inputs": {
    "ports": [$PORT_BACKEND, $PORT_NEW_SERVER, $PORT_FRONTEND],
    "services": ["backend", "new_server", "frontend"]
  },
  "outputs": {
    "backend_pid": $BACKEND_PID,
    "server_pid": $SERVER_PID,
    "frontend_pid": $FRONTEND_PID
  },
  "level": "1",
  "mode": "dev"
}
EOF

print_success "Manifest 已保存: $MANIFEST_FILE"
