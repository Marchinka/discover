import pymongo
from pymongo import ReplaceOne
from pymongo.errors import BulkWriteError

from scraping.utils.log import log_info

mongo_client = pymongo.MongoClient(
    "ds259738.mlab.com:59738",
    username='discover_adm',
    password='Magheggio.89',
    authSource='heroku_rxd08jx3',
    retryWrites=False)
mongo_db = mongo_client["heroku_rxd08jx3"]
events_collection = mongo_db["events"]


class Event:
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

    def get_sources(self):
        engine_names = []
        for engine in self.engines:
            engine_names.append(engine.name())
        return engine_names

    def run(self, source="All"):
        all_result = []
        all_events = []
        is_successful = True
        for engine in self.engines:
            if source == "All" or source == engine.name():
                result = self.__run_engine__(engine)
                is_successful = is_successful and result["is_successful"]
                events = result["events"]
                all_events = all_events + events
                all_result.append({
                    "events_count": len(events),
                    "is_successful": result["is_successful"],
                    "engine": result["engine"]})

        bulk_op = events_collection.initialize_ordered_bulk_op()

        for show in all_events:
            dto = show.get_dict()
            bulk_op.find({'title': dto["title"], 'location': dto["location"]}).upsert().update({'$set': dto})

        try:
            bulk_op.execute()
        except BulkWriteError as bwe:
            log_info(bwe.details)

        return all_result

    def __run_engine__(self, engine):
        try:
            log_info("Starting", engine.name())
            result = engine.run()

            if not result["is_successful"]:
                log_info("Engine", engine.name(), "is not successful")

            log_info("Found", len(result["events"]), "shows")
            return result

        except Exception as e:
            log_info("Engine", engine.name(), "has encountered a fatal error")
            log_info(e)
            return {"events": [], "is_successful": False, "engine": engine.name()}
