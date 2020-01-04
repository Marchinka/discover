import pymongo
from pymongo import ReplaceOne
from pymongo.errors import BulkWriteError

from scraping.utils.log import log_info

__mongo_client__ = pymongo.MongoClient(
    "ds259738.mlab.com:59738",
    username='discover_adm',
    password='discover_adm01',
    authSource='heroku_rxd08jx3',
    retryWrites=False)
__mongo_db__ = __mongo_client__["heroku_rxd08jx3"]

scraping_log_collection = __mongo_db__["scraping_log"]
events_collection = __mongo_db__["events"]

