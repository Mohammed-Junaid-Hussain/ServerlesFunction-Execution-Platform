import requests
import json

# API endpoint
API_URL = "http://localhost:3000/api"

def analyze_text(text):
    """Analyze text using our serverless function"""
    # Clean up the text by removing extra whitespace and newlines
    cleaned_text = ' '.join(text.strip().split())
    response = requests.post(
        f"{API_URL}/executions/6805142e69321a52b1fe14dc",
        json={"input": {"text": cleaned_text}}
    )
    return response.json()

def main():
    # Example text to analyze
    sample_text = """
    This is a sample text for demonstration. It contains multiple sentences.
    We can analyze its properties like word count, character count, and more.
    The text analyzer function will process this and return useful statistics.
    """
    
    print("=== Text Analysis Demo ===")
    print("\nInput Text:")
    print(sample_text)
    
    print("\nAnalyzing text...")
    try:
        result = analyze_text(sample_text)
        
        if result.get("success"):
            analysis = result.get("result", {})
            print("\nAnalysis Results:")
            print(f"Word Count: {analysis.get('word_count', 'N/A')}")
            print(f"Character Count: {analysis.get('character_count', 'N/A')}")
            print(f"Sentence Count: {analysis.get('sentence_count', 'N/A')}")
            print(f"Longest Word: {analysis.get('longest_word', 'N/A')}")
            print(f"Average Word Length: {analysis.get('average_word_length', 0):.2f} characters")
            print(f"\nExecution Time: {result.get('executionTime', 'N/A')}ms")
        else:
            print("Error:", result.get("error", "Unknown error"))
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API server. Make sure it's running on http://localhost:3000")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 