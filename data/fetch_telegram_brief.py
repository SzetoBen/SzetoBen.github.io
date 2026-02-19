import os
import json
import requests
import argparse
from datetime import datetime

# Configuration
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
OUTPUT_FILE = os.path.join("data", "daily_brief.json")

def fetch_updates(offset=None):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
    params = {"allowed_updates": ["message"]}
    if offset:
        params["offset"] = offset
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching updates: {e}")
        return None

def process_messages(mock=False):
    if mock:
        print("Running in MOCK mode.")
        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "brief_segments": [
                "Good Morning! Here is your daily brief.",
                "Market Update: Stocks are up 2% following the tech rally. AI sector leading the charge with NVIDIA hitting all-time highs.",
                "Weather: Sunny with a high of 25°C. Perfect day for a run.",
                "News: The new orbital station has successfully deployed its solar arrays. Global energy summit concludes with new agreements."
            ]
        }

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables must be set.")
        return None

    # We want to fetch messages from the last 24 hours ideally, 
    # but getUpdates only gives us pending updates or recent ones if not acknowledged.
    # For a daily action, we essentially want 'new' messages since the last run.
    # However, getUpdates is tricky if we don't maintain an offset.
    # A simpler approach for a "brief" bot that sends messages at a specific time is to 
    # fetch the latest updates and look for the specific brief pattern.
    
    # Assuming the bot sends the brief as a series of messages around the same time.
    
    updates = fetch_updates()
    if not updates or "result" not in updates:
        print("No updates found.")
        return None

    brief_messages = []
    
    # We are looking for messages from the target chat
    # And potentially grouped together.
    # For now, let's grab all text messages from the target chat in the result.
    
    # Filter for target chat
    target_updates = [
        u for u in updates["result"] 
        if "message" in u 
        and str(u["message"]["chat"]["id"]) == str(TELEGRAM_CHAT_ID)
        and "text" in u["message"]
    ]
    
    if not target_updates:
        print("No messages from target chat found in updates.")
        return None

    # Sort by date
    target_updates.sort(key=lambda x: x["message"]["date"], reverse=True)
    
    # Strategy: Take the most recent cluster of messages.
    # If the brief is split, they will process within seconds of each other.
    
    if not target_updates:
        return None

    latest_update = target_updates[0]
    latest_time = latest_update["message"]["date"]
    
    # Define a time window (e.g., 5 minutes) to group messages
    TIME_WINDOW = 300 # seconds
    
    cluster = []
    for update in target_updates:
        msg_time = update["message"]["date"]
        if latest_time - msg_time < TIME_WINDOW:
            cluster.append(update["message"]["text"])
        else:
            break
            
    # The messages usually come in order 1, 2, 3... but we are iterating reverse.
    # So we reverse the cluster to get chronological order.
    cluster.reverse()
    
    return {
        "date": datetime.fromtimestamp(latest_time).strftime("%Y-%m-%d"),
        "brief_segments": cluster
    }

def save_brief(data):
    if not data:
        return
        
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    print(f"Brief saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch grouped Telegram messages for daily brief.")
    parser.add_argument("--mock", action="store_true", help="Use mock data instead of API")
    args = parser.parse_args()

    data = process_messages(mock=args.mock)
    if data:
        save_brief(data)
