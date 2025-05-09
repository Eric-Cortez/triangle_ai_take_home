from flask import Flask, request, jsonify
import requests
from requests.auth import HTTPBasicAuth
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

ZENDESK_BASE_URL = os.getenv("ZENDESK_BASE_URL")
ZENDESK_API_KEY = os.getenv("ZENDESK_API_KEY")
ZENDESK_EMAIL = os.getenv("ZENDESK_EMAIL")
ZAPIER_WEBHOOK_URL = os.getenv("ZAPIER_WEBHOOK_URL")

@app.route('/api/tasks', methods=['GET'])
def fetch_tasks():
    try:
        response = requests.get(
            ZENDESK_BASE_URL,
            headers={"Content-Type": "application/json"},
            auth=HTTPBasicAuth(f'{ZENDESK_EMAIL}/token', ZENDESK_API_KEY)
        )
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/zapier-webhook', methods=['POST']) # zapier only allows POST requests
def zapier_webhook():
    try:
        payload = request.json

        if not payload:
            return jsonify({"error": "Payload is required"}), 400

        response = requests.post(
            ZAPIER_WEBHOOK_URL,
            json={
            "ticket_id": payload["ticket_id"],
            "subject": payload["subject"],
            "status": payload["status"],
            "priority": payload["priority"]
            },
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        return jsonify({"message": "Payload sent to Zapier successfully", "zapier_response": response.json()}), 200
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)