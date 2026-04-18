import time

import requests
import streamlit as st

# ========== SETTINGS ==========
BACKEND_URL = st.secrets["backend_url"]
openai_api_key = st.secrets["openai_api_key"]

st.set_page_config(
    page_title="AI Assassins",
    layout="wide"
)

st.title("🔥 AI ASSASSINS — Streamlit Live App")

if "messages" not in st.session_state:
    st.session_state.messages = []


def send_to_backend(message):
    """
    Sends message to backend for processing
    """
    try:
        res = requests.post(
            f"{BACKEND_URL}/api/send",
            json={"message": message},
            timeout=15
        )
        return res.json()
    except Exception as e:
        return {"error": str(e)}


st.markdown("### Chat")

input_text = st.text_input("You:", key="input")

if st.button("Send"):
    st.session_state.messages.append({"role": "user", "text": input_text})
    response = send_to_backend(input_text)

    if "reply" in response:
        st.session_state.messages.append({"role": "AI", "text": response["reply"]})
    else:
        st.session_state.messages.append({"role": "Error", "text": response.get("error", "Unknown")})

st.write("---")

for msg in st.session_state.messages:
    st.markdown(f"**{msg['role']}:** {msg['text']}")
