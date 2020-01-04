import datetime
import re
import requests
from bs4 import BeautifulSoup

from scraping.scraping_engine import Show


def __get_month_number__(text_month):
    switcher = {
        "gennaio": 1,
        "febbraio": 2,
        "marzo": 3,
        "aprile": 4,
        "maggio": 5,
        "giugno": 6,
        "luglio": 7,
        "agosto": 8,
        "settembre": 9,
        "ottobre": 10,
        "novembre": 11,
        "dicembre": 12,
    }
    return switcher.get(text_month.lower(), 1)


def __get_dates__(text_date):
    pattern = r"^(([0-9]*)\s([\S]*))?(\s*\-\s*)*(\s*([0-9]*)\s([\S]*))\s([0-9]*)$"
    match = re.search(pattern, text_date, re.IGNORECASE)

    if not match:
        return {"start_date": None,
                "end_date": None,
                "are_matching": False}

    end_day = int(match.group(6))
    end_month_text = match.group(7)
    end_month = __get_month_number__(end_month_text)
    start_day = int(match.group(2) or end_day)
    start_month_text = match.group(3) or end_month_text
    start_month = __get_month_number__(start_month_text)
    year = int(match.group(8))
    return {"start_date": datetime.datetime(year, start_month, start_day),
            "end_date": datetime.datetime(year, end_month, end_day),
            "are_matching": True}


class ElfoPucciniScraper:

    def name(self):
        return "Elfo Puccini"

    def run(self):
        url = 'https://www.elfo.org/calendario/20192020/stagione.html'
        page = requests.get(url)
        soup = BeautifulSoup(page.content, 'html.parser')
        wwboxes = soup.find_all("div", class_='wwbox')

        shows = []
        for wwbox in wwboxes:
            try:
                show_text_date = wwbox.find('div', class_="date").text.strip()
                dates = __get_dates__(show_text_date)
                show_title = wwbox.find('div', class_="titolo").text.strip()
                show_description = ""
                show_link = wwbox.find('div', class_="titolo").find("a")['href'].strip()

                if show_link.startswith("/"):
                    show_link = "https://www.elfo.org" + show_link

                show = Show(
                    title=show_title,
                    start_date=dates["start_date"],
                    end_date=dates["end_date"],
                    location="Teatro Elfo Puccini",
                    description=show_description,
                    link=show_link)

                if dates["are_matching"]:
                    shows.append(show)
                else:
                    print("** Not matching show **")
                    show.print_show()
                    print("Dates", show_text_date)

            except Exception as e:
                print(e)

        return shows
