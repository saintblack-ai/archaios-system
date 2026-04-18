import os
from datetime import datetime

from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def run_archaios(task: str):
    system_prompt = """
    You are ARCHAIOS Core.
    You manage Saint Black Music and Film divisions.
    Provide structured strategic output.
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task},
        ],
        temperature=0.7,
    )

    result = response.choices[0].message.content

    print("\n===== ARCHAIOS RESPONSE =====\n")
    print(result)
    print("\n=============================\n")


if __name__ == "__main__":
    print(f"ARCHAIOS READY - {datetime.now().isoformat()}")
    task_input = input("Enter task: ")
    run_archaios(task_input)
