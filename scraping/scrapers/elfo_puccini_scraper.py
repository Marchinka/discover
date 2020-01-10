import datetime
import re
import requests
from bs4 import BeautifulSoup

from scraping.scraping_engine import Event
from scraping.utils.log import log_info


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
    return switcher.get(text_month.lower(), -1)


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

    # for example this happens for '19 - 20 settembre 2019' where the match for the start month is '-'
    if start_month == -1:
        start_month = end_month
        
    year = int(match.group(8))
    return {"start_date": datetime.datetime(year, start_month, start_day),
            "end_date": datetime.datetime(year, end_month, end_day),
            "are_matching": True}


class ElfoPucciniScraper:

    def name(self):
        return "Elfo Puccini"

    def run(self):
        is_successful = True
        url = 'https://www.elfo.org/calendario/20192020/stagione.html'
        page = requests.get(url)
        soup = BeautifulSoup(page.content, 'html.parser')
        wwboxes = soup.find_all("div", class_='wwbox')

        events = []
        for wwbox in wwboxes:
            try:
                show_text_date = wwbox.find('div', class_="date").text.strip()
                dates = __get_dates__(show_text_date)
                show_title = wwbox.find('div', class_="titolo").text.strip()
                show_description = ""
                show_link = wwbox.find('div', class_="titolo").find("a")['href'].strip()

                if show_link.startswith("/"):
                    show_link = "https://www.elfo.org" + show_link

                event = Event(
                    title=show_title,
                    start_date=dates["start_date"],
                    end_date=dates["end_date"],
                    location="Teatro Elfo Puccini",
                    type="Theater",
                    description=show_description,
                    link=show_link)

                if dates["are_matching"]:
                    events.append(event)
                else:
                    is_successful = False
                    log_info("** Not matching event **")
                    event.log_event()
                    log_info("Dates", show_text_date)

            except Exception as e:
                is_successful = False
                log_info(e)

        return {"events": events, "is_successful": is_successful, "engine": self.name()}
