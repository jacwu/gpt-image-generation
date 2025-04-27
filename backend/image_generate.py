import requests
import base64
import os

class AzureImageGenerator:
    def __init__(self, api_key, endpoint, deployment_name):
        self.api_key = api_key
        self.endpoint = endpoint.rstrip('/')
        self.deployment_name = deployment_name
        self.api_version = "2025-04-01-preview"

    def generate_image(self, prompt, size="1024x1024", quality="medium", n=1, output_path="generated_image.png"):
        print(f"generate_image")
        url = f"{self.endpoint}/openai/deployments/{self.deployment_name}/images/generations?api-version={self.api_version}"
        headers = {
            "Content-Type": "application/json",
            "api-key": self.api_key
        }
        payload = {
            "prompt": prompt,
            "size": size,
            "quality": quality,
            "n": n
        }
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        if not data.get("data") or not data["data"][0].get("b64_json"):
            raise ValueError("No image data returned from API.")
        b64_image = data["data"][0]["b64_json"]
        image_bytes = base64.b64decode(b64_image)
        with open(output_path, "wb") as f:
            f.write(image_bytes)
        print(f"Image saved to {os.path.abspath(output_path)}")

    def edit_image(self, images, prompt, output_path="edited_image.png", size="1024x1024", quality="medium"):
        print("Editing image...")
        """
        Edit an image using Azure OpenAI image edit API.
        :param images: List of image file paths to use as input
        :param prompt: Edit prompt
        :param output_path: Path to save the edited image
        :param size: Size of the output image (1024x1024, 1536x1024, 1024x1536)
        :param quality: Quality of the output image (low, medium, high)
        """
        url = f"{self.endpoint}/openai/deployments/{self.deployment_name}/images/edits?api-version={self.api_version}"
        headers = {
            "api-key": self.api_key
        }
        files = []

        # Add images to files
        for img_path in images:
            files.append(("image[]", (os.path.basename(img_path), open(img_path, "rb"), "image/png")))


        data = {
            "prompt": prompt,
            "size": size,
            "quality": quality
        }

        response = requests.post(url, headers=headers, files=files, data=data)

        # Close file handles
        for _, file_tuple in files:
            file_tuple[1].close()

        # Debugging: Print response content on error
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(f"Response Content: {response.text}")
            response.raise_for_status()

        result = response.json()
        if not result.get("data") or not result["data"][0].get("b64_json"):
            raise ValueError("No image data returned from API.")
        b64_image = result["data"][0]["b64_json"]
        image_bytes = base64.b64decode(b64_image)
        with open(output_path, "wb") as f:
            f.write(image_bytes)
        print(f"Edited image saved to {os.path.abspath(output_path)}")

