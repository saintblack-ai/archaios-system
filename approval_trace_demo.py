from openai import OpenAI
import json, datetime, hashlib, os

client = OpenAI()

# ---- STEP 1: PLAN (STRICT JSON OUTPUT) ----
planning = client.responses.create(
    model="gpt-4.1",
    input=[
        {
            "role": "system",
            "content": (
                "Return STRICT JSON with keys: "
                "plan, tool_name, tool_inputs, "
                "est_cost_usd, risk_level, rollback_plan, "
                "needs_approval"
            ),
        },
        {
            "role": "user",
            "content": "Write a one-paragraph weekly project summary.",
        },
    ],
)

proposal = json.loads(planning.output_text)

# ---- STEP 2: APPROVAL GATE ----
APPROVED = True  # Change to False to test blocking behavior


# ---- TOOL (DETERMINISTIC BOUNDARY) ----
def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    return {"status": "written", "path": path}


if proposal.get("needs_approval") and APPROVED:
    result = write_file(
        f"legacy_logs/{datetime.date.today()}_summary.md",
        proposal["plan"],
    )
else:
    result = {"status": "blocked_no_approval"}

# ---- STEP 3: TRACE LEDGER ----
trace_payload = {
    "proposal": proposal,
    "approved": APPROVED,
    "execution_result": result,
    "timestamp_utc": datetime.datetime.utcnow().isoformat(),
}

trace_hash = hashlib.sha256(
    json.dumps(trace_payload, sort_keys=True).encode()
).hexdigest()

trace_payload["sha256"] = trace_hash

print(json.dumps(trace_payload, indent=2))
