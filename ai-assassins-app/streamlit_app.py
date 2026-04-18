import requests
import streamlit as st

st.set_page_config(page_title="AI Assassins", layout="wide")
st.title("🔥 AI ASSASSINS — Streamlit Live App")

BACKEND_URL = st.secrets.get("backend_url", "http://localhost:8000")

if "messages" not in st.session_state:
    st.session_state.messages = []


def send_to_backend(message: str) -> dict:
    try:
        res = requests.post(
            f"{BACKEND_URL}/api/send",
            json={"message": message},
            timeout=20,
        )
        return res.json()
    except Exception as e:
        return {"error": str(e)}


st.markdown("### Chat")
input_text = st.text_input("You:", key="input")

if st.button("Send") and input_text.strip():
    st.session_state.messages.append({"role": "user", "text": input_text})
    response = send_to_backend(input_text)

    if "reply" in response:
        st.session_state.messages.append({"role": "AI", "text": response["reply"]})
    else:
        st.session_state.messages.append({"role": "Error", "text": response.get("error", "Unknown")})

st.write("---")
for msg in st.session_state.messages:
    st.markdown(f"**{msg['role']}:** {msg['text']}")
