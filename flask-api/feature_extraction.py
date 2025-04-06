import re
import whois
import socket
import requests
import pandas as pd
from urllib.parse import urlparse

def extract_features(url):
    features = {
        "having_IP_Address": -1, "URL_Length": 0, "Shortining_Service": -1,
        "having_At_Symbol": -1, "double_slash_redirecting": 1, "Prefix_Suffix": 1,
        "having_Sub_Domain": 1, "SSLfinal_State": -1, "Domain_registeration_length": -1,
        "HTTPS_token": 1, "Request_URL": -1,
        "URL_of_Anchor": -1, "Links_in_tags": -1, "SFH": -1, "Submitting_to_email": -1,
        "Abnormal_URL": -1, "Redirect": -1, "age_of_domain": -1, "DNSRecord": -1,
        "web_traffic": -1, "Google_Index": -1,
        "Links_pointing_to_page": -1
    }

    try:
        
        parsed_url = urlparse(url)
        domain = parsed_url.netloc

        # Check for IP address in URL
        features["having_IP_Address"] = 1 if re.match(r"\d+\.\d+\.\d+\.\d+", domain) else -1

        # URL Length
        features["URL_Length"] = 1 if len(url) < 54 else (-1 if len(url) > 75 else 0)

        # Shortening Service
        shortening_services = ["bit.ly", "goo.gl", "tinyurl.com", "is.gd", "t.co", "ow.ly", "buff.ly"]
        features["Shortining_Service"] = -1 if domain in shortening_services else 1

        # '@' Symbol
        features["having_At_Symbol"] = 1 if "@" in url else -1

        # Double Slash Redirecting
        features["double_slash_redirecting"] = -1 if "//" in parsed_url.path else 1

        # Prefix-Suffix
        features["Prefix_Suffix"] = -1 if '-' in domain else 1

        # Subdomain Analysis
        features["having_Sub_Domain"] = -1 if domain.count('.') > 2 else 1

        # HTTPS Validation
        try:
            response = requests.get(url, timeout=5, verify=True)
            features["SSLfinal_State"] = 1 if response.url.startswith("https://") else -1
        except:
            features["SSLfinal_State"] = -1

        # WHOIS Data (Domain Age & Registration Length)
        try:
            domain_info = whois.whois(domain)
            expiration_date = domain_info.expiration_date
            creation_date = domain_info.creation_date

            if isinstance(expiration_date, list):
                expiration_date = expiration_date[0]
            if isinstance(creation_date, list):
                creation_date = creation_date[0]

            if expiration_date and creation_date:
                features["Domain_registeration_length"] = 1 if (expiration_date - pd.Timestamp.now()).days > 365 else -1
                features["age_of_domain"] = 1 if (pd.Timestamp.now() - creation_date).days > 180 else -1
        except:
            features["Domain_registeration_length"] = -1
            features["age_of_domain"] = -1

        # Favicon Check
        # try:
        #     if '<link rel="shortcut icon"' in response.text.lower():
        #         features["Favicon"] = 1
        # except:
        #     pass

        # Port Analysis
        # try:
        #     port = parsed_url.port
        #     features["port"] = -1 if port and port in [21, 22, 23, 8080, 3389] else 1
        # except:
        #     pass

        # HTTPS Token
        features["HTTPS_token"] = -1 if "https" in domain else 1

        # External Links
        try:
            external_links = len(re.findall(r"http[s]?://", response.text))
            features["Request_URL"] = -1 if external_links > 5 else 1
        except:
            pass

        # Anchor Tags
        try:
            anchor_tags = len(re.findall(r'<a href="http', response.text))
            features["URL_of_Anchor"] = -1 if anchor_tags > 10 else 1
        except:
            pass

        # Links in Meta, Script, or Form Tags
        try:
            meta_count = len(re.findall(r'<meta.*?http-equiv="refresh"', response.text, re.IGNORECASE))
            script_count = len(re.findall(r'<script>.*?window.location', response.text, re.IGNORECASE))
            features["Links_in_tags"] = -1 if (meta_count + script_count) > 2 else 1
        except:
            pass

        # Server Form Handler (SFH)
        try:
            features["SFH"] = -1 if 'action=""' in response.text or 'action="http' in response.text else 1
        except:
            pass

        # Submitting to Email
        features["Submitting_to_email"] = -1 if "mailto:" in response.text else 1

        # Abnormal URL (WHOIS Mismatch)
        try:
            whois_domain = whois.whois(domain).domain_name
            features["Abnormal_URL"] = -1 if whois_domain and domain.lower() not in whois_domain.lower() else 1
        except:
            pass

        # Redirects
        try:
            features["Redirect"] = -1 if len(response.history) > 3 else 1
        except:
            pass

        # JavaScript Attacks Detection
        # features["on_mouseover"] = -1 if "onmouseover=\"window.status" in response.text else 1
        # features["RightClick"] = -1 if "event.button==2" in response.text else 1
        # features["popUpWidnow"] = -1 if "window.open" in response.text else 1

        # # Iframe Detection
        # features["Iframe"] = -1 if "<iframe width=\"0\" height=\"0\"" in response.text else 1

        # DNS Record Check
        try:
            socket.gethostbyname(domain)
            features["DNSRecord"] = 1
        except:
            pass

        # Web Traffic (Placeholder, replace with real API if available)
        features["web_traffic"] = -1

        # Page Rank (Placeholder, replace with real API if available)
        # features["Page_Rank"] = -1

        # Google Index (Placeholder, assumes indexed if response received)
        features["Google_Index"] = 1 if response.status_code == 200 else -1

        # Links Pointing to Page
        try:
            backlinks = len(re.findall(r'<a href="http', response.text))
            features["Links_pointing_to_page"] = -1 if backlinks < 50 else 1
        except:
            pass

        # Statistical Report (Placeholder, replace with real API if needed)
        # features["Statistical_report"] = -1

    except Exception as e:
        print(f"Error extracting features: {e}")

    return features