import os
import io
import json
import urllib.request
import urllib.error

import pandas as pd
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# ── Load .env manually ─────────────────────────────────────────────────────────
def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(env_path):
        print(f"[WARN] .env not found at: {env_path}")
        return
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
    print("[INFO] .env loaded successfully")

load_env_file()

_key = os.environ.get("OPENROUTER_API_KEY", "")
print(f"[INFO] OPENROUTER_API_KEY: {'SET (' + str(len(_key)) + ' chars)' if _key else 'MISSING'}")

app = FastAPI(title="CSV AI Decision Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

csv_store = {"data": None, "filename": None}


@app.get("/")
def root():
    return {"message": "CSV AI Decision Agent is running."}


@app.get("/debug")
def debug():
    key = os.environ.get("OPENROUTER_API_KEY", "")
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    return {
        "openrouter_key_found": bool(key),
        "key_length": len(key),
        "key_preview": key[:10] + "..." if len(key) > 10 else "EMPTY",
        "env_file_exists": os.path.exists(env_path),
        "env_path": env_path,
    }


# ── /analyze ───────────────────────────────────────────────────────────────────

@app.post("/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".csv"):
            return JSONResponse(status_code=400, content={"error": "Invalid file type. Please upload a .csv file."})

        contents = await file.read()
        if not contents.strip():
            return JSONResponse(status_code=400, content={"error": "The uploaded file is empty."})

        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception:
            return JSONResponse(status_code=400, content={"error": "Could not parse the file. Make sure it is a valid CSV."})

        original_rows = len(df)
        df.dropna(inplace=True)
        df.drop_duplicates(inplace=True)
        cleaned_rows = len(df)

        if cleaned_rows == 0:
            return JSONResponse(status_code=400, content={"error": "No data remaining after cleaning."})

        csv_store["data"] = df.head(300).to_json(orient="records")
        csv_store["filename"] = file.filename

        columns = df.columns.tolist()
        insights = []

        if original_rows != cleaned_rows:
            insights.append(f"Cleaned dataset: removed {original_rows - cleaned_rows} row(s). {cleaned_rows} row(s) remain.")

        numeric_found = False
        for col in columns:
            series = pd.to_numeric(df[col], errors="coerce")
            if series.isna().all():
                continue
            numeric_found = True
            insights.append(f"{col} average = {round(float(series.mean()), 2)}")

        if not numeric_found:
            insights.append("No numeric columns found.")

        decisions = []
        if cleaned_rows < 50:
            decisions.append("Dataset is small — consider collecting more data.")
        else:
            decisions.append(f"Dataset is sufficiently large ({cleaned_rows} rows).")

        if len(columns) > 8:
            decisions.append("Too many features detected — consider dimensionality reduction.")
        else:
            decisions.append(f"Feature count is manageable ({len(columns)} columns).")

        if "Value" in df.columns:
            vs = pd.to_numeric(df["Value"], errors="coerce")
            if not vs.isna().all():
                vm = float(vs.mean())
                if vm > 1000:
                    decisions.append(f"High performance detected — 'Value' average is {round(vm, 2)}.")
                else:
                    decisions.append(f"Improvement needed — 'Value' average is only {round(vm, 2)}.")
            else:
                decisions.append("'Value' column has no numeric data.")

        decisions.append("Monitor trends regularly to track changes over time.")

        return {
            "filename": file.filename,
            "rows": cleaned_rows,
            "columns": columns,
            "insights": insights,
            "decisions": decisions,
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Unexpected error: {str(e)}"})


# ── /chat (OpenRouter — free, no Cloudflare issues) ────────────────────────────

class ChatRequest(BaseModel):
    question: str
    history: list = []


@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        if not csv_store["data"]:
            return JSONResponse(status_code=400, content={"error": "No CSV uploaded yet. Please upload and analyze a file first."})

        api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
        if not api_key:
            return JSONResponse(status_code=500, content={"error": "OPENROUTER_API_KEY is not set in your .env file."})

        system_prompt = (
            f"You are a data analyst AI. The user uploaded '{csv_store['filename']}'.\n"
            f"Here is the CSV data (up to 300 rows, JSON):\n\n{csv_store['data']}\n\n"
            "Rules:\n"
            "- Answer strictly from this data only.\n"
            "- Be concise and precise with numbers.\n"
            "- Use bullet points when listing items.\n"
            "- If something cannot be answered from the data, say so clearly."
        )

        messages = [{"role": "system", "content": system_prompt}]
        for h in req.history:
            if h.get("role") in ("user", "assistant") and h.get("content"):
                messages.append({"role": h["role"], "content": str(h["content"])})
        messages.append({"role": "user", "content": req.question})

        payload = json.dumps({
            "model": "qwen/qwen-2-7b-instruct:free",  # free model on OpenRouter
            "messages": messages,
            "max_tokens": 1024,
            "temperature": 0.3,
        }).encode("utf-8")

        api_req = urllib.request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "http://localhost:5500",   # required by OpenRouter
                "X-Title": "CSV AI Decision Agent",        # optional but good practice
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(api_req) as resp:
                result = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8")
            return JSONResponse(status_code=502, content={"error": f"OpenRouter API error {e.code}: {body}"})

        answer = result["choices"][0]["message"]["content"].strip()

        if not answer:
            return JSONResponse(status_code=502, content={"error": "Empty response from OpenRouter."})

        return {"answer": answer}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Chat error: {str(e)}"})