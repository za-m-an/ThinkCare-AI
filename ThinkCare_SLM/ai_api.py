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
    "You are ThinkCare AI, a professional and empathetic clinical symptom checker and triage assistant. "
    "Your objective is to analyze the patient's reported symptoms, evaluate potential medical conditions, "
    "and provide a structured assessment to assist them in seeking the appropriate level of care. "
    "Analyze the input carefully for clinical indicators, severity markers, and potential red flags. "
    "You must format your assessment strictly using the keys below so the application can parse the information correctly:\n\n"
    "**Disease**: [Name of the most likely condition or differential diagnosis]\n"
    "**Severity**: [Mild / Moderate / Severe / Critical - based on symptom urgency]\n"
    "**Recommended Precautions**:\n"
    "1. [First specific actionable precaution, self-care step, or warning sign to monitor]\n"
    "2. [Second precaution or next step]\n"
    "3. [Third precaution or next step]\n\n"
    "Ensure you always remind the patient that this assessment is not a definitive diagnosis and they must consult a qualified healthcare professional."
)

SYSTEM_PROMPT_BN = (
    "আপনি ThinkCare AI, একজন পেশাদার এবং সহানুভূতিশীল ক্লিনিক্যাল লক্ষণ পরীক্ষক এবং ট্রায়াজ সহকারী। "
    "আপনার লক্ষ্য হলো রোগীর উল্লিখিত লক্ষণগুলি বিশ্লেষণ করা, সম্ভাব্য চিকিৎসা পরিস্থিতি মূল্যায়ন করা, "
    "এবং রোগীকে সঠিক স্তরের চিকিৎসা সহায়তা পেতে সহায়তা করার জন্য একটি সুনির্দিষ্ট কাঠামোবদ্ধ মূল্যায়ন প্রদান করা। "
    "ক্লিনিক্যাল নির্দেশক, তীব্রতার লক্ষণ এবং সম্ভাব্য লাল সংকেত (red flags) এর জন্য রোগীর বিবরণটি সাবধানে বিশ্লেষণ করুন। "
    "সিস্টেম যাতে তথ্যগুলি সঠিকভাবে পার্স করতে পারে, সেজন্য আপনাকে অবশ্যই নিম্নলিখিত বিন্যাসটি কঠোরভাবে অনুসরণ করতে হবে:\n\n"
    "**রোগ**: [সবচেয়ে সম্ভাব্য রোগ বা অবস্থার নাম]\n"
    "**তীব্রতা**: [হালকা / মাঝারি / গুরুতর / জটিল - লক্ষণের গুরুত্বের ভিত্তিতে]\n"
    "**সুপারিশকৃত সতর্কতা**:\n"
    "১. [প্রথম নির্দিষ্ট করণীয় সতর্কতা, নিজের যত্ন নেওয়ার পদক্ষেপ বা বিপজ্জনক লক্ষণ যা পর্যবেক্ষণ করতে হবে]\n"
    "২. [দ্বিতীয় সতর্কতা বা পরবর্তী পদক্ষেপ]\n"
    "৩. [তৃতীয় সতর্কতা বা পরবর্তী পদক্ষেপ]\n\n"
    "সর্বদা রোগীকে মনে করিয়ে দিন যে এই মূল্যায়নটি কোনো চূড়ান্ত রোগ নির্ণয় নয় এবং তাদের অবশ্যই একজন যোগ্যতাসম্পন্ন চিকিৎসকের সাথে পরামর্শ করতে হবে।"
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
        
        # Determine the number of user turns (prior user messages + current message)
        user_turns = sum(1 for msg in history if msg.sender == "user") + 1
        
        # Build turn-based instructions based on language
        if use_bn:
            if user_turns < 3:
                insist_keywords_bn = ["রোগ কি", "রোগ কি?", "রোগ নির্ণয়", "সিদ্ধান্ত", "ডায়াগনসিস", "চূড়ান্ত", "এখনই বলো"]
                user_insisting_bn = any(kw in message for kw in insist_keywords_bn)
                if user_insisting_bn:
                    turn_instruction = (
                        f"\n\n[সিস্টেম নির্দেশাবলী: এটি ধাপ {user_turns}, তবে রোগী সরাসরি রোগ নির্ণয় জানতে চাচ্ছেন। "
                        "প্রশ্নোত্তর ধাপটি এড়িয়ে অবিলম্বে আপনার চূড়ান্ত ক্লিনিক্যাল মূল্যায়ন ও রোগ নির্ণয় দিন। "
                        "অবশ্যই '**রোগ**:', '**তীব্রতা**:', এবং '**সুপারিশকৃত সতর্কতা**:' বিন্যাসটি অনুসরণ করুন।]"
                    )
                else:
                    turn_instruction = (
                        f"\n\n[সিস্টেম নির্দেশাবলী: এটি কথোপকথনের {user_turns} নম্বর ধাপ। জীবন সংশয়কারী জরুরি অবস্থা না থাকলে এখনই কোনো চূড়ান্ত রোগ নির্ণয় দেবেন না "
                        "(অর্থাৎ '**রোগ**:', '**তীব্রতা**:', বা '**সুপারিশকৃত সতর্কতা**:' অংশগুলি যুক্ত করবেন না)। "
                        "এর পরিবর্তে, লক্ষণগুলি আরও ভালোভাবে বোঝার জন্য ১ বা ২টি সংক্ষিপ্ত ও সহানুভূতিশীল প্রশ্ন জিজ্ঞাসা করুন।]"
                    )
            else:
                turn_instruction = (
                    f"\n\n[সিস্টেম নির্দেশাবলী: এটি ধাপ {user_turns}। আপনাকে এখন অবশ্যই আপনার চূড়ান্ত রোগ নির্ণয় এবং ক্লিনিক্যাল মূল্যায়ন প্রদান করতে হবে। "
                    "কঠোরভাবে বিন্যাসটি অনুসরণ করুন: '**রোগ**:', '**তীব্রতা**:', '**সুপারিশকৃত সতর্কতা**:', এবং চিকিৎসা সংক্রান্ত সতর্কতা বার্তাটি অন্তর্ভুক্ত করুন।]"
                )
        else:
            if user_turns < 3:
                insist_keywords = ["diagnose", "diagnosis", "verdict", "what do i have", "tell me what is wrong", "immediate", "final"]
                user_insisting = any(kw in message.lower() for kw in insist_keywords)
                if user_insisting:
                    turn_instruction = (
                        f"\n\n[System Instructions: This is turn {user_turns}, but the patient is explicitly asking for a diagnosis. "
                        "Bypass the question-gathering phase and provide the final clinical assessment and diagnostic verdict strictly following the format: '**Disease**:', '**Severity**:', and '**Recommended Precautions**:'.]"
                    )
                else:
                    turn_instruction = (
                        f"\n\n[System Instructions: This is turn {user_turns} of the conversation. Do NOT provide a final diagnostic verdict yet "
                        "(do not output '**Disease**:', '**Severity**:', or '**Recommended Precautions**:') unless there is a severe/life-threatening emergency. "
                        "Instead, ask 1 or 2 relevant, empathetic, and brief follow-up questions to understand their symptoms better.]"
                    )
            else:
                turn_instruction = (
                    f"\n\n[System Instructions: This is turn {user_turns}. You must now provide your final clinical assessment and diagnostic verdict. "
                    "Strictly follow the formatting rules: include '**Disease**:', '**Severity**:', '**Recommended Precautions**:', and the medical disclaimer.]"
                )
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({
                "role": "user" if msg.sender == "user" else "assistant",
                "content": msg.text
            })
        messages.append({"role": "user", "content": message + turn_instruction})
        
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
