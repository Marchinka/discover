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


class DualBandScraper:

    def name(self):
        return "Dual Band"

    def run(self):
        is_successful = True
        url = 'https://www.ladualband.com/il-cielo-sotto-milano'
        page = requests.get(url)
        soup = BeautifulSoup(page.content, 'html.parser')
        event_list_items = soup.find_all("div", class_='s_BIwzIGroupSkin')

        events = []
        for event_list_item in event_list_items:
            try:
                show_link = 'https://www.ladualband.com/il-cielo-sotto-milano'
                paragraphs = event_list_item.select("p.font_8")
                if len(paragraphs) == 0:
                    continue
                show_title = event_list_item.select("p.font_8 a")[0].text.strip()
                show_description = ""
                for paragraph in paragraphs:
                    fragment = paragraph.text.strip()

                    if fragment != show_title:
                        if show_description != "":
                            if show_description.endswith("."):
                                show_description += " "
                            else:
                                show_description += ". "
                        show_description += fragment

                dates = []
                dates_p = event_list_item.select("p.font_7")
                for date_p in dates_p:
                    date = date_p.text.strip()

                    pattern = r"([0-9]*)\s?\-\s?([0-9]*)\s([\w]{4,})"
                    match = re.search(pattern, date, re.IGNORECASE)
                    if match:
                        start_day = int(match.group(1))
                        end_day = int(match.group(2))
                        month_text = match.group(3)
                        month = __get_month_number__(month_text)
                        dates.append(datetime.datetime(2020, month, start_day))
                        dates.append(datetime.datetime(2020, month, end_day))

                    pattern = r"([0-9]*)\s([\w]{4,})"
                    match = re.search(pattern, date, re.IGNORECASE)

                    if match:
                        day = int(match.group(1))
                        month_text = match.group(2)
                        month = __get_month_number__(month_text)
                        dates.append(datetime.datetime(2020, month, day))

                if len(dates) > 0:
                    event = Event(
                        title=show_title,
                        start_date=min(dates),
                        end_date=max(dates),
                        location="Dual Band",
                        type="Theater",
                        description=show_description,
                        link=show_link)

                    events.append(event)

                # date_elements = event_list_item.find('p', class_="date").find_all("strong")
                # start_date_text = date_elements[0].text
                # end_date_text = start_date_text
                # if len(date_elements) == 2:
                #     end_date_text = date_elements[1].text
                #
                # start_date = __get_date__(start_date_text)
                # end_date = __get_date__(end_date_text)
                #


            except Exception as e:
                is_successful = False
                log_info(e)

        return {"events": events, "is_successful": is_successful, "engine": self.name()}
