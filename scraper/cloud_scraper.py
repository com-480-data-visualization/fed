import csv
import cloudscraper
from bs4 import BeautifulSoup

DATA = "../data/scrapped/"
scraper = cloudscraper.create_scraper()
url = "https://www.atptour.com/en/scores/results-archive?year=2024"
response = scraper.get(url)


def parse_and_save(tournaments, filename="tournaments.csv"):
    with open(filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["date", "venue", "name", "winner", "cat"])

        for tournament in tournaments:
            img = tournament.find("img", class_="events_banner")
            cat = (
                img.attrs["src"]
                .removeprefix("/assets/atpwt/images/tournament/badges/categorystamps_")
                .removesuffix(".png")
                .removesuffix(".svg")
            )

            match cat:
                case "250":
                    cat = "ATP 250"
                case "500":
                    cat = "ATP 500"
                case "1000":
                    cat = "ATP 1000"
                case "grandslam":
                    cat = "Grand Slam"
                case "finals":
                    cat = "ATP Finals"
                case "itf":
                    cat = "Davis Cup"
                case "lvr":
                    cat = "Laver Cup"

            winner = tournament.find("dl", class_="winner")
            if winner == None:
                winner = "N/A"
            else:
                winner = (
                    winner.text.strip()
                    .removeprefix("Singles Winner")
                    .replace("\n", "")
                    .strip()
                )
            date = tournament.find("span", class_="Date").text.strip()
            location = (
                tournament.find("span", class_="venue")
                .text.strip()
                .replace("\n", "")
                .strip()
                .replace("|", "")
                .strip()
            )
            name = tournament.find("span", class_="name").text.replace("\n", "").strip()
            writer.writerow(
                [
                    " ".join(date.split()),
                    " ".join(location.split()),
                    " ".join(name.split()),
                    winner,
                    cat,
                ]
            )


if response.status_code == 200:
    soup = BeautifulSoup(response.text, "html.parser")
    tournaments = soup.findAll("ul", class_="events")
    parse_and_save(tournaments, filename=DATA + "tournaments.csv")
else:
    print("Could not fetch the page.")
