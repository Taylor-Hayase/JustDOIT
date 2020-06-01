import pymongo
from bson import ObjectId

class Model(dict):
    """
    A simple model that wraps mongodb document
    """
    __getattr__ = dict.get
    __delattr__ = dict.__delitem__
    __setattr__ = dict.__setitem__

    def save(self):
        if not self._id:
            self.collection.insert(self)
        else:
            self.collection.update(
                { "_id": ObjectId(self._id) }, self)
        self._id = str(self._id)

    def reload(self):
        if self._id:
            self.update(self.collection\
                    .find_one({"_id": ObjectId(self._id)}))
            self._id = str(self._id)

    def remove(self):
        if self._id:
            self.collection.remove({"_id": ObjectId(self._id)})
            self.clear()

class User(Model):
    db_client = pymongo.MongoClient('localhost', 27017)
    collection = db_client["users"]["users_list"]

    def add_user(self, user):
        return None
    def add_list(self, user, listo):
        return None
    def add_item(self, user, listo, item):
        return None
    

    def find_all(self):
        users = list(self.collection.find())
        for user in users:
            user["_id"] = str(user["_id"])
        return users

    def find_by_name(self, name):
        users = list(self.collection.find({"username": name}))
        for user in users:
            user["_id"] = str(user["_id"])
        return users
    def find_by_login(self, name, password):
        users = list(self.collection.find({"username": name, "password":password}))
        for user in users:
            user["_id"] = str(user["_id"])
        return users

    def delete_user(self, user):
        return None
    def delete_list(self, user, listo):
        return None
    def delete_item(self, user, listo, item):
        return None