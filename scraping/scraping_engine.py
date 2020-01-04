class Show:
    def __init__(self, title, start_date, end_date, location, description="", link=""):
        self.title = title
        self.location = location
        self.start_date = start_date
        self.end_date = end_date
        self.description = description
        self.link = link

    def print_show(self):
        print({
            "title": self.title,
            "location": self.location,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "description": self.description,
            "link": self.link})


class ScrapingEngine:
    def __init__(self, engines):
        self.engines = engines

    def run(self):
        all_shows = []
        for engine in self.engines:
            print("Starting", engine.name())
            shows = engine.run()
            print("Found", len(shows), "shows")
            all_shows = all_shows + shows

        # for show in all_shows:
        #     show.print_show()


