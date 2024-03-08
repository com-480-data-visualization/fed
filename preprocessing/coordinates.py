class Coordinates:
    def __init__(self, lat, lon):
        if lat is None or lon is None:
            self.lat = None
            self.lon = None
            return

        self.lat = lat
        self.lon = lon

    def _to_tuple(self):
        return (self.lat, self.lon)

    def print(self):
        print(f"({self.lat}, {self.lon})")
