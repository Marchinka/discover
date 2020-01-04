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
