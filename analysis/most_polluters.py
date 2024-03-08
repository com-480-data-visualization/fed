import pandas as pd
import sys
import pickle
from transport_co2 import estimate_co2
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from tabulate import tabulate


LAVER_CUP = {
    2017: "Prague",
    2018: "Chicago",
    2019: "Geneva",
    2021: "Boston",
    2022: "London",
    2023: "Vancouver",
}

DATA_IN = "../data/preprocessed/"
DATA_OUT = "../data/polluter/"

with open(DATA_IN + "path_to_distance", "rb") as f:
    path_to_distance = pickle.load(f)


def path_to_list(path: str):
    elements = path.split(", ")

    resultat = []
    for elem in elements:
        debut, fin = elem.split(" -> ")
        if not resultat or resultat[-1] != debut:
            resultat.append(debut)
        if elem == elements[-1]:
            resultat.append(fin)

    return resultat


def clean_city(city: str):
    if "Olympics" in city:
        return city.replace("Olympics", "")
    if "2" in city:
        return city.replace("2", "")

    match city:
        case "Great Ocean Road Open":
            return "Melbourne"
        case "Murray River Open":
            return "Adelaide"
        case "NextGen Finals":
            return "Milan"
        case "Atp Cup":
            return "Sydney"
        case "United Cup":
            return "Sydney"
        case "Laver Cup":
            global year
            return LAVER_CUP[year]
        case "Queen's Club":
            return "London"
        case "Stuttgart Outdoor":
            return "Stuttgart"

    return city


def get_distance(a: str, b: str):
    a = clean_city(a)
    b = clean_city(b)
    geolocator = Nominatim(user_agent="com-480")
    loc1 = geolocator.geocode(a)  # pair (lat, lon)
    loc2 = geolocator.geocode(b)
    return geodesic((loc1.latitude, loc1.longitude), (loc2.latitude, loc2.longitude)).km


def compute_emission(a, b):
    a = a.split(" ")[0] if "2" in a or "1" in a else a
    b = b.split(" ")[0] if "2" in a or "1" in b else b

    if (a, b) in path_to_distance:
        return path_to_distance[(a, b)][1], path_to_distance[(a, b)][0]

    dist = get_distance(a, b)
    emission = estimate_co2(mode="airplane", distance_in_km=dist) / 1e6
    path_to_distance[(a, b)] = (dist, emission)

    # Save path_to_distance
    with open(DATA_IN + "path_to_distance", "wb") as f:
        pickle.dump(path_to_distance, f)

    return emission, dist


def compute_emissions_from_path(path: str):
    cities = path_to_list(path)
    emissions = 0
    distance = 0
    for i in range(len(cities) - 1):
        if cities[i] != None and cities[i + 1] != None:
            a, dist = compute_emission(cities[i], cities[i + 1])
            emissions += a
            distance += dist
    return emissions, distance, len(cities)


def get_polluters_rankings(year: int):
    path = DATA_IN + "top_100_" + str(year) + "_with_path.csv"
    data = pd.read_csv(path)
    data.dropna(subset=["path"], inplace=True)
    data = data.reset_index(drop=True)
    for i in range(len(data) - 1):
        emission, dist, cities = compute_emissions_from_path(data.loc[i, "path"])
        data.loc[i, "co2"] = emission
        data.loc[i, "km"] = dist
        data.loc[i, "tournaments"] = cities
        data.loc[i, "rank"] = i + 1

    data[["player", "co2", "km", "tournaments", "rank"]].to_csv(
        DATA_OUT + "" + str(year) + "_with_co2.csv", index=False
    )


year = 0
if __name__ == "__main__":
    year = sys.argv[1]
    get_polluters_rankings(2000 + int(year))
