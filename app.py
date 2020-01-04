from flask import Flask

from scraping import scraping_factory

app = Flask(__name__)


@app.route("/")
def hello():
    return "Hello World!"


@app.route("/run_scraping")
def run_engine():
    scraping_factory.get_engine().run()
    return "Done"


if __name__ == "__main__":
    app.run(debug=True)
