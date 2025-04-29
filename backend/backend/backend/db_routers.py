class SensorManagerRouter:
    """
    Điều hướng database cho app sensor_manager sang sensor_manager database.
    Các app còn lại mặc định dùng database 'default'.
    """

    def db_for_read(self, model, **hints):
        if model._meta.app_label == "sensor_manager":
            return "sensor_manager"
        return "default"

    def db_for_write(self, model, **hints):
        if model._meta.app_label == "sensor_manager":
            return "sensor_manager"
        return "default"

    def allow_relation(self, obj1, obj2, **hints):
        db1 = self.db_for_read(obj1)
        db2 = self.db_for_read(obj2)
        if db1 and db2:
            return db1 == db2
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == "sensor_manager":
            return db == "sensor_manager"
        return db == "default"
