.PHONY: install dev test run-capture run-dashboard run-watch

install:
	python -m pip install -e .

dev:
	python -m pip install -e .[dev,watch]

test:
	pytest -q

run-capture:
	archaios_capture --title "Test" --project_code "DEMO" --tier Research --tags "demo" --content "Test content"

run-dashboard:
	archaios_dashboard

run-watch:
	archaios_watch
