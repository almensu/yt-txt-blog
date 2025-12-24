#!/bin/bash

#############################################
# YouTube to Blog - 停止服务脚本
#############################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "\n${BOLD}${BLUE}========================================${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}========================================${NC}\n"
}

# 杀掉占用指定端口的进程（优雅停机：SIGTERM → wait → SIGKILL）
kill_port() {
    local port=$1
    local service_name=$2

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

# 从 PID 文件杀掉进程（优雅停机：SIGTERM → wait → SIGKILL）
kill_from_pid_file() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file" 2>/dev/null || echo "")
        if [ -n "$pid" ]; then
            # 检查进程是否还在运行
            if ps -p "$pid" > /dev/null 2>&1; then
                print_info "Stopping $service_name (PID: $pid)..."
                kill -TERM "$pid" 2>/dev/null || true
                sleep 2
                if kill -0 "$pid" 2>/dev/null; then
                    print_warning "$service_name did not stop gracefully, forcing..."
                    kill -KILL "$pid" 2>/dev/null || true
                fi
                print_success "$service_name stopped"
            else
                print_warning "$service_name (PID: $pid) not running"
            fi
        fi
        rm -f "$pid_file"
    fi
}

#############################################
# 主流程
#############################################

print_header "YouTube to Blog - 停止服务"

cd "$(dirname "$0")"

# 方法1: 从 PID 文件停止
if [ -f "$PID_DIR/all_pids" ]; then
    print_info "从 PID 文件停止服务..."

    while read -r pid; do
        if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
            print_info "Stopping process (PID: $pid)..."
            kill -TERM "$pid" 2>/dev/null || true
            sleep 1
            if kill -0 "$pid" 2>/dev/null; then
                kill -KILL "$pid" 2>/dev/null || true
            fi
        fi
    done < "$PID_DIR/all_pids"

    rm -f "$PID_DIR/all_pids"
fi

# 方法2: 从端口杀掉进程（备用）
print_header "清理端口占用"

kill_port $PORT_BACKEND "Backend (Old System)"
kill_port $PORT_NEW_SERVER "New Server"
kill_port $PORT_FRONTEND "Frontend (Vite)"

# 清理 PID 文件
print_header "清理 PID 文件"

rm -f "$PID_DIR/backend.pid"
rm -f "$PID_DIR/server.pid"
rm -f "$PID_DIR/frontend.pid"
rm -f "$PID_DIR/all_pids"

print_success "所有服务已停止"

# 确认没有残留进程
print_header "确认服务状态"

REMAINING=$(lsof -ti :$PORT_BACKEND :$PORT_NEW_SERVER :$PORT_FRONTEND 2>/dev/null || true)

if [ -n "$REMAINING" ]; then
    print_warning "发现残留进程，强制清理..."
    echo "$REMAINING" | xargs kill -9 2>/dev/null || true
    print_success "残留进程已清理"
else
    print_success "所有端口已释放"
fi

echo ""
print_success "完成！"

# 输出 Manifest（遵循资产存储约束）
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MANIFEST_FILE="$MANIFEST_DIR/port-management-stop.json"
cat > "$MANIFEST_FILE" << EOF
{
  "p_sequence": "N/A",
  "name": "port-management-stop",
  "skill_id": "port-management",
  "created_at": "$TIMESTAMP",
  "inputs": {
    "ports": [$PORT_BACKEND, $PORT_NEW_SERVER, $PORT_FRONTEND],
    "services": ["backend", "new_server", "frontend"]
  },
  "outputs": {
    "stopped": true,
    "ports_released": true
  },
  "level": "1"
}
EOF

print_success "Manifest 已保存: $MANIFEST_FILE"
