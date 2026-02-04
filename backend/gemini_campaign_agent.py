import os
import json
import re
from typing import Dict, Any, Optional
import google.generativeai as genai


class GeminiCampaignAgent:
    def __init__(self, gemini_api_key: Optional[str] = None):
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        if not self.gemini_api_key:
            raise ValueError(
                "Gemini API key not provided. Set GEMINI_API_KEY environment variable."
            )

        genai.configure(api_key=self.gemini_api_key)
        self.model = genai.GenerativeModel("gemini-1.5-pro")

    def generate_segment(self, prompt: str) -> Dict[str, Any]:
        # Create prompt for segment generation
        prompt_text = f"""
Generate a detailed customer segment for a marketing campaign based on the following business objective:

Business Objective: {prompt}

Requirements:
1. The segment should be specific and actionable
2. Include clear criteria (demographic, behavioral, transactional)
3. Use standard marketing metrics (LTV, purchase frequency, recency, etc.)
4. Provide exact thresholds and conditions
5. Make it implementable in a marketing automation system

Output Format:
Return only the segment definition in JSON format like:
[
  {{
    "segment_name": "Descriptive name",
    "criteria": [
      {{"field": "metric_name", "operator": "condition", "value": "threshold"}},
      {{"field": "metric_name", "operator": "condition", "value": "threshold"}}
    ],
    "description": "Brief explanation of the segment"
  }}
]
"""

        # Generate segment
        response = self.model.generate_content(prompt_text)

        # Extract JSON segment from response
        segment_json = self._extract_json_from_response(response)
        return segment_json

    def generate_campaign_elements(self, prompt: str) -> Dict[str, Any]:
        # Create prompt for campaign elements generation
        prompt_text = f"""
Generate complete campaign elements for an email marketing campaign based on the following business objective:

Business Objective: {prompt}

Requirements:
1. Generate an engaging email subject line (max 50 characters)
2. Suggest optimal send time (hour of day in 24-hour format)
3. Suggest optimal send date (relative to today, e.g., "tomorrow", "next Monday")
4. Provide 3 plain-text content ideas for the email body
5. Include specific product recommendations or offers if applicable
6. Make suggestions data-driven and relevant to the segment

Output Format:
Return only the campaign elements in JSON format like:
[
  {{
    "subject": "Engaging subject line",
    "send_time": "14:00",
    "send_date": "tomorrow",
    "content_ideas": [
      "First content idea with specific details",
      "Second content idea with specific details",
      "Third content idea with specific details"
    ],
    "recommendations": "Any additional recommendations"
  }}
]
"""

        # Generate campaign elements
        response = self.model.generate_content(prompt_text)

        # Extract JSON campaign elements from response
        campaign_json = self._extract_json_from_response(response)
        return campaign_json

    def generate_complete_campaign(self, prompt: str) -> Dict[str, Any]:
        segment = self.generate_segment(prompt)
        campaign_elements = self.generate_campaign_elements(prompt)

        return {"segment": segment, "campaign": campaign_elements}

    def _extract_json_from_response(self, response: str) -> Dict[str, Any]:
        try:
            json_pattern = r"\{.*?\}"
            matches = re.findall(json_pattern, response, re.DOTALL)

            if matches:
                for match in matches:
                    try:
                        return json.loads(match)
                    except json.JSONDecodeError:
                        continue

            raise ValueError(
                f"Could not extract JSON from response: {response[:200]}..."
            )

        except Exception as e:
            raise ValueError(f"Error extracting JSON from response: {str(e)}")


# Example usage
if __name__ == "__main__":
    agent = GeminiCampaignAgent()

    prompt = "I want to improve revenue from high lifetime value (total order value of a customer across their lifetime journey with a brand) customers that haven't purchased recently."

    campaign = agent.generate_complete_campaign(prompt)

    print("=== GENERATED CAMPAIGN ===")
    print(f"Segment: {campaign['segment']}")
    print(f"Campaign Elements: {campaign['campaign']}")
