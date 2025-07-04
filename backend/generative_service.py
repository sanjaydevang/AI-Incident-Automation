import os
import json
from fastapi import HTTPException
import httpx
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

async def get_detailed_analysis_from_llm(text: str) -> dict:
    """
    Calls the Gemini API to get a detailed analysis of the incident text.
    
    Args:
        text: The incident description or log data.
        
    Returns:
        A dictionary containing the analysis.
    """
    print(f"Getting detailed analysis from Gemini for: '{text[:100]}...'")

    apiKey = os.getenv("GEMINI_API_KEY")
    if not apiKey:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not found in .env file.")

    categories = ["Database", "Network", "Application", "Authentication", "Infrastructure", "General"]
    
    # The prompt now asks for a JSON object with multiple fields.
    prompt = f"""
    Analyze the following incident description. Provide a detailed analysis in JSON format.
    The JSON object must contain three fields: 'category', 'summary', and 'probable_cause'.
    - 'category': Classify the incident into one of the following categories: {', '.join(categories)}.
    - 'summary': Provide a concise, one-sentence summary of the issue.
    - 'probable_cause': Briefly state the most likely root cause of the incident.

    Incident Description:
    ---
    {text}
    ---
    """

    # Define the JSON schema for the expected response.
    # This helps ensure the LLM returns data in the correct format.
    response_schema = {
        "type": "OBJECT",
        "properties": {
            "category": {"type": "STRING", "enum": categories},
            "summary": {"type": "STRING"},
            "probable_cause": {"type": "STRING"}
        },
        "required": ["category", "summary", "probable_cause"]
    }

    try:
        # Construct the payload with the new prompt and schema.
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": response_schema
            }
        }
        
        apiUrl = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                apiUrl,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=30.0
            )
        
        response.raise_for_status()
        result = response.json()
        
        # Safely extract the JSON text from the response.
        if (
            result.get("candidates") and
            result["candidates"][0].get("content") and
            result["candidates"][0]["content"].get("parts") and
            result["candidates"][0]["content"]["parts"][0].get("text")
        ):
            analysis_text = result["candidates"][0]["content"]["parts"][0]["text"]
            analysis_json = json.loads(analysis_text)
            print(f"Gemini Analysis result: {analysis_json}")
            return analysis_json
        else:
            print("Error: Could not parse a valid analysis from the Gemini API response.")
            return {"category": "General", "summary": "Could not analyze text.", "probable_cause": "Unknown"}

    except Exception as e:
        print(f"An error occurred during the Gemini API call: {e}")
        return {"category": "General", "summary": "Error during analysis.", "probable_cause": "API call failed"}


class GenerativeService:
    async def analyze_incident(self, text: str) -> dict:
        if not text:
            raise HTTPException(status_code=400, detail="Text for analysis cannot be empty.")
        
        try:
            analysis = await get_detailed_analysis_from_llm(text)
            return analysis
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            print(f"Error during LLM analysis: {e}")
            raise HTTPException(status_code=500, detail="Failed to analyze text with the generative model.")

generative_service = GenerativeService()