from sentence_transformers import SentenceTransformer

class LLMService:
    """
    Handles text embedding generation using sentence-transformers.
    """
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """
        Initializes the embedding model.
        This model runs locally and doesn't require an API key.
        The first time this runs, it will download the model (a few hundred MB).
        """
        try:
            print(f"Loading embedding model: {model_name}")
            self.model = SentenceTransformer(model_name)
            print("Embedding model loaded successfully.")
        except Exception as e:
            print(f"Error loading sentence transformer model: {e}")
            self.model = None

    def get_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Generates embeddings for a list of text strings.
        
        Args:
            texts: A list of strings to be embedded.
            
        Returns:
            A list of embeddings, where each embedding is a list of floats.
        """
        if not self.model:
            print("Embedding model is not available.")
            return []
        
        print(f"Generating embeddings for {len(texts)} texts...")
        embeddings = self.model.encode(texts, convert_to_tensor=False)
        print("Embeddings generated.")
        return embeddings.tolist()

# Singleton instance to be used across the application
llm_service = LLMService()