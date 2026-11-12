import type { ExamQuestionItem } from "@/lib/engines/exam-engine";
import type { PyqRecord } from "@/lib/engines/pyq-analytics";
import type { FsrsCard } from "@/lib/engines/fsrs";

export interface CurriculumTopic {
  id: string;
  title: string;
  sanskritTerm?: string;
  difficulty: "easy" | "medium" | "hard";
  highYieldScore: number;
  subtopics: string[];
  learningObjectives: string[];
}

export interface CurriculumSubject {
  code: string;
  name: string;
  englishTitle: string;
  professionalCode: "PROF_1" | "PROF_2" | "PROF_3" | "PROF_4";
  paperCount: number;
  maxMarks: number;
  ncismSourceUrl: string;
  referenceTextbooks: string[];
  topics: CurriculumTopic[];
}

export interface SmartNoteBundle {
  topicId: string;
  subjectCode: string;
  title: string;
  sanskritTerm: string;
  sourceCitation: string;
  verificationStatus: "verified" | "demonstration" | "ai_generated";
  masterNote: {
    definition: string;
    introduction: string;
    classification: string[];
    detailedExplanation: string;
    clinicalSignificance: string;
    examPoints: string[];
    references: string[];
  };
  easyNote: {
    hinglishSummary: string;
    everydayAnalogy: string;
    stepByStep: string[];
    comparisonTable: { parameter: string; ayurveda: string; modern: string }[];
  };
  quickGoNote: {
    keyDefinitions: string[];
    oneLiners: string[];
    memoryTricks: string[];
    commonMistakes: string[];
  };
}

export interface MindMapNodeData {
  id: string;
  label: string;
  sanskritTerm?: string;
  description: string;
  color: string;
  children?: MindMapNodeData[];
}

export interface GlossaryItem {
  id: string;
  sanskritTerm: string;
  devanagari: string;
  transliteration: string;
  englishMeaning: string;
  hindiMeaning: string;
  subjectCode: string;
  contextualExplanation: string;
  relatedTerms: string[];
  referenceSource: string;
}

export interface PracticalModule {
  id: string;
  subjectCode: string;
  subjectName: string;
  professionalCode: string;
  title: string;
  category: "Instrument" | "Specimen / Spotter" | "Procedure" | "OSPE Station" | "Viva Bank";
  description: string;
  keyIdentificationPoints: string[];
  vivaQuestions: { q: string; a: string }[];
  safetyDisclaimer: string;
}

export const CURRICULUM_VERSIONS = [
  {
    code: "NCISM_MSE_2022",
    name: "NCISM Competency-Based (2021-22 Onwards • 3 Professionals)",
    sourceUrl: "https://ncismindia.org/ayurveda-syllabus.php",
    professionals: [
      { code: "PROF_1", name: "First Professional BAMS (18 Months)" },
      { code: "PROF_2", name: "Second Professional BAMS (18 Months)" },
      { code: "PROF_3", name: "Third / Final Professional BAMS (18 Months)" },
      { code: "INTERNSHIP", name: "Compulsory Rotatory Internship (12 Months)" },
    ],
  },
  {
    code: "CCIM_LEGACY_4PROF",
    name: "Legacy 4-Professional BAMS (Pre-2021-22 Batches)",
    sourceUrl: "https://ncismindia.org/ayurveda-syllabus.php",
    professionals: [
      { code: "PROF_1", name: "First Professional BAMS" },
      { code: "PROF_2", name: "Second Professional BAMS" },
      { code: "PROF_3", name: "Third Professional BAMS" },
      { code: "PROF_4", name: "Final (Fourth) Professional BAMS" },
    ],
  },
] as const;

export const NCISM_SUBJECTS: CurriculumSubject[] = [
  {
    code: "AyUG-PV",
    name: "Padartha Vigyan evam Ayurved Itihas",
    englishTitle: "Ayurvedic Philosophy, Epistemology & History",
    professionalCode: "PROF_1",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/ayurveda-syllabus.php",
    referenceTextbooks: [
      "Charaka Samhita Sutrasthana (Chakrapani Teeka)",
      "Padartha Vigyan by Vd. Ramraksha Pathak",
    ],
    topics: [
      {
        id: "top-pv-shatpadartha",
        title: "Shat-Padartha (Six Categories of Reality)",
        sanskritTerm: "षट्पदार्थ",
        difficulty: "medium",
        highYieldScore: 94,
        subtopics: ["Samanya", "Vishesha", "Guna", "Dravya", "Karma", "Samavaya"],
        learningObjectives: [
          "Explain Samanya-Vishesha Siddhanta in clinical therapeutics",
          "Classify 41 Gunas (Gurvadi, Paradi, Adhyatma)",
        ],
      },
      {
        id: "top-pv-pramana",
        title: "Pramana Vigyan (Means of Valid Knowledge)",
        sanskritTerm: "प्रमाण विज्ञान",
        difficulty: "hard",
        highYieldScore: 91,
        subtopics: ["Aptopadesha", "Pratyaksha", "Anumana", "Yukti"],
        learningObjectives: [
          "Apply Trividha & Chaturvidha Pariksha in Rogi Pariksha",
          "Distinguish Yukti Pramana as unique Ayurvedic epistemology",
        ],
      },
    ],
  },
  {
    code: "AyUG-SN & AI",
    name: "Samskritam evam Ayurved Itihas",
    englishTitle: "Sanskrit Grammar & History of Ayurveda",
    professionalCode: "PROF_1",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/AyUG-SN%20AI.pdf",
    referenceTextbooks: ["Laghu Siddhanta Kaumudi", "Ayurved Ka Brihat Itihas"],
    topics: [
      {
        id: "top-sn-sandhi-samasa",
        title: "Sandhi, Samasa & Vibhakti in Samhita Reading",
        sanskritTerm: "सन्धि-समास",
        difficulty: "medium",
        highYieldScore: 86,
        subtopics: ["Ach Sandhi", "Hal Sandhi", "Tatpurusha & Bahuvrihi Samasa"],
        learningObjectives: ["Split compound Sanskrit medical terms accurately"],
      },
    ],
  },
  {
    code: "AyUG-KS",
    name: "Kriya Sharir",
    englishTitle: "Ayurvedic & Modern Human Physiology",
    professionalCode: "PROF_1",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/ayurveda-syllabus.php",
    referenceTextbooks: [
      "Kriya Sharir by Prof. Yogesh Chandra Mishra",
      "Guyton & Hall Textbook of Medical Physiology",
    ],
    topics: [
      {
        id: "top-ks-tridosha",
        title: "Tridosha Siddhanta (Vata, Pitta, Kapha)",
        sanskritTerm: "त्रिदोष सिद्धान्त",
        difficulty: "medium",
        highYieldScore: 98,
        subtopics: ["5 Types of Vata", "5 Types of Pitta", "5 Types of Kapha", "Prakriti"],
        learningObjectives: [
          "Correlate Vata-Pitta-Kapha subtypes with neuro-endocrine-metabolic physiology",
          "Assess Deha Prakriti systematically",
        ],
      },
      {
        id: "top-ks-agni-dhatu",
        title: "Agni, Ahara Paka & Sapta Dhatu Poshana",
        sanskritTerm: "अग्नि एवं सप्तधातु",
        difficulty: "hard",
        highYieldScore: 95,
        subtopics: ["Jatharagni", "Avasthapaka", "Kshira-Dadhi Nyaya", "Ojas"],
        learningObjectives: [
          "Compare Ksheera-Dadhi, Kedari-Kulya, and Khale-Kapota Nyaya",
        ],
      },
    ],
  },
  {
    code: "AyUG-RS",
    name: "Rachana Sharir",
    englishTitle: "Ayurvedic & Modern Human Anatomy",
    professionalCode: "PROF_1",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/AyUG%20RS-1.pdf",
    referenceTextbooks: [
      "Sushruta Samhita Sharirasthana",
      "BD Chaurasia Human Anatomy",
    ],
    topics: [
      {
        id: "top-rs-marma",
        title: "Marma Sharir (107 Vital Anatomical Points)",
        sanskritTerm: "मर्म शारीर",
        difficulty: "hard",
        highYieldScore: 97,
        subtopics: ["Shadanga Classification", "Parinama Classification (Sadyapranahara etc.)"],
        learningObjectives: ["Locate Trimarma and identify trauma prognosis"],
      },
      {
        id: "top-rs-srotas",
        title: "Srotas & Kala Sharir",
        sanskritTerm: "स्रोतस् एवं कला",
        difficulty: "medium",
        highYieldScore: 89,
        subtopics: ["7 Kalas", "13 Antarmukha Srotas", "Srotomula"],
        learningObjectives: ["Enumerate Srotomula per Charaka Samhita Vimanasthana"],
      },
    ],
  },
  {
    code: "AyUG-SA1",
    name: "Samhita Adhyayan-1",
    englishTitle: "Ashtanga Hridaya & Charaka Sutrasthana",
    professionalCode: "PROF_1",
    paperCount: 1,
    maxMarks: 100,
    ncismSourceUrl: "https://ncismindia.org/Ay%20UG-SA1.pdf",
    referenceTextbooks: ["Ashtanga Hridaya Sutrasthana (1-15)", "Charaka Sutrasthana (1-12)"],
    topics: [
      {
        id: "top-sa1-dinacharya",
        title: "Ayushkamiya, Dinacharya & Ritucharya",
        sanskritTerm: "दिनचर्या एवं ऋतुचर्या",
        difficulty: "easy",
        highYieldScore: 90,
        subtopics: ["Brahma Muhurta", "Ritu Sandhi", "Adharaniya Vega"],
        learningObjectives: ["Explain seasonal Dosha Sanchaya-Prakopa-Prashama"],
      },
    ],
  },
  {
    code: "AyUG-DG",
    name: "Dravyaguna Vigyan",
    englishTitle: "Ayurvedic Pharmacology & Materia Medica",
    professionalCode: "PROF_2",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/II%20year%20syllabus.php",
    referenceTextbooks: ["Dravyaguna Vigyan by Prof. PV Sharma", "Bhavaprakasha Nighantu"],
    topics: [
      {
        id: "top-dg-rasapanchaka",
        title: "Rasa Panchaka (Pharmacodynamics)",
        sanskritTerm: "रसपञ्चक",
        difficulty: "medium",
        highYieldScore: 96,
        subtopics: ["Shadrasa", "20 Gurvadi Guna", "Virya", "Vipaka", "Prabhava"],
        learningObjectives: ["Analyze exceptions where Prabhava overrides Rasa-Virya-Vipaka"],
      },
    ],
  },
  {
    code: "AyUG-RB",
    name: "Rasashastra evam Bhaishajya Kalpana",
    englishTitle: "Ayurvedic Pharmaceutics & Alchemy",
    professionalCode: "PROF_2",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/NCISM_II%20BAMS_AyUG-RB.pdf",
    referenceTextbooks: ["Rasaratna Samuchchaya", "Sharangadhara Samhita"],
    topics: [
      {
        id: "top-rb-parada",
        title: "Parada Samskara, Shodhana & Marana (Bhasma)",
        sanskritTerm: "पारद संस्कार एवं भस्म परीक्षा",
        difficulty: "hard",
        highYieldScore: 93,
        subtopics: ["Ashtadasha Samskara", "Puta", "Varitara & Rekhapurnatva"],
        learningObjectives: ["List Bhasma Pariksha quality control tests"],
      },
    ],
  },
  {
    code: "AyUG-RN",
    name: "Roga Nidana evam Vikriti Vigyan",
    englishTitle: "Ayurvedic Pathology & Clinical Diagnostics",
    professionalCode: "PROF_2",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/II%20year%20syllabus.php",
    referenceTextbooks: ["Madhava Nidana", "Robbins Basic Pathology"],
    topics: [
      {
        id: "top-rn-shatkriyakala",
        title: "Shatkriyakala & Nidana Panchaka",
        sanskritTerm: "षट्क्रियाकाल एवं निदान पञ्चक",
        difficulty: "medium",
        highYieldScore: 97,
        subtopics: ["Sanchaya to Bheda", "Nidana", "Purvarupa", "Rupa", "Upashaya", "Samprapti"],
        learningObjectives: ["Map disease progression across the 6 Kriyakalas"],
      },
    ],
  },
  {
    code: "AyUG-AT",
    name: "Agada Tantra evam Vidhi Vaidyaka",
    englishTitle: "Ayurvedic Toxicology & Forensic Medicine",
    professionalCode: "PROF_2",
    paperCount: 1,
    maxMarks: 100,
    ncismSourceUrl: "https://ncismindia.org/II%20year%20syllabus.php",
    referenceTextbooks: ["Sushruta Kalpasthana", "Modi's Medical Jurisprudence"],
    topics: [
      {
        id: "top-at-visha",
        title: "Sthavara & Jangama Visha, Dushi Visha & Garavisha",
        sanskritTerm: "विष विज्ञान",
        difficulty: "medium",
        highYieldScore: 88,
        subtopics: ["10 Visha Guna", "Chaturvimshati Upakrama", "Darvikara vs Mandali"],
        learningObjectives: ["Differentiate Visha Vega and emergency management"],
      },
    ],
  },
  {
    code: "AyUG-SW",
    name: "Swasthavritta evam Yoga",
    englishTitle: "Preventive Medicine, Public Health & Yoga",
    professionalCode: "PROF_2",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/NCISM_II%20BAMS_AyUG-SW.pdf",
    referenceTextbooks: ["Swasthavritta Vigyan", "Park's Textbook of Preventive & Social Medicine"],
    topics: [
      {
        id: "top-sw-sadvritta",
        title: "Sadvritta, Janapadodhwamsa & Ashtanga Yoga",
        sanskritTerm: "सद्वृत्त एवं जनपदोध्वंस",
        difficulty: "easy",
        highYieldScore: 87,
        subtopics: ["Epidemiology (Vayu, Jala, Desha, Kala)", "Patanjali Ashtanga Yoga"],
        learningObjectives: ["Compare Janapadodhwamsa with modern epidemic triad"],
      },
    ],
  },
  {
    code: "AyUG-SA2",
    name: "Samhita Adhyayan-2",
    englishTitle: "Charaka Samhita (Purvardha)",
    professionalCode: "PROF_2",
    paperCount: 1,
    maxMarks: 100,
    ncismSourceUrl: "https://ncismindia.org/II%20year%20syllabus.php",
    referenceTextbooks: ["Charaka Samhita Nidana, Vimana, Sharira & Indriya Sthana"],
    topics: [
      {
        id: "top-sa2-dashavidha",
        title: "Dashavidha Atura Pariksha (Vimanasthana 8)",
        sanskritTerm: "दशविध आतुर परीक्षा",
        difficulty: "medium",
        highYieldScore: 92,
        subtopics: ["Prakriti", "Vikriti", "Sara", "Samhanana", "Pramana", "Satmya", "Satva"],
        learningObjectives: ["Apply 10-fold patient examination in clinical case sheets"],
      },
    ],
  },
  {
    code: "AyUG-KC",
    name: "Kayachikitsa",
    englishTitle: "Ayurvedic Internal Medicine",
    professionalCode: "PROF_3",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/1.%20NCISM_IIIBAMS_AyUG-KC.pdf",
    referenceTextbooks: ["Charaka Chikitsasthana", "Harrison's Principles of Internal Medicine"],
    topics: [
      {
        id: "top-kc-jvara",
        title: "Jvara Chikitsa (Nava, Jeerna, Vishama & Sankramika Jvara)",
        sanskritTerm: "ज्वर चिकित्सा",
        difficulty: "hard",
        highYieldScore: 98,
        subtopics: ["Langhana", "Shadanga Paniya", "Vishama Jvara (Santata to Chaturthaka)"],
        learningObjectives: ["Formulate stage-wise Jvara Chikitsa Sutra"],
      },
      {
        id: "top-kc-prameha",
        title: "Prameha & Madhumeha (Diabetes Mellitus Correlation)",
        sanskritTerm: "प्रमेह-मधुमेह",
        difficulty: "medium",
        highYieldScore: 95,
        subtopics: ["20 Types of Prameha", "Avaranajanya vs Dhatukshayajanya Madhumeha"],
        learningObjectives: ["Differentiate Sthula Pramehi vs Krisha Pramehi Chikitsa"],
      },
    ],
  },
  {
    code: "AyUG-PK",
    name: "Panchakarma & Upakarma",
    englishTitle: "Bio-Purification & Allied Procedures",
    professionalCode: "PROF_3",
    paperCount: 1,
    maxMarks: 100,
    ncismSourceUrl: "https://ncismindia.org/2.%20NCISM_IIIBAMS_AyUG-PK.pdf",
    referenceTextbooks: ["Charaka Siddhisthana", "Panchakarma Vigyan by Dr. Pulak Kanti Kar"],
    topics: [
      {
        id: "top-pk-vamana-basti",
        title: "Snehana, Swedana, Vamana, Virechana & Basti Karma",
        sanskritTerm: "पञ्चकर्म",
        difficulty: "medium",
        highYieldScore: 96,
        subtopics: ["Samyak Snigdha Lakshana", "Vega & Maniki Shuddhi", "Niruha vs Anuvasana Basti"],
        learningObjectives: ["Monitor Samyak Yoga, Ayoga, and Atiyoga of Panchakarma"],
      },
    ],
  },
  {
    code: "AyUG-ST",
    name: "Shalya Tantra",
    englishTitle: "Ayurvedic General Surgery",
    professionalCode: "PROF_3",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/3.%20NCISM_IIIBAMS_AyUG-ST.pdf",
    referenceTextbooks: ["Sushruta Samhita Sutrasthana & Chikitsasthana", "Bailey & Love's Short Practice of Surgery"],
    topics: [
      {
        id: "top-st-ksharasutra",
        title: "Ashtavidha Shastra Karma, Vrana & Ksharasutra",
        sanskritTerm: "अष्टविध शस्त्रकर्म एवं क्षारसूत्र",
        difficulty: "medium",
        highYieldScore: 94,
        subtopics: ["Shashti Upakrama", "Arsha & Bhagandara", "Jalaukavacharana"],
        learningObjectives: ["Explain preparation and mechanism of Apamarga Ksharasutra"],
      },
    ],
  },
  {
    code: "AyUG-SL",
    name: "Shalakya Tantra",
    englishTitle: "Ophthalmology, ENT & Oro-Dentistry",
    professionalCode: "PROF_3",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/IIIrd-prof-BAMS.php",
    referenceTextbooks: ["Sushruta Uttaratantra", "Parsons' Diseases of the Eye"],
    topics: [
      {
        id: "top-sl-netra",
        title: "Netra Roga (76 Eye Diseases) & Kriyakalpa",
        sanskritTerm: "नेत्र रोग एवं क्रियाकल्प",
        difficulty: "hard",
        highYieldScore: 91,
        subtopics: ["Tarpana", "Putapaka", "Seka", "Aschyotana", "Anjana", "Timira-Kacha-Linganasha"],
        learningObjectives: ["Classify Netra Roga by Adhishthana and Dosha"],
      },
    ],
  },
  {
    code: "AyUG-PS",
    name: "Prasuti Tantra evam Stri Roga",
    englishTitle: "Obstetrics & Gynecology",
    professionalCode: "PROF_3",
    paperCount: 2,
    maxMarks: 200,
    ncismSourceUrl: "https://ncismindia.org/IIIrd-prof-BAMS.php",
    referenceTextbooks: ["Ayurvediya Prasuti Tantra by Prof. Premvati Tewari", "DC Dutta's Textbook of Obstetrics"],
    topics: [
      {
        id: "top-ps-garbhini",
        title: "Masanumasika Garbhini Paricharya & 20 Yonivyapad",
        sanskritTerm: "गर्भिणी परिचर्या एवं योनिव्यापद्",
        difficulty: "medium",
        highYieldScore: 93,
        subtopics: ["Month-wise antenatal regimen", "Sutika Paricharya", "Asrigdara"],
        learningObjectives: ["Prescribe month-wise Garbhini Paricharya"],
      },
    ],
  },
  {
    code: "AyUG-KB",
    name: "Kaumarabhritya",
    englishTitle: "Ayurvedic Pediatrics",
    professionalCode: "PROF_3",
    paperCount: 1,
    maxMarks: 100,
    ncismSourceUrl: "https://ncismindia.org/IIIrd-prof-BAMS.php",
    referenceTextbooks: ["Kashyapa Samhita", "Ghai Essential Pediatrics"],
    topics: [
      {
        id: "top-kb-navajata",
        title: "Navajata Shishu Paricharya, Samskara & Balagraha",
        sanskritTerm: "नवजात शिशु परिचर्या एवं स्वर्णप्राशन",
        difficulty: "easy",
        highYieldScore: 89,
        subtopics: ["Ulba Parimarjana", "Suvarnaprashana", "Phakka Roga"],
        learningObjectives: ["Compare Navajata Shishu Paricharya with modern neonatal resuscitation"],
      },
    ],
  },
  {
    code: "AyUG-SA3",
    name: "Samhita Adhyayan-3",
    englishTitle: "Charaka Samhita (Uttarardha)",
    professionalCode: "PROF_3",
    paperCount: 1,
    maxMarks: 100,
    ncismSourceUrl: "https://ncismindia.org/7.%20NCISM_IIIBAMS_AyUG-SA3.pdf",
    referenceTextbooks: ["Charaka Samhita Kalpa & Siddhi Sthana"],
    topics: [
      {
        id: "top-sa3-kalpa",
        title: "Madanaphala Kalpa & Basti Vyapad",
        sanskritTerm: "कल्प-सिद्धि स्थान",
        difficulty: "medium",
        highYieldScore: 85,
        subtopics: ["133 Madanaphala Yoga", "12 Basti Dosha"],
        learningObjectives: ["Identify and manage Panchakarma complications"],
      },
    ],
  },
  {
    code: "AyUG-RM",
    name: "Research Methodology & Medical Statistics",
    englishTitle: "Evidence-Based Ayurveda & Biostatistics",
    professionalCode: "PROF_3",
    paperCount: 1,
    maxMarks: 100,
    ncismSourceUrl: "https://ncismindia.org/8.%20NCISM_IIIBAMS_AyUG-RM.pdf",
    referenceTextbooks: ["NCISM Research Methodology Manual", "Mahajan's Methods in Biostatistics"],
    topics: [
      {
        id: "top-rm-study-design",
        title: "Clinical Trial Designs, P-Value, Chi-Square & t-Test",
        sanskritTerm: "अनुसन्धान एवं सांख्यिकी",
        difficulty: "medium",
        highYieldScore: 88,
        subtopics: ["RCT", "Cohort vs Case-Control", "CTRI Registration", "CONSORT"],
        learningObjectives: ["Select appropriate parametric vs non-parametric statistical tests"],
      },
    ],
  },
];

export const SMART_NOTES_LIBRARY: SmartNoteBundle[] = [
  {
    topicId: "top-ks-tridosha",
    subjectCode: "AyUG-KS",
    title: "Tridosha Siddhanta: Vata, Pitta, Kapha & Clinical Subtypes",
    sanskritTerm: "त्रिदोष सिद्धान्त (वात-पित्त-कफ)",
    sourceCitation: "Ashtanga Hridaya Sutrasthana Ch. 1 & 12; Charaka Sutrasthana Ch. 12",
    verificationStatus: "verified",
    masterNote: {
      definition:
        "Tridosha (Vata, Pitta, Kapha) are the three primary bio-functional entities that sustain physiological homeostasis (Prakriti/Dhatu-samya) in normalcy and initiate pathogenesis (Vikriti) when vitiated.",
      introduction:
        "Derived from Panchamahabhuta: Vata (Vayu + Akasha), Pitta (Agni + Jala), and Kapha (Prithvi + Jala). Each Dosha exhibits five functional subtypes (Panchavidha) localized to specific anatomical seats (Sthana).",
      classification: [
        "Vata (Prana, Udana, Samana, Vyana, Apana) — Pradhana Sthana: Pakwashaya",
        "Pitta (Pachaka, Ranjaka, Sadhaka, Alochaka, Bhrajaka) — Pradhana Sthana: Nabhi / Amashaya",
        "Kapha (Kledaka, Avalambaka, Bodhaka, Tarpaka, Shleshaka) — Pradhana Sthana: Uras",
      ],
      detailedExplanation:
        "Vata governs all kinetic, neural, and eliminative functions (Ruksha, Laghu, Shita, Khara, Sukshma, Chala). Pitta governs digestion, thermogenesis, pigmentation, and intellect (Sasneha, Tikshna, Ushna, Laghu, Visra, Sara, Drava). Kapha governs cohesion, lubrication, immunity, and tissue stability (Snigdha, Shita, Guru, Manda, Shlakshna, Mritsna, Sthira).",
      clinicalSignificance:
        "Sthana-vishesha assessment guides Panchakarma selection: Basti is the premier therapy for Vata, Virechana for Pitta, and Vamana for Kapha.",
      examPoints: [
        "Pradhana Sthana & Karmas of all 15 Dosha subtypes (frequent 10-mark LAQ / 5-mark SAQ).",
        "Guna-based Chikitsa: Sneha-Basti for Vata, Tikta-Virechana for Pitta, Ruksha-Vamana for Kapha.",
        "Ashraya-Ashrayi Bhava: Vata resides in Asthi, Pitta in Rakta/Sweda, Kapha in Rasa/Mamsa/Meda/Majja/Shukra.",
      ],
      references: [
        "Ashtanga Hridaya Sutrasthana 12/1–18",
        "Charaka Samhita Sutrasthana 20",
      ],
    },
    easyNote: {
      hinglishSummary:
        "Simple logic samjho: Body ek smart factory hai. Vata = Logistics & Wi-Fi (movement & nerve signals), Pitta = Power Plant & Kitchen (digestion, enzymes, heat), aur Kapha = Building Structure & Coolant (strength, joints, immunity). Teeno balance me rahein toh health, bigde toh disease!",
      everydayAnalogy:
        "Think of a car: Vata is the steering, accelerator, and electrical wiring; Pitta is the combustion engine & fuel metabolism; Kapha is the chassis, engine oil, and shock absorbers.",
      stepByStep: [
        "Step 1: Learn the Panchamahabhuta pair for each Dosha.",
        "Step 2: Memorize the 5 subtypes using anatomical top-to-bottom order (Head → Chest → Stomach → Pelvis).",
        "Step 3: Connect each subtype to its modern physiological correlate without losing its Ayurvedic Sthana.",
      ],
      comparisonTable: [
        { parameter: "Primary Role", ayurveda: "Vata: Gati & Gandhana", modern: "CNS/ANS signaling & motility" },
        { parameter: "Primary Role", ayurveda: "Pitta: Paka & Ushma", modern: "Enzymes, BMR & thermoregulation" },
        { parameter: "Primary Role", ayurveda: "Kapha: Sthiratva & Bandha", modern: "Anabolism, mucosa & synovial fluid" },
      ],
    },
    quickGoNote: {
      keyDefinitions: [
        "Dosha: 'Dushanad doshah' — entities capable of vitiating Dhatu & Mala.",
        "Sthana: Pakwashaya (Vata), Nabhi (Pitta), Uras (Kapha).",
      ],
      oneLiners: [
        "Pitta is the ONLY Dosha with Agni-predominance (Tejas + Jala).",
        "Ashraya-Ashrayi exception: Vata-Asthi has inverse relation (Brimhana increases Asthi, decreases Vata).",
        "Vyana Vata circulates Rasa-Rakta throughout the body continuously.",
      ],
      memoryTricks: [
        "Vata 5: P-U-S-V-A (Prana, Udana, Samana, Vyana, Apana).",
        "Pitta 5: Pa-Ra-Sa-A-Bha (Pachaka, Ranjaka, Sadhaka, Alochaka, Bhrajaka).",
        "Kapha 5: K-A-B-T-S (Kledaka, Avalambaka, Bodhaka, Tarpaka, Shleshaka).",
      ],
      commonMistakes: [
        "Confusing Sadhaka Pitta (Hridaya) with Tarpaka Kapha (Shiras) in MCQ stems.",
        "Writing 'Amashaya' as general Pitta Sthana without specifying Adho-Amashaya.",
      ],
    },
  },
  {
    topicId: "top-rn-shatkriyakala",
    subjectCode: "AyUG-RN",
    title: "Shatkriyakala: Six Stages of Pathogenesis & Early Intervention",
    sanskritTerm: "षट्क्रियाकाल",
    sourceCitation: "Sushruta Samhita Sutrasthana 21/18–36",
    verificationStatus: "verified",
    masterNote: {
      definition:
        "Shatkriyakala describes the six sequential stages of Dosha vitiation and disease manifestation, providing six therapeutic windows (Kriya-kala) to arrest pathogenesis.",
      introduction:
        "Formulated by Acharya Sushruta, it bridges subclinical Dosha accumulation (Sanchaya) to overt structural complications (Bheda).",
      classification: [
        "1. Sanchaya (Accumulation in own Sthana)",
        "2. Prakopa (Aggravation/Excitation)",
        "3. Prasara (Spread across Srotas)",
        "4. Sthana Samshraya (Localization at Khavaigunya; Purvarupa appears)",
        "5. Vyakti (Manifestation of cardinal Rupa)",
        "6. Bheda (Chronicity, Rupture & Upadrava)",
      ],
      detailedExplanation:
        "In Sanchaya, the patient develops aversion to causative factors and desire for opposites (Chaya-karana-vidvesha). In Prakopa, Doshas become mobile (Unmarga-gamana begins). In Prasara, Vata acts as the primary carrier propelling Pitta and Kapha. Sthana Samshraya occurs where Srotodushti/Khavaigunya exists, producing prodromal symptoms (Purvarupa). Vyakti marks full clinical diagnosis, while Bheda indicates incurability or surgical/chronic sequelae.",
      clinicalSignificance:
        "Early intervention during Sanchaya–Prasara prevents systemic organ damage and reduces treatment complexity.",
      examPoints: [
        "Sushruta's exact quote: 'Sanchayam cha prakopam cha prasaram sthana-samshrayam | Vyaktim bhedam cha yo vetti doshanam sa bhaved bhishak ||'",
        "Purvarupa appears in Stage 4 (Sthana Samshraya); Rupa in Stage 5 (Vyakti).",
      ],
      references: ["Sushruta Samhita Sutrasthana 21/36", "Madhava Nidana"],
    },
    easyNote: {
      hinglishSummary:
        "Shatkriyakala ko ek traffic jam ya flood se samjho: 1) Sanchaya = Baarish shuru (water collects in dam), 2) Prakopa = Dam full & overflowing, 3) Prasara = Water streets me fail gaya, 4) Sthana Samshraya = Low-lying area (Khavaigunya) me paani bhar gaya, 5) Vyakti = Proper flood visible, 6) Bheda = Building damage!",
      everydayAnalogy:
        "Stage 1–3 is like smoke and sparks before a fire catches; Stage 4 is the heat in the wall; Stage 5 is visible flames; Stage 6 is structural collapse.",
      stepByStep: [
        "Memorize the 6 names in order: Sanchaya → Prakopa → Prasara → Sthana Samshraya → Vyakti → Bheda.",
        "Map Clinical Signs: Purvarupa = Stage 4; Rupa = Stage 5; Upadrava/Asadhyata = Stage 6.",
      ],
      comparisonTable: [
        { parameter: "Stage 1–2", ayurveda: "Sanchaya & Prakopa", modern: "Subclinical biochemical/cellular stress" },
        { parameter: "Stage 4", ayurveda: "Sthana Samshraya (Purvarupa)", modern: "Prodromal phase at target organ" },
        { parameter: "Stage 5–6", ayurveda: "Vyakti & Bheda", modern: "Clinical syndrome & complications" },
      ],
    },
    quickGoNote: {
      keyDefinitions: [
        "Kriyakala: Appropriate time-window for therapeutic action (Chikitsa Avasara).",
        "Khavaigunya: Structural/functional weakness in a Srotas inviting Dosha-Dushya Sammurchhana.",
      ],
      oneLiners: [
        "Vata is responsible for Prasara ('Vayu is Pangu-free', propels Pitta & Kapha).",
        "Sushruta Sutrasthana Chapter 21 (Vranaprashna Adhyaya) is the primary source.",
      ],
      memoryTricks: [
        "S-P-P-S-V-B: 'Some People Prefer Studying Very Briskly'.",
      ],
      commonMistakes: [
        "Attributing Shatkriyakala to Charaka instead of Sushruta.",
        "Placing Purvarupa in Prasara instead of Sthana Samshraya.",
      ],
    },
  },
];

export const DEMO_PYQ_BANK: PyqRecord[] = [
  {
    id: "pyq-demo-1",
    question:
      "Define Tridosha. Describe the Sthana, Guna, and Karma of Vata Dosha and its five subtypes in detail.",
    subjectCode: "AyUG-KS",
    subjectName: "Kriya Sharir",
    topicTitle: "Tridosha Siddhanta (Vata, Pitta, Kapha)",
    university: "MUHS (Demonstration Sample)",
    examYear: 2023,
    marks: 10,
    qType: "LAQ",
    conceptClusterKey: "ks-vata-subtypes",
    sourceDocument: "Demonstration Sample (Marked Non-Official)",
    verificationStatus: "demonstration",
    referenceAnswer:
      "Outline: 1) Nirukti of Dosha & Vata ('Va gati-gandhanayoh'), 2) Vata Gunas (Ruksha, Laghu, Shita, Khara, Sukshma, Chala), 3) Pradhana Sthana (Pakwashaya), 4) Panchavidha Vata (Prana, Udana, Samana, Vyana, Apana) with Sthana & Karma.",
  },
  {
    id: "pyq-demo-2",
    question:
      "Enumerate the five types of Vata with their specific locations and physiological functions.",
    subjectCode: "AyUG-KS",
    subjectName: "Kriya Sharir",
    topicTitle: "Tridosha Siddhanta (Vata, Pitta, Kapha)",
    university: "RGUHS (Demonstration Sample)",
    examYear: 2022,
    marks: 5,
    qType: "SAQ",
    conceptClusterKey: "ks-vata-subtypes",
    sourceDocument: "Demonstration Sample (Marked Non-Official)",
    verificationStatus: "demonstration",
  },
  {
    id: "pyq-demo-3",
    question:
      "Write a short note on Prana Vata and Udana Vata clinical correlation.",
    subjectCode: "AyUG-KS",
    subjectName: "Kriya Sharir",
    topicTitle: "Tridosha Siddhanta (Vata, Pitta, Kapha)",
    university: "BHU (Demonstration Sample)",
    examYear: 2021,
    marks: 5,
    qType: "Short Note",
    conceptClusterKey: "ks-vata-subtypes",
    sourceDocument: "Demonstration Sample (Marked Non-Official)",
    verificationStatus: "demonstration",
  },
  {
    id: "pyq-demo-4",
    question:
      "Explain Shatkriyakala according to Sushruta Samhita and discuss its clinical utility in early diagnosis.",
    subjectCode: "AyUG-RN",
    subjectName: "Roga Nidana evam Vikriti Vigyan",
    topicTitle: "Shatkriyakala & Nidana Panchaka",
    university: "MUHS (Demonstration Sample)",
    examYear: 2024,
    marks: 10,
    qType: "LAQ",
    conceptClusterKey: "rn-shatkriyakala",
    sourceDocument: "Demonstration Sample (Marked Non-Official)",
    verificationStatus: "demonstration",
  },
  {
    id: "pyq-demo-5",
    question:
      "Describe the preparation of Apamarga Ksharasutra and its indications in Bhagandara.",
    subjectCode: "AyUG-ST",
    subjectName: "Shalya Tantra",
    topicTitle: "Ashtavidha Shastra Karma, Vrana & Ksharasutra",
    university: "RGUHS (Demonstration Sample)",
    examYear: 2023,
    marks: 10,
    qType: "LAQ",
    conceptClusterKey: "st-ksharasutra",
    sourceDocument: "Demonstration Sample (Marked Non-Official)",
    verificationStatus: "demonstration",
  },
  {
    id: "pyq-demo-6",
    question:
      "List the Bhasma Pariksha criteria (Varitara, Rekhapurnatva, Apunarbhava) and explain their significance.",
    subjectCode: "AyUG-RB",
    subjectName: "Rasashastra evam Bhaishajya Kalpana",
    topicTitle: "Parada Samskara, Shodhana & Marana (Bhasma)",
    university: "GAU (Demonstration Sample)",
    examYear: 2022,
    marks: 5,
    qType: "SAQ",
    conceptClusterKey: "rb-bhasma-pariksha",
    sourceDocument: "Demonstration Sample (Marked Non-Official)",
    verificationStatus: "demonstration",
  },
];

export const DEMO_MCQ_POOL: ExamQuestionItem[] = [
  {
    id: "mcq-1",
    subjectCode: "AyUG-KS",
    subjectName: "Kriya Sharir",
    topicId: "top-ks-tridosha",
    topicTitle: "Tridosha Siddhanta",
    qType: "mcq_single",
    stem: "Which subtype of Pitta resides in the Hridaya and is responsible for Buddhi, Medha, and Abhimana?",
    options: [
      { id: "mcq-1-a", label: "A", text: "Ranjaka Pitta", isCorrect: false },
      { id: "mcq-1-b", label: "B", text: "Sadhaka Pitta", isCorrect: true },
      { id: "mcq-1-c", label: "C", text: "Alochaka Pitta", isCorrect: false },
      { id: "mcq-1-d", label: "D", text: "Bhrajaka Pitta", isCorrect: false },
    ],
    marks: 1,
    difficulty: "easy",
    isPyq: true,
    isAiGenerated: false,
    sourceLabel: "Demonstration Practice Bank (Ashtanga Hridaya Su. 12/13)",
    explanation:
      "Sadhaka Pitta is located in the Hridaya and governs higher cognitive functions (Buddhi, Medha, Abhimana) and achievement of desired goals.",
    ayurvedicReference: "Ashtanga Hridaya Sutrasthana 12/13",
  },
  {
    id: "mcq-2",
    subjectCode: "AyUG-RN",
    subjectName: "Roga Nidana evam Vikriti Vigyan",
    topicId: "top-rn-shatkriyakala",
    topicTitle: "Shatkriyakala",
    qType: "mcq_single",
    stem: "In which stage of Sushruta's Shatkriyakala do Purvarupa (prodromal symptoms) first manifest?",
    options: [
      { id: "mcq-2-a", label: "A", text: "Prakopa", isCorrect: false },
      { id: "mcq-2-b", label: "B", text: "Prasara", isCorrect: false },
      { id: "mcq-2-c", label: "C", text: "Sthana Samshraya", isCorrect: true },
      { id: "mcq-2-d", label: "D", text: "Vyakti", isCorrect: false },
    ],
    marks: 1,
    difficulty: "medium",
    isPyq: true,
    isAiGenerated: false,
    sourceLabel: "Demonstration Practice Bank (Sushruta Su. 21/33)",
    explanation:
      "During Sthana Samshraya, vitiated Doshas localize at a site of Khavaigunya (Srotodushti), leading to Dosha-Dushya Sammurchhana and Purvarupa.",
    ayurvedicReference: "Sushruta Samhita Sutrasthana 21/33",
  },
  {
    id: "mcq-3",
    subjectCode: "AyUG-RS",
    subjectName: "Rachana Sharir",
    topicId: "top-rs-marma",
    topicTitle: "Marma Sharir",
    qType: "mcq_single",
    stem: "What is the total number of Marma points described by Acharya Sushruta in Sharirasthana?",
    options: [
      { id: "mcq-3-a", label: "A", text: "100", isCorrect: false },
      { id: "mcq-3-b", label: "B", text: "107", isCorrect: true },
      { id: "mcq-3-c", label: "C", text: "114", isCorrect: false },
      { id: "mcq-3-d", label: "D", text: "120", isCorrect: false },
    ],
    marks: 1,
    difficulty: "easy",
    isPyq: true,
    isAiGenerated: false,
    sourceLabel: "Demonstration Practice Bank (Sushruta Sha. 6/3)",
    explanation:
      "Sushruta enumerates 107 Marmas: 44 in Shakha (11 per limb), 12 in Koshtha (Uras & Udara), 14 in Prishtha, and 37 in Urdhvajatru.",
    ayurvedicReference: "Sushruta Samhita Sharirasthana 6/3",
  },
  {
    id: "mcq-4",
    subjectCode: "AyUG-DG",
    subjectName: "Dravyaguna Vigyan",
    topicId: "top-dg-rasapanchaka",
    topicTitle: "Rasa Panchaka",
    qType: "assertion_reason",
    stem: "Assertion (A): Danti (Baliospermum montanum) produces Virechana despite having Katu Rasa & Ushna Virya similar to Chitraka. Reason (R): Specific therapeutic action not explainable by Rasa-Virya-Vipaka is attributed to Prabhava.",
    options: [
      { id: "mcq-4-a", label: "A", text: "Both A and R are true, and R is the correct explanation of A", isCorrect: true },
      { id: "mcq-4-b", label: "B", text: "Both A and R are true, but R is NOT the correct explanation", isCorrect: false },
      { id: "mcq-4-c", label: "C", text: "A is true, R is false", isCorrect: false },
      { id: "mcq-4-d", label: "D", text: "A is false, R is true", isCorrect: false },
    ],
    marks: 1,
    difficulty: "hard",
    isPyq: false,
    isAiGenerated: false,
    sourceLabel: "Demonstration Practice Bank (Charaka Su. 26/67)",
    explanation:
      "Acharya Charaka specifically cites Danti vs Chitraka as the classical illustration of Achintya Prabhava.",
    ayurvedicReference: "Charaka Samhita Sutrasthana 26/67-70",
  },
  {
    id: "mcq-5",
    subjectCode: "AyUG-RB",
    subjectName: "Rasashastra evam Bhaishajya Kalpana",
    topicId: "top-rb-parada",
    topicTitle: "Bhasma Pariksha",
    qType: "mcq_single",
    stem: "Which physical test confirms that a prepared Bhasma is light enough to float on still water?",
    options: [
      { id: "mcq-5-a", label: "A", text: "Rekhapurnatva", isCorrect: false },
      { id: "mcq-5-b", label: "B", text: "Varitara", isCorrect: true },
      { id: "mcq-5-c", label: "C", text: "Niruttha", isCorrect: false },
      { id: "mcq-5-d", label: "D", text: "Niswadu", isCorrect: false },
    ],
    marks: 1,
    difficulty: "easy",
    isPyq: true,
    isAiGenerated: false,
    sourceLabel: "Demonstration Practice Bank (Rasatarangini)",
    explanation:
      "Varitara ('Vari' = water, 'Tara' = floating) tests lightness and surface tension compliance of properly incinerated Bhasma.",
    ayurvedicReference: "Rasaratna Samuchchaya 8",
  },
  {
    id: "mcq-6",
    subjectCode: "AyUG-KC",
    subjectName: "Kayachikitsa",
    topicId: "top-kc-jvara",
    topicTitle: "Jvara Chikitsa",
    qType: "case_based",
    stem: "A patient presents with acute onset fever (Nava Jvara), Ama-lakshana, anorexia, and coated tongue. What is the first-line Ayurvedic therapeutic principle?",
    options: [
      { id: "mcq-6-a", label: "A", text: "Immediate Ghrita Pana", isCorrect: false },
      { id: "mcq-6-b", label: "B", text: "Langhana & Shadanga Paniya", isCorrect: true },
      { id: "mcq-6-c", label: "C", text: "Kshira Basti", isCorrect: false },
      { id: "mcq-6-d", label: "D", text: "Raktamokshana", isCorrect: false },
    ],
    marks: 1,
    difficulty: "medium",
    isPyq: false,
    isAiGenerated: false,
    sourceLabel: "Demonstration Clinical Bank (Charaka Chi. 3/139)",
    explanation:
      "In Nava Jvara (Ama stage), Langhana (up to strength tolerance), Swedana, Kala, Yavagu, and Tikta Rasa / Shadanga Paniya are indicated; Sneha is contraindicated until Nirama stage.",
    ayurvedicReference: "Charaka Samhita Chikitsasthana 3/139",
  },
];

export const INITIAL_MIND_MAPS: Record<string, MindMapNodeData> = {
  tridosha: {
    id: "mm-root",
    label: "Tridosha Siddhanta",
    sanskritTerm: "त्रिदोष",
    description: "Three bio-functional pillars maintaining Sharira homeostasis.",
    color: "#27C68B",
    children: [
      {
        id: "mm-vata",
        label: "Vata Dosha",
        sanskritTerm: "वात (वायु + आकाश)",
        description: "Gati & Gandhana | Seat: Pakwashaya | Therapy: Basti",
        color: "#D6B66F",
        children: [
          { id: "mm-v1", label: "Prana", description: "Murdha/Uras — Respiration, deglutition, Buddhi", color: "#B9D69B" },
          { id: "mm-v2", label: "Udana", description: "Uras/Kantha — Vak, Prayatna, Urja, Bala", color: "#B9D69B" },
          { id: "mm-v3", label: "Samana", description: "Koshtha — Agni stimulation & Anna Vivechana", color: "#B9D69B" },
          { id: "mm-v4", label: "Vyana", description: "Hridaya/Sarvasharira — Rasa-Rakta Vikshepana", color: "#B9D69B" },
          { id: "mm-v5", label: "Apana", description: "Apana Pradesh — Elimination (Mala, Mutra, Shukra, Artava, Garbha)", color: "#B9D69B" },
        ],
      },
      {
        id: "mm-pitta",
        label: "Pitta Dosha",
        sanskritTerm: "पित्त (अग्नि + जल)",
        description: "Tapana & Paka | Seat: Nabhi | Therapy: Virechana",
        color: "#E08A5A",
        children: [
          { id: "mm-p1", label: "Pachaka", description: "Pakwashaya-Amashaya Madhya — Ahara Pachana", color: "#D6B66F" },
          { id: "mm-p2", label: "Ranjaka", description: "Yakrit-Pliha / Amashaya — Rasa Raktikarana", color: "#D6B66F" },
          { id: "mm-p3", label: "Sadhaka", description: "Hridaya — Buddhi, Medha, Abhimana", color: "#D6B66F" },
          { id: "mm-p4", label: "Alochaka", description: "Drishti — Rupa Grahana (Vision)", color: "#D6B66F" },
          { id: "mm-p5", label: "Bhrajaka", description: "Twak — Prabha & Lepa-Pachana", color: "#D6B66F" },
        ],
      },
      {
        id: "mm-kapha",
        label: "Kapha Dosha",
        sanskritTerm: "कफ (पृथ्वी + जल)",
        description: "Shleshana & Sthairya | Seat: Uras | Therapy: Vamana",
        color: "#6BB8D6",
        children: [
          { id: "mm-k1", label: "Kledaka", description: "Amashaya — Moistening ingested food", color: "#9BAAA2" },
          { id: "mm-k2", label: "Avalambaka", description: "Uras/Trikas — Cardiopulmonary & systemic support", color: "#9BAAA2" },
          { id: "mm-k3", label: "Bodhaka", description: "Jihvamula — Rasa Bodhana (Taste perception)", color: "#9BAAA2" },
          { id: "mm-k4", label: "Tarpaka", description: "Shiras — Indriya Tarpana", color: "#9BAAA2" },
          { id: "mm-k5", label: "Shleshaka", description: "Sandhi — Joint lubrication", color: "#9BAAA2" },
        ],
      },
    ],
  },
};

export const INITIAL_GLOSSARY: GlossaryItem[] = [
  {
    id: "gl-1",
    sanskritTerm: "Tridosha",
    devanagari: "त्रिदोष",
    transliteration: "Tri-doṣa",
    englishMeaning: "Three fundamental bio-humors (Vata, Pitta, Kapha)",
    hindiMeaning: "तीन मूलभूत शारीरिक दोष",
    subjectCode: "AyUG-KS",
    contextualExplanation: "Primary physiological regulators that maintain health in equilibrium and initiate pathology when vitiated.",
    relatedTerms: ["Vata", "Pitta", "Kapha", "Prakriti"],
    referenceSource: "Ashtanga Hridaya Sutrasthana 1/6",
  },
  {
    id: "gl-2",
    sanskritTerm: "Shatkriyakala",
    devanagari: "षट्क्रियाकाल",
    transliteration: "Ṣaṭ-kriyākāla",
    englishMeaning: "Six sequential stages of disease pathogenesis and intervention",
    hindiMeaning: "रोगोत्पत्ति की छह अवस्थाएँ और चिकित्सा अवसर",
    subjectCode: "AyUG-RN",
    contextualExplanation: "Sanchaya, Prakopa, Prasara, Sthana Samshraya, Vyakti, and Bheda.",
    relatedTerms: ["Khavaigunya", "Purvarupa", "Samprapti"],
    referenceSource: "Sushruta Samhita Sutrasthana 21/36",
  },
  {
    id: "gl-3",
    sanskritTerm: "Rasa Panchaka",
    devanagari: "रसपञ्चक",
    transliteration: "Rasa-pañcaka",
    englishMeaning: "Five pharmacodynamic principles of a Dravya",
    hindiMeaning: "द्रव्य के पाँच औषधीय सिद्धांत (रस, गुण, वीर्य, विपाक, प्रभाव)",
    subjectCode: "AyUG-DG",
    contextualExplanation: "Determines how a medicinal plant or mineral acts on Dosha, Dhatu, and Mala.",
    relatedTerms: ["Shadrasa", "Virya", "Vipaka", "Prabhava"],
    referenceSource: "Dravyaguna Vigyan (AyUG-DG)",
  },
  {
    id: "gl-4",
    sanskritTerm: "Marma",
    devanagari: "मर्म",
    transliteration: "Marma",
    englishMeaning: "107 vital anatomical junctions where Mamsa, Sira, Snayu, Asthi & Sandhi meet",
    hindiMeaning: "शरीर के 107 प्राणायतन संवेदनशील स्थान",
    subjectCode: "AyUG-RS",
    contextualExplanation: "Trauma to Marmas produces severe pain, disability, or fatality depending on Parinama classification.",
    relatedTerms: ["Trimarma", "Sadyapranahara", "Kalantara"],
    referenceSource: "Sushruta Samhita Sharirasthana 6",
  },
];

export const INITIAL_FLASHCARDS: (FsrsCard & {
  front: string;
  back: string;
  sanskrit?: string;
  subjectCode: string;
  cardType: string;
})[] = [
  {
    id: "fc-1",
    front: "Pradhana Sthana of Vata, Pitta, and Kapha",
    back: "Vata: Pakwashaya | Pitta: Nabhi / Adho-Amashaya | Kapha: Uras (Chest)",
    sanskrit: "पक्वाशयः कटिः सक्थि... (अ.हृ.सू. 12/1)",
    subjectCode: "AyUG-KS",
    cardType: "Sanskrit Concept",
    stability: 1.5,
    difficulty: 4.5,
    state: "new",
    reps: 0,
    lapses: 0,
    dueAt: new Date().toISOString(),
  },
  {
    id: "fc-2",
    front: "Total number of Marmas in Sushruta Sharirasthana",
    back: "107 Marmas (44 Shakha, 12 Koshtha, 14 Prishtha, 37 Urdhvajatru)",
    sanskrit: "सप्तोत्तरं मर्मशतम्",
    subjectCode: "AyUG-RS",
    cardType: "Anatomy",
    stability: 2.0,
    difficulty: 4.0,
    state: "learning",
    reps: 1,
    lapses: 0,
    dueAt: new Date().toISOString(),
  },
  {
    id: "fc-3",
    front: "Varitara Bhasma Pariksha tests which property?",
    back: "Lightness (Laghutva) — properly incinerated Bhasma floats on still water.",
    sanskrit: "वारितर",
    subjectCode: "AyUG-RB",
    cardType: "Pharmaceutics",
    stability: 3.0,
    difficulty: 3.8,
    state: "review",
    reps: 2,
    lapses: 0,
    dueAt: new Date().toISOString(),
  },
  {
    id: "fc-4",
    front: "First-line Chikitsa Sutra in Nava Jvara (Ama stage)",
    back: "Langhana, Swedana, Kala, Yavagu, and Tikta Rasa / Shadanga Paniya. Sneha is contraindicated.",
    sanskrit: "लङ्घनं स्वेदनं कालो यवाग्वस्तिक्तको रसः",
    subjectCode: "AyUG-KC",
    cardType: "Clinical",
    stability: 0.8,
    difficulty: 5.5,
    state: "new",
    reps: 0,
    lapses: 0,
    dueAt: new Date().toISOString(),
  },
];

export const PRACTICAL_MODULES: PracticalModule[] = [
  {
    id: "prac-1",
    subjectCode: "AyUG-ST",
    subjectName: "Shalya Tantra",
    professionalCode: "PROF_3",
    title: "Shalaka Yantra & Ksharasutra Probe (Eshani)",
    category: "Instrument",
    description:
      "Malleable metallic probe with an eyelet at the tip used to trace Bhagandara (fistula-in-ano) tracts and thread Apamarga Ksharasutra.",
    keyIdentificationPoints: [
      "Slender, flexible, blunt-tipped shaft to avoid creating false tracts",
      "Eyelet at proximal/distal end for threading medicated linen (21 coatings)",
      "Mentioned under Eshani Yantra in Sushruta Sutrasthana Ch. 7",
    ],
    vivaQuestions: [
      {
        q: "How many coatings are applied in standard Apamarga Ksharasutra?",
        a: "21 coatings total: 11 coatings of Snuhi Ksheera, 7 of Snuhi Ksheera + Apamarga Kshara, and 3 of Snuhi Ksheera + Haridra Churna.",
      },
      {
        q: "What is the typical pH of Apamarga Ksharasutra?",
        a: "Alkaline (approximately pH 9.5–10.5), enabling chemical cauterization and simultaneous cutting-healing.",
      },
    ],
    safetyDisclaimer: "Educational practical guide only. Perform clinical probing strictly under supervised surgical faculty.",
  },
  {
    id: "prac-2",
    subjectCode: "AyUG-RB",
    subjectName: "Rasashastra evam Bhaishajya Kalpana",
    professionalCode: "PROF_2",
    title: "Bhasma Pariksha OSPE Station",
    category: "OSPE Station",
    description:
      "Standardized physical and chemical quality-control verification of metallic/mineral Bhasma before clinical dispensing.",
    keyIdentificationPoints: [
      "Rekhapurnatva: Fills finger-crease lines cleanly",
      "Varitara: Floats on still water surface",
      "Niruttha: Does not regain metallic luster when heated with Mitra Panchaka",
    ],
    vivaQuestions: [
      {
        q: "What is the purpose of Nischandratva test?",
        a: "To confirm absence of free shining metallic particles (especially in Abhraka or Loha Bhasma) under bright sunlight.",
      },
    ],
    safetyDisclaimer: "Follow institutional pharmacopoeia SOPs in Rasashastra laboratory.",
  },
];
