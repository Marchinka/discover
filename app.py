from flask import Flask, jsonify

from scraping import scraping_factory

app = Flask(__name__)


@app.route("/")
def hello():
    return "Hello World!"


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
