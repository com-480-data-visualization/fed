import pandas as pd
from coordinates import Coordinates
from modes import Mode
from transport_co2 import estimate_co2
from modes import get_available_modes
from geopy import distance


DATA_IN = "../data/preprocessed/tournaments_without_special_events.csv"
DATA_OUT = "../data/preprocessed/edges_between_cities.csv"


def load_data() -> pd.DataFrame:
    return pd.read_csv(DATA_IN)


def clean_coords(coords):
    if coords == "(None, None)":
        return Coordinates(None, None)
    coords = coords.replace("(", "").replace(")", "")
    coords = tuple(map(float, coords.split(",")))
    return Coordinates(*coords)


def _dist(c1: Coordinates, c2: Coordinates):
    if c1 is None or c2 is None:
        return None

    return distance.distance(c1, c2).km


def compute_co2(distance, passengers=1):
    if distance is None:
        return None, None, None

    train = estimate_co2(mode="light_rail", distance_in_km=distance) / 1e6
    airplane = estimate_co2(mode="airplane", distance_in_km=distance) / 1e6
    car = estimate_co2(mode="car", distance_in_km=distance, occupancy=passengers) / 1e6
    return train, airplane, car


def get_duration(distance, mode):
    match mode:
        case Mode.AIRPLANE:
            return distance / 880 + 3  # Add time for boarding, commuting etc.


def edges():
    df = load_data()
    rez = pd.DataFrame(
        columns=[
            "u",
            "v",
            "u_continent",
            "v_continent",
            "u_name",
            "v_name",
            "u_coords",
            "v_coords",
            "dist",
            "train_co2",
            "airplane_co2",
            "car_co2",
            "modes",
            "train_duration",
            "car_duration",
            "airplane_duration",
        ]
    )

    for index1, row1 in df.iterrows():
        print(index1 + 1, "/", len(df))
        for index2, row2 in df.iterrows():
            if index1 != index2:
                if row1["idx"] == row2["idx"] + 1:
                    coords1 = clean_coords(row1["coords"])
                    coords2 = clean_coords(row2["coords"])
                    dist = _dist(coords1._to_tuple(), coords2._to_tuple())
                    train, airplane, car = compute_co2(dist)
                    modes, dur_dr, dur_tr = get_available_modes(coords1, coords2)
                    airplane_duration = get_duration(dist, Mode.AIRPLANE)
                    line = [
                        row2["index"],
                        row1["index"],
                        row2["continent"],
                        row1["continent"],
                        row2["city"],
                        row1["city"],
                        row2["coords"],
                        row1["coords"],
                        dist,
                        train,
                        airplane,
                        car,
                        modes,
                        dur_tr,
                        dur_dr,
                        airplane_duration,
                    ]
                    rez.loc[len(rez)] = line
    rez.to_csv(DATA_OUT)


if __name__ == "__main__":
    edges()
