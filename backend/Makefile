.PHONY: dev migrate install clean

dev:
	source venv/bin/activate && cd api && python manage.py runserver

migrate:
	source venv/bin/activate && cd api && python manage.py migrate

install:
	source venv/bin/activate && pip install -r requirements.txt

clean:
	find . -name "__pycache__" -type d -exec rm -rf {} +
	rm -f api/db.sqlite3
