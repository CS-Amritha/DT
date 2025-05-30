from pymongo import MongoClient
from config.settings import MONGO_URI, MONGO_DB_NAME

class MongoExporter:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[MONGO_DB_NAME]

    def save_to_mongo(self, data, collection_name):
        if data:
            collection = self.db[collection_name]
            collection.insert_many(data)
            return f"Saved {len(data)} documents to MongoDB collection '{collection_name}'"
        return "No data to save."

    def update_mongo(self, collection_name, query, update_data):
        collection = self.db[collection_name]
        result = collection.update_one(query, {"$set": update_data})
        if result.matched_count > 0:
            return "Update successful"
        return "No matching document found"
