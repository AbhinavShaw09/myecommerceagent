.PHONY: start frontend backend install clean

start: install
	@echo "Starting both services..."
	@make -j2 frontend backend

run-frontend:
	@echo "Starting frontend..."
	cd frontend && bun dev

run-backend:
	@echo "Starting backend..."
	cd backend && source venv/bin/activate && cd api && python manage.py runserver

install:
	@echo "Installing frontend dependencies..."
	cd frontend && bun install

clean:
	@echo "Cleaning build files..."
	rm -rf frontend/node_modules frontend/.next
	find backend -name "__pycache__" -type d -exec rm -rf {} +
