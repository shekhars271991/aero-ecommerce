#!/bin/bash

# Docker Setup Script for Aerospike E-commerce Application
# This script helps build and run the entire application stack using Docker Compose

set -e

echo "🚀 Setting up Aerospike E-commerce Application with Docker"
echo "=========================================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
        echo "❌ Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
    echo "✅ Docker Compose is available"
}

# Function to build and start services
start_services() {
    echo "🏗️  Building and starting all services..."
    
    # Use docker compose if available, otherwise fall back to docker-compose
    if docker compose version > /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    # Build and start all services
    $COMPOSE_CMD up --build -d
    
    echo "⏳ Waiting for services to be healthy..."
    
    # Wait for services to be ready
    sleep 30
    
    echo "🎉 All services should now be running!"
    echo ""
    echo "📋 Service Status:"
    $COMPOSE_CMD ps
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend (Next.js): http://localhost:4000"
    echo "   Backend API:        http://localhost:5001"
    echo "   MySQL:              localhost:3306"
    echo "   Aerospike:          localhost:3000"
    echo "   MongoDB:            localhost:27017"
    echo ""
    echo "🔍 To view logs:"
    echo "   All services:       $COMPOSE_CMD logs -f"
    echo "   Frontend only:      $COMPOSE_CMD logs -f frontend"
    echo "   Backend only:       $COMPOSE_CMD logs -f backend"
    echo ""
    echo "🛑 To stop all services:"
    echo "   $COMPOSE_CMD down"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Build and start all services (default)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      Show logs from all services"
    echo "  status    Show status of all services"
    echo "  clean     Stop services and remove containers, networks, and volumes"
    echo "  help      Show this help message"
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping all services..."
    if docker compose version > /dev/null 2>&1; then
        docker compose down
    else
        docker-compose down
    fi
    echo "✅ All services stopped"
}

# Function to restart services
restart_services() {
    echo "🔄 Restarting all services..."
    stop_services
    start_services
}

# Function to show logs
show_logs() {
    echo "📋 Showing logs from all services..."
    if docker compose version > /dev/null 2>&1; then
        docker compose logs -f
    else
        docker-compose logs -f
    fi
}

# Function to show status
show_status() {
    echo "📊 Service Status:"
    if docker compose version > /dev/null 2>&1; then
        docker compose ps
    else
        docker-compose ps
    fi
}

# Function to clean up everything
clean_services() {
    echo "🧹 Cleaning up all services, containers, networks, and volumes..."
    if docker compose version > /dev/null 2>&1; then
        docker compose down -v --remove-orphans
        docker compose rm -f
    else
        docker-compose down -v --remove-orphans
        docker-compose rm -f
    fi
    echo "✅ Cleanup completed"
}

# Main script logic
main() {
    case "${1:-start}" in
        start)
            check_docker
            check_docker_compose
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            check_docker
            check_docker_compose
            restart_services
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        clean)
            clean_services
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo "❌ Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run the main function with all arguments
main "$@"
