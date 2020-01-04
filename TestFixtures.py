import unittest

from scraping.scrapers.teatro_parenti_scraper import __get_dates__


class ParentiDatesTests(unittest.TestCase):
    def test_double_date_double_month_is_parsed(self):
        text_date = "7 Gennaio - 19 Marzo 2020"
        dates = __get_dates__(text_date)
        start_date = dates["start_date"]
        end_date = dates["end_date"]

        # start date
        self.assertEqual(start_date.year, 2020)
        self.assertEqual(start_date.month, 1)
        self.assertEqual(start_date.day, 7)

        # end date
        self.assertEqual(end_date.year, 2020)
        self.assertEqual(end_date.month, 3)
        self.assertEqual(end_date.day, 19)

    def test_double_date_single_month_is_parsed(self):
        text_date = "7 - 19 Gennaio 2020"
        dates = __get_dates__(text_date)
        start_date = dates["start_date"]
        end_date = dates["end_date"]

        # start date
        self.assertEqual(start_date.year, 2020)
        self.assertEqual(start_date.month, 1)
        self.assertEqual(start_date.day, 7)

        # end date
        self.assertEqual(end_date.year, 2020)
        self.assertEqual(end_date.month, 1)
        self.assertEqual(end_date.day, 19)

    def test_single_date_is_parsed(self):
        text_date = "19 Gennaio 2020"
        dates = __get_dates__(text_date)
        start_date = dates["start_date"]
        end_date = dates["end_date"]

        # start date
        self.assertEqual(start_date.year, 2020)
        self.assertEqual(start_date.month, 1)
        self.assertEqual(start_date.day, 19)

        # end date
        self.assertEqual(end_date.year, 2020)
        self.assertEqual(end_date.month, 1)
        self.assertEqual(end_date.day, 19)


if __name__ == '__main__':
    unittest.main()
