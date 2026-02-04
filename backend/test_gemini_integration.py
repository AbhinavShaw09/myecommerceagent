import os
from gemini_campaign_agent import GeminiCampaignAgent


def test_gemini_integration():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not found in environment")
        print("Please set GEMINI_API_KEY to test the integration")
        return

    try:
        agent = GeminiCampaignAgent(gemini_api_key=api_key)
        prompt = "I want to improve revenue from high lifetime value customers that haven't purchased recently."
        campaign = agent.generate_complete_campaign(prompt)

        print("=== GEMINI INTEGRATION TEST ===")
        print(f"Segment: {campaign['segment']}")
        print(f"Campaign: {campaign['campaign']}")
        print("\nTest successful!")

    except Exception as e:
        print(f"Test failed: {str(e)}")
        print("Please check your GEMINI_API_KEY and internet connection")


if __name__ == "__main__":
    test_gemini_integration()
