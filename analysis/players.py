import pandas as pd
import pycountry


PATH = "../data/external/atp_players.csv"
data = pd.read_csv(PATH)


code_mapping = {
    "SUI": "CHE",  # Switzerland
    "GER": "DEU",  # Germany
    "NED": "NLD",  # Netherlands
    "ZIM": "ZWE",  # Zimbabwe
    "CRO": "HRV",  # Croatia
    "DEN": "DNK",  # Denmark
    "CHI": "CHL",  # Chile
    "RSA": "ZAF",  # South Africa
    "POR": "PRT",  # Portugal
    "EST": "EST",  # Estonia <- debug
}


def get_name(player_id: int):
    first_name = data[data["player_id"] == player_id]["name_first"].values[0]
    last_name = data[data["player_id"] == player_id]["name_last"].values[0]
    return first_name + " " + last_name


def get_ioc(player_id: int):
    return data[data["player_id"] == player_id]["ioc"].values[0]


def country_code_to_flag(code):
    if code in code_mapping:
        code = code_mapping[code]

    try:
        country = pycountry.countries.get(alpha_3=code)
        alpha_2 = country.alpha_2
        flag = "".join(chr(0x1F1E6 + ord(char) - ord("A")) for char in alpha_2)
        return flag
    except:
        return None


def get_matches(year, player_id):
    matches = pd.read_csv(f"../data/external/atp_matches_{year}.csv")
    return len(matches[matches["winner_id"] == player_id]) + len(
        matches[matches["loser_id"] == player_id]
    )


def retrieve_att(year: int, out_path: str):
    extract = pd.read_csv(out_path)
    extract["name"] = extract["player"].apply(get_name)
    extract["ioc"] = extract["player"].apply(get_ioc)
    extract["flag"] = extract["ioc"].apply(country_code_to_flag)
    extract["matches"] = extract["player"].apply(lambda x: get_matches(year, x))
    extract.to_csv(out_path, index=False)


if __name__ == "__main__":
    for i in range(2000, 2024):
        retrieve_att(i, f"../data/polluter/{i}_with_co2.csv")
