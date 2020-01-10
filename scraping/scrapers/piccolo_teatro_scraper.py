import datetime
import re
import requests
from bs4 import BeautifulSoup

from scraping.scraping_engine import Event
from scraping.utils.log import log_info


def __get_month_number__(text_month):
    switcher = {
        "Gennaio": 1,
        "Febbraio": 2,
        "Marzo": 3,
        "Aprile": 4,
        "Maggio": 5,
        "Giugno": 6,
        "Luglio": 7,
        "Agosto": 8,
        "Settembre": 9,
        "Ottobre": 10,
        "Novembre": 11,
        "Dicembre": 12,
    }
    return switcher.get(text_month, 1)


def __get_date__(start_date_text):
    start_date = datetime.datetime.strptime(start_date_text, '%Y-%m-%d')
    return start_date


class PiccoloTeatroScraper:

    def name(self):
        return "Piccolo Teatro"

    def run(self):
        is_successful = True
        all_events = []
        for index in range(30):
            index_result = self.get_shows_for_index(index * 5)
            events = index_result["events"]
            is_successful = is_successful and index_result["is_successful"]
            if events:
                all_events = all_events + events
            else:
                break

        return {"events": all_events, "is_successful": is_successful, "engine": self.name()}

    def get_shows_for_index(self, index):
        is_successful = True
        url = 'https://www.piccoloteatro.org/it/seasons/2019-2020/loader?start=' + str(index)
        page = requests.get(url)
        soup = BeautifulSoup(page.content, 'html.parser')
        story_item_info = soup.find_all("div", class_='story-item-info')
        events = []
        for story_item_info in story_item_info:
            try:
                show_title = story_item_info.find('h3', class_="box-header").text.strip()
                show_description = story_item_info.find('div', class_="story-description").text.strip()
                show_link = story_item_info.find('h3', class_="box-header").find("a")['href'].strip()

                if show_link.startswith("/"):
                    show_link = "https://www.piccoloteatro.org" + show_link

                location = story_item_info.find('div', class_="story-theater").text.strip()
                times = story_item_info.find('div', class_="story-range").find_all("time")
                start_date_text = times[0]["datetime"][0:10]
                start_date = __get_date__(start_date_text)
                end_date = start_date

                if len(times) == 2:
                    end_date_text = times[1]["datetime"][0:10]
                    end_date = __get_date__(end_date_text)

                event = Event(
                    title=show_title,
                    start_date=start_date,
                    end_date=end_date,
                    location=location,
                    type="Theater",
                    description=show_description,
                    link=show_link)

                events.append(event)

            except Exception as e:
                is_successful = False
                log_info(e)

        return {"events": events, "is_successful": is_successful, "engine": self.name()}

