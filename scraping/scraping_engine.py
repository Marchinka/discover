from scraping.repository import events_repository, scraping_log_repository
from scraping.utils.log import log_info


class Event:
    def __init__(self, title, start_date, end_date, location, description="", link=""):
        self.title = title
        self.location = location
        self.start_date = start_date
        self.end_date = end_date
        self.description = description
        self.link = link

    def get_dict(self):
        return {
            "title": self.title,
            "location": self.location,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "description": self.description,
            "link": self.link}

    def log_event(self):
        log_info(self.get_dict())


class ScrapingEngine:
    def __init__(self, engines):
        self.engines = engines

    def get_sources(self):
        engine_names = []
        for engine in self.engines:
            engine_names.append(engine.name())
        return engine_names

    def run(self, source="All"):
        all_result = []
        all_events = []
        is_successful = True
        for engine in self.engines:
            if source == "All" or source == engine.name():
                engine_run = scraping_log_repository.can_run(engine.name())
                if not engine_run["can_run"]:
                    all_result.append(engine_run["result"])
                    continue

                result = self.__run_engine__(engine)
                scraping_log_repository.log_run(engine.name(), result)
                is_successful = is_successful and result["is_successful"]
                events = result["events"]
                all_events = all_events + events
                all_result.append({
                    "events_count": len(events),
                    "is_successful": result["is_successful"],
                    "engine": result["engine"]})

        events_repository.save_events(all_events)

        return all_result

    def __run_engine__(self, engine):
        try:
            log_info("Starting", engine.name())
            result = engine.run()

            if not result["is_successful"]:
                log_info("Engine", engine.name(), "is not successful")

            log_info("Found", len(result["events"]), "shows")
            result["has_run"] = True
            return result

        except Exception as e:
            log_info("Engine", engine.name(), "has encountered a fatal error")
            log_info(e)
            result = {"events": [], "is_successful": False, "engine": engine.name(), "has_run": True}
            return result
