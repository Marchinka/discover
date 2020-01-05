import datetime

import pymongo

from scraping.repository import app_mongo_db


def can_run(engine_name):
    engine_run = app_mongo_db.scraping_log_collection.find_one({"engine": engine_name})
    if not engine_run:
        return {"can_run": True, "result": engine_run}
    else:
        del engine_run["_id"]
        last_run = engine_run["last_run"]
        today = datetime.datetime.today()
        threshold = last_run.replace(hour=23, minute=59)
        can_engine_run = today > threshold
        return {"can_run": can_engine_run, "result": engine_run}


def log_run(engine_name, result):
    dto = {
        "engine": engine_name,
        "last_run": datetime.datetime.now(),
        "is_successful": result["is_successful"],
        "events_count": len(result["events"])
    }
    app_mongo_db.scraping_log_collection.update({"engine": engine_name}, dto, True)


def get_logs():
    cursor = app_mongo_db.scraping_log_collection.find().sort([("last_run", pymongo.ASCENDING), ("engine", pymongo.ASCENDING)])
    elements = list(cursor)
    for element in elements:
        element["last_run"] = datetime.datetime.timestamp(element["last_run"])
        element["_id"] = str(element["_id"])
    return elements
