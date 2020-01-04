import datetime

import pymongo
from pymongo.errors import BulkWriteError

from scraping.repository import app_mongo_db
from scraping.utils.log import log_info


def save_events(all_events):
    if len(all_events) == 0:
        return

    bulk_op = app_mongo_db.events_collection.initialize_ordered_bulk_op()

    for event in all_events:
        dto = event.get_dict()
        bulk_op.find({'title': dto["title"], 'location': dto["location"]}).upsert().update({'$set': dto})

    try:
        bulk_op.execute()
    except BulkWriteError as bwe:
        log_info(bwe.details)


def get_events(start_date_timestamp, end_date_timestamp):
    query = dict()

    if start_date_timestamp:
        start_date = datetime.datetime.fromtimestamp(int(start_date_timestamp))
        query["end_date"] = {"$gte": start_date}

    if end_date_timestamp:
        end_date = datetime.datetime.fromtimestamp(int(end_date_timestamp))
        query["start_date"] = {"$lte": end_date}

    cursor = app_mongo_db.events_collection.find(query).sort([("start_date", pymongo.ASCENDING), ("title", pymongo.ASCENDING)])
    events = list(cursor)
    for event in events:
        event["_id"] = str(event["_id"])
        event["start_date"] = datetime.datetime.timestamp(event["start_date"])
        event["end_date"] = datetime.datetime.timestamp(event["end_date"])
    return events
