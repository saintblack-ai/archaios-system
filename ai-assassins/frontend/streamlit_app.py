import os
from datetime import datetime

import requests
import streamlit as st

backend_url = st.secrets.get("backend_url", os.getenv("BACKEND_URL", "http://localhost:8000"))

st.set_page_config(page_title="AI Assassins", layout="wide")
st.title("AI Assassins Real-Time Chat")
st.caption("Streamlit frontend connected to FastAPI backend")

if "messages" not in st.session_state:
    st.session_state.messages = []


with st.sidebar:
    st.subheader("Settings")
    st.write(f"Backend: `{backend_url}`")
    if st.button("Clear conversation"):
        st.session_state.messages = []
        st.rerun()

st.subheader("Conversation")
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if msg.get("timestamp"):
            st.caption(msg["timestamp"])

user_text = st.chat_input("Type your message...")

if user_text:
    ts = datetime.now().strftime("%H:%M:%S")
    st.session_state.messages.append({"role": "user", "content": user_text, "timestamp": ts})

    with st.chat_message("user"):
        st.markdown(user_text)
        st.caption(ts)

    try:
        response = requests.post(
            f"{backend_url}/api/chat",
            json={"message": user_text},
            timeout=15,
        )
        reply = response.json().get("reply", "No reply")
        ts = datetime.now().strftime("%H:%M:%S")
        st.session_state.messages.append({"role": "assistant", "content": reply, "timestamp": ts})

        with st.chat_message("assistant"):
            st.markdown(reply)
            st.caption(ts)
    except Exception as e:
        ts = datetime.now().strftime("%H:%M:%S")
        st.session_state.messages.append({"role": "assistant", "content": str(e), "timestamp": ts})

        with st.chat_message("assistant"):
            st.markdown(str(e))
            st.caption(ts)
