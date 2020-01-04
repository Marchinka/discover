import pymongo
from pymongo import ReplaceOne
from pymongo.errors import BulkWriteError

mongo_client = pymongo.MongoClient(
    "ds259738.mlab.com:59738",
    username='discover_adm',
    password='Magheggio.89',
    authSource='heroku_rxd08jx3',
    retryWrites=False)
mongo_db = mongo_client["heroku_rxd08jx3"]
events_collection = mongo_db["events"]

class Show:
    def __init__(self, title, start_date, end_date, location, description="", link=""):
        self.title = title
        self.location = location
        self.start_date = start_date
        self.end_date = end_date
        self.description = description
        self.link = link

    def get_dict(self):
        return {
            "title": self.title,
            "location": self.location,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "description": self.description,
            "link": self.link}

    def print_show(self):
        print(self.get_dict())


class ScrapingEngine:
    def __init__(self, engines):
        self.engines = engines

    def run(self):
        all_shows = []
        for engine in self.engines:
            print("Starting", engine.name())
            shows = engine.run()
            print("Found", len(shows), "shows")
            all_shows = all_shows + shows

        dtos = []
        bulk_op = events_collection.initialize_ordered_bulk_op()

        for show in all_shows:
            dto = show.get_dict()
            dtos.append(dto)
            bulk_op.find({'title': dto["title"]}).upsert().update({'$set': dto})

        try:
            bulk_op.execute()
        except BulkWriteError as bwe:
            print(bwe.details)


