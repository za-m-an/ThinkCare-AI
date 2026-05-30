// ─────────────────────────────────────────────────
// ThinkCare AI — Bilingual Translation Dictionary
// Languages: English (en) + Bangla (bn)
// ─────────────────────────────────────────────────

export type Language = "en" | "bn";

type TranslationValue = { en: string; bn: string };
type TranslationSection = Record<string, TranslationValue>;
type TranslationMap = Record<string, TranslationSection>;

export const translations: TranslationMap = {
  // ═══════════════════════════════════════════════
  // COMMON / SHARED
  // ═══════════════════════════════════════════════
  common: {
    appName: { en: "ThinkCare AI", bn: "ThinkCare AI" },
    taglineUser: { en: "Medical Companion", bn: "চিকিৎসা সহচর" },
    taglineAdmin: { en: "System Administration", bn: "সিস্টেম প্রশাসন" },
    logout: { en: "Logout", bn: "লগআউট" },
    save: { en: "Save", bn: "সংরক্ষণ" },
    saveChanges: { en: "Save Changes", bn: "পরিবর্তন সংরক্ষণ" },
    loading: { en: "Loading...", bn: "লোড হচ্ছে..." },
    cancel: { en: "Cancel", bn: "বাতিল" },
    confirm: { en: "Confirm", bn: "নিশ্চিত করুন" },
    yes: { en: "Yes", bn: "হ্যাঁ" },
    no: { en: "No", bn: "না" },
    or: { en: "OR", bn: "অথবা" },
    edit: { en: "Edit", bn: "সম্পাদনা" },
    delete: { en: "Delete", bn: "মুছুন" },
    close: { en: "Close", bn: "বন্ধ করুন" },
    back: { en: "Back", bn: "পিছনে" },
    next: { en: "Next", bn: "পরবর্তী" },
    submit: { en: "Submit", bn: "জমা দিন" },
    update: { en: "Update", bn: "আপডেট" },
    search: { en: "Search", bn: "অনুসন্ধান" },
    notifications: { en: "Notifications", bn: "বিজ্ঞপ্তি" },
    noNotifications: { en: "No new notifications.", bn: "কোনো নতুন বিজ্ঞপ্তি নেই।" },
    markAllRead: { en: "Mark all read", bn: "সব পঠিত চিহ্নিত করুন" },
    markRead: { en: "Mark read", bn: "পঠিত" },
    disclaimer: {
      en: "ThinkCare AI provides insights based on available data and is not a substitute for professional medical advice, diagnosis, or treatment.",
      bn: "ThinkCare AI উপলব্ধ তথ্যের উপর ভিত্তি করে অন্তর্দৃষ্টি প্রদান করে এবং এটি পেশাদার চিকিৎসা পরামর্শ, রোগ নির্ণয়, বা চিকিৎসার বিকল্প নয়।"
    },
    disclaimerShort: {
      en: "ThinkCare AI insights are generated dynamically from available data. Consult professional care providers for medical actions.",
      bn: "ThinkCare AI অন্তর্দৃষ্টি উপলব্ধ তথ্য থেকে গতিশীলভাবে তৈরি। চিকিৎসা পদক্ষেপের জন্য পেশাদার স্বাস্থ্যসেবা প্রদানকারীদের সাথে পরামর্শ করুন।"
    },
    secureEnvironment: { en: "Secure, HIPAA-compliant environment.", bn: "নিরাপদ, HIPAA-সম্মত পরিবেশ।" },
    termsAgreement: {
      en: "By continuing, you agree to our terms of service and privacy policy.",
      bn: "চালিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের সেবার শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন।"
    },
  },

  // ═══════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════
  nav: {
    dashboard: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
    assistant: { en: "Assistant", bn: "সহকারী" },
    profile: { en: "Profile", bn: "প্রোফাইল" },
    profileReports: { en: "Profile / Reports", bn: "প্রোফাইল / রিপোর্ট" },
    settings: { en: "Settings", bn: "সেটিংস" },
    admin: { en: "Admin", bn: "অ্যাডমিন" },
    adminPanel: { en: "Admin Panel", bn: "অ্যাডমিন প্যানেল" },
    monitorUsers: { en: "Monitor Users", bn: "ব্যবহারকারী পর্যবেক্ষণ" },
    newAssessment: { en: "New Assessment", bn: "নতুন মূল্যায়ন" },
  },

  // ═══════════════════════════════════════════════
  // LOGIN PAGE
  // ═══════════════════════════════════════════════
  login: {
    title: { en: "ThinkCare AI", bn: "ThinkCare AI" },
    subtitle: {
      en: "Sign in to securely access your medical companion dashboard.",
      bn: "আপনার চিকিৎসা সহচর ড্যাশবোর্ডে নিরাপদে প্রবেশ করুন।"
    },
    emailLabel: { en: "Email or Phone", bn: "ইমেইল বা ফোন" },
    emailPlaceholder: { en: "Enter your credentials", bn: "আপনার তথ্য লিখুন" },
    passwordLabel: { en: "Password", bn: "পাসওয়ার্ড" },
    forgotPassword: { en: "Forgot Password?", bn: "পাসওয়ার্ড ভুলে গেছেন?" },
    signIn: { en: "Sign In →", bn: "সাইন ইন →" },
    signInWithGoogle: { en: "Sign in with Google", bn: "Google দিয়ে সাইন ইন" },
    noAccount: { en: "Don't have an account?", bn: "অ্যাকাউন্ট নেই?" },
    register: { en: "Register", bn: "নিবন্ধন করুন" },
  },

  // ═══════════════════════════════════════════════
  // REGISTER PAGE
  // ═══════════════════════════════════════════════
  register: {
    title: { en: "ThinkCare AI", bn: "ThinkCare AI" },
    subtitle: { en: "Create your account to start your journey.", bn: "আপনার যাত্রা শুরু করতে অ্যাকাউন্ট তৈরি করুন।" },
    fullNameLabel: { en: "Full Name", bn: "পূর্ণ নাম" },
    fullNamePlaceholder: { en: "John Doe", bn: "আপনার নাম" },
    emailLabel: { en: "Email or Phone Number", bn: "ইমেইল বা ফোন নম্বর" },
    emailPlaceholder: { en: "name@example.com", bn: "name@example.com" },
    passwordLabel: { en: "Password", bn: "পাসওয়ার্ড" },
    signUp: { en: "Sign Up →", bn: "সাইন আপ →" },
    signUpWithGoogle: { en: "Sign up with Google", bn: "Google দিয়ে সাইন আপ" },
    hasAccount: { en: "Already have an account?", bn: "ইতিমধ্যে অ্যাকাউন্ট আছে?" },
    logIn: { en: "Log In", bn: "লগ ইন" },
    successTitle: { en: "Registration Successful!", bn: "নিবন্ধন সফল!" },
    successMessage: { en: "Redirecting you to the login page...", bn: "লগইন পৃষ্ঠায় নিয়ে যাওয়া হচ্ছে..." },
    minChars: { en: "8+ chars", bn: "৮+ অক্ষর" },
    oneNumber: { en: "1 number", bn: "১ সংখ্যা" },
    oneSpecial: { en: "1 special", bn: "১ বিশেষ অক্ষর" },
  },

  // ═══════════════════════════════════════════════
  // CHAT PAGE
  // ═══════════════════════════════════════════════
  chat: {
    headerTitle: { en: "Medical Assistant", bn: "চিকিৎসা সহকারী" },
    headerTitleMobile: { en: "ThinkCare Assistant", bn: "ThinkCare সহকারী" },
    headerSubtitle: { en: "Clinical symptom parsing and prediction agent.", bn: "ক্লিনিক্যাল লক্ষণ বিশ্লেষণ এবং পূর্বাভাস এজেন্ট।" },
    welcomeMessage: {
      en: "Hello! I am your ThinkCare AI companion. Describe your symptoms or how you are feeling, and our proprietary clinical model will run a real-time risk prediction assessment.",
      bn: "হ্যালো! আমি আপনার ThinkCare AI সহচর। আপনার উপসর্গ বা আপনি কেমন অনুভব করছেন তা বর্ণনা করুন, এবং আমাদের ক্লিনিক্যাল মডেল একটি রিয়েল-টাইম ঝুঁকি পূর্বাভাস মূল্যায়ন চালাবে।"
    },
    welcomeMessageMobile: {
      en: "Hello! Describe your symptoms, and our clinical model will run a real-time risk prediction assessment.",
      bn: "হ্যালো! আপনার উপসর্গ বর্ণনা করুন, এবং আমাদের ক্লিনিক্যাল মডেল একটি রিয়েল-টাইম ঝুঁকি পূর্বাভাস মূল্যায়ন চালাবে।"
    },
    inputPlaceholder: {
      en: "Describe your symptoms or ask a medical question...",
      bn: "আপনার উপসর্গ বর্ণনা করুন বা একটি চিকিৎসা প্রশ্ন জিজ্ঞাসা করুন..."
    },
    inputPlaceholderMobile: {
      en: "Type symptoms (e.g. fever, chills)...",
      bn: "উপসর্গ লিখুন (যেমন জ্বর, কাঁপুনি)..."
    },
    trySample: { en: "Try a sample query", bn: "একটি নমুনা প্রশ্ন চেষ্টা করুন" },
    trySampleMobile: { en: "Try a sample", bn: "নমুনা চেষ্টা করুন" },
    analyzing: { en: "Clinical engine analyzing symptoms...", bn: "ক্লিনিক্যাল ইঞ্জিন উপসর্গ বিশ্লেষণ করছে..." },
    analyzingMobile: { en: "Parsing symptoms...", bn: "উপসর্গ বিশ্লেষণ হচ্ছে..." },
    recentSessions: { en: "Recent Sessions", bn: "সাম্প্রতিক সেশন" },
    selectSession: { en: "Select Session", bn: "সেশন নির্বাচন করুন" },
    startNewAssessment: { en: "+ Start New Assessment", bn: "+ নতুন মূল্যায়ন শুরু করুন" },
    noSessions: { en: "No past sessions yet. Use the chat to start your first assessment.", bn: "এখনো কোনো পূর্ববর্তী সেশন নেই। আপনার প্রথম মূল্যায়ন শুরু করতে চ্যাট ব্যবহার করুন।" },
    noSessionsMobile: { en: "No past sessions found.", bn: "কোনো পূর্ববর্তী সেশন পাওয়া যায়নি।" },
    liveDiagnosis: { en: "Live Diagnosis Log", bn: "লাইভ ডায়াগনসিস লগ" },
    proprietaryClassifier: { en: "Proprietary AI Classifier", bn: "মালিকানাধীন AI শ্রেণিবিভাজক" },
    clinicalPredictions: { en: "Clinical Predictions", bn: "ক্লিনিক্যাল পূর্বাভাস" },
    topPredictedDisease: { en: "Top Predicted Disease", bn: "শীর্ষ পূর্বাভাসিত রোগ" },
    topCondition: { en: "Top Condition", bn: "শীর্ষ অবস্থা" },
    likelihood: { en: "% Likelihood", bn: "% সম্ভাবনা" },
    statusLogged: { en: "Status: Logged", bn: "অবস্থা: লগ করা হয়েছে" },
    recommendedPrecautions: { en: "Recommended Precautions", bn: "সুপারিশকৃত সতর্কতা" },
    precautions: { en: "Precautions", bn: "সতর্কতা" },
    outlookAftermath: { en: "Outlook & Aftermath", bn: "সম্ভাবনা ও পরিণতি" },
    outlook: { en: "Outlook", bn: "সম্ভাবনা" },
    alternativeMatches: { en: "Alternative Matches", bn: "বিকল্প মিল" },
    noAssessmentActive: { en: "No Assessment Active", bn: "কোনো মূল্যায়ন সক্রিয় নেই" },
    noAssessmentDesc: {
      en: "Describe symptoms in the chat thread. The AI agent will parse features and log predictions here.",
      bn: "চ্যাট থ্রেডে উপসর্গ বর্ণনা করুন। AI এজেন্ট বৈশিষ্ট্য বিশ্লেষণ করবে এবং এখানে পূর্বাভাস লগ করবে।"
    },
    noAssessmentDescMobile: {
      en: "Describe symptoms in chat, and prediction metrics will display here.",
      bn: "চ্যাটে উপসর্গ বর্ণনা করুন, এবং পূর্বাভাস মেট্রিক্স এখানে প্রদর্শিত হবে।"
    },
    predictionDisclaimer: {
      en: "Predictions are calculated for research evaluation and have not been vetted by physician reviews.",
      bn: "পূর্বাভাসগুলি গবেষণা মূল্যায়নের জন্য গণনা করা হয়েছে এবং চিকিৎসক পর্যালোচনা দ্বারা যাচাই করা হয়নি।"
    },
    predictionDisclaimerMobile: {
      en: "Research prediction output. Vetted physician checks recommended.",
      bn: "গবেষণা পূর্বাভাস আউটপুট। চিকিৎসক যাচাই সুপারিশ করা হয়।"
    },
    offlineMessage: {
      en: "I have analyzed your symptoms, but our clinical engine is currently offline. Please try again shortly or contact your care provider.",
      bn: "আমি আপনার উপসর্গগুলি বিশ্লেষণ করেছি, কিন্তু আমাদের ক্লিনিক্যাল ইঞ্জিন বর্তমানে অফলাইনে রয়েছে। অনুগ্রহ করে শীঘ্রই আবার চেষ্টা করুন বা আপনার স্বাস্থ্যসেবা প্রদানকারীর সাথে যোগাযোগ করুন।"
    },
    // Suggestion chips
    chip1: { en: "I have a high fever with chills and muscle pain", bn: "আমার উচ্চ জ্বর, কাঁপুনি এবং পেশী ব্যথা আছে" },
    chip2: { en: "I feel nauseous and have been vomiting with watery diarrhea", bn: "আমার বমি বমি ভাব এবং পাতলা পায়খানা হচ্ছে" },
    chip3: { en: "My eyes look yellow and I have dark urine", bn: "আমার চোখ হলুদ দেখাচ্ছে এবং গাঢ় প্রস্রাব হচ্ছে" },
    chip4: { en: "I have a chronic cough with blood in sputum", bn: "আমার দীর্ঘস্থায়ী কাশি এবং কফের সাথে রক্ত আসছে" },
  },

  // ═══════════════════════════════════════════════
  // DASHBOARD PAGE
  // ═══════════════════════════════════════════════
  dashboard: {
    companionDashboard: { en: "Companion Dashboard", bn: "সহচর ড্যাশবোর্ড" },
    hi: { en: "Hi,", bn: "হাই," },
    goodMorning: { en: "Good morning", bn: "সুপ্রভাত" },
    goodAfternoon: { en: "Good afternoon", bn: "শুভ অপরাহ্ন" },
    goodEvening: { en: "Good evening", bn: "শুভ সন্ধ্যা" },
    dailySummary: { en: "Here is your daily health summary for", bn: "আজকের স্বাস্থ্য সারসংক্ষেপ:" },
    overallHealthScore: { en: "Overall Health Score", bn: "সামগ্রিক স্বাস্থ্য স্কোর" },
    statusOptimal: { en: "STATUS: OPTIMAL", bn: "অবস্থা: সর্বোত্তম" },
    pointsSinceLastWeek: { en: "+3 pts since last week", bn: "+৩ পয়েন্ট গত সপ্তাহ থেকে" },
    aiHealthInsight: { en: "AI Health Insight", bn: "AI স্বাস্থ্য অন্তর্দৃষ্টি" },
    aiInsight: { en: "AI insight", bn: "AI অন্তর্দৃষ্টি" },
    highConfidence: { en: "High Confidence", bn: "উচ্চ আত্মবিশ্বাস" },
    generatedFrom: { en: "Generated dynamically from clinical records", bn: "ক্লিনিক্যাল রেকর্ড থেকে গতিশীলভাবে তৈরি" },
    discussInsight: { en: "Discuss Insight", bn: "অন্তর্দৃষ্টি আলোচনা" },
    restingHeartRate: { en: "Resting Heart Rate", bn: "বিশ্রামকালীন হৃদস্পন্দন" },
    pulse: { en: "Pulse", bn: "পালস" },
    bloodPressure: { en: "Blood Pressure", bn: "রক্তচাপ" },
    bp: { en: "BP", bn: "রক্তচাপ" },
    bloodOxygen: { en: "Blood Oxygen", bn: "রক্তের অক্সিজেন" },
    activityTrend: { en: "Activity Trend", bn: "কার্যকলাপ প্রবণতা" },
    activity: { en: "Activity", bn: "কার্যকলাপ" },
    stepsProgress: { en: "Steps Progress", bn: "পদক্ষেপ অগ্রগতি" },
    week: { en: "Week", bn: "সপ্তাহ" },
    month: { en: "Month", bn: "মাস" },
    weeklyStepsSummary: { en: "Weekly steps activity summary.", bn: "সাপ্তাহিক পদক্ষেপ কার্যকলাপ সারসংক্ষেপ।" },
    monthlyStepsSummary: { en: "Monthly steps activity summary.", bn: "মাসিক পদক্ষেপ কার্যকলাপ সারসংক্ষেপ।" },
    myHealthDashboard: { en: "My Health Dashboard", bn: "আমার স্বাস্থ্য ড্যাশবোর্ড" },
    profileReports: { en: "Profile / Reports", bn: "প্রোফাইল / রিপোর্ট" },
    logOut: { en: "Log Out", bn: "লগ আউট" },
  },

  // ═══════════════════════════════════════════════
  // SETTINGS PAGE
  // ═══════════════════════════════════════════════
  settings: {
    pageTitle: { en: "Account Settings", bn: "অ্যাকাউন্ট সেটিংস" },
    pageSubtitle: {
      en: "Manage your professional profile, medical data context, and security preferences.",
      bn: "আপনার পেশাদার প্রোফাইল, চিকিৎসা ডেটা প্রসঙ্গ, এবং নিরাপত্তা পছন্দ পরিচালনা করুন।"
    },
    // Sub tabs
    profileSettings: { en: "Profile Settings", bn: "প্রোফাইল সেটিংস" },
    medicalContext: { en: "Medical Context", bn: "চিকিৎসা প্রসঙ্গ" },
    defaultMedicalContext: { en: "Default Medical Context", bn: "ডিফল্ট চিকিৎসা প্রসঙ্গ" },
    securityAccess: { en: "Security & Access", bn: "নিরাপত্তা ও অ্যাক্সেস" },
    securityPassword: { en: "Security & Password", bn: "নিরাপত্তা ও পাসওয়ার্ড" },
    notificationsTab: { en: "Notifications", bn: "বিজ্ঞপ্তি" },
    languageTab: { en: "Language / ভাষা", bn: "ভাষা / Language" },
    // Profile
    fullName: { en: "Full Name", bn: "পূর্ণ নাম" },
    emailAddress: { en: "Email Address", bn: "ইমেইল ঠিকানা" },
    email: { en: "Email", bn: "ইমেইল" },
    specialtyRole: { en: "Specialty / Role", bn: "বিশেষত্ব / ভূমিকা" },
    changesSaved: { en: "Changes saved successfully!", bn: "পরিবর্তন সফলভাবে সংরক্ষিত!" },
    saved: { en: "Saved!", bn: "সংরক্ষিত!" },
    // Medical
    medicalContextDesc: {
      en: "Set default parameters to contextualize AI responses for your standard patient profiles.",
      bn: "আপনার মানক রোগীর প্রোফাইলের জন্য AI প্রতিক্রিয়া প্রাসঙ্গিক করতে ডিফল্ট পরামিতি সেট করুন।"
    },
    medicalContextDescMobile: {
      en: "Set standard indicators to contextualize clinical predictions.",
      bn: "ক্লিনিক্যাল পূর্বাভাস প্রাসঙ্গিক করতে মানক সূচক সেট করুন।"
    },
    defaultBloodType: { en: "Default Blood Type Context", bn: "ডিফল্ট রক্তের গ্রুপ" },
    defaultBloodTypeMobile: { en: "Default Blood Type", bn: "ডিফল্ট রক্তের গ্রুপ" },
    allergiesWatchlist: { en: "Standard Allergies Watchlist", bn: "মানক অ্যালার্জি তালিকা" },
    allergiesWatchlistMobile: { en: "Allergies Watchlist", bn: "অ্যালার্জি তালিকা" },
    allergiesPlaceholder: { en: "e.g. Penicillin, Latex", bn: "যেমন পেনিসিলিন, ল্যাটেক্স" },
    medicalNote: {
      en: "This data is used solely to pre-prompt the AI for relevant interactions. It does not replace strict patient charting.",
      bn: "এই ডেটা শুধুমাত্র প্রাসঙ্গিক মিথস্ক্রিয়ার জন্য AI-কে প্রাক-প্রম্পট করতে ব্যবহৃত হয়। এটি কঠোর রোগী চার্টিং প্রতিস্থাপন করে না।"
    },
    saveMedicalContext: { en: "Save Medical Context", bn: "চিকিৎসা প্রসঙ্গ সংরক্ষণ" },
    medicalContextUpdated: { en: "Medical context updated!", bn: "চিকিৎসা প্রসঙ্গ আপডেট হয়েছে!" },
    // Security
    twoFactorTitle: { en: "Two-Factor Authentication (2FA)", bn: "দুই-ধাপ প্রমাণীকরণ (2FA)" },
    twoFactorDesc: { en: "Add an extra layer of security to your account.", bn: "আপনার অ্যাকাউন্টে অতিরিক্ত নিরাপত্তা স্তর যোগ করুন।" },
    twoFactorToggle: { en: "2FA Toggle", bn: "2FA টগল" },
    twoFactorToggleDesc: { en: "Additional login check.", bn: "অতিরিক্ত লগইন যাচাই।" },
    changePassword: { en: "Change Password", bn: "পাসওয়ার্ড পরিবর্তন" },
    currentPassword: { en: "Current Password", bn: "বর্তমান পাসওয়ার্ড" },
    newPassword: { en: "New Password", bn: "নতুন পাসওয়ার্ড" },
    updatePassword: { en: "Update Password", bn: "পাসওয়ার্ড আপডেট" },
    passwordChanged: { en: "Password changed successfully!", bn: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!" },
    passwordUpdated: { en: "Updated!", bn: "আপডেট হয়েছে!" },
    passwordMinLength: { en: "New password must be at least 8 characters long.", bn: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।" },
    // Notifications
    notificationPreferences: { en: "Notification Preferences", bn: "বিজ্ঞপ্তি পছন্দসমূহ" },
    emailAlerts: { en: "Email Alerts", bn: "ইমেইল সতর্কতা" },
    emailAlertsDesc: {
      en: "Receive diagnostic notifications and report alerts via email.",
      bn: "ইমেইলের মাধ্যমে ডায়াগনস্টিক বিজ্ঞপ্তি এবং রিপোর্ট সতর্কতা পান।"
    },
    emailAlertsDescMobile: { en: "Diagnostic updates.", bn: "ডায়াগনস্টিক আপডেট।" },
    criticalTriggers: { en: "Critical Medical Triggers", bn: "জটিল চিকিৎসা ট্রিগার" },
    criticalTriggersDesc: {
      en: "Instant notification on critical assessment confidence ranges.",
      bn: "জটিল মূল্যায়ন আত্মবিশ্বাস পরিসরে তাৎক্ষণিক বিজ্ঞপ্তি।"
    },
    criticalTriggersMobile: { en: "Critical Triggers", bn: "জটিল ট্রিগার" },
    criticalTriggersDescMobile: { en: "High risk predictions.", bn: "উচ্চ ঝুঁকি পূর্বাভাস।" },
    systemLogs: { en: "System Logs", bn: "সিস্টেম লগ" },
    systemLogsDesc: {
      en: "Weekly analysis summaries and system health updates.",
      bn: "সাপ্তাহিক বিশ্লেষণ সারসংক্ষেপ এবং সিস্টেম স্বাস্থ্য আপডেট।"
    },
    systemLogsDescMobile: { en: "Weekly dashboard insights.", bn: "সাপ্তাহিক ড্যাশবোর্ড অন্তর্দৃষ্টি।" },
    // Language
    languageTitle: { en: "Interface Language", bn: "ইন্টারফেস ভাষা" },
    languageDesc: {
      en: "Choose your preferred language for the ThinkCare AI interface. The AI assistant will also respond in your selected language.",
      bn: "ThinkCare AI ইন্টারফেসের জন্য আপনার পছন্দের ভাষা বেছে নিন। AI সহকারীও আপনার নির্বাচিত ভাষায় প্রতিক্রিয়া জানাবে।"
    },
    english: { en: "English", bn: "English" },
    bangla: { en: "বাংলা (Bangla)", bn: "বাংলা (Bangla)" },
    englishDesc: { en: "Use English for the entire interface", bn: "সমগ্র ইন্টারফেসের জন্য ইংরেজি ব্যবহার করুন" },
    banglaDesc: { en: "Use Bangla for the entire interface", bn: "সমগ্র ইন্টারফেসের জন্য বাংলা ব্যবহার করুন" },
    currentLanguage: { en: "Current", bn: "বর্তমান" },
  },

  // ═══════════════════════════════════════════════
  // PROFILE PAGE
  // ═══════════════════════════════════════════════
  profile: {
    pageTitle: { en: "Medical Profile & Reports", bn: "চিকিৎসা প্রোফাইল ও রিপোর্ট" },
    pageSubtitle: {
      en: "Clinical overview and report generation.",
      bn: "ক্লিনিক্যাল ওভারভিউ এবং রিপোর্ট তৈরি।"
    },
    patientId: { en: "Patient ID", bn: "রোগী আইডি" },
    basicBiometrics: { en: "Basic Biometrics", bn: "মৌলিক বায়োমেট্রিক্স" },
    age: { en: "Age", bn: "বয়স" },
    sex: { en: "Sex", bn: "লিঙ্গ" },
    height: { en: "Height", bn: "উচ্চতা" },
    weight: { en: "Weight", bn: "ওজন" },
    bmi: { en: "BMI", bn: "বিএমআই" },
    bloodType: { en: "Blood Type", bn: "রক্তের গ্রুপ" },
    vitalSigns: { en: "Vital Signs", bn: "প্রাণশক্তি চিহ্ন" },
    heartRate: { en: "Heart Rate", bn: "হৃদস্পন্দন" },
    spO2: { en: "SpO₂", bn: "SpO₂" },
    lifestyleMetrics: { en: "Lifestyle Metrics", bn: "জীবনধারা পরিমাপ" },
    sleepAvg: { en: "Sleep (Avg)", bn: "ঘুম (গড়)" },
    dailySteps: { en: "Daily Steps", bn: "দৈনিক পদক্ষেপ" },
    stressLevel: { en: "Stress Level", bn: "মানসিক চাপ" },
    medicalHistory: { en: "Medical History", bn: "চিকিৎসা ইতিহাস" },
    conditions: { en: "Conditions", bn: "অবস্থা" },
    medications: { en: "Medications", bn: "ওষুধ" },
    allergies: { en: "Allergies", bn: "অ্যালার্জি" },
    generateReport: { en: "Generate Report", bn: "রিপোর্ট তৈরি করুন" },
    downloadReport: { en: "Download Health Report", bn: "স্বাস্থ্য রিপোর্ট ডাউনলোড করুন" },
    none: { en: "None", bn: "কোনোটি নেই" },
    notSpecified: { en: "Not Specified", bn: "নির্দিষ্ট করা হয়নি" },
  },

  // ═══════════════════════════════════════════════
  // ONBOARDING PAGE
  // ═══════════════════════════════════════════════
  onboarding: {
    pageTitle: { en: "Welcome to ThinkCare AI", bn: "ThinkCare AI-তে স্বাগতম" },
    pageSubtitle: {
      en: "Let's set up your clinical profile so our AI can provide personalized health insights.",
      bn: "আসুন আপনার ক্লিনিক্যাল প্রোফাইল সেট আপ করি যাতে আমাদের AI ব্যক্তিগতকৃত স্বাস্থ্য অন্তর্দৃষ্টি প্রদান করতে পারে।"
    },
    step: { en: "Step", bn: "ধাপ" },
    of: { en: "of", bn: "এর মধ্যে" },
    completeProfile: { en: "Complete Profile", bn: "প্রোফাইল সম্পূর্ণ করুন" },
    personalInfo: { en: "Personal Information", bn: "ব্যক্তিগত তথ্য" },
    bodyMetrics: { en: "Body Metrics", bn: "শারীরিক পরিমাপ" },
    vitalSigns: { en: "Vital Signs", bn: "প্রাণশক্তি চিহ্ন" },
    lifestyle: { en: "Lifestyle & Habits", bn: "জীবনধারা ও অভ্যাস" },
    medicalHistory: { en: "Medical History", bn: "চিকিৎসা ইতিহাস" },
    firstName: { en: "First Name", bn: "প্রথম নাম" },
    lastName: { en: "Last Name", bn: "শেষ নাম" },
    dateOfBirth: { en: "Date of Birth", bn: "জন্ম তারিখ" },
    sexAtBirth: { en: "Sex at Birth", bn: "জন্মের সময় লিঙ্গ" },
  },

  // ═══════════════════════════════════════════════
  // ADMIN DASHBOARD
  // ═══════════════════════════════════════════════
  admin: {
    pageTitle: { en: "System Administration", bn: "সিস্টেম প্রশাসন" },
    systemOverview: { en: "System Overview", bn: "সিস্টেম ওভারভিউ" },
    totalUsers: { en: "Total Users", bn: "মোট ব্যবহারকারী" },
    totalAssessments: { en: "Total Assessments", bn: "মোট মূল্যায়ন" },
    avgConfidence: { en: "Avg Confidence", bn: "গড় আত্মবিশ্বাস" },
    avgLatency: { en: "Avg Latency", bn: "গড় বিলম্ব" },
    systemConfig: { en: "System Configuration", bn: "সিস্টেম কনফিগারেশন" },
    assessmentLogs: { en: "Assessment Logs", bn: "মূল্যায়ন লগ" },
  },
};
