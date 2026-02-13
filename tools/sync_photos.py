import os
import json
import subprocess
import glob

# Configuration
# Path to the slideshow directory relative to this script
# If this script is in /tools, and slideshow is in /slideshow, then it's ../slideshow
SLIDESHOW_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "slideshow")
MANIFEST_FILE = os.path.join(SLIDESHOW_DIR, "photos.json")

# Valid extensions
EXTENSIONS = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.webp']

def scan_photos():
    """Scans the slideshow directory and generates a JSON list of paths."""
    print(f"Scanning directory: {SLIDESHOW_DIR}")
    
    photos = []
    
    # 1. Walk through directory
    for root, dirs, files in os.walk(SLIDESHOW_DIR):
        for file in files:
            if any(file.lower().endswith(ext.replace('*', '')) for ext in EXTENSIONS):
                # valid photo
                # We need the path relative to the WEBSITE ROOT (where index.html is)
                # Since SLIDESHOW_DIR is <root>/slideshow, and file is inside, 
                # the web path should be slideshow/filename
                
                # Careful with nested folders if icloudpd creates them
                # get path relative to the project root
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, os.path.dirname(SLIDESHOW_DIR))
                
                # Normalize slashes for web (forward slash)
                web_path = rel_path.replace("\\", "/")
                photos.append(web_path)

    # 2. Sort or Shuffle? 
    # Let's just sort alphabetically to be deterministic
    photos.sort()
    
    # 3. Write to JSON
    with open(MANIFEST_FILE, 'w') as f:
        json.dump(photos, f, indent=2)
        
    print(f"Successfully generated {MANIFEST_FILE}")
    print(f"Found {len(photos)} photos.")

def run_icloudpd():
    """
    Optional: Wrapper to run icloudpd if user wants to sync.
    You need to configure this command based on your preferences.
    """
    print("--- iCloud Photo Downloader ---")
    print("If you have 'icloudpd' installed, you can uncomment the code below to auto-sync.")
    print("Command would look like: icloudpd --directory \"../slideshow\" --album \"My Shared Album\" ...")
    
    # Example Command (User needs to fill this in)
    # subprocess.run(["icloudpd", "--directory", SLIDESHOW_DIR, "--album", "Favorites", "--username", "your_email@icloud.com"])

if __name__ == "__main__":
    # 1. (Optional) Download new photos
    # run_icloudpd() 
    
    # 2. Generate the manifest for the website
    scan_photos()
