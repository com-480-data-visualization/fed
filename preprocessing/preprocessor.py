import re
import pandas as pd
from datetime import datetime

# Geo tools
from geopy.geocoders import Nominatim
import pycountry_convert as pc

DATA_IN = "../data/scrapped/"
DATA_OUT = "../data/preprocessed/"


def parse_dates(date_str):
    format1_pattern = r"(\d{1,2}) (\w+), (\d{4}) - (\d{1,2}) (\w+), (\d{4})"
    format1_pattern_b = r"(\d{1,2}) (\w+) - (\d{1,2}) (\w+), (\d{4})"
    format2_pattern = r"(\d{1,2}) - (\d{1,2}) (\w+), (\d{4})"

    if re.match(format1_pattern, date_str):
        match = re.match(format1_pattern, date_str)
        from_date = datetime.strptime(
            f"{match.group(1)} {match.group(2)} {match.group(3)}", "%d %B %Y"
        ).strftime("%d %B, %Y")
        to_date = datetime.strptime(
            f"{match.group(4)} {match.group(5)} {match.group(6)}", "%d %B %Y"
        ).strftime("%d %B, %Y")
    elif re.match(format1_pattern_b, date_str):
        match = re.match(format1_pattern_b, date_str)
        from_date = datetime.strptime(
            f"{match.group(1)} {match.group(2)} {match.group(5)}", "%d %B %Y"
        ).strftime("%d %B, %Y")
        to_date = datetime.strptime(
            f"{match.group(3)} {match.group(4)} {match.group(5)}", "%d %B %Y"
        ).strftime("%d %B, %Y")
    elif re.match(format2_pattern, date_str):
        match = re.match(format2_pattern, date_str)
        month = match.group(3)
        year = match.group(4)
        from_date = datetime.strptime(
            f"{match.group(1)} {month} {year}", "%d %B %Y"
        ).strftime("%d %B, %Y")
        to_date = datetime.strptime(
            f"{match.group(2)} {month} {year}", "%d %B %Y"
        ).strftime("%d %B, %Y")
    else:
        raise ValueError("Date format not recognized.")

    return (from_date, to_date)


def find_locations(data: pd.DataFrame) -> pd.DataFrame:
    geolocator = Nominatim(user_agent="com-480")

    def get_coords(x):
        loc = geolocator.geocode(x)
        if loc is None:
            return (None, None)
        return (loc.latitude, loc.longitude)

    def get_continent(country_name):
        if country_name == "":
            return None
        country_alpha2 = pc.country_name_to_country_alpha2(country_name)
        continent_code = pc.country_alpha2_to_continent_code(country_alpha2)
        continent_name = pc.convert_continent_code_to_continent_name(continent_code)
        return continent_name

    data["coords"] = data["venue"].apply(lambda x: get_coords(x))
    data["continent"] = data["country"].apply(lambda x: get_continent(x))
    return data


def convert_dates(data) -> pd.DataFrame:
    data["from"] = data["date"].apply(lambda x: parse_dates(x)[0])
    data["to"] = data["date"].apply(lambda x: parse_dates(x)[1])
    data["from_dt"] = pd.to_datetime(data["from"])
    data["to_dt"] = pd.to_datetime(data["to"])
    return data


def parse_location(data: pd.DataFrame) -> pd.DataFrame:
    data["city"] = data["venue"].str.split(",").str[0]
    data["country"] = data["venue"].str.split(",").str[1].str.lstrip()
    return data


def remove_special_events(data: pd.DataFrame) -> pd.DataFrame:
    data = data[~data["cat"].isin(["unitedcup", "Davis Cup", "Laver Cup"])]
    return data


def save(data: pd.DataFrame, filename: str, idx=False) -> None:
    data.to_csv(DATA_OUT + filename, index=idx)


def preprocess(filename: str) -> pd.DataFrame:
    data = pd.read_csv(DATA_IN + filename)
    data = convert_dates(data)
    data = parse_location(data)
    data = find_locations(data)
    data["idx"] = data.groupby(["from_dt", "to_dt"]).ngroup()
    data_without_events = remove_special_events(data)
    data_without_events["idx"] = data_without_events.groupby(
        ["from_dt", "to_dt"]
    ).ngroup()
    return data, data_without_events


if __name__ == "__main__":
    df1, df2 = preprocess("tournaments.csv")
    save(df1, "tournaments_with_dates.csv", idx=True)
    save(df2.reset_index(), "tournaments_without_special_events.csv", idx=True)
