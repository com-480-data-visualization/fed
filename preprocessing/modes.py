from enum import Enum
import json, os
import requests
from coordinates import Coordinates
from dotenv import load_dotenv

load_dotenv()


class Mode(Enum):
    AIRPLANE = 0
    TRAIN = 1
    CAR = 2


class Route:
    def __init__(self, mode, distance, duration) -> None:
        self.mode = mode
        self.distance = distance
        self.duration = duration


@staticmethod
def _get_routes(from_: Coordinates, to: Coordinates) -> list[Mode]:
    def get_routes(mode, from_: Coordinates, to: Coordinates):
        url = "https://routes.googleapis.com/directions/v2:computeRoutes"

        payload = json.dumps(
            {
                "origin": {
                    "location": {
                        "latLng": {
                            "latitude": from_.lat,
                            "longitude": from_.lon,
                        }
                    }
                },
                "destination": {
                    "location": {
                        "latLng": {
                            "latitude": to.lat,
                            "longitude": to.lon,
                        }
                    }
                },
                "travelMode": mode,
                "computeAlternativeRoutes": True,
            }
        )

        api_key = os.getenv("GOOGLE_MAPS_API_KEY")

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
        }

        response = requests.post(url, headers=headers, data=payload)
        if not response.json():
            return None, 0
        else:
            dur = int(response.json()["routes"][0]["duration"].replace("s", "")) / 3600
            match mode:
                case "DRIVE":
                    return Mode.CAR, dur
                case "TRANSIT":
                    return Mode.TRAIN, dur

    drive, dur_drive = get_routes("DRIVE", from_, to)
    tr, dur_tr = get_routes("TRANSIT", from_, to)
    return drive, dur_drive, tr, dur_tr


def get_available_modes(from_, to) -> list[Mode]:
    result = [Mode.AIRPLANE]
    drive, dur_drive, tr, dur_tr = _get_routes(from_, to)
    result.append(drive) if drive != None else result
    result.append(tr) if tr != None else result
    return (result, dur_drive, dur_tr)
