.PHONY: dev migrate install clean setup

dev:
	source venv/bin/activate && cd api && python manage.py runserver

migrate:
	source venv/bin/activate && cd api && python manage.py makemigrations customers && python manage.py migrate

setup: migrate
	source venv/bin/activate && cd api && python manage.py create_sample_data

install:
	source venv/bin/activate && pip install -r requirements.txt

clean:
	find . -name "__pycache__" -type d -exec rm -rf {} +
	rm -f api/db.sqlite3
