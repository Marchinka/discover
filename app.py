import os
from flask import Flask, jsonify, request, url_for, send_from_directory
from werkzeug.utils import redirect

from scraping import scraping_factory
from scraping.repository import events_repository, scraping_log_repository

app = Flask(__name__)

script_dir = os.path.dirname(__file__)  # absolute dir the script is in


@app.route('/')
def send_index():
    return app.send_static_file('index.html')


@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('static', path)


@app.route('/events', methods=['GET'])
def get_events():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    events = events_repository.get_events(start_date, end_date)
    return jsonify(events)


@app.route('/logs', methods=['GET'])
def get_logs():
    logs = scraping_log_repository.get_logs()
    return jsonify(logs)



@app.route('/sources', methods=['GET'])
def get_source():
    result = scraping_factory.get_engine().get_sources()
    return jsonify(result)


@app.route('/run_scraping', defaults={'engine_id': "All"}, methods=['GET'])
@app.route('/run_scraping/<string:engine_id>', methods=['GET'])
def run_engine(engine_id):
    result = scraping_factory.get_engine().run(engine_id)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
