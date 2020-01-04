import pymongo
from pymongo import ReplaceOne
from pymongo.errors import BulkWriteError

from scraping.utils.log import log_info

mongo_client = pymongo.MongoClient(
    "ds259738.mlab.com:59738",
    username='discover_adm',
    password='discover_adm01',
    authSource='heroku_rxd08jx3',
    retryWrites=False)
mongo_db = mongo_client["heroku_rxd08jx3"]
events_collection = mongo_db["events"]


def save_events(all_events):
    bulk_op = events_collection.initialize_ordered_bulk_op()

    for event in all_events:
        dto = event.get_dict()
        bulk_op.find({'title': dto["title"], 'location': dto["location"]}).upsert().update({'$set': dto})

    try:
        bulk_op.execute()
    except BulkWriteError as bwe:
        log_info(bwe.details)
