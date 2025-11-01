"""
Simple test script to verify the API is working
Run this after starting the FastAPI server
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
API_KEY = "dev-secret-key-12345"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*50)
    print("Testing Health Endpoint")
    print("="*50)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200

def test_classify():
    """Test classification endpoint"""
    print("\n" + "="*50)
    print("Testing Classification Endpoint")
    print("="*50)
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    test_cases = [
        {
            "title": "Team Meeting Tomorrow",
            "content": "We have a team meeting scheduled for tomorrow at 10 AM in the conference room."
        },
        {
            "title": "Invoice #12345",
            "content": "Please find attached the invoice for this month's services. Payment is due within 30 days."
        },
        {
            "title": "Happy Birthday!",
            "content": "Wishing you a wonderful birthday celebration with your family and friends!"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Title: {test_case['title']}")
        print(f"Content: {test_case['content'][:50]}...")
        
        response = requests.post(
            f"{BASE_URL}/api/v1/classify",
            headers=headers,
            json=test_case
        )
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Result: {json.dumps(result, indent=2)}")
        else:
            print(f"Error: {response.text}")
    
    return True

def test_model_info():
    """Test model info endpoint"""
    print("\n" + "="*50)
    print("Testing Model Info Endpoint")
    print("="*50)
    
    response = requests.get(f"{BASE_URL}/api/v1/model/info")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200

def main():
    """Run all tests"""
    print("\n" + "="*50)
    print("FastAPI ML Service - Test Suite")
    print("="*50)
    
    try:
        # Test health
        if not test_health():
            print("\n❌ Health check failed!")
            return
        
        # Test model info
        test_model_info()
        
        # Test classification
        test_classify()
        
        print("\n" + "="*50)
        print("✅ All tests completed!")
        print("="*50)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the API server.")
        print("Make sure the FastAPI server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    main()

