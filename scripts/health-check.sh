#!/bin/bash

# YouTube to Pure Text Generator - Health Check Script
# This script verifies that all system components are working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global status
OVERALL_STATUS=0

# Print functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    OVERALL_STATUS=1
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check service
check_service() {
    local service_name=$1
    local service_url=$2
    local timeout=5

    print_info "Checking $service_name..."

    if command_exists curl; then
        if curl -s --max-time $timeout "$service_url" >/dev/null 2>&1; then
            print_success "$service_name is responding"
            return 0
        else
            print_error "$service_name is not responding"
            return 1
        fi
    else
        print_warning "curl not available, cannot check $service_name"
        return 2
    fi
}

# Check file
check_file() {
    local file_path=$1
    local file_description=$2

    print_info "Checking $file_description..."

    if [ -f "$file_path" ]; then
        print_success "$file_description exists"
        return 0
    else
        print_error "$file_description not found: $file_path"
        return 1
    fi
}

# Check directory
check_directory() {
    local dir_path=$1
    local dir_description=$2

    print_info "Checking $dir_description..."

    if [ -d "$dir_path" ]; then
        print_success "$dir_description exists"
        return 0
    else
        print_error "$dir_description not found: $dir_path"
        return 1
    fi
}

# Main health check function
main() {
    echo -e "${BLUE}"
    echo "🏥 YouTube to Pure Text Generator - Health Check"
    echo "================================================"
    echo -e "${NC}"

    # Check basic commands
    echo "🔧 Basic Command Checks"
    echo "----------------------"

    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js: $NODE_VERSION"
    else
        print_error "Node.js not found"
    fi

    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm: $NPM_VERSION"
    else
        print_error "npm not found"
    fi

    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python: $PYTHON_VERSION"
    else
        print_error "Python3 not found"
    fi

    if command_exists yt-dlp; then
        YTDLP_VERSION=$(yt-dlp --version 2>/dev/null || echo "version check failed")
        print_success "yt-dlp: $YTDLP_VERSION"
    else
        print_error "yt-dlp not found"
    fi

    echo
    echo "📁 File System Checks"
    echo "--------------------"

    # Check project structure
    check_file "package.json" "package.json"
    check_file "tsconfig.json" "TypeScript configuration"
    check_file ".env" "Environment configuration"
    check_file "scripts/clean_subtitle.py" "Python cleaning script"

    # Check directories
    check_directory "src" "Source code directory"
    check_directory "src/shared" "Shared code directory"
    check_directory "src/backend" "Backend code directory"
    check_directory "storage" "Storage directory"
    check_directory "storage/downloads" "Downloads directory"
    check_directory "storage/processed" "Processed directory"
    check_directory "storage/temp" "Temp directory"
    check_directory "storage/logs" "Logs directory"

    echo
    echo "🧪 Component Tests"
    echo "-----------------"

    # Test TypeScript compilation
    print_info "Testing TypeScript compilation..."
    if npm run type-check >/dev/null 2>&1; then
        print_success "TypeScript compilation successful"
    else
        print_error "TypeScript compilation failed"
    fi

    # Test linting
    print_info "Testing code linting..."
    if npm run lint >/dev/null 2>&1; then
        print_success "Code linting passed"
    else
        print_warning "Code linting issues found"
    fi

    # Test Python script
    print_info "Testing Python cleaning script..."
    if python3 scripts/clean_subtitle.py --help >/dev/null 2>&1; then
        print_success "Python cleaning script working"
    else
        print_error "Python cleaning script failed"
    fi

    # Check if tests pass
    print_info "Running test suite..."
    if npm test >/dev/null 2>&1; then
        print_success "All tests passed"
    else
        print_warning "Some tests failed"
    fi

    echo
    echo "🌐 Service Checks"
    echo "----------------"

    # Check if backend service is running
    if check_service "Backend API" "http://localhost:3000/health"; then
        # Additional API checks
        print_info "Checking API endpoints..."

        if command_exists curl; then
            # Check system status
            if curl -s "http://localhost:3000/api/system/status" >/dev/null 2>&1; then
                print_success "System status endpoint working"
            else
                print_warning "System status endpoint not responding"
            fi
        fi
    else
        print_warning "Backend service not running - start with 'npm run dev:backend'"
    fi

    echo
    echo "📊 Configuration Summary"
    echo "------------------------"

    # Check environment variables
    if [ -f .env ]; then
        print_info "Environment file found, checking key variables..."

        # Check for required variables
        required_vars=("NODE_ENV" "PORT")
        for var in "${required_vars[@]}"; do
            if grep -q "^${var}=" .env; then
                value=$(grep "^${var}=" .env | cut -d'=' -f2-)
                if [ "$var" = "PORT" ]; then
                    print_success "$var: $value"
                else
                    print_success "$var: [SET]"
                fi
            else
                print_warning "$var not set in .env"
            fi
        done
    else
        print_warning "No .env file found"
    fi

    echo
    echo "📈 Storage Status"
    echo "----------------"

    # Check storage usage
    if command_exists du; then
        if [ -d storage ]; then
            STORAGE_SIZE=$(du -sh storage 2>/dev/null | cut -f1)
            FILE_COUNT=$(find storage -type f 2>/dev/null | wc -l)
            print_success "Storage directory: $STORAGE_SIZE, $FILE_COUNT files"
        fi
    fi

    # Final summary
    echo
    if [ $OVERALL_STATUS -eq 0 ]; then
        print_success "🎉 All health checks passed!"
        echo
        echo -e "${GREEN}The system is ready for use.${NC}"
    else
        print_error "❌ Some health checks failed!"
        echo
        echo -e "${RED}Please address the issues above before proceeding.${NC}"
    fi

    echo
    echo -e "${BLUE}Quick fixes:${NC}"
    echo "• Missing dependencies: Run './scripts/setup.sh'"
    echo "• Backend not running: Run 'npm run dev:backend'"
    echo "• TypeScript errors: Run 'npm run type-check'"
    echo "• Linting issues: Run 'npm run lint:fix'"
    echo

    exit $OVERALL_STATUS
}

# Run main function
main "$@"