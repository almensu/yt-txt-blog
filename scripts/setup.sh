#!/bin/bash

# YouTube to Pure Text Generator - Setup Script
# This script sets up the development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
}

# Print header
print_header() {
    echo -e "${BLUE}"
    echo "🎬 YouTube to Pure Text Generator - Setup Script"
    echo "=================================================="
    echo -e "${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check version
check_version() {
    local cmd=$1
    local min_version=$2
    local current_version

    if ! command_exists "$cmd"; then
        return 1
    fi

    case $cmd in
        node)
            current_version=$(node --version | sed 's/v//')
            ;;
        npm)
            current_version=$(npm --version)
            ;;
        python3)
            current_version=$(python3 --version 2>&1 | awk '{print $2}')
            ;;
        yt-dlp)
            current_version=$(yt-dlp --version 2>/dev/null || echo "0.0.0")
            ;;
        *)
            current_version=$($cmd --version 2>/dev/null | head -n1 | awk '{print $NF}' || echo "0.0.0")
            ;;
    esac

    # Simple version comparison (works for basic semantic versions)
    if printf '%s\n%s\n' "$min_version" "$current_version" | sort -V -C; then
        return 0
    else
        return 1
    fi
}

# Main setup function
main() {
    print_header

    # Check Node.js
    print_info "Checking Node.js..."
    if command_exists node; then
        if check_version node "18.0.0"; then
            NODE_VERSION=$(node --version)
            print_success "Node.js found: $NODE_VERSION"
        else
            print_error "Node.js version 18.0.0 or higher is required"
            print_info "Please upgrade Node.js from https://nodejs.org/"
            exit 1
        fi
    else
        print_error "Node.js is not installed"
        print_info "Please install Node.js from https://nodejs.org/"
        exit 1
    fi

    # Check npm
    print_info "Checking npm..."
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi

    # Check Python
    print_info "Checking Python..."
    if command_exists python3; then
        if check_version python3 "3.7.0"; then
            PYTHON_VERSION=$(python3 --version)
            print_success "Python found: $PYTHON_VERSION"
        else
            print_error "Python version 3.7.0 or higher is required"
            print_info "Please install Python 3.7+ from https://python.org/"
            exit 1
        fi
    else
        print_error "Python 3 is not installed"
        print_info "Please install Python 3.7+ from https://python.org/"
        exit 1
    fi

    # Check yt-dlp
    print_info "Checking yt-dlp..."
    if command_exists yt-dlp; then
        YTDLP_VERSION=$(yt-dlp --version)
        print_success "yt-dlp found: $YTDLP_VERSION"
    else
        print_warning "yt-dlp is not installed"
        print_info "Installing yt-dlp..."

        # Try to install yt-dlp
        if command_exists pip3; then
            pip3 install --user yt-dlp
            if command_exists yt-dlp; then
                print_success "yt-dlp installed successfully"
                YTDLP_VERSION=$(yt-dlp --version)
                print_info "yt-dlp version: $YTDLP_VERSION"
            else
                print_error "Failed to install yt-dlp with pip3"
                print_info "Please install yt-dlp manually:"
                print_info "  macOS: brew install yt-dlp"
                print_info "  Ubuntu/Debian: sudo apt install yt-dlp"
                print_info "  Or: pip3 install --user yt-dlp"
                exit 1
            fi
        else
            print_error "pip3 is not available for yt-dlp installation"
            print_info "Please install yt-dlp manually:"
            print_info "  macOS: brew install yt-dlp"
            print_info "  Ubuntu/Debian: sudo apt install yt-dlp"
            print_info "  Or: pip3 install --user yt-dlp"
            exit 1
        fi
    fi

    # Create storage directories
    print_info "Creating storage directories..."
    mkdir -p storage/{downloads,processed,temp,logs}
    print_success "Storage directories created"

    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please review and update the .env file with your configuration"
    else
        print_success ".env file already exists"
    fi

    # Install npm dependencies
    print_info "Installing npm dependencies..."
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi

    # Run TypeScript type check
    print_info "Running TypeScript type check..."
    if npm run type-check; then
        print_success "TypeScript type check passed"
    else
        print_warning "TypeScript type check failed - please review the errors above"
    fi

    # Run linter
    print_info "Running linter..."
    if npm run lint; then
        print_success "Linting passed"
    else
        print_warning "Linting issues found - please review the errors above"
    fi

    # Test Python cleaning script
    print_info "Testing Python cleaning script..."
    if python3 scripts/clean_subtitle.py --help > /dev/null 2>&1; then
        print_success "Python cleaning script is working"
    else
        print_error "Python cleaning script test failed"
        exit 1
    fi

    # Run tests
    print_info "Running tests..."
    if npm test; then
        print_success "All tests passed"
    else
        print_warning "Some tests failed - please review the errors above"
    fi

    # Final summary
    echo
    print_success "Setup completed successfully! 🎉"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Review and update the .env file if needed"
    echo "2. Run 'npm run dev' to start the development server"
    echo "3. Visit http://localhost:3000/health to verify the server is running"
    echo "4. Check the README.md for usage instructions"
    echo
    echo -e "${BLUE}Useful commands:${NC}"
    echo "  npm run dev          - Start development server"
    echo "  npm test             - Run tests"
    echo "  npm run lint         - Run linter"
    echo "  npm run build        - Build for production"
    echo "  npm run type-check   - Check TypeScript types"
    echo
}

# Run main function
main "$@"