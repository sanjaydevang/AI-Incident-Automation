import os
from datetime import datetime

class LocalConnector:
    """
    Handles fetching and processing data from a local directory.
    """
    def __init__(self, data_path="local_data"):
        """
        Initializes the connector with the path to the local data.
        
        Args:
            data_path: The folder containing your .txt or .md incident files.
        """
        self.data_path = data_path
        if not os.path.exists(data_path):
            print(f"Data directory '{data_path}' not found. Creating it.")
            os.makedirs(data_path)

    def fetch_documents(self) -> list[dict]:
        """
        Reads all .txt and .md files from the data directory.
        
        Returns:
            A list of dictionaries, where each dictionary represents a document.
        """
        processed_pages = []
        print(f"Fetching documents from '{self.data_path}'...")
        
        for filename in os.listdir(self.data_path):
            if filename.endswith((".txt", ".md")):
                file_path = os.path.join(self.data_path, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Get file modification time as a proxy for last_modified
                    mod_time = os.path.getmtime(file_path)
                    
                    processed_pages.append({
                        'id': filename,
                        'title': os.path.splitext(filename)[0].replace('_', ' ').title(),
                        'url': f"local_file://{filename}",
                        'last_modified': datetime.fromtimestamp(mod_time).isoformat(),
                        'cleaned_text': content
                    })
                except Exception as e:
                    print(f"Error reading file {filename}: {e}")
                    
        print(f"Successfully fetched and processed {len(processed_pages)} local documents.")
        return processed_pages