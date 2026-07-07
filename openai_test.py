import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

client = OpenAI(
  api_key=os.environ.get("OPENAI_API_KEY")
)

response = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "write a haiku about ai"}
  ]
)

print(response.choices[0].message.content)
import requests

url = "https://verify.cgpey.com/api/v1/verify/pan"

headers = {
    "Content-Type": "application/json",
    "x-merchant-id": "YOUR_MERCHANT_ID",
    "x-api-key": "YOUR_API_KEY",
    "x-secret-key": "YOUR_SECRET_KEY"
}

payload = {
    "pan": "ABCDE1234F"
}

response = requests.post(url, headers=headers, json=payload)

print(response.status_code)
print(response.json())from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

MERCHANT_ID = "YOUR_MERCHANT_ID"
API_KEY = "YOUR_API_KEY"
SECRET_KEY = "YOUR_SECRET_KEY"

@app.route("/verify-pan", methods=["POST"])
def verify_pan():
    pan = request.json.get("pan")

    url = "https://verify.cgpey.com/api/v1/verify/pan"

    headers = {
        "Content-Type": "application/json",
        "x-merchant-id": MERCHANT_ID,
        "x-api-key": API_KEY,
        "x-secret-key": SECRET_KEY
    }

    response = requests.post(
        url,
        headers=headers,
        json={"pan": pan}
    )

    return jsonify(response.json()), response.status_code
import requests

url = "https://verify.cgpey.com/api/v1/verify/pan"

headers = {
    "Content-Type": "application/json",
    "x-merchant-id": "YOUR_MERCHANT_ID",
    "x-api-key": "YOUR_API_KEY",
    "x-secret-key": "YOUR_SECRET_KEY"
}

payload = {
    "pan": "ABCDE1234F"
}

response = requests.post(url, headers=headers, json=payload)

print(response.json())
import os
from dotenv import load_dotenv

load_dotenv()

headers = {
    "Content-Type": "application/json",
    "x-merchant-id": os.getenv("CGPEY_MERCHANT_ID"),
    "x-api-key": os.getenv("CGPEY_API_KEY"),
    "x-secret-key": os.getenv("CGPEY_SECRET_KEY"),
}
if __name__ == "__main__":
    app.run(debug=True)
