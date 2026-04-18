import requests
import streamlit as st

st.set_page_config(page_title="Saint Black OS", layout="wide")

st.title("⚡ SAINT BLACK OS")
st.subheader("ARCHAIOS Cognitive Command Interface")

menu = st.sidebar.selectbox(
    "Select Mode",
    ["Strategic Analysis", "Creative Forge", "Myth Simulation", "Memory View"],
)

query = st.text_area("Enter Command")

if st.button("Execute"):
    if menu == "Strategic Analysis":
        response = requests.post(
            "http://localhost:8000/ask",
            json={"query": query},
        )
        st.success("Strategic Output")
        st.write(response.json())

    elif menu == "Creative Forge":
        response = requests.post(
            "http://localhost:8000/ask",
            json={"query": f"Create cinematic concept: {query}"},
        )
        st.success("Creative Output")
        st.write(response.json())

    elif menu == "Myth Simulation":
        response = requests.post(
            "http://localhost:8000/ask",
            json={"query": f"Simulate archetype: {query}"},
        )
        st.success("Myth Engine Output")
        st.write(response.json())

    elif menu == "Memory View":
        st.info("Memory persistence is active in backend.")
