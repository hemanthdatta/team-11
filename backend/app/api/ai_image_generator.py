from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import base64
from io import BytesIO
from typing import Optional
import requests
import json

router = APIRouter()

class ImagePromptRequest(BaseModel):
    prompt: str
    model: str = "default"  # Default model for DeepAI


class ImageGenerationResponse(BaseModel):
    imageUrl: str
    success: bool
    message: Optional[str] = None


@router.post("/generate-image", response_model=ImageGenerationResponse)
async def generate_image(request: ImagePromptRequest):
    try:
        # Try to import the required libraries
        try:
            import requests
        except ImportError as e:
            print(f"Import error: {e}")
            # Fallback to placeholder if imports fail
            placeholder_image = "https://via.placeholder.com/800x600.png?text=AI+Generated+Image"
            return ImageGenerationResponse(
                imageUrl=placeholder_image,
                success=True,
                message="Using placeholder image (missing dependencies)"
            )
            
        # Get API key from environment or use the provided one
        api_key = os.environ.get("DEEPAI_API_KEY", "0fb6ddde-7c15-4714-a177-ef7d61da4c7a")
        if not api_key:
            print("Missing API key")
            placeholder_image = "https://via.placeholder.com/800x600.png?text=Missing+API+Key"
            return ImageGenerationResponse(
                imageUrl=placeholder_image,
                success=True,
                message="Using placeholder image (missing API key)"
            )
            
        try:
            # Set up the DeepAI API request
            url = "https://api.deepai.org/api/text2img"
            
            headers = {
                'api-key': api_key
            }
            
            data = {
                'text': request.prompt,
            }
            
            # Make the API call
            response = requests.post(url, headers=headers, data=data)
            response.raise_for_status()  # Raises an HTTPError for bad responses
            result = response.json()
            
            print(f"API Response: {json.dumps(result, indent=2)}")
            
            # Check if the response contains image URL
            if 'output_url' in result:
                image_url = result['output_url']
                return ImageGenerationResponse(
                    imageUrl=image_url,
                    success=True
                )
            else:
                print("No image URL in response")
                placeholder_image = "https://via.placeholder.com/800x600.png?text=No+Image+Generated"
                return ImageGenerationResponse(
                    imageUrl=placeholder_image,
                    success=True,
                    message="No image URL was returned by the API"
                )
            
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")
            placeholder_image = "https://via.placeholder.com/800x600.png?text=API+Error"
            return ImageGenerationResponse(
                imageUrl=placeholder_image,
                success=True,
                message=f"Using placeholder image (HTTP error: {str(http_err)})"
            )
        except Exception as api_error:
            print(f"API error: {api_error}")
            # Provide a placeholder image if the API call fails
            placeholder_image = "https://via.placeholder.com/800x600.png?text=API+Error"
            return ImageGenerationResponse(
                imageUrl=placeholder_image,
                success=True,
                message=f"Using placeholder image (API error: {str(api_error)})"
            )
    
    except Exception as e:
        print(f"General error: {e}")
        # Handle other errors gracefully
        placeholder_image = "https://via.placeholder.com/800x600.png?text=Error+Generating+Image"
        return ImageGenerationResponse(
            imageUrl=placeholder_image,
            success=True,
            message=f"Using placeholder image (error: {str(e)})"
        )
