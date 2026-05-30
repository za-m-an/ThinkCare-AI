from __future__ import annotations

import os
import re
import threading
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- CONFIGURATION ---
APP_TITLE = "ThinkCare AI SLM Serving Engine"
model_path = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(title=APP_TITLE)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SLM MODEL VARIABLES ---
slm_model = None
slm_tokenizer = None

SYSTEM_PROMPT_EN = (
    "You are ThinkCare AI, a professional clinical symptom checker. "
    "When a patient describes their symptoms, analyze them carefully and provide: "
    "1) The most likely disease/condition, "
    "2) The severity level (Mild, Moderate, Severe, or Critical), "
    "3) Recommended precautions and next steps. "
    "Always remind the patient to consult a healthcare professional."
)

SYSTEM_PROMPT_BN = (
    "আপনি ThinkCare AI, একজন পেশাদার ক্লিনিক্যাল লক্ষণ পরীক্ষক। "
    "যখন কোনো রোগী তাদের লক্ষণ বর্ণনা করে, সেগুলি সাবধানে বিশ্লেষণ করুন এবং প্রদান করুন: "
    "১) সবচেয়ে সম্ভাব্য রোগ/অবস্থা, "
    "২) তীব্রতার মাত্রা (হালকা, মাঝারি, গুরুতর, বা জটিল), "
    "৩) সুপারিশকৃত সতর্কতা এবং পরবর্তী পদক্ষেপ। "
    "সর্বদা রোগীকে একজন স্বাস্থ্যসেবা পেশাদারের সাথে পরামর্শ করতে মনে করিয়ে দিন।"
)

def load_slm():
    global slm_model, slm_tokenizer
    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        
        print(f"[INFO] Loading SLM from {model_path}...")
        slm_tokenizer = AutoTokenizer.from_pretrained(model_path, fix_mistral_regex=True)
        
        # Auto-detect device
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[INFO] SLM using device: {device}")
        
        if device == "cuda":
            slm_model = AutoModelForCausalLM.from_pretrained(
                model_path,
                dtype=torch.float16,
                device_map="auto"
            )
        else:
            slm_model = AutoModelForCausalLM.from_pretrained(
                model_path,
                dtype=torch.float32,
                low_cpu_mem_usage=True
            ).to("cpu")
        print("[SUCCESS] SLM Model and Tokenizer loaded successfully!")
    except Exception as e:
        print(f"[ERROR] Failed to load SLM model: {e}")

# Launch SLM loader in background thread to avoid blocking server boot
threading.Thread(target=load_slm, daemon=True).start()


# --- SCHEMAS ---
class ChatMessage(BaseModel):
    sender: str  # "user" or "ai"
    text: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    history: List[ChatMessage] = Field(default_factory=list)
    gemini_api_key: Optional[str] = None
    mode: Optional[str] = None
    language: Optional[str] = None  # "en" or "bn" — explicit language preference from frontend

class Prediction(BaseModel):
    condition: str
    likelihood: float

class ChatResponse(BaseModel):
    response: str
    predictions: List[Prediction] = Field(default_factory=list)
    top_condition: Optional[str] = None
    top_confidence: Optional[float] = None
    precautions: List[str] = Field(default_factory=list)
    aftermaths: Optional[str] = None
    verdict_given: bool


# --- HELPERS ---
def is_bangla(text: str) -> bool:
    return bool(re.search(r"[\u0980-\u09ff]", text))

def run_slm_inference(message: str, history: List[ChatMessage], language: Optional[str] = None) -> str:
    if slm_model is None or slm_tokenizer is None:
        return "SLM model is currently loading or offline. Please try again in a few moments."
    try:
        import torch
        # If explicit language preference is provided, use it; otherwise auto-detect from message text
        if language == "bn":
            use_bn = True
        elif language == "en":
            use_bn = False
        else:
            use_bn = is_bangla(message)
        system_prompt = SYSTEM_PROMPT_BN if use_bn else SYSTEM_PROMPT_EN
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({
                "role": "user" if msg.sender == "user" else "assistant",
                "content": msg.text
            })
        messages.append({"role": "user", "content": message})
        
        text = slm_tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        inputs = slm_tokenizer(text, return_tensors="pt").to(slm_model.device)
        
        with torch.no_grad():
            outputs = slm_model.generate(
                **inputs,
                max_new_tokens=512,
                max_length=None,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                use_cache=True
            )
            
        generated_ids = outputs[0][inputs["input_ids"].shape[-1]:]
        response = slm_tokenizer.decode(generated_ids, skip_special_tokens=True)
        return response.strip()
    except Exception as e:
        print(f"[ERROR] SLM generation failed: {e}")
        return f"An error occurred during local SLM inference: {str(e)}"

def parse_slm_response(text: str) -> dict:
    parsed = {
        "top_condition": None,
        "top_confidence": None,
        "predictions": [],
        "precautions": [],
        "aftermaths": None,
        "verdict_given": False
    }
    
    # Match Disease name (English & Bangla)
    disease_match = re.search(r"(?:\*\*?|১\)\s*|১\.\s*)(?:Disease|রোগ|সম্ভাব্য রোগ|অবস্থা|সবচেয়ে সম্ভাব্য রোগ/অবস্থা)\*\*?:\s*([^\n]+)", text, re.IGNORECASE)
    if disease_match:
        condition = disease_match.group(1).strip()
        parsed["top_condition"] = condition
        parsed["top_confidence"] = 95.0
        parsed["predictions"] = [Prediction(condition=condition, likelihood=95.0)]
        parsed["verdict_given"] = True
        
    # Match Severity (English & Bangla)
    severity_match = re.search(r"(?:\*\*?|২\)\s*|২\.\s*)(?:Severity|তীব্রতা|তীব্রতার মাত্রা)\*\*?:\s*([^\n]+)", text, re.IGNORECASE)
    if severity_match:
        severity_val = severity_match.group(1).strip()
        parsed["aftermaths"] = f"Severity Level: {severity_val}"
        
    # Match Precautions list
    prec_section = re.search(r"(?:\*\*?|৩\)\s*|৩\.\s*)(?:Recommended Precautions|সুপারিশকৃত সতর্কতা|সতর্কতা|প্রয়োজনীয় সতর্কতা)\*\*?:\s*\n?((?:[১-৯১-৯0-9*•-]\s*[^\n]+\n?)+)", text, re.IGNORECASE)
    if prec_section:
        items = re.findall(r"(?:[১-৯১-৯0-9*•-]\.\s*|[১-৯১-৯0-9*•-]\s*)([^\n]+)", prec_section.group(1))
        parsed["precautions"] = [item.strip() for item in items if item.strip()]
    else:
        # Fallback list match
        items = re.findall(r"(?:\n[১-৯১-৯0-9*•-]\.\s*|\n[১-৯১-৯0-9*•-]\s*)([^\n]+)", text)
        if items:
            parsed["precautions"] = [item.strip() for item in items if item.strip()]
            
    if parsed["verdict_given"] and not parsed["precautions"]:
        parsed["precautions"] = ["Consult a medical professional", "Monitor symptoms closely", "Rest and stay hydrated"]
        
    return parsed


# --- ENDPOINTS ---
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "ThinkCare SLM",
        "engine": "ready" if slm_model is not None else "loading/offline"
    }

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    response_text = run_slm_inference(payload.message, payload.history, payload.language)
    parsed = parse_slm_response(response_text)
    return ChatResponse(
        response=response_text,
        predictions=parsed["predictions"],
        top_condition=parsed["top_condition"],
        top_confidence=parsed["top_confidence"],
        precautions=parsed["precautions"],
        aftermaths=parsed["aftermaths"],
        verdict_given=parsed["verdict_given"]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
