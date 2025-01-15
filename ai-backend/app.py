#!/usr/bin/env python3	
from flask import Flask, jsonify, request
from scrape import *
from helper import *
from flask_cors import CORS
app = Flask('Edify API')
CORS(app)
@app.route('/')
def index():
	return "Hello, World!"

@app.route('/hackathons')
def api():
    hackathons = scrape_hackathons()
    return jsonify(hackathons)

@app.route('/meetups')
def meetups():
    meetups = scrape_meetups()
    return jsonify(meetups)

@app.route("/chatbot", methods=["POST"])
def process_content():
    """
    API route to process chapter and content, generate embeddings, and store them in a FAISS index.
    
    Request Body:
        - chapter (dict): Contains chapter information (e.g., name, description).
        - content (dict): Contains content details, including titles and explanations.
    
    Returns:
        JSON: Status message and FAISS index details.
    """
    try:
        # Get JSON data from the request
        data = request.json

        if not data:
            return jsonify({"error": "No data provided"}), 400

        description = data.get("description")
        query = data.get("query")
        
        if not description:
            return jsonify({"error": "Missing chapter or content"}), 400
        # Process the content
        result = answer_query(description,query)

        # Check for errors in processing
        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        return jsonify({"result":result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
	app.run(debug=True,port=5000)