from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time

def create_chrome_options():
    options = Options()
    options.add_argument("--headless=new")  # Enable headless mode
    options.add_argument("--disable-gpu")  # Disable GPU rendering
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument("--log-level=3")  # Suppress logs
    return options

def scrape_internships():
    # Set up Selenium WebDriver with headless mode
    options = create_chrome_options()
    service = Service(executable_path="chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)

    # Open the Internshala webpage
    url = 'https://internshala.com/internships/'
    driver.get(url)

    # Wait for the page to load completely
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, 'internship_meta'))
        )
    except:
        print("Timeout while waiting for internships to load.")
        driver.quit()
        return []

    # Extract the rendered page source
    html = driver.page_source

    # Parse with BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')

    # Find internship listings
    internship_cards = soup.find_all('div', class_='individual_internship')
    print(f'Found {len(internship_cards)} internships.')

    # Array to store internship details
    internship_details = []

    # Extract data
    for card in internship_cards:
        # Extracting the internship title
        title = card.find('a', class_='job-title-href').get_text(strip=True) if card.find('a', class_='job-title-href') else "N/A"

        # Extracting the company name
        company = card.find('p', class_='company-name').get_text(strip=True) if card.find('p', class_='company-name') else "N/A"

        # Extracting the location
        location = card.find('span', class_='location').get_text(strip=True) if card.find('span', class_='location') else "Online"

        # Extracting the internship duration
        duration = card.find('span', class_='duration').get_text(strip=True) if card.find('span', class_='duration') else "N/A"

        # Extracting the stipend
        stipend = card.find('span', class_='stipend').get_text(strip=True) if card.find('span', class_='stipend') else "N/A"

        # Extracting the posting time (optional)
        posted_time = card.find('span', class_='status-success').get_text(strip=True) if card.find('span', class_='status-success') else "N/A"

        # Extracting the link to the internship details
        link = 'https://internshala.com' + card['data-href'] if 'data-href' in card.attrs else "No link"

        # Adding the extracted details to the internship_data dictionary
        internship_data = {
            'title': title,
            'company': company,
            'location': location,
            'duration': duration,
            'stipend': stipend,
            'posted_time': posted_time,
            'link': link
        }

        # Appending the internship details to the list
        internship_details.append(internship_data)
    # Close the browser
    driver.quit()

    return internship_details

# Example usage
if __name__ == "__main__":
    internships = scrape_internships()
    for internship in internships:
        print(internship)
