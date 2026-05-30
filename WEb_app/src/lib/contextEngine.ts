export const AI_FEATURES = [
  "yellow_eyes_jaundice",
  "dark_urine",
  "itching_pruritus",
  "fever_with_chills",
  "mosquito_bite_history",
  "blood_in_sputum_hemoptysis",
  "unexplained_weight_loss",
  "loss_of_smell_anosmia",
  "loss_of_taste_ageusia",
  "watery_diarrhea",
  "vomiting",
  "heartburn_dyspepsia",
  "diffuse_abdominal_pain",
  "painful_urination_dysuria",
  "altered_mental_status",
  "hypoxia",
  "hypotension_low_blood_pressure",
  "night_sweats",
  "yellow_green_sputum",
  "abdominal_distension",
  "joint_pain_arthralgia",
  "muscle_pain_myalgia",
  "retro_orbital_pain",
  "cyclical_fever",
  "high_fever",
  "chronic_cough",
  "tachypnea_rapid_breathing",
  "recent_travel_tropical",
  "unprotected_sex_history",
  "consumption_of_street_food",
  "heavy_alcohol_use",
  "severe_one_sided_headache",
  "photophobia",
  "stiff_neck",
  "flank_pain_radiating_to_groin",
  "sudden_sharp_chest_pain",
  "wheezing",
  "swollen_tonsils_white_patches",
  "localized_painful_rash_blisters",
  "lower_right_quadrant_abdominal_pain"
];

const KEYWORD_MAP: Record<string, string[]> = {
  yellow_eyes_jaundice: ["jaundice", "yellow eyes", "yellow skin", "yellowish"],
  dark_urine: ["dark urine", "brown urine", "orange urine"],
  itching_pruritus: ["itching", "itchy", "pruritus", "scratching"],
  fever_with_chills: ["chills", "shivering", "cold sweat"],
  mosquito_bite_history: ["mosquito", "dengue bite", "malaria bite"],
  blood_in_sputum_hemoptysis: ["blood in cough", "blood in spit", "coughing blood", "hemoptysis"],
  unexplained_weight_loss: ["weight loss", "losing weight", "slimmed down"],
  loss_of_smell_anosmia: ["smell", "anosmia", "cannot smell", "lost smell"],
  loss_of_taste_ageusia: ["taste", "ageusia", "cannot taste", "lost taste"],
  watery_diarrhea: ["diarrhea", "watery stool", "loose motion", "watery diarrhea"],
  vomiting: ["vomit", "vomiting", "threw up", "throwing up"],
  heartburn_dyspepsia: ["heartburn", "acid reflux", "dyspepsia", "indigestion"],
  diffuse_abdominal_pain: ["stomach pain", "abdominal pain", "belly ache", "tummy pain"],
  painful_urination_dysuria: ["burning urination", "painful urination", "dysuria", "pain peeing"],
  altered_mental_status: ["confused", "dizzy", "delirious", "mental status", "confusion"],
  hypoxia: ["breathless", "cannot breathe", "oxygen low", "hypoxia", "shortness of breath"],
  hypotension_low_blood_pressure: ["low bp", "low blood pressure", "hypotension", "fainted"],
  night_sweats: ["night sweats", "sweating at night", "sweaty sleep"],
  yellow_green_sputum: ["mucus", "phlegm", "green cough", "yellow sputum", "green sputum"],
  abdominal_distension: ["bloated", "bloating", "distended belly", "swollen stomach"],
  joint_pain_arthralgia: ["joint pain", "arthralgia", "joints hurt", "knee pain"],
  muscle_pain_myalgia: ["muscle pain", "myalgia", "body ache", "muscles hurt"],
  retro_orbital_pain: ["pain behind eyes", "eye ache", "retro-orbital"],
  cyclical_fever: ["cyclical fever", "fever comes and goes", "fever returns"],
  high_fever: ["high fever", "hot body", "temperature high"],
  chronic_cough: ["cough", "coughing", "dry cough", "chronic cough"],
  tachypnea_rapid_breathing: ["rapid breathing", "fast breathing", "tachypnea"],
  recent_travel_tropical: ["travelled", "tropical country", "africa", "asia", "recent travel"],
  unprotected_sex_history: ["unprotected", "sexual contact", "std risk", "sex history"],
  consumption_of_street_food: ["street food", "dirty food", "vendor food", "outside food"],
  heavy_alcohol_use: ["alcohol", "drinking heavy", "drunkard", "heavy drinking", "alcoholism"],
  severe_one_sided_headache: ["one-sided headache", "migraine headache", "throbbing headache", "severe headache on one side"],
  photophobia: ["light sensitivity", "sensitive to light", "photophobia", "hurt eyes in light"],
  stiff_neck: ["stiff neck", "neck stiffness", "cannot bend neck", "neck pain and stiffness"],
  flank_pain_radiating_to_groin: ["flank pain", "kidney pain", "side pain radiating", "groin pain from back", "radiating to groin"],
  sudden_sharp_chest_pain: ["sharp chest pain", "sudden chest pain", "stabbing chest pain", "chest pain suddenly"],
  wheezing: ["wheezing", "wheeze", "whistling sound when breathing", "noisy breathing"],
  swollen_tonsils_white_patches: ["swollen tonsils", "white patches on throat", "tonsillitis", "tonsils hurt", "strep throat patches"],
  localized_painful_rash_blisters: ["shingles rash", "painful rash", "blisters in line", "localized blisters", "rash with blisters"],
  lower_right_quadrant_abdominal_pain: ["lower right abdomen", "right side stomach pain", "appendicitis pain", "pain in right lower belly"]
};

const REFUTATION_KEYWORDS = [
  "no",
  "gone",
  "stopped",
  "clear",
  "resolved",
  "without",
  "not having",
  "no longer",
  "cured",
  "disappeared",
  "better"
];

export class ContextEngine {
  /**
   * Helper to parse symptoms of a single text message using rule-based keywords.
   */
  public static parseSymptomsKeywords(text: string): Record<string, number> {
    const lowercase = text.toLowerCase();
    const parsed: Record<string, number> = {};

    AI_FEATURES.forEach((feature) => {
      parsed[feature] = 0.0;
    });

    for (const [feature, keywords] of Object.entries(KEYWORD_MAP)) {
      for (const keyword of keywords) {
        if (lowercase.includes(keyword)) {
          parsed[feature] = 1.0;
          break;
        }
      }
    }

    return parsed;
  }

  /**
   * Check if a specific symptom keyword has been refuted in the text.
   * e.g., "no fever", "fever is gone", "stopped vomiting"
   */
  public static isSymptomRefuted(text: string, feature: string): boolean {
    const lowercase = text.toLowerCase();
    const keywords = KEYWORD_MAP[feature] || [];

    // Find if any symptom keyword is in the text
    const matchedKeyword = keywords.find(kw => lowercase.includes(kw));
    if (!matchedKeyword) return false;

    // Check if any refutation word is in the text
    const hasRefutation = REFUTATION_KEYWORDS.some(ref => lowercase.includes(ref));
    if (!hasRefutation) return false;

    // Verify close proximity or syntactic structure (simple check: if both keyword and refutation are present)
    // More specific checks: e.g., "no fever" or "fever is gone"
    const refutationPatterns = [
      `no ${matchedKeyword}`,
      `without ${matchedKeyword}`,
      `not having ${matchedKeyword}`,
      `no longer ${matchedKeyword}`,
      `${matchedKeyword} is gone`,
      `${matchedKeyword} has gone`,
      `${matchedKeyword} stopped`,
      `${matchedKeyword} has stopped`,
      `${matchedKeyword} resolved`,
      `${matchedKeyword} has resolved`,
      `${matchedKeyword} disappeared`,
      `${matchedKeyword} has disappeared`
    ];

    return refutationPatterns.some(pattern => lowercase.includes(pattern));
  }

  /**
   * Main context method to accumulate symptom features over the conversation session.
   * It takes all past user messages, parses them, merges them using logical OR,
   * merges the current parsed symptoms (which can be Gemini parsed),
   * and clears any features that have been explicitly refuted in the latest prompt.
   */
  public static accumulateSymptoms(
    pastMessages: { sender: string; text: string }[],
    currentMessage: string,
    currentParsed: Record<string, number>
  ): Record<string, number> {
    const accumulated: Record<string, number> = {};

    // Initialize all to 0.0
    AI_FEATURES.forEach(feature => {
      accumulated[feature] = 0.0;
    });

    // 1. Process all previous user messages to build historical baseline
    const previousUserMessages = pastMessages.filter(m => m.sender === "user" || m.sender === "Patient");
    previousUserMessages.forEach((msg) => {
      const parsedMsg = this.parseSymptomsKeywords(msg.text);
      AI_FEATURES.forEach((feature) => {
        if (parsedMsg[feature] === 1.0) {
          accumulated[feature] = 1.0;
        }
      });
    });

    // 2. Merge current parsed symptoms (either LLM parsed or fallback parsed)
    AI_FEATURES.forEach((feature) => {
      if (currentParsed[feature] === 1.0) {
        accumulated[feature] = 1.0;
      }
    });

    // 3. Apply refutations from the latest user message
    // If the patient explicitly refutes a symptom in the latest prompt, clear it to 0.0
    AI_FEATURES.forEach((feature) => {
      if (accumulated[feature] === 1.0 && this.isSymptomRefuted(currentMessage, feature)) {
        accumulated[feature] = 0.0;
        console.log(`ContextEngine: Symptom '${feature}' refuted and cleared in current turn.`);
      }
    });

    return accumulated;
  }
}
