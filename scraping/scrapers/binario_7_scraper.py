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
    return switcher.get(text_month.lower(), 1)


def __get_date__(text_date):
    # the date is "sabato 20 gennaio", so [0] is weekday, [1] is day number and [2] is month
    date_parts = text_date.split()
    day_text = date_parts[1]
    day = int(day_text)
    month_text = date_parts[2]
    month = __get_month_number__(month_text)
    year = 2020
    return datetime.datetime(year, month, day)


class Binario7Scraper:

    def name(self):
        return "Teatro Binario 7"

    def run(self):
        is_successful = True
        url = 'https://teatro.binario7.org/'
        page = requests.get(url)
        soup = BeautifulSoup(page.content, 'html.parser')
        event_list_items = soup.find_all("div", class_='event-list-item')

        events = []
        for event_list_item in event_list_items:
            try:
                show_title = event_list_item.find('a', class_="name").text.strip()
                show_description = ""
                show_link = event_list_item.find('a', class_="name")['href'].strip()
                date_elements = event_list_item.find('p', class_="date").find_all("strong")
                start_date_text = date_elements[0].text
                end_date_text = start_date_text
                if len(date_elements) == 2:
                    end_date_text = date_elements[1].text

                start_date = __get_date__(start_date_text)
                end_date = __get_date__(end_date_text)

                event = Event(
                    title=show_title,
                    start_date=start_date,
                    end_date=end_date,
                    location="Teatro Binario 7",
                    type="Theater",
                    description=show_description,
                    link=show_link)

                events.append(event)

            except Exception as e:
                is_successful = False
                log_info(e)

        return {"events": events, "is_successful": is_successful, "engine": self.name()}
