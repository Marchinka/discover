from scraping.scrapers.binario_7_scraper import Binario7Scraper
from scraping.scrapers.dual_band_scraper import DualBandScraper
from scraping.scrapers.elfo_puccini_scraper import ElfoPucciniScraper
from scraping.scrapers.piccolo_teatro_scraper import PiccoloTeatroScraper
from scraping.scrapers.teatro_parenti_scraper import TeatroParentiScraper
from scraping.scraping_engine import ScrapingEngine


def get_engine():
    engines = [
        PiccoloTeatroScraper(), TeatroParentiScraper(), ElfoPucciniScraper(), Binario7Scraper(), DualBandScraper()
        # Binario7Scraper()
    ]

    scraping_engine = ScrapingEngine(engines)
    return scraping_engine
