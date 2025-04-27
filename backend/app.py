from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
from PIL import Image
import io
from image_generate import AzureImageGenerator
import dotenv

# Load environment variables from .env file if it exists
dotenv.load_dotenv()

# Get Azure OpenAI API credentials from environment variables
AZURE_API_KEY = os.getenv("AZURE_API_KEY", "your-api-key")
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT", "your-endpoint")
AZURE_DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME", "your-deployment-name")

# Initialize the image generator
image_generator = AzureImageGenerator(
    api_key=AZURE_API_KEY,
    endpoint=AZURE_ENDPOINT,
    deployment_name=AZURE_DEPLOYMENT_NAME
)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
GENERATED_FOLDER = 'generated'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GENERATED_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['GENERATED_FOLDER'] = GENERATED_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/edit-image', methods=['POST'])
def edit_image_endpoint():
    print("Edit image endpoint")
    # Check if the post request has the file part
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400

    # Get all uploaded images
    files = request.files.getlist('image')
    prompt = request.form.get('prompt', '')
    size = request.form.get('size', '1024x1024')
    quality = request.form.get('quality', 'medium')

    # Check if any files were uploaded
    if not files or all(file.filename == '' for file in files):
        return jsonify({'error': 'No selected files'}), 400

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    # Check if all files have allowed extensions
    if not all(allowed_file(file.filename) for file in files if file.filename):
        return jsonify({'error': 'One or more files have unsupported format'}), 400

    try:
        # Save all uploaded images
        file_paths = []
        for file in files:
            if file and file.filename:
                # Generate a unique filename
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                file_paths.append(file_path)

        # Generate a unique output filename
        output_filename = f"{uuid.uuid4()}_generated.png"
        output_path = os.path.join(app.config['GENERATED_FOLDER'], output_filename)

        # Use the AzureImageGenerator to edit the images based on the prompt
        try:
            # Check if we're using the default API key (for development/testing)
            if AZURE_API_KEY == "your-api-key":
                # Fallback to a simple image processing if no API key is provided
                img = Image.open(file_paths[0])  # Just use the first image
                img.save(output_path)
            else:
                # Use the Azure OpenAI API to edit the images
                image_generator.edit_image(
                    images=file_paths,
                    prompt=prompt,
                    output_path=output_path,
                    size=size if size != "auto" else "1024x1024",
                    quality=quality if quality != "auto" else "medium"
                )

            # Return the generated image
            return send_file(output_path, mimetype='image/png')

        except Exception as e:
            return jsonify({'error': f'Image generation failed: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'error': f'File processing error: {str(e)}'}), 500

@app.route('/generate-image', methods=['POST'])
def generate_image_endpoint():
    print("Generate image endpoint")
    """
    Generate an image from a prompt without requiring an uploaded image.
    This endpoint uses the generate_image method from AzureImageGenerator.
    """
    prompt = request.form.get('prompt', '')
    size = request.form.get('size', '1024x1024')
    quality = request.form.get('quality', 'medium')

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    try:
        # Generate a unique output filename
        output_filename = f"{uuid.uuid4()}_generated.png"
        output_path = os.path.join(app.config['GENERATED_FOLDER'], output_filename)

        # Use the AzureImageGenerator to generate an image based on the prompt
        try:
            # Check if we're using the default API key (for development/testing)
            if AZURE_API_KEY == "your-api-key":
                # Fallback to a simple image generation if no API key is provided
                img = Image.new('RGB', (1024, 1024), color = (73, 109, 137))
                img.save(output_path)
            else:
                # Use the Azure OpenAI API to generate the image
                image_generator.generate_image(
                    prompt=prompt,
                    size=size if size != "auto" else "1024x1024",
                    quality=quality if quality != "auto" else "medium",
                    n=1,
                    output_path=output_path
                )

            # Return the generated image
            return send_file(output_path, mimetype='image/png')

        except Exception as e:
            return jsonify({'error': f'Image generation failed: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'error': f'Processing error: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
