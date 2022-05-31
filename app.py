from flask import Flask, render_template
import os
from dotenv import load_dotenv
from twilio.rest import Client
import json

load_dotenv()

app = Flask(__name__, static_url_path="/static")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/demo")
def demo():
    return render_template("demo.html")


@app.route("/run")
def run_application():
    return render_template("run.html")


@app.route("/api/alert")
def alert():
    account_sid = os.environ["TWILIO_ACCOUNT_SID"]
    auth_token = os.environ["TWILIO_AUTH_TOKEN"]
    from_number = os.environ["TWILIO_PHONE_NUMBER"]
    to_number = os.environ["TARGET_PHONE_NUMBER"]

    client = Client(account_sid, auth_token)
    client.messages.create(
        body="Alert triggered by Web Sentinel",
        from_=from_number,
        to=to_number,
    )

    return json.dumps({"alert": True})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
