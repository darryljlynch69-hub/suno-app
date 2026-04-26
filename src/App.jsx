import { useState, useMemo, useRef, useEffect } from "react";
import { Music, Copy, Check, Sparkles, RotateCcw, ChevronDown, ChevronUp, Search, Disc, X, Plus, ArrowUp, ArrowDown, Trash2, Layers, Star, AlertTriangle, CheckCircle2, Wrench, Brain, Loader2, Radio, Globe, Flame, Target, Scissors, Heart, Activity, Shuffle, Beaker, Wand2, Play, Pause, Upload, SkipBack, SkipForward, Volume2, Headphones, HelpCircle, Send, FileText, BarChart3, Sun, Moon, Sliders } from "lucide-react";

export default function SunoPromptBuilder() {
  const [rawLyrics, setRawLyrics] = useState("");

  const [selectedTags, setSelectedTags] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState("genre");
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [songKey, setSongKey] = useState("");
  const [duration, setDuration] = useState("");
  const [mood, setMood] = useState("");
  const [instruments, setInstruments] = useState("");
  const [negativeTags, setNegativeTags] = useState("");
  const [language, setLanguage] = useState("English");
  const [vocalGender, setVocalGender] = useState("");

  const [auditOpen, setAuditOpen] = useState(true);
  const [metaOpen, setMetaOpen] = useState(false);
  const [hitsOpen, setHitsOpen] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [transparencyOpen, setTransparencyOpen] = useState(true); // Open by default — users should see this
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachResult, setCoachResult] = useState(null);
  const [coachError, setCoachError] = useState("");
  const [coachFocus, setCoachFocus] = useState("all");
  const [radioOpen, setRadioOpen] = useState(false);
  const [honestyLoading, setHonestyLoading] = useState(false);
  const [honestyError, setHonestyError] = useState("");

  const [hitSearch, setHitSearch] = useState("");
  const [hitGenre, setHitGenre] = useState("all");
  const [activeHit, setActiveHit] = useState(null);

  const [arrangement, setArrangement] = useState([]);
  const [nextId, setNextId] = useState(1);

  const sectionTypes = ["Intro", "Verse", "Verse 1", "Verse 2", "Verse 3", "Pre-Chorus", "Chorus", "Post-Chorus", "Bridge", "Build", "Drop", "Breakdown", "Solo", "Hook", "Refrain", "Final Chorus", "Outro", "Tag"];

  const arrangementTemplates = {
    "Pop Standard": [
      { type: "Intro", duration: "0:10" }, { type: "Verse 1", duration: "0:30" }, { type: "Pre-Chorus", duration: "0:15" }, { type: "Chorus", duration: "0:30" },
      { type: "Verse 2", duration: "0:30" }, { type: "Pre-Chorus", duration: "0:15" }, { type: "Chorus", duration: "0:30" }, { type: "Bridge", duration: "0:20" },
      { type: "Final Chorus", duration: "0:30" }, { type: "Outro", duration: "0:10" },
    ],
    "EDM Drop": [
      { type: "Intro", duration: "0:16" }, { type: "Verse 1", duration: "0:24" }, { type: "Build", duration: "0:16" }, { type: "Drop", duration: "0:32" },
      { type: "Breakdown", duration: "0:16" }, { type: "Verse 2", duration: "0:24" }, { type: "Build", duration: "0:16" }, { type: "Drop", duration: "0:32" }, { type: "Outro", duration: "0:14" },
    ],
    "Hip-Hop": [
      { type: "Intro", duration: "0:08" }, { type: "Hook", duration: "0:20" }, { type: "Verse 1", duration: "0:32" }, { type: "Hook", duration: "0:20" },
      { type: "Verse 2", duration: "0:32" }, { type: "Hook", duration: "0:20" }, { type: "Bridge", duration: "0:16" }, { type: "Hook", duration: "0:20" }, { type: "Outro", duration: "0:12" },
    ],
    "Rock Anthem": [
      { type: "Intro", duration: "0:12" }, { type: "Verse 1", duration: "0:24" }, { type: "Chorus", duration: "0:24" }, { type: "Verse 2", duration: "0:24" },
      { type: "Chorus", duration: "0:24" }, { type: "Solo", duration: "0:20" }, { type: "Bridge", duration: "0:16" }, { type: "Final Chorus", duration: "0:30" }, { type: "Outro", duration: "0:16" },
    ],
    "Ballad": [
      { type: "Intro", duration: "0:15" }, { type: "Verse 1", duration: "0:35" }, { type: "Chorus", duration: "0:30" }, { type: "Verse 2", duration: "0:35" },
      { type: "Chorus", duration: "0:30" }, { type: "Bridge", duration: "0:25" }, { type: "Final Chorus", duration: "0:35" }, { type: "Outro", duration: "0:15" },
    ],
  };

  const loadTemplate = (name) => {
    let id = nextId;
    const newArr = arrangementTemplates[name].map((s) => ({ ...s, id: id++ }));
    setArrangement(newArr);
    setNextId(id);
  };

  const addSection = (type) => { setArrangement([...arrangement, { id: nextId, type, duration: "0:20" }]); setNextId(nextId + 1); };
  const removeSection = (id) => setArrangement(arrangement.filter((s) => s.id !== id));
  const moveSection = (idx, dir) => {
    const newArr = [...arrangement]; const target = idx + dir;
    if (target < 0 || target >= newArr.length) return;
    [newArr[idx], newArr[target]] = [newArr[target], newArr[idx]]; setArrangement(newArr);
  };
  const updateSection = (id, field, value) => setArrangement(arrangement.map((s) => s.id === id ? { ...s, [field]: value } : s));

  const totalDurationSec = useMemo(() => {
    let total = 0;
    arrangement.forEach((s) => {
      const [m, sec] = s.duration.split(":").map(Number);
      if (!isNaN(m) && !isNaN(sec)) total += m * 60 + sec;
    });
    return total;
  }, [arrangement]);

  const totalDuration = useMemo(() => {
    const min = Math.floor(totalDurationSec / 60);
    const sec = totalDurationSec % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  }, [totalDurationSec]);

  const arrangementBlock = useMemo(() => {
    if (arrangement.length === 0) return "";
    return `[Arrangement: ${arrangement.map((s) => `${s.type} (${s.duration})`).join(" \u2192 ")}]`;
  }, [arrangement]);

  const sectionColor = (type) => {
    if (type.includes("Intro") || type.includes("Outro")) return "bg-slate-100 text-slate-700 border-slate-300";
    if (type.includes("Verse")) return "bg-blue-100 text-blue-800 border-blue-300";
    if (type.includes("Chorus") || type.includes("Hook")) return "bg-pink-100 text-pink-800 border-pink-300";
    if (type.includes("Pre-Chorus")) return "bg-purple-100 text-purple-800 border-purple-300";
    if (type.includes("Bridge")) return "bg-amber-100 text-amber-800 border-amber-300";
    if (type.includes("Drop") || type.includes("Build") || type.includes("Breakdown")) return "bg-orange-100 text-orange-800 border-orange-300";
    if (type.includes("Solo")) return "bg-green-100 text-green-800 border-green-300";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  // HIT RATIONALIZATION CORE — Audit Engine
  const auditResult = useMemo(() => {
    const issues = [];
    const passes = [];

    // PHASE 1 — Time to Chorus
    let timeToChorus = 0;
    let chorusFound = false;
    for (const s of arrangement) {
      if (s.type.toLowerCase().includes("chorus") || s.type.toLowerCase().includes("hook") || s.type.toLowerCase() === "drop") {
        chorusFound = true; break;
      }
      const [m, sec] = s.duration.split(":").map(Number);
      timeToChorus += (m || 0) * 60 + (sec || 0);
    }
    if (!chorusFound) {
      issues.push({ phase: "Velocity", severity: "fail", msg: "No Chorus/Hook/Drop in arrangement", fix: () => {
        setArrangement([...arrangement.slice(0, 3), { id: nextId, type: "Chorus", duration: "0:26" }, ...arrangement.slice(3)]);
        setNextId(nextId + 1);
      }, fixLabel: "Insert Chorus at position 4" });
    } else if (timeToChorus >= 30) {
      issues.push({ phase: "Velocity", severity: "fail", msg: `Hook lands at ${timeToChorus}s — listener attention dies after 30s`, fix: () => {
        const newArr = arrangement.map((s) => {
          if (s.type === "Intro") return { ...s, duration: "0:06" };
          if (s.type === "Verse 1" || s.type === "Verse") return { ...s, duration: "0:16" };
          return s;
        });
        setArrangement(newArr);
      }, fixLabel: "Trim Intro to 0:06 + Verse 1 to 0:16" });
    } else {
      passes.push({ phase: "Velocity", msg: `Hook lands at ${timeToChorus}s` });
    }

    // PHASE 2 — Spatial Clarity
    const instrumentList = instruments.split(",").map((i) => i.trim()).filter(Boolean);
    if (instrumentList.length > 5) {
      issues.push({ phase: "Clarity", severity: "warn", msg: `${instrumentList.length} instruments listed — clutter risk in 250Hz–2kHz`, fix: () => {
        setInstruments(instrumentList.slice(0, 4).join(", "));
      }, fixLabel: "Trim to 4 core instruments" });
    } else if (instrumentList.length === 0 && selectedTags.size === 0) {
      issues.push({ phase: "Clarity", severity: "warn", msg: "No instruments or DNA defined — Suno will guess", fix: null, fixLabel: null });
    } else {
      passes.push({ phase: "Clarity", msg: `Foundation tight (${instrumentList.length} instruments)` });
    }

    // PHASE 3 — Waveform Forensics
    const hasHumanCues = [...selectedTags].some((t) =>
      t.includes("analog") || t.includes("tape") || t.includes("warm") ||
      t.includes("lo-fi") || t.includes("vintage") || t.includes("raw") ||
      t.includes("crunch") || t.includes("vinyl") || t.includes("room")
    );
    if (!hasHumanCues) {
      issues.push({ phase: "Human Error", severity: "fail", msg: "No analog/tape/room DNA — sterile AI sizzle risk", fix: () => {
        const next = new Set(selectedTags);
        next.add("analog warmth");
        next.add("tape saturation");
        next.add("lo-fi room drums");
        setSelectedTags(next);
      }, fixLabel: "Add analog warmth + tape sat + room drums" });
    } else {
      passes.push({ phase: "Human Error", msg: "Analog/tape DNA present" });
    }

    // PHASE 4 — Lyrical Honesty
    const lyricsLower = rawLyrics.toLowerCase();
    const cliches = ["ghosts", "shadows", "heart", "forever", "soul", "fire inside", "deep inside", "broken", "tears fall", "feel alive"];
    const dirtyDetails = ["concrete", "coffee", "wool", "ashtray", "dent", "stain", "mirror", "asphalt", "denim", "cigarette", "neon", "rust", "linoleum", "porch", "tile", "kitchen", "couch", "gravel", "kerosene"];

    const clicheHits = cliches.filter((c) => lyricsLower.includes(c));
    const detailHits = dirtyDetails.filter((d) => lyricsLower.includes(d));

    if (clicheHits.length >= 2) {
      issues.push({ phase: "Honesty", severity: "warn", msg: `${clicheHits.length} clichés found: ${clicheHits.join(", ")}`, fix: "ai_honesty", fixLabel: "AI: Rewrite for honesty" });
    }
    if (detailHits.length === 0) {
      issues.push({ phase: "Honesty", severity: "warn", msg: "No concrete details. Add specifics (coffee, denim, neon, asphalt).", fix: "ai_honesty", fixLabel: "AI: Add concrete details" });
    } else {
      passes.push({ phase: "Honesty", msg: `${detailHits.length} concrete details: ${detailHits.join(", ")}` });
    }

    // Length sync
    if (duration) {
      const [tm, ts] = duration.split(":").map(Number);
      const targetSec = (tm || 0) * 60 + (ts || 0);
      const drift = Math.abs(targetSec - totalDurationSec);
      if (drift > 20) {
        issues.push({ phase: "Length Sync", severity: "warn", msg: `Arrangement total ${totalDuration} ≠ Length ${duration} (drift ${drift}s)`, fix: () => {
          const min = Math.floor(totalDurationSec / 60);
          const sec = totalDurationSec % 60;
          setDuration(`${min}:${String(sec).padStart(2, "0")}`);
        }, fixLabel: `Sync Length tag → ${totalDuration}` });
      }
    }

    // Star rating
    const failCount = issues.filter((i) => i.severity === "fail").length;
    const warnCount = issues.filter((i) => i.severity === "warn").length;
    let stars = 5;
    stars -= failCount * 1.5;
    stars -= warnCount * 0.5;
    stars = Math.max(0, Math.min(5, Math.round(stars * 2) / 2));

    let verdict = "FUNCTIONAL_DEMO";
    let verdictColor = "amber";
    if (stars >= 4.5) { verdict = "HONEST_HIT"; verdictColor = "green"; }
    else if (stars >= 3) { verdict = "CONTENDER"; verdictColor = "yellow"; }
    else if (stars >= 1.5) { verdict = "DEMO"; verdictColor = "orange"; }
    else { verdict = "STERILE"; verdictColor = "red"; }

    return { stars, verdict, verdictColor, issues, passes };
  }, [arrangement, instruments, selectedTags, rawLyrics, duration, totalDurationSec, totalDuration, nextId]);

  // RADIO SAFETY + LIKABILITY ANALYZER
  const radioCheck = useMemo(() => {
    const lyricsLower = rawLyrics.toLowerCase();
    const checks = [];

    // 1. Profanity scan (FCC indecency)
    const explicit = ["fuck", "shit", "bitch", "ass", "damn", "hell", "pussy", "dick", "cock", "nigga", "bastard", "whore", "slut"];
    const found = explicit.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(lyricsLower));
    if (found.length > 0) {
      checks.push({ label: "FCC / Indecency", status: "fail", msg: `Explicit language detected: ${found.join(", ")}. Will need clean edit for daytime airplay.`, weight: 25 });
    } else {
      checks.push({ label: "FCC / Indecency", status: "pass", msg: "No flagged language. Daytime airplay safe.", weight: 25 });
    }

    // 2. Hook velocity (under 20s = sticky)
    let hookSec = 0;
    let hookFound = false;
    for (const s of arrangement) {
      if (s.type.toLowerCase().includes("chorus") || s.type.toLowerCase().includes("hook") || s.type.toLowerCase() === "drop") {
        hookFound = true; break;
      }
      const [m, sec] = s.duration.split(":").map(Number);
      hookSec += (m || 0) * 60 + (sec || 0);
    }
    if (!hookFound) {
      checks.push({ label: "Hook Velocity", status: "fail", msg: "No chorus/hook in arrangement. Top 40 PDs will skip immediately.", weight: 20 });
    } else if (hookSec <= 20) {
      checks.push({ label: "Hook Velocity", status: "pass", msg: `Hook lands at ${hookSec}s — Top 40 sticky range.`, weight: 20 });
    } else if (hookSec <= 30) {
      checks.push({ label: "Hook Velocity", status: "warn", msg: `Hook at ${hookSec}s — acceptable for AC/Country, slow for Top 40.`, weight: 20 });
    } else {
      checks.push({ label: "Hook Velocity", status: "fail", msg: `Hook lands at ${hookSec}s — past listener attention floor.`, weight: 20 });
    }

    // 3. Format fit (length 2:30-3:45 ideal for radio)
    const [tm, ts] = (duration || "0:00").split(":").map(Number);
    const lenSec = (tm || 0) * 60 + (ts || 0);
    if (lenSec === 0) {
      checks.push({ label: "Format Length", status: "warn", msg: "No length set. Radio prefers 2:30–3:45.", weight: 15 });
    } else if (lenSec >= 150 && lenSec <= 225) {
      checks.push({ label: "Format Length", status: "pass", msg: `${duration} fits radio's 2:30–3:45 sweet spot.`, weight: 15 });
    } else if (lenSec < 150) {
      checks.push({ label: "Format Length", status: "warn", msg: `${duration} is short — under 2:30 feels incomplete.`, weight: 15 });
    } else if (lenSec <= 270) {
      checks.push({ label: "Format Length", status: "warn", msg: `${duration} runs long — PDs prefer under 3:45.`, weight: 15 });
    } else {
      checks.push({ label: "Format Length", status: "fail", msg: `${duration} too long for commercial rotation.`, weight: 15 });
    }

    // 4. Audience comfort — controversy scan
    const controversyTerms = ["suicide", "kill myself", "overdose", "drugs", "cocaine", "heroin", "meth", "molly", "xanax", "rape", "murder", "shoot", "gun", "trigger"];
    const controversies = controversyTerms.filter((w) => lyricsLower.includes(w));
    if (controversies.length > 0) {
      checks.push({ label: "Audience Comfort", status: "warn", msg: `Sensitive themes (${controversies.join(", ")}) — advertiser caution. May survive Urban/Rhythmic.`, weight: 15 });
    } else {
      checks.push({ label: "Audience Comfort", status: "pass", msg: "Themes broadly relatable. No advertiser red flags.", weight: 15 });
    }

    // 5. Replay/sticky factor — repetition + memorability
    const lines = rawLyrics.split("\n").filter((l) => l.trim() && !l.trim().startsWith("["));
    const lineCounts = {};
    lines.forEach((l) => {
      const norm = l.trim().toLowerCase();
      lineCounts[norm] = (lineCounts[norm] || 0) + 1;
    });
    const repeatedLines = Object.values(lineCounts).filter((c) => c >= 2).length;
    if (repeatedLines >= 2) {
      checks.push({ label: "Stickiness", status: "pass", msg: `${repeatedLines} repeated phrases — built-in earworm hooks.`, weight: 15 });
    } else if (repeatedLines === 1) {
      checks.push({ label: "Stickiness", status: "warn", msg: "Only 1 repeated phrase. Add a refrain for replay value.", weight: 15 });
    } else {
      checks.push({ label: "Stickiness", status: "fail", msg: "No repeated lines. Radio survives on repetition — add a hook refrain.", weight: 15 });
    }

    // 6. International compatibility (UK Ofcom + BBC stricter)
    const ukRedFlags = ["god", "jesus", "christ"];
    const ukIssues = ukRedFlags.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(lyricsLower));
    if (ukIssues.length > 0 || found.length > 0) {
      checks.push({ label: "Int'l (UK/EU)", status: "warn", msg: "BBC + EU public broadcasters stricter. May need separate edit.", weight: 10 });
    } else {
      checks.push({ label: "Int'l (UK/EU)", status: "pass", msg: "Passes BBC + EU public broadcaster norms.", weight: 10 });
    }

    // Calculate score (weighted, out of 100)
    let score = 0;
    let maxScore = 0;
    checks.forEach((c) => {
      maxScore += c.weight;
      if (c.status === "pass") score += c.weight;
      else if (c.status === "warn") score += c.weight * 0.5;
    });
    const finalScore = Math.round((score / maxScore) * 100);

    // Format fit per genre
    const formatFit = {};
    formatFit["Top 40 / CHR"] = found.length === 0 && hookFound && hookSec <= 25 && lenSec >= 150 && lenSec <= 225 ? "fit" : found.length > 0 || hookSec > 30 ? "edit" : "borderline";
    formatFit["Country"] = found.length === 0 && controversies.length === 0 ? "fit" : "edit";
    formatFit["Urban / Rhythmic"] = found.length <= 2 ? "fit" : "edit";
    formatFit["AC / Adult Contemp."] = found.length === 0 && controversies.length === 0 && lenSec <= 240 ? "fit" : "edit";

    let verdict = "PROBLEMATIC";
    let verdictColor = "red";
    let chartLikelihood = "Streaming-only";
    if (finalScore >= 90) { verdict = "RADIO READY"; verdictColor = "green"; chartLikelihood = "Top 10 candidate"; }
    else if (finalScore >= 75) { verdict = "FORMAT FIT"; verdictColor = "yellow"; chartLikelihood = "Top 40 contender"; }
    else if (finalScore >= 55) { verdict = "NEEDS EDIT"; verdictColor = "amber"; chartLikelihood = "Genre-specific charts"; }
    else if (finalScore >= 35) { verdict = "RISKY"; verdictColor = "orange"; chartLikelihood = "Niche/streaming"; }

    return { score: finalScore, verdict, verdictColor, checks, formatFit, chartLikelihood };
  }, [rawLyrics, arrangement, duration]);

  // ========================================
  // ULTRA ENGINE (OFFLINE - NO API)
  // ========================================
  const [ultraOpen, setUltraOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [activeVariant, setActiveVariant] = useState(null);
  const [variantToast, setVariantToast] = useState("");
  const [labOpen, setLabOpen] = useState(false);
  const [labEmotion, setLabEmotion] = useState("longing");
  const [labResult, setLabResult] = useState(null);
  const [executiveOpen, setExecutiveOpen] = useState(false);
  const [archOpen, setArchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpQuestion, setHelpQuestion] = useState("");
  const [helpAnswer, setHelpAnswer] = useState("");
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpError, setHelpError] = useState("");
  const [helpHistory, setHelpHistory] = useState([]);

  // ===== NEW: 6 SUNO POWER TOOLS state =====
  // Tool 1: Reference Track Analyzer
  const [refAnalyzerOpen, setRefAnalyzerOpen] = useState(false);
  const [refTrackInput, setRefTrackInput] = useState("");
  const [refAnalyzerLoading, setRefAnalyzerLoading] = useState(false);
  const [refAnalyzerError, setRefAnalyzerError] = useState("");
  const [refAnalyzerResult, setRefAnalyzerResult] = useState(null);

  // Tool 2: Concept Expander
  const [conceptOpen, setConceptOpen] = useState(false);
  const [conceptInput, setConceptInput] = useState("");
  const [conceptLoading, setConceptLoading] = useState(false);
  const [conceptError, setConceptError] = useState("");
  const [conceptResult, setConceptResult] = useState(null);

  // Tool 3: Tag Optimizer
  const [tagOptOpen, setTagOptOpen] = useState(false);
  const [tagOptLoading, setTagOptLoading] = useState(false);
  const [tagOptError, setTagOptError] = useState("");
  const [tagOptResult, setTagOptResult] = useState(null);

  // Tool 4: Cover Reimaginer
  const [coverOpen, setCoverOpen] = useState(false);
  const [coverGenre, setCoverGenre] = useState("");
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [coverResult, setCoverResult] = useState("");

  // Tool 5: Translator
  const [translateOpen, setTranslateOpen] = useState(false);
  const [translateLang, setTranslateLang] = useState("Spanish");
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateError, setTranslateError] = useState("");
  const [translateResult, setTranslateResult] = useState("");

  // Tool 6: Critic
  const [criticOpen, setCriticOpen] = useState(false);
  const [criticLoading, setCriticLoading] = useState(false);
  const [criticError, setCriticError] = useState("");
  const [criticResult, setCriticResult] = useState(null);

  // ===== HOOK MAKER state =====
  const [hookOpen, setHookOpen] = useState(false);
  const [titleOpen, setTitleOpen] = useState(false);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [titleResults, setTitleResults] = useState([]);
  const [titleStyle, setTitleStyle] = useState("modern");

  // Transcription
  const [transcribeOpen, setTranscribeOpen] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [diagResult, setDiagResult] = useState("");
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeError, setTranscribeError] = useState("");
  const [transcript, setTranscript] = useState("");

  // Pitch contour
  const [pitchData, setPitchData] = useState([]);
  const [pitchAnalyzing, setPitchAnalyzing] = useState(false);
  // Pitch adjustments
  const [pitchTranspose, setPitchTranspose] = useState(0); // semitones
  const [pitchSmoothing, setPitchSmoothing] = useState(0); // 0-10 window size
  const [pitchSnapToKey, setPitchSnapToKey] = useState("none"); // "none" | "C major" | "A minor" etc
  const [pitchOctaveLock, setPitchOctaveLock] = useState(false);
  const [hookEmotion, setHookEmotion] = useState("longing");
  const [hookStyle, setHookStyle] = useState("");
  const [hookLoading, setHookLoading] = useState(false);
  const [hookError, setHookError] = useState("");
  const [hookResults, setHookResults] = useState([]);

  // ===== AI IMPROVE SELECTION state =====
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [selectedLyricText, setSelectedLyricText] = useState("");
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveError, setImproveError] = useState("");
  const [improveResult, setImproveResult] = useState(null);
  const lyricsTextareaRef = useRef(null);

  // ===== UI MODE — Tabs + Dark Mode =====
  const [activeTab, setActiveTab] = useState("write"); // write, score, audio, hits, output, help
  const [darkMode, setDarkMode] = useState(false);

  // Auto-detect iOS dark mode preference
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mq.matches);
    const handler = (e) => setDarkMode(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ===== HAPTIC FEEDBACK (iPhone vibration API) =====
  const haptic = (pattern = 10) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // ===== AUTO-SAVE to localStorage =====
  // Restore on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sunoBuilder_v1");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.rawLyrics) setRawLyrics(data.rawLyrics);
        if (data.title) setTitle(data.title);
        if (data.bpm) setBpm(data.bpm);
        if (data.songKey) setSongKey(data.songKey);
        if (data.duration) setDuration(data.duration);
        if (data.mood) setMood(data.mood);
        if (data.instruments) setInstruments(data.instruments);
        if (data.negativeTags) setNegativeTags(data.negativeTags);
        if (data.vocalGender) setVocalGender(data.vocalGender);
        if (data.selectedTags && Array.isArray(data.selectedTags)) setSelectedTags(new Set(data.selectedTags));
        if (data.arrangement) setArrangement(data.arrangement);
      }
    } catch (e) { /* ignore corrupt save */ }
  }, []);

  // Persist on changes (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem("sunoBuilder_v1", JSON.stringify({
          rawLyrics, title, bpm, songKey, duration, mood, instruments,
          negativeTags, vocalGender,
          selectedTags: [...selectedTags],
          arrangement,
        }));
      } catch (e) { /* quota / private mode */ }
    }, 500);
    return () => clearTimeout(id);
  }, [rawLyrics, title, bpm, songKey, duration, mood, instruments, negativeTags, vocalGender, selectedTags, arrangement]);

  // ===== iOS PWA META — injects into document head =====
  useEffect(() => {
    if (typeof document === "undefined") return;
    const ensureMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    ensureMeta("viewport", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no");
    ensureMeta("apple-mobile-web-app-capable", "yes");
    ensureMeta("apple-mobile-web-app-status-bar-style", darkMode ? "black-translucent" : "default");
    ensureMeta("theme-color", darkMode ? "#020617" : "#ffffff");
    ensureMeta("apple-mobile-web-app-title", "Suno Builder");
  }, [darkMode]);

  // Audio Playback Engine (port of AVAudioEngine for browser)
  const [audioOpen, setAudioOpen] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const [audioRate, setAudioRate] = useState(1.0);
  const [currentRMS, setCurrentRMS] = useState(0);
  const [peakRMS, setPeakRMS] = useState(0);
  const [coachAnalysis, setCoachAnalysis] = useState("");
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const rafRef = useRef(null);
  const audioRef = useRef(null);
  const bassFilterRef = useRef(null);
  const vocalFilterRef = useRef(null);
  const [bassGain, setBassGain] = useState(0); // -12 to +12 dB
  const [vocalGain, setVocalGain] = useState(0); // -12 to +12 dB

  // Wire EQ changes to live filters
  useEffect(() => {
    if (bassFilterRef.current) bassFilterRef.current.gain.value = bassGain;
  }, [bassGain]);
  useEffect(() => {
    if (vocalFilterRef.current) vocalFilterRef.current.gain.value = vocalGain;
  }, [vocalGain]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setAudioDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioFile]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = audioVolume;
  }, [audioVolume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = audioRate;
  }, [audioRate]);

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (audioFile) URL.revokeObjectURL(audioFile);
    const url = URL.createObjectURL(file);
    setAudioFile(url);
    setAudioFileName(file.name);
    setIsPlaying(false);
    setAudioCurrentTime(0);
  };

  // ===== VOCAL COACH — RMS analyser =====
  const vocalCoachAnalyze = (rms) => {
    if (rms < 0.15) return { msg: "Too quiet — increase vocal energy", level: "low", color: "yellow" };
    if (rms > 0.85) return { msg: "Too loud — clipping risk", level: "high", color: "red" };
    return { msg: "Vocal level is balanced", level: "balanced", color: "green" };
  };

  const setupAudioAnalyser = () => {
    if (!audioRef.current || analyserRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(audioRef.current);

      // REAL EQ chain: source → bassFilter → vocalFilter → analyser → destination
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = "lowshelf";
      bassFilter.frequency.value = 200; // bass shelf
      bassFilter.gain.value = 0;

      const vocalFilter = ctx.createBiquadFilter();
      vocalFilter.type = "peaking";
      vocalFilter.frequency.value = 2500; // vocal presence range
      vocalFilter.Q.value = 1.0;
      vocalFilter.gain.value = 0;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;

      source.connect(bassFilter);
      bassFilter.connect(vocalFilter);
      vocalFilter.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;
      bassFilterRef.current = bassFilter;
      vocalFilterRef.current = vocalFilter;
    } catch (err) {
      console.error("Audio analyser setup failed:", err);
    }
  };

  const sampleRMS = () => {
    if (!analyserRef.current) return;
    const buffer = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buffer);
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i] * buffer[i];
    const rms = Math.sqrt(sumSquares / buffer.length);
    setCurrentRMS(rms);
    setPeakRMS((p) => Math.max(p * 0.95, rms)); // peak with decay
    rafRef.current = requestAnimationFrame(sampleRMS);
  };

  // Start/stop sampling tied to playback
  useEffect(() => {
    if (isPlaying && analyserRef.current) {
      sampleRMS();
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  // Vocal coach analysis updates with RMS
  useEffect(() => {
    if (currentRMS > 0.001) {
      const result = vocalCoachAnalyze(peakRMS);
      setCoachAnalysis(result);
    }
  }, [peakRMS, currentRMS]);

  const togglePlay = () => {
    if (!audioRef.current || !audioFile) return;
    setupAudioAnalyser();
    // Resume audio context if suspended (browser autoplay policy)
    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("Playback error:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioDuration, audioRef.current.currentTime + seconds));
  };

  const seekTo = (e) => {
    if (!audioRef.current || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioDuration;
  };

  const clearAudio = () => {
    if (audioFile) URL.revokeObjectURL(audioFile);
    if (audioRef.current) audioRef.current.pause();
    setAudioFile(null);
    setAudioFileName("");
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setCurrentRMS(0);
    setPeakRMS(0);
    setCoachAnalysis("");
  };

  const fmtTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // ===== TRACK BLOCKS — Visual Timeline =====
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [trackBlocks, setTrackBlocks] = useState([]);
  const [blockNextId, setBlockNextId] = useState(1);
  const [editingBlock, setEditingBlock] = useState(null);
  const timelineDuration = useMemo(() => {
    if (audioDuration) return audioDuration;
    if (trackBlocks.length === 0) return 180; // default 3 min canvas
    const maxEnd = Math.max(...trackBlocks.map((b) => b.startTime + b.duration));
    return Math.max(180, maxEnd + 30);
  }, [audioDuration, trackBlocks]);

  const addTrackBlock = (name = "Section", startTime = 0, duration = 16) => {
    const newBlock = { id: blockNextId, name, startTime, duration };
    setTrackBlocks([...trackBlocks, newBlock]);
    setBlockNextId(blockNextId + 1);
  };

  const removeTrackBlock = (id) => setTrackBlocks(trackBlocks.filter((b) => b.id !== id));
  const updateTrackBlock = (id, field, value) => setTrackBlocks(trackBlocks.map((b) => b.id === id ? { ...b, [field]: value } : b));

  // ===== DAW ENGINE — moveTrack with drag =====
  const [dragState, setDragState] = useState(null); // { blockId, startX, originalStart, mode: 'move'|'resize' }
  const [snapEnabled, setSnapEnabled] = useState(true);
  const timelineRef = useRef(null);

  const moveTrack = (id, newStart) => {
    const snapped = snapEnabled ? Math.round(newStart * 2) / 2 : Math.round(newStart * 10) / 10; // snap to 0.5s
    setTrackBlocks((blocks) => blocks.map((b) => b.id === id ? { ...b, startTime: Math.max(0, snapped) } : b));
  };

  const resizeTrack = (id, newDuration) => {
    const snapped = snapEnabled ? Math.round(newDuration * 2) / 2 : Math.round(newDuration * 10) / 10;
    setTrackBlocks((blocks) => blocks.map((b) => b.id === id ? { ...b, duration: Math.max(0.5, snapped) } : b));
  };

  const handleBlockPointerDown = (e, block, mode) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBlock(block.id);
    setDragState({
      blockId: block.id,
      startX: e.clientX,
      originalStart: block.startTime,
      originalDuration: block.duration,
      mode,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragState.startX;
      const deltaSec = (deltaX / rect.width) * timelineDuration;

      if (dragState.mode === "move") {
        moveTrack(dragState.blockId, dragState.originalStart + deltaSec);
      } else if (dragState.mode === "resize") {
        resizeTrack(dragState.blockId, dragState.originalDuration + deltaSec);
      }
    };

    const handlePointerUp = () => setDragState(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragState, timelineDuration, snapEnabled]);

  const importFromArrangement = () => {
    if (arrangement.length === 0) return;
    let cursor = 0;
    let id = blockNextId;
    const newBlocks = arrangement.map((s) => {
      const [m, sec] = s.duration.split(":").map(Number);
      const dur = (m || 0) * 60 + (sec || 0);
      const block = { id: id++, name: s.type, startTime: cursor, duration: dur };
      cursor += dur;
      return block;
    });
    setTrackBlocks(newBlocks);
    setBlockNextId(id);
  };

  const blockColor = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("intro") || lower.includes("outro")) return "bg-slate-500";
    if (lower.includes("chorus") || lower.includes("hook")) return "bg-pink-500";
    if (lower.includes("pre")) return "bg-purple-500";
    if (lower.includes("verse")) return "bg-blue-500";
    if (lower.includes("bridge")) return "bg-amber-500";
    if (lower.includes("drop") || lower.includes("build") || lower.includes("breakdown")) return "bg-orange-500";
    if (lower.includes("solo")) return "bg-green-500";
    return "bg-cyan-500";
  };

  const [ultraToast, setUltraToast] = useState("");

  // Parse lyrics into sections
  const parsedSections = useMemo(() => {
    const sections = [];
    let current = null;
    const lines = rawLyrics.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      const tagMatch = trimmed.match(/^\[(.+?)\]/);
      if (tagMatch) {
        if (current) sections.push(current);
        const tag = tagMatch[1];
        const tagLower = tag.toLowerCase();
        let type = "VERSE";
        if (tagLower.includes("chorus")) type = "CHORUS";
        else if (tagLower.includes("bridge")) type = "BRIDGE";
        else if (tagLower.includes("intro")) type = "INTRO";
        else if (tagLower.includes("outro")) type = "OUTRO";
        else if (tagLower.includes("pre")) type = "PRE_CHORUS";
        else if (tagLower.includes("hook")) type = "CHORUS";
        current = { type, title: tag, lines: [], rawTag: trimmed };
      } else if (trimmed && current) {
        current.lines.push(trimmed);
      } else if (trimmed && !current) {
        // No tag yet — treat as orphan verse
        current = { type: "VERSE", title: "Verse", lines: [trimmed], rawTag: "[Verse]" };
      }
    }
    if (current) sections.push(current);
    return sections;
  }, [rawLyrics]);

  // Hook Score calculator
  const calculateHookScore = (lines) => {
    const text = lines.join(" ").toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 0;

    const emotionalWords = new Set([
      "love","heart","fall","stay","need","want","hold",
      "alone","forever","tonight","fire","dream","cry","break",
      "feel","wanna","gonna","baby","lonely","crazy","ride","high"
    ]);

    const repetitionMap = {};
    let emotionHits = 0;
    for (const w of words) {
      repetitionMap[w] = (repetitionMap[w] || 0) + 1;
      if (emotionalWords.has(w)) emotionHits++;
    }
    const repetitionScore = Object.values(repetitionMap).reduce((a, b) => a + (b > 1 ? b : 0), 0);
    const avgWordLength = words.reduce((a, w) => a + w.length, 0) / words.length;

    const score = repetitionScore * 0.6 + emotionHits * 1.2 + (10 - avgWordLength) * 0.25;
    return Math.max(0, Math.min(10, score));
  };

  // Hit Probability per section
  const calculateHitProbability = (section, hookScore) => {
    const chorusBoost = section.type === "CHORUS" ? 2 : 0;
    const shortLyricBoost = section.lines.join(" ").length < 300 ? 1 : 0;
    return Math.min(100, Math.round(hookScore * 8 + chorusBoost * 12 + shortLyricBoost * 6));
  };

  // Enriched sections with metrics
  const enrichedSections = useMemo(() => {
    return parsedSections.map((s) => {
      const hookScore = calculateHookScore(s.lines);
      const hitProb = calculateHitProbability(s, hookScore);
      return { ...s, hookScore: Math.round(hookScore * 10) / 10, hitProb, energyLevel: Math.round(hookScore * 10) };
    });
  }, [parsedSections]);

  // ===== PRODUCER BRAIN — section + emotion arrangement suggestions =====
  const [sectionEmotion, setSectionEmotion] = useState("neutral");

  const producerBrainSuggest = (sectionType, emotion) => {
    const t = (sectionType || "").toLowerCase();
    const e = (emotion || "neutral").toLowerCase();

    // CHORUS / HOOK
    if (t.includes("chorus") || t.includes("hook")) {
      if (e === "excited" || e === "euphoric" || e === "celebration") return "Add full drums + vocal stack 4-deep + tambourine. Sidechain everything to the kick.";
      if (e === "sad" || e === "melancholy" || e === "heartbreak") return "Half-time feel. Strings replace drums. Belt on the hook word.";
      if (e === "rage" || e === "aggressive") return "Distort the bus. Snare crack at every turnaround. Gang vocals 6-deep.";
      if (e === "longing" || e === "nostalgic") return "Vocal stack triples on the hook word. Extended decay reverb. Tape sat warmth.";
      if (e === "lust" || e === "romantic") return "Sub-bass pulse. Slow hi-hats. Pan vocal off-center. Breathy synth pad at 3kHz.";
      if (e === "triumph") return "Key change up a half-step. 4-deep gang vocals. Toms fill into the chorus.";
      return "Full drums + vocal stack + bright synth pad. Lift the energy.";
    }

    // VERSE
    if (t.includes("verse")) {
      if (e === "sad" || e === "melancholy" || e === "heartbreak") return "Strip to piano + vocal only. Bass drops out. Long pre-delay reverb.";
      if (e === "excited" || e === "euphoric") return "Drum machine + bass + minimal synth. Build energy toward pre-chorus.";
      if (e === "rage" || e === "aggressive") return "Punk drumming under rap-sung delivery. Aggressive close-mic. No autotune.";
      if (e === "longing" || e === "nostalgic") return "Acoustic guitar + brushed drums. Tape hiss. Cassette warmth.";
      if (e === "lust" || e === "romantic") return "Electric piano + finger-snap percussion. Intimate close-mic.";
      if (e === "triumph") return "Build with toms + bass walking up. Tease the chorus melody.";
      return "Standard rhythm section. Leave room for the vocal.";
    }

    // PRE-CHORUS
    if (t.includes("pre")) {
      if (e === "excited" || e === "euphoric") return "Snare roll. Riser. Drop the bass for 2 bars to slingshot into chorus.";
      if (e === "sad" || e === "melancholy") return "Strings swell. Drums drop out. Tension builds in the silence.";
      if (e === "rage") return "Stop-start dynamics. Cymbal swell. Almost too loud.";
      return "Build energy. Add a riser. Filter sweep into the chorus.";
    }

    // BRIDGE
    if (t.includes("bridge")) {
      if (e === "sad" || e === "melancholy" || e === "heartbreak") return "Reduce to vocal + sustained pad. Final emotional reset before the last chorus.";
      if (e === "excited" || e === "euphoric") return "Half-time breakdown. Build tension. Beat drops back in for the final chorus.";
      if (e === "rage") return "Drop bass. Whisper-to-scream dynamic. Slam the final chorus.";
      if (e === "triumph") return "Modulate up a step. Stack harmonies. Set up the key-change final.";
      return "Reduce instrumentation for contrast. Provide emotional pivot.";
    }

    // INTRO
    if (t.includes("intro")) {
      if (e === "excited" || e === "euphoric") return "Cold open with the hook melody on synth. 4 bars of buildup max.";
      if (e === "sad" || e === "melancholy") return "Lone piano motif. 8 bars to set the mood. Vocal enters quietly.";
      if (e === "rage") return "Riff-based cold open. No fade. Hit hard from bar 1.";
      return "Establish key + mood in 4-8 bars. Tease the hook melody.";
    }

    // OUTRO
    if (t.includes("outro")) {
      if (e === "sad" || e === "melancholy") return "Strip back to vocal + piano. Hard cold stop on the last word.";
      if (e === "excited" || e === "triumph") return "Repeat hook with full stack. Fade or cold cut on downbeat.";
      return "Hook repeat with progressive simplification. Hard stop or fade.";
    }

    // BUILD / DROP / BREAKDOWN
    if (t.includes("build")) return "White-noise riser. Rising filter. Snare roll doubles speed across 4 bars.";
    if (t.includes("drop")) return "Hit hard. Sub-bass + lead synth + sidechained pads. Visual silence first.";
    if (t.includes("breakdown")) return "Strip everything except the lead element. 4-8 bars of breathing room.";

    // SOLO
    if (t.includes("solo")) return "Drop vocal. Lead instrument takes spotlight. Rhythm section simplifies.";

    return "Balanced arrangement. Match the energy of surrounding sections.";
  };

  // Overall song hit probability (weighted average favoring chorus)
  const overallHitProb = useMemo(() => {
    if (enrichedSections.length === 0) return 0;
    let totalWeight = 0;
    let weighted = 0;
    enrichedSections.forEach((s) => {
      const w = s.type === "CHORUS" ? 3 : s.type === "PRE_CHORUS" ? 2 : 1;
      totalWeight += w;
      weighted += s.hitProb * w;
    });
    return Math.round(weighted / totalWeight);
  }, [enrichedSections]);

  // ===== EXECUTIVE PRODUCER — Final commercial verdict =====
  // Aggregates: Hit Rationalization stars, Radio Safety score, Hook score, Producer scores
  const executiveProducerScore = useMemo(() => {
    // Pull from all sub-engines and normalize to 0-1 scale
    const hitStars = (auditResult?.stars || 0) / 5; // 0-1
    const radioScore = (radioCheck?.score || 0) / 100; // 0-1
    const hookScore = overallHitProb / 100; // 0-1

    // Has lyrics check
    const hasLyrics = rawLyrics.trim().length > 50;
    const hasLyricsBonus = hasLyrics ? 0.1 : -0.2;

    // Has DNA tags
    const hasDNA = selectedTags.size >= 3;
    const hasDNABonus = hasDNA ? 0.05 : -0.15;

    // Weighted composite: hit audit (35%) + radio safety (25%) + hook strength (30%) + completeness (10%)
    let composite = (hitStars * 0.35) + (radioScore * 0.25) + (hookScore * 0.30) + 0.10;
    composite += hasLyricsBonus * 0.5;
    composite += hasDNABonus * 0.5;
    composite = Math.max(0, Math.min(1, composite));

    return composite;
  }, [auditResult, radioCheck, overallHitProb, rawLyrics, selectedTags]);

  const executiveFeedback = (score) => {
    // Direct port of Swift function with same thresholds
    if (score > 0.9) return {
      verdict: "GREENLIGHT",
      msg: "Ready for release",
      icon: "✅",
      color: "emerald",
      detail: "All metrics in commercial range. Ship it. Push to A&R + DSP partners.",
      action: "Submit to label"
    };
    if (score > 0.75) return {
      verdict: "REVISE",
      msg: "Improve hook and tighten intro",
      icon: "✏️",
      color: "yellow",
      detail: "Strong foundation but missing the final 15%. Sharpen the hook melody, trim the intro under 8 seconds.",
      action: "One more pass"
    };
    return {
      verdict: "REJECTED",
      msg: "Lacks commercial identity",
      icon: "❌",
      color: "red",
      detail: "No clear hook, weak format fit, or missing audience signal. Rebuild from a hit reference template.",
      action: "Back to drawing board"
    };
  };

  const execResult = useMemo(() => executiveFeedback(executiveProducerScore), [executiveProducerScore]);

  // Rewrite actions
  const ultraRewriteSection = (sectionIdx, action) => {
    const section = parsedSections[sectionIdx];
    if (!section) return;

    let newLines = [...section.lines];

    switch (action) {
      case "HOOK_BOOST": {
        const lastLine = newLines[newLines.length - 1];
        if (lastLine) newLines = [...newLines, lastLine, lastLine];
        break;
      }
      case "TIGHTEN":
        newLines = newLines.map((l) => l.split(" ").filter((w) => w.length > 2).join(" "));
        break;
      case "EMOTION":
        newLines = newLines.map((l) =>
          l.replace(/\byou\b/gi, "you and I")
           .replace(/\blove\b/gi, "deep love")
           .replace(/\bnight\b/gi, "lonely night")
        );
        break;
      case "RHYTHM":
        newLines = newLines.map((l) => l.replace(/\s+/g, " ").trim());
        break;
      case "RADIO_EDIT":
        newLines = newLines.slice(0, Math.max(4, Math.floor(newLines.length * 0.7)));
        break;
      case "VARIATIONS": {
        const lastLine = newLines[newLines.length - 1];
        newLines = [...newLines, "— ALT VERSION —", ...newLines, ...(lastLine ? [lastLine, lastLine] : [])];
        break;
      }
      default:
        break;
    }

    // Rebuild full lyrics by replacing this section
    const newLyrics = parsedSections.map((s, i) => {
      const linesToUse = i === sectionIdx ? newLines : s.lines;
      return `${s.rawTag}\n${linesToUse.join("\n")}`;
    }).join("\n\n");

    setRawLyrics(newLyrics);
    setUltraToast(`${action.replace("_", " ")} applied to ${section.title}`);
    setTimeout(() => setUltraToast(""), 2000);
  };

  const sectionTypeColor = (type) => {
    if (type === "CHORUS") return "bg-pink-100 text-pink-800 border-pink-300";
    if (type === "PRE_CHORUS") return "bg-purple-100 text-purple-800 border-purple-300";
    if (type === "BRIDGE") return "bg-amber-100 text-amber-800 border-amber-300";
    if (type === "VERSE") return "bg-blue-100 text-blue-800 border-blue-300";
    if (type === "INTRO" || type === "OUTRO") return "bg-slate-100 text-slate-700 border-slate-300";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  const probColor = (p) => {
    if (p >= 70) return "text-green-600";
    if (p >= 50) return "text-yellow-600";
    if (p >= 30) return "text-orange-600";
    return "text-red-600";
  };



  const durations = ["0:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00"];
  const moods = ["energetic", "melancholy", "euphoric", "dark", "romantic", "aggressive", "dreamy", "nostalgic", "triumphant", "tense"];
  const vocalOptions = ["male lead", "female lead", "duet", "group vocals", "no vocals"];

  const hitsLibrary = [
    { title: "Blinding Lights", artist: "The Weeknd", year: 2019, genre: "pop", bpm: 171, key: "F minor", duration: "3:20", mood: "energetic", vocal: "male lead", instruments: "synth bass, drum machine, retro synths, electric piano",
      structure: "EDM Drop",
      dna: ["synthwave retro", "80s synth pop revival", "sidechained synth pads", "Max Martin chorus architecture", "wide stereo field", "falsetto hook"] },
    { title: "Bad Guy", artist: "Billie Eilish", year: 2019, genre: "pop", bpm: 135, key: "G minor", duration: "3:14", mood: "dark", vocal: "female lead", instruments: "808 sub-bass, finger snaps, minimal synth",
      structure: "Pop Standard",
      dna: ["Finneas intimate production", "minimal bedroom pop", "whispered delivery", "sub-bass pulse", "intimate close-mic", "sparse arrangement"] },
    { title: "Rolling in the Deep", artist: "Adele", year: 2010, genre: "pop", bpm: 105, key: "C minor", duration: "3:48", mood: "triumphant", vocal: "female lead", instruments: "acoustic guitar, drums, piano, gospel choir",
      structure: "Ballad",
      dna: ["Paul Epworth live-room production", "soul-pop hybrid", "belted anthemic chorus", "Tom Elmhirst vintage vocal chain", "gospel-style gang vocals"] },
    { title: "Sicko Mode", artist: "Travis Scott", year: 2018, genre: "hip-hop", bpm: 155, key: "C# minor", duration: "5:12", mood: "dark", vocal: "male lead", instruments: "808s, trap drums, synth pads",
      structure: "Hip-Hop",
      dna: ["Mike Dean low-end focus", "trap-rock hybrid", "sub-bass pulse", "pitched background oohs", "dark trap atmosphere"] },
    { title: "HUMBLE.", artist: "Kendrick Lamar", year: 2017, genre: "hip-hop", bpm: 150, key: "F# minor", duration: "2:57", mood: "aggressive", vocal: "male lead", instruments: "808s, piano, trap drums",
      structure: "Hip-Hop",
      dna: ["Mike Will Made It hard trap", "minimal piano hook", "dry upfront vocal", "aggressive delivery", "sparse arrangement"] },
    { title: "Mr. Brightside", artist: "The Killers", year: 2003, genre: "rock", bpm: 148, key: "D major", duration: "3:42", mood: "energetic", vocal: "male lead", instruments: "electric guitar, bass, drums, synth",
      structure: "Rock Anthem",
      dna: ["Jeff Saltzman indie-rock production", "arena rock anthem", "synth-driven post-punk", "belted anthemic chorus", "wide stereo field"] },
    { title: "Seven Nation Army", artist: "The White Stripes", year: 2003, genre: "rock", bpm: 124, key: "E minor", duration: "3:51", mood: "aggressive", vocal: "male lead", instruments: "electric guitar, drums, bass-effect guitar",
      structure: "Rock Anthem",
      dna: ["Jack White raw analog", "minimal blues-rock", "dry raw mix", "tape saturation", "garage rock energy"] },
    { title: "Crazy in Love", artist: "Beyoncé", year: 2003, genre: "r&b", bpm: 99, key: "D minor", duration: "3:56", mood: "energetic", vocal: "female lead", instruments: "horns, drums, bass, hi-hats",
      structure: "Pop Standard",
      dna: ["Rich Harrison horn-driven R&B", "live horn section", "call-and-response chant", "gospel-style gang vocals"] },
    { title: "Titanium", artist: "David Guetta ft. Sia", year: 2011, genre: "edm", bpm: 126, key: "Eb major", duration: "4:05", mood: "triumphant", vocal: "female lead", instruments: "synth lead, electronic drums, piano",
      structure: "EDM Drop",
      dna: ["David Guetta big-room house", "festival EDM drop", "white-noise risers", "sidechained synth pads", "filter sweep transitions"] },
    { title: "Anti-Hero", artist: "Taylor Swift", year: 2022, genre: "pop", bpm: 97, key: "E major", duration: "3:20", mood: "melancholy", vocal: "female lead", instruments: "synth pads, drum machine, electric guitar",
      structure: "Pop Standard",
      dna: ["Jack Antonoff atmospheric build", "synth-pop confessional", "intimate close-mic", "wide stereo field", "dreamy indie-rock"] },
    { title: "As It Was", artist: "Harry Styles", year: 2022, genre: "pop", bpm: 174, key: "A major", duration: "2:47", mood: "nostalgic", vocal: "male lead", instruments: "synth bass, drum machine, retro synths",
      structure: "Pop Standard",
      dna: ["Kid Harpoon pop-rock", "80s synth pop revival", "breathy intimate vocal", "dreamy indie-rock"] },
    { title: "Espresso", artist: "Sabrina Carpenter", year: 2024, genre: "pop", bpm: 104, key: "A minor", duration: "2:55", mood: "euphoric", vocal: "female lead", instruments: "disco bass, claves, electric piano, drums",
      structure: "Pop Standard",
      dna: ["Julian Bunetta disco-pop", "breathy intimate vocal", "retro disco funk", "sidechained synth pads", "bright pop polish"] },
    { title: "Flowers", artist: "Miley Cyrus", year: 2023, genre: "pop", bpm: 118, key: "A minor", duration: "3:20", mood: "triumphant", vocal: "female lead", instruments: "electric guitar, bass, drums, synth pads",
      structure: "Pop Standard",
      dna: ["Kid Harpoon pop-rock", "belted anthemic chorus", "disco-pop revival", "wide stereo field"] },
    { title: "Kill Bill", artist: "SZA", year: 2022, genre: "r&b", bpm: 89, key: "B minor", duration: "2:33", mood: "dark", vocal: "female lead", instruments: "808s, electric guitar, sub-bass",
      structure: "Pop Standard",
      dna: ["Rob Bisel alt-R&B production", "intimate close-mic", "neo-soul", "sub-bass pulse"] },
    { title: "Take Me to Church", artist: "Hozier", year: 2013, genre: "alt", bpm: 129, key: "E minor", duration: "4:01", mood: "tense", vocal: "male lead", instruments: "piano, drums, organ, gospel choir",
      structure: "Ballad",
      dna: ["Rob Kirwan gospel-soul production", "Hammond organ", "belted anthemic chorus", "gospel-style gang vocals", "build + release dynamics"] },

    // ===== MORE POP =====
    { title: "Shape of You", artist: "Ed Sheeran", year: 2017, genre: "pop", bpm: 96, key: "C# minor", duration: "3:53", mood: "energetic", vocal: "male lead", instruments: "marimba, clap, drums, guitar",
      structure: "Pop Standard",
      dna: ["Steve Mac dancehall-pop", "marimba hook", "tropical house lite", "intimate close-mic", "minimal arrangement", "topline hook-first"] },
    { title: "Levitating", artist: "Dua Lipa", year: 2020, genre: "pop", bpm: 103, key: "B minor", duration: "3:23", mood: "euphoric", vocal: "female lead", instruments: "disco bass, claps, retro synths, electric piano",
      structure: "Pop Standard",
      dna: ["Koz disco-pop production", "Studio 54 revival", "sidechained synth pads", "belted anthemic chorus", "wide stereo field"] },
    { title: "Watermelon Sugar", artist: "Harry Styles", year: 2019, genre: "pop", bpm: 95, key: "C major", duration: "2:54", mood: "euphoric", vocal: "male lead", instruments: "electric guitar, bass, drums, horns",
      structure: "Pop Standard",
      dna: ["Kid Harpoon pop-rock", "70s soft rock revival", "live horn section", "warm analog", "breathy intimate vocal"] },
    { title: "Dance Monkey", artist: "Tones and I", year: 2019, genre: "pop", bpm: 98, key: "F# minor", duration: "3:29", mood: "energetic", vocal: "female lead", instruments: "piano, kick drum, claps, synth",
      structure: "Pop Standard",
      dna: ["Konstantin Kersting bedroom-pop", "minimal piano hook", "raspy delivery", "loop-based production", "viral hook architecture"] },
    { title: "Stay", artist: "The Kid LAROI & Justin Bieber", year: 2021, genre: "pop", bpm: 170, key: "F minor", duration: "2:21", mood: "melancholy", vocal: "duet", instruments: "synth pads, drum machine, electric guitar",
      structure: "Pop Standard",
      dna: ["Charlie Puth production", "hyperpop-adjacent", "auto-tuned shine", "sub-bass pulse", "drum machine pop"] },
    { title: "Bad Habits", artist: "Ed Sheeran", year: 2021, genre: "pop", bpm: 126, key: "B minor", duration: "3:51", mood: "energetic", vocal: "male lead", instruments: "synth bass, drum machine, retro synths",
      structure: "Pop Standard",
      dna: ["Fred Again synth-pop", "80s pop revival", "sidechained synth pads", "wide stereo field", "anthemic pre-chorus lift"] },
    { title: "Shallow", artist: "Lady Gaga & Bradley Cooper", year: 2018, genre: "pop", bpm: 96, key: "G major", duration: "3:36", mood: "triumphant", vocal: "duet", instruments: "acoustic guitar, piano, drums, strings",
      structure: "Ballad",
      dna: ["Benjamin Rice live-room production", "country-rock crossover", "belted anthemic chorus", "build + release dynamics", "intimate to anthem dynamics"] },
    { title: "Cruel Summer", artist: "Taylor Swift", year: 2019, genre: "pop", bpm: 170, key: "A major", duration: "2:58", mood: "energetic", vocal: "female lead", instruments: "synth bass, drum machine, electric guitar",
      structure: "Pop Standard",
      dna: ["Jack Antonoff atmospheric build", "St. Vincent co-write", "synth-pop punch", "sidechained synth pads", "anthemic pre-chorus lift"] },
    { title: "Vampire", artist: "Olivia Rodrigo", year: 2023, genre: "pop", bpm: 138, key: "F major", duration: "3:39", mood: "tense", vocal: "female lead", instruments: "piano, drums, electric guitar, strings",
      structure: "Ballad",
      dna: ["Daniel Nigro alt-pop", "piano-driven build", "rock catharsis ending", "build + release dynamics", "raspy delivery"] },
    { title: "Greedy", artist: "Tate McRae", year: 2023, genre: "pop", bpm: 110, key: "A minor", duration: "2:11", mood: "energetic", vocal: "female lead", instruments: "drum machine, synth bass, claps",
      structure: "Pop Standard",
      dna: ["Ryan Tedder pop production", "minimal dance-pop", "breathy intimate vocal", "tight punchy kick", "TikTok-optimized hook"] },
    { title: "Shivers", artist: "Ed Sheeran", year: 2021, genre: "pop", bpm: 141, key: "B major", duration: "3:27", mood: "euphoric", vocal: "male lead", instruments: "drum machine, synth, acoustic guitar",
      structure: "Pop Standard",
      dna: ["Steve Mac uplift pop", "tropical pop", "Max Martin chorus architecture", "wide stereo field", "anthemic pre-chorus lift"] },

    // ===== MORE HIP-HOP =====
    { title: "In Da Club", artist: "50 Cent", year: 2003, genre: "hip-hop", bpm: 90, key: "C minor", duration: "3:13", mood: "energetic", vocal: "male lead", instruments: "synth bass, drums, strings",
      structure: "Hip-Hop",
      dna: ["Dr. Dre West Coast production", "G-Unit era", "minimal string hook", "tight punchy kick", "club-rap anthem"] },
    { title: "Empire State of Mind", artist: "Jay-Z ft. Alicia Keys", year: 2009, genre: "hip-hop", bpm: 86, key: "F major", duration: "4:36", mood: "triumphant", vocal: "duet", instruments: "piano, drums, strings",
      structure: "Hip-Hop",
      dna: ["Al Shux production", "piano-driven hip-hop", "anthemic pre-chorus lift", "Alicia Keys topline", "cinematic strings"] },
    { title: "Money Trees", artist: "Kendrick Lamar", year: 2012, genre: "hip-hop", bpm: 145, key: "C# minor", duration: "6:26", mood: "dark", vocal: "male lead", instruments: "guitar loop, sub-bass, drums",
      structure: "Hip-Hop",
      dna: ["DJ Dahi atmospheric production", "reverse guitar loop", "West Coast rap", "intimate close-mic", "dreamy hip-hop"] },
    { title: "Mask Off", artist: "Future", year: 2017, genre: "hip-hop", bpm: 75, key: "C minor", duration: "3:24", mood: "dark", vocal: "male lead", instruments: "flute sample, 808s, trap drums",
      structure: "Hip-Hop",
      dna: ["Metro Boomin dark trap", "flute sample hook", "808 focus", "sparse arrangement", "atmospheric trap"] },
    { title: "Lucid Dreams", artist: "Juice WRLD", year: 2018, genre: "hip-hop", bpm: 84, key: "C# minor", duration: "3:59", mood: "melancholy", vocal: "male lead", instruments: "guitar sample, 808s, hi-hats",
      structure: "Hip-Hop",
      dna: ["Nick Mira emo-rap production", "Sting sample interpolation", "melodic rap", "sub-bass pulse", "auto-tuned shine"] },
    { title: "Industry Baby", artist: "Lil Nas X & Jack Harlow", year: 2021, genre: "hip-hop", bpm: 150, key: "F major", duration: "3:32", mood: "triumphant", vocal: "duet", instruments: "horns, 808s, trap drums",
      structure: "Hip-Hop",
      dna: ["Take A Daytrip production", "Kanye West co-production", "marching band horns", "anthemic trap", "call-and-response chant"] },
    { title: "First Person Shooter", artist: "Drake & J. Cole", year: 2023, genre: "hip-hop", bpm: 75, key: "G minor", duration: "4:11", mood: "aggressive", vocal: "duet", instruments: "808s, piano, trap drums",
      structure: "Hip-Hop",
      dna: ["Conductor Williams hard trap", "Boi-1da co-production", "minimal piano hook", "808 focus", "battle-rap energy"] },

    // ===== MORE ROCK =====
    { title: "Bohemian Rhapsody", artist: "Queen", year: 1975, genre: "rock", bpm: 72, key: "Bb major", duration: "5:55", mood: "tense", vocal: "male lead", instruments: "piano, electric guitar, drums, bass, vocal stack",
      structure: "Rock Anthem",
      dna: ["Roy Thomas Baker layered production", "Queen multi-tracking", "operatic vocal harmonies", "tape saturation", "build + release dynamics"] },
    { title: "Wonderwall", artist: "Oasis", year: 1995, genre: "rock", bpm: 87, key: "F# minor", duration: "4:18", mood: "nostalgic", vocal: "male lead", instruments: "acoustic guitar, drums, mellotron, cello",
      structure: "Rock Anthem",
      dna: ["Owen Morris Britpop production", "acoustic-driven", "wall of guitars", "mellotron warmth", "anthemic chorus"] },
    { title: "Sweet Child O' Mine", artist: "Guns N' Roses", year: 1987, genre: "rock", bpm: 125, key: "D major", duration: "5:56", mood: "triumphant", vocal: "male lead", instruments: "electric guitar, bass, drums",
      structure: "Rock Anthem",
      dna: ["Mike Clink hard rock production", "Slash guitar tone", "iconic riff hook", "Sunset Strip rock", "guitar solo feature"] },
    { title: "High Hopes", artist: "Panic! at the Disco", year: 2018, genre: "rock", bpm: 82, key: "Bb major", duration: "3:11", mood: "triumphant", vocal: "male lead", instruments: "horns, piano, drums, bass",
      structure: "Rock Anthem",
      dna: ["Jonas Jeberg pop-rock production", "horn-driven anthem", "belted anthemic chorus", "trap-influenced drums", "anthemic pre-chorus lift"] },
    { title: "Believer", artist: "Imagine Dragons", year: 2017, genre: "rock", bpm: 125, key: "B minor", duration: "3:24", mood: "aggressive", vocal: "male lead", instruments: "drums, bass, electric guitar, synth",
      structure: "Rock Anthem",
      dna: ["Mattman & Robin pop-rock", "stomp-clap anthem", "alt-rock crossover", "tribal drums", "punchy bus compression"] },
    { title: "Welcome to the Black Parade", artist: "My Chemical Romance", year: 2006, genre: "rock", bpm: 96, key: "G major", duration: "5:11", mood: "triumphant", vocal: "male lead", instruments: "piano, electric guitar, drums, bass",
      structure: "Rock Anthem",
      dna: ["Rob Cavallo emo-rock production", "Queen-influenced suite", "marching drums", "theatrical build", "build + release dynamics"] },

    // ===== MORE R&B =====
    { title: "End of the Road", artist: "Boyz II Men", year: 1992, genre: "r&b", bpm: 67, key: "Db major", duration: "5:50", mood: "melancholy", vocal: "group vocals", instruments: "piano, drums, bass, strings",
      structure: "Ballad",
      dna: ["Babyface ballad production", "new jack swing era", "group vocal harmonies", "lush strings", "intimate close-mic"] },
    { title: "Adorn", artist: "Miguel", year: 2012, genre: "r&b", bpm: 105, key: "Eb major", duration: "3:13", mood: "romantic", vocal: "male lead", instruments: "synth bass, drum machine, electric piano",
      structure: "Pop Standard",
      dna: ["Miguel minimal R&B", "Prince-influenced production", "falsetto hook", "intimate close-mic", "neo-soul"] },
    { title: "Earned It", artist: "The Weeknd", year: 2015, genre: "r&b", bpm: 99, key: "B minor", duration: "4:37", mood: "dark", vocal: "male lead", instruments: "strings, drums, bass, piano",
      structure: "Ballad",
      dna: ["Stephan Moccio cinematic R&B", "James Bond-style strings", "intimate close-mic", "build + release dynamics", "dark romantic"] },
    { title: "Snooze", artist: "SZA", year: 2022, genre: "r&b", bpm: 142, key: "C# minor", duration: "3:21", mood: "romantic", vocal: "female lead", instruments: "guitar, drums, bass, synth pads",
      structure: "Pop Standard",
      dna: ["Babyface co-write", "Leon Thomas production", "guitar-driven R&B", "intimate close-mic", "neo-soul"] },

    // ===== MORE EDM =====
    { title: "Animals", artist: "Martin Garrix", year: 2013, genre: "edm", bpm: 128, key: "F minor", duration: "5:08", mood: "energetic", vocal: "no vocals", instruments: "synth lead, kick drum, bass, percussion",
      structure: "EDM Drop",
      dna: ["Martin Garrix big-room", "festival main stage", "metallic synth lead", "white-noise risers", "festival EDM drop"] },
    { title: "Closer", artist: "The Chainsmokers ft. Halsey", year: 2016, genre: "edm", bpm: 95, key: "Ab major", duration: "4:05", mood: "nostalgic", vocal: "duet", instruments: "synth, drum machine, electric piano",
      structure: "EDM Drop",
      dna: ["The Chainsmokers future bass", "tropical pop", "vocal-driven drop", "sidechained synth pads", "wide stereo field"] },
    { title: "Wake Me Up", artist: "Avicii", year: 2013, genre: "edm", bpm: 124, key: "B minor", duration: "4:09", mood: "triumphant", vocal: "male lead", instruments: "acoustic guitar, banjo, drum machine, synth",
      structure: "EDM Drop",
      dna: ["Avicii folk-EDM", "Aloe Blacc topline", "country-EDM crossover", "anthemic synth lead", "festival EDM drop"] },
    { title: "Stay", artist: "Zedd & Alessia Cara", year: 2017, genre: "edm", bpm: 102, key: "F minor", duration: "3:30", mood: "melancholy", vocal: "female lead", instruments: "drum machine, synth, piano",
      structure: "EDM Drop",
      dna: ["Zedd progressive house", "Alessia Cara topline", "minimal vocal-led EDM", "sidechained synth pads", "intimate close-mic"] },

    // ===== COUNTRY =====
    { title: "Body Like a Back Road", artist: "Sam Hunt", year: 2017, genre: "country", bpm: 100, key: "Bb major", duration: "2:45", mood: "romantic", vocal: "male lead", instruments: "acoustic guitar, drums, bass",
      structure: "Pop Standard",
      dna: ["Zach Crowell country-pop", "minimal arrangement", "talk-sing delivery", "country-trap hybrid", "Nashville polish"] },
    { title: "The Good Ones", artist: "Gabby Barrett", year: 2020, genre: "country", bpm: 132, key: "Eb major", duration: "3:00", mood: "romantic", vocal: "female lead", instruments: "acoustic guitar, drums, bass, fiddle",
      structure: "Ballad",
      dna: ["Ross Copperman country-pop", "modern Nashville", "belted anthemic chorus", "anthemic pre-chorus lift", "slick Nashville mix"] },
    { title: "Tennessee Whiskey", artist: "Chris Stapleton", year: 2015, genre: "country", bpm: 70, key: "A major", duration: "4:53", mood: "nostalgic", vocal: "male lead", instruments: "electric guitar, organ, bass, drums",
      structure: "Ballad",
      dna: ["Dave Cobb organic production", "outlaw country revival", "soul-country hybrid", "raspy delivery", "Hammond organ"] },

    // ===== ALT / INDIE =====
    { title: "Pumped Up Kicks", artist: "Foster the People", year: 2010, genre: "alt", bpm: 128, key: "F major", duration: "3:59", mood: "dark", vocal: "male lead", instruments: "synth bass, drum machine, whistle, claps",
      structure: "Pop Standard",
      dna: ["Mark Foster indie-pop production", "lo-fi bedroom aesthetic", "whistle hook", "sidechained synth pads", "dreamy indie-rock"] },
    { title: "Ho Hey", artist: "The Lumineers", year: 2012, genre: "alt", bpm: 80, key: "C major", duration: "2:43", mood: "nostalgic", vocal: "duet", instruments: "acoustic guitar, drums, piano, bass",
      structure: "Pop Standard",
      dna: ["Ryan Hadlock folk-rock production", "stomp-clap folk", "call-and-response chant", "live-room sound", "minimal arrangement"] },
    { title: "Riptide", artist: "Vance Joy", year: 2013, genre: "alt", bpm: 102, key: "Ab major", duration: "3:24", mood: "nostalgic", vocal: "male lead", instruments: "ukulele, drums, bass, electric guitar",
      structure: "Pop Standard",
      dna: ["Edwin White indie-folk production", "ukulele-driven", "intimate close-mic", "warm analog", "Triple J indie sound"] },
    { title: "Heat Waves", artist: "Glass Animals", year: 2020, genre: "alt", bpm: 81, key: "B major", duration: "3:58", mood: "dreamy", vocal: "male lead", instruments: "synth, drums, bass, percussion",
      structure: "Pop Standard",
      dna: ["Dave Bayley dream-pop production", "psychedelic indie", "sidechained synth pads", "intimate close-mic", "dreamy indie-rock"] },
    { title: "Mr. Blue Sky", artist: "Electric Light Orchestra", year: 1977, genre: "alt", bpm: 174, key: "F major", duration: "5:03", mood: "euphoric", vocal: "male lead", instruments: "piano, strings, vocoder, drums, bass",
      structure: "Rock Anthem",
      dna: ["Jeff Lynne layered production", "ELO orchestral pop", "vocoder accents", "Beatles-influenced harmonies", "wide stereo field"] },

    // ===== BOY BANDS =====
    { title: "I Want It That Way", artist: "Backstreet Boys", year: 1999, genre: "pop", bpm: 99, key: "A major", duration: "3:33", mood: "romantic", vocal: "group vocals", instruments: "acoustic guitar, drums, synth pads, strings",
      structure: "Pop Standard",
      dna: ["Max Martin chorus architecture", "late-90s teen pop", "5-part harmony stack", "Cheiron Studios production", "anthemic pre-chorus lift"] },
    { title: "Bye Bye Bye", artist: "*NSYNC", year: 2000, genre: "pop", bpm: 172, key: "C# minor", duration: "3:20", mood: "energetic", vocal: "group vocals", instruments: "synth bass, drum machine, strings, claps",
      structure: "Pop Standard",
      dna: ["Max Martin chorus architecture", "Kristian Lundin co-production", "late-90s teen pop", "5-part harmony stack", "punchy radio mix"] },
    { title: "What Makes You Beautiful", artist: "One Direction", year: 2011, genre: "pop", bpm: 124, key: "E major", duration: "3:23", mood: "euphoric", vocal: "group vocals", instruments: "electric guitar, drums, bass, synth",
      structure: "Pop Standard",
      dna: ["Carl Falk pop-rock production", "Rami Yacoub co-production", "boy band pop-rock revival", "anthemic pre-chorus lift", "harmonized chorus"] },
    { title: "Story of My Life", artist: "One Direction", year: 2013, genre: "pop", bpm: 122, key: "A major", duration: "4:06", mood: "nostalgic", vocal: "group vocals", instruments: "acoustic guitar, drums, strings, piano",
      structure: "Pop Standard",
      dna: ["Julian Bunetta production", "Mumford & Sons-influenced pop", "stomp-clap folk-pop", "5-part harmony stack", "build + release dynamics"] },
    { title: "MMMBop", artist: "Hanson", year: 1997, genre: "pop", bpm: 145, key: "A major", duration: "4:28", mood: "euphoric", vocal: "group vocals", instruments: "drums, bass, electric guitar, piano",
      structure: "Pop Standard",
      dna: ["Dust Brothers production", "90s power pop", "sibling harmony stack", "punchy radio mix", "wide stereo field"] },
    { title: "It's Gonna Be Me", artist: "*NSYNC", year: 2000, genre: "pop", bpm: 84, key: "F minor", duration: "3:11", mood: "romantic", vocal: "group vocals", instruments: "synth bass, drum machine, electric piano, strings",
      structure: "Pop Standard",
      dna: ["Max Martin chorus architecture", "Cheiron Studios production", "Eurodance pop", "5-part harmony stack", "tight punchy kick"] },
    { title: "Drag Me Down", artist: "One Direction", year: 2015, genre: "pop", bpm: 138, key: "A minor", duration: "3:13", mood: "energetic", vocal: "group vocals", instruments: "drum machine, bass, synth pads, electric guitar",
      structure: "Pop Standard",
      dna: ["Julian Bunetta production", "John Ryan co-production", "alt-pop maturity", "harmonized chorus", "wide stereo field"] },
    { title: "Larger Than Life", artist: "Backstreet Boys", year: 1999, genre: "pop", bpm: 91, key: "Eb minor", duration: "3:53", mood: "triumphant", vocal: "group vocals", instruments: "synth bass, drum machine, strings, electric guitar",
      structure: "Pop Standard",
      dna: ["Max Martin chorus architecture", "Cheiron Studios production", "stadium teen pop", "5-part harmony stack", "anthemic pre-chorus lift"] },

    // ===== GIRL GROUPS =====
    { title: "Wannabe", artist: "Spice Girls", year: 1996, genre: "pop", bpm: 110, key: "C major", duration: "2:53", mood: "energetic", vocal: "group vocals", instruments: "piano, drums, bass, synth",
      structure: "Pop Standard",
      dna: ["Matt Rowe production", "Richard Stannard co-production", "90s girl power pop", "call-and-response chant", "5-part vocal trade-off"] },
    { title: "Say My Name", artist: "Destiny's Child", year: 1999, genre: "r&b", bpm: 138, key: "F# minor", duration: "4:31", mood: "tense", vocal: "group vocals", instruments: "synth bass, drum machine, claps, hi-hats",
      structure: "Pop Standard",
      dna: ["Rodney Jerkins R&B production", "Darkchild signature sound", "late-90s R&B", "harmonized hook", "tight punchy kick"] },
    { title: "Waterfalls", artist: "TLC", year: 1995, genre: "r&b", bpm: 81, key: "Bb major", duration: "4:38", mood: "melancholy", vocal: "group vocals", instruments: "horns, drums, bass, electric piano",
      structure: "Pop Standard",
      dna: ["Organized Noize production", "Atlanta R&B", "live horn section", "social-conscious R&B", "harmonized chorus"] },
    { title: "Survivor", artist: "Destiny's Child", year: 2001, genre: "r&b", bpm: 80, key: "D minor", duration: "4:13", mood: "triumphant", vocal: "group vocals", instruments: "synth bass, drum machine, percussion",
      structure: "Pop Standard",
      dna: ["Anthony Dent production", "Beyoncé co-write", "empowerment R&B", "harmonized chorus", "tight punchy kick"] },
    { title: "Worth It", artist: "Fifth Harmony", year: 2015, genre: "pop", bpm: 100, key: "A minor", duration: "3:45", mood: "energetic", vocal: "group vocals", instruments: "saxophone, drum machine, synth bass",
      structure: "Pop Standard",
      dna: ["Stargate production", "saxophone hook", "Latin-pop fusion", "5-part harmony stack", "tight punchy kick"] },
    { title: "Bang Bang", artist: "Jessie J, Ariana Grande, Nicki Minaj", year: 2014, genre: "pop", bpm: 150, key: "A minor", duration: "3:19", mood: "energetic", vocal: "group vocals", instruments: "drum machine, synth bass, brass stabs",
      structure: "Pop Standard",
      dna: ["Max Martin chorus architecture", "Savan Kotecha co-write", "powerhouse vocal trade-off", "anthemic pre-chorus lift", "Vegas pop"] },

    // ===== ROCK BANDS =====
    { title: "Don't Stop Believin'", artist: "Journey", year: 1981, genre: "rock", bpm: 119, key: "E major", duration: "4:11", mood: "triumphant", vocal: "group vocals", instruments: "piano, electric guitar, drums, bass",
      structure: "Rock Anthem",
      dna: ["Mike Stone production", "arena rock anthem", "iconic piano riff", "Steve Perry vocal style", "anthemic pre-chorus lift"] },
    { title: "Eye of the Tiger", artist: "Survivor", year: 1982, genre: "rock", bpm: 109, key: "C minor", duration: "4:04", mood: "triumphant", vocal: "group vocals", instruments: "electric guitar, drums, bass, synth",
      structure: "Rock Anthem",
      dna: ["Frankie Sullivan production", "80s arena rock", "iconic guitar riff", "training montage rock", "punchy bus compression"] },
    { title: "Africa", artist: "Toto", year: 1982, genre: "rock", bpm: 92, key: "B minor", duration: "4:55", mood: "nostalgic", vocal: "group vocals", instruments: "synth, drums, bass, marimba, strings",
      structure: "Rock Anthem",
      dna: ["David Paich layered production", "Toto session-musician precision", "African percussion", "harmonized chorus", "wide stereo field"] },
    { title: "Mr. Brightside", artist: "The Killers", year: 2003, genre: "rock", bpm: 148, key: "D major", duration: "3:42", mood: "energetic", vocal: "group vocals", instruments: "electric guitar, bass, drums, synth",
      structure: "Rock Anthem",
      dna: ["Jeff Saltzman indie-rock production", "arena rock anthem", "synth-driven post-punk", "belted anthemic chorus", "wide stereo field"] },
    { title: "Stacy's Mom", artist: "Fountains of Wayne", year: 2003, genre: "rock", bpm: 122, key: "E major", duration: "3:17", mood: "energetic", vocal: "group vocals", instruments: "electric guitar, bass, drums, organ",
      structure: "Rock Anthem",
      dna: ["Adam Schlesinger power-pop", "Cars-influenced production", "90s power pop", "punchy bus compression", "harmonized chorus"] },
    { title: "Viva La Vida", artist: "Coldplay", year: 2008, genre: "rock", bpm: 138, key: "Ab major", duration: "4:01", mood: "triumphant", vocal: "group vocals", instruments: "strings, drums, piano, bass",
      structure: "Rock Anthem",
      dna: ["Brian Eno production", "Markus Dravs co-production", "string-driven anthem", "anthemic chorus", "build + release dynamics"] },

    // ===== K-POP GROUPS =====
    { title: "Dynamite", artist: "BTS", year: 2020, genre: "pop", bpm: 114, key: "F# minor", duration: "3:19", mood: "euphoric", vocal: "group vocals", instruments: "disco bass, drum machine, brass, electric piano",
      structure: "Pop Standard",
      dna: ["David Stewart disco-pop", "K-pop crossover", "retro disco funk", "7-part harmony stack", "bright pop polish"] },
    { title: "How You Like That", artist: "BLACKPINK", year: 2020, genre: "pop", bpm: 130, key: "C minor", duration: "3:01", mood: "aggressive", vocal: "group vocals", instruments: "808s, brass stabs, synth bass, trap drums",
      structure: "Pop Standard",
      dna: ["Teddy Park K-pop production", "trap-pop hybrid", "rap-sing hybrid verses", "drop-style post-chorus", "K-pop maximalism"] },
    { title: "Butter", artist: "BTS", year: 2021, genre: "pop", bpm: 110, key: "Db minor", duration: "2:44", mood: "euphoric", vocal: "group vocals", instruments: "synth bass, drum machine, claps, electric piano",
      structure: "Pop Standard",
      dna: ["Rob Grimaldi production", "80s funk-pop revival", "K-pop crossover", "harmonized chorus", "tight punchy kick"] },

    // ===== HIP-HOP GROUPS =====
    { title: "It Wasn't Me", artist: "Shaggy ft. RikRok", year: 2000, genre: "hip-hop", bpm: 95, key: "A minor", duration: "3:48", mood: "energetic", vocal: "duet", instruments: "synth bass, drum machine, electric piano",
      structure: "Hip-Hop",
      dna: ["Sting International production", "dancehall-pop crossover", "call-and-response chant", "warm analog", "Caribbean groove"] },
    { title: "Hey Ya!", artist: "OutKast", year: 2003, genre: "hip-hop", bpm: 160, key: "G major", duration: "3:55", mood: "euphoric", vocal: "male lead", instruments: "acoustic guitar, drums, synth bass, organ",
      structure: "Pop Standard",
      dna: ["André 3000 funk production", "Prince-influenced pop-funk", "stomp-clap rhythm", "live-room sound", "call-and-response chant"] },
    { title: "Crazy", artist: "Gnarls Barkley", year: 2006, genre: "hip-hop", bpm: 112, key: "C minor", duration: "2:58", mood: "tense", vocal: "duet", instruments: "drums, bass, strings, synth",
      structure: "Pop Standard",
      dna: ["Danger Mouse production", "soul-rap hybrid", "spaghetti western strings", "Cee Lo vocal style", "vintage analog"] },

    // ===== BAND CLASSICS =====
    { title: "Hey Jude", artist: "The Beatles", year: 1968, genre: "rock", bpm: 73, key: "F major", duration: "7:11", mood: "triumphant", vocal: "group vocals", instruments: "piano, acoustic guitar, drums, bass, orchestra",
      structure: "Ballad",
      dna: ["George Martin production", "Abbey Road sound", "extended outro chorus", "orchestral build", "tape saturation"] },
    { title: "Take On Me", artist: "a-ha", year: 1985, genre: "pop", bpm: 169, key: "F# minor", duration: "3:46", mood: "euphoric", vocal: "group vocals", instruments: "synth bass, drum machine, retro synths, electric piano",
      structure: "Pop Standard",
      dna: ["Alan Tarney synth-pop production", "Norwegian synth-pop", "iconic synth riff", "falsetto hook", "wide stereo field"] },
    { title: "Bohemian Rhapsody", artist: "Queen", year: 1975, genre: "rock", bpm: 72, key: "Bb major", duration: "5:55", mood: "tense", vocal: "group vocals", instruments: "piano, electric guitar, drums, bass, vocal stack",
      structure: "Rock Anthem",
      dna: ["Roy Thomas Baker layered production", "Queen multi-tracking", "operatic vocal harmonies", "tape saturation", "build + release dynamics"] },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", year: 1991, genre: "rock", bpm: 117, key: "F minor", duration: "5:01", mood: "aggressive", vocal: "male lead", instruments: "electric guitar, bass, drums",
      structure: "Rock Anthem",
      dna: ["Butch Vig 90s grunge production", "loud-quiet-loud dynamics", "crunchy bus compression", "aggressive delivery", "wall-of-guitar"] },
  ];

  const hitGenres = ["all", "pop", "hip-hop", "rock", "r&b", "edm", "country", "alt"];
  const filteredHits = useMemo(() => hitsLibrary.filter((h) => {
    const mg = hitGenre === "all" || h.genre === hitGenre;
    const q = hitSearch.toLowerCase();
    const ms = !q || h.title.toLowerCase().includes(q) || h.artist.toLowerCase().includes(q);
    return mg && ms;
  }).sort((a, b) => b.year - a.year), [hitGenre, hitSearch]);

  const loadHit = (hit) => {
    haptic([8, 20, 8]);
    setSelectedTags(new Set(hit.dna));
    setBpm(String(hit.bpm));
    setSongKey(hit.key);
    if (hit.duration) setDuration(hit.duration);
    if (hit.mood) setMood(hit.mood);
    if (hit.vocal) setVocalGender(hit.vocal);
    if (hit.instruments) setInstruments(hit.instruments);
    // Auto-load matching arrangement template
    if (hit.structure && arrangementTemplates[hit.structure]) {
      let id = nextId;
      const newArr = arrangementTemplates[hit.structure].map((s) => ({ ...s, id: id++ }));
      setArrangement(newArr);
      setNextId(id);
    }
    setActiveHit(hit);
  };
  const clearHit = () => {
    setActiveHit(null);
    setSelectedTags(new Set());
    setBpm("");
    setSongKey("");
    setDuration("");
    setMood("");
    setVocalGender("");
    setInstruments("");
    setArrangement([]);
  };

  const categories = {
    genre: { label: "Genre", icon: "🎸", color: "from-purple-500 to-pink-500", tags: ["electro pop-rock 2010-era","late-90s alt rock","2015 EDM festival","modern hyperpop","90s grunge","2000s pop-punk","arena rock anthem","synthwave retro","trap-rock hybrid","club banger","indie rock lo-fi","country-pop crossover","neo-soul","drill","afrobeats","dream pop"] },
    producer: { label: "Producer", icon: "🎛️", color: "from-blue-500 to-cyan-500", tags: ["Max Martin chorus architecture","Dr. Luke percussive pump","Jack Antonoff atmospheric build","Finneas intimate production","Mike Dean low-end focus","Metro Boomin dark trap","Mutt Lange layered vocals","Rick Rubin dry raw mix","Jeff Bhasker pop-rock crunch","will.i.am electro-rap chant","Timbaland rhythmic quirk","Dave Fridmann wall-of-sound","Pharrell minimal funk","Benny Blanco pop polish"] },
    engineer: { label: "Engineer", icon: "🎚️", color: "from-green-500 to-emerald-500", tags: ["Serban Ghenea polished radio mix","Chris Lord-Alge punchy drums","Andrew Scheps parallel compression","Tom Elmhirst vintage vocal chain","Tchad Blake gritty texture","Manny Marroquin wide stereo","Michael Brauer warm analog","Spike Stent cinematic depth"] },
    vocal: { label: "Vocal", icon: "🎤", color: "from-orange-500 to-red-500", tags: ["staccato rap-sung verses","behind-the-beat pocket","vocoder accents","talkbox lead","gang vocal stacks","auto-tuned shine","intimate close-mic","double-time flow","call-and-response chant","whispered bridge","belted anthemic chorus","pitched background oohs","falsetto hook","raspy delivery"] },
    mix: { label: "Sonic", icon: "🔊", color: "from-yellow-500 to-orange-500", tags: ["analog warmth","tape saturation","sidechained synth pads","wide stereo field","dry upfront vocal","plate reverb tail","lo-fi room drums","crunchy bus compression","white-noise risers","filter sweep transitions","sub-bass pulse","ambient hall reverb","vinyl crackle","tight punchy kick"] },
    feel: { label: "Feel", icon: "🏗️", color: "from-indigo-500 to-purple-500", tags: ["anthemic pre-chorus lift","drop-style post-chorus","half-time bridge breakdown","topline hook-first","synth-stab drops","build + release dynamics","intro acapella count-in","outro vocoder tail","double chorus ending","breakdown then final drop"] },
  };

  const toggleTag = (tag) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) next.delete(tag); else next.add(tag);
    setSelectedTags(next);
    if (activeHit) setActiveHit(null);
  };

  const clearAll = () => { setSelectedTags(new Set()); setActiveHit(null); };

  // STYLE BLOCK — for Suno's "Style of Music" field
  const styleOutput = useMemo(() => {
    const parts = [...selectedTags];
    if (bpm) parts.push(`${bpm} BPM`);
    if (songKey) parts.push(songKey);
    if (mood) parts.push(`${mood} mood`);
    if (instruments) parts.push(instruments);
    if (vocalGender) parts.push(vocalGender);
    return parts.join(", ");
  }, [selectedTags, bpm, songKey, mood, instruments, vocalGender]);

  // LYRICS BLOCK — for Suno's "Lyrics" field (includes title + arrangement metadata)
  const lyricsOutput = useMemo(() => {
    const lines = [];
    if (title) lines.push(`[Title: ${title}]`);
    if (duration) lines.push(`[Length: ${duration}]`);
    if (language && language !== "English") lines.push(`[Language: ${language}]`);
    if (arrangementBlock) lines.push(arrangementBlock);
    if (lines.length > 0) lines.push("");
    lines.push(rawLyrics);
    return lines.join("\n");
  }, [title, duration, language, arrangementBlock, rawLyrics]);

  // NEGATIVE BLOCK — for Suno's "Exclude Styles" field
  const negativeOutput = useMemo(() => {
    return negativeTags;
  }, [negativeTags]);

  // Track which block was copied
  const [copiedBlock, setCopiedBlock] = useState("");

  const copyBlock = async (text, blockName) => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlock(blockName);
      setTimeout(() => setCopiedBlock(""), 1500);
    } catch (e) { console.error(e); }
  };

  // Legacy full prompt for header copy button (copies all 3 with labels)
  const fullPrompt = useMemo(() => {
    const parts = [];
    if (styleOutput) parts.push(`STYLE:\n${styleOutput}`);
    if (lyricsOutput) parts.push(`LYRICS:\n${lyricsOutput}`);
    if (negativeOutput) parts.push(`EXCLUDE:\n${negativeOutput}`);
    return parts.join("\n\n---\n\n");
  }, [styleOutput, lyricsOutput, negativeOutput]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      haptic([10, 30, 10]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) { console.error(e); }
  };

  // ===== MASTER CLEAR — wipes EVERY user-input field =====
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const clearAllFields = () => {
    // Lyrics + metadata
    setRawLyrics("");
    setTitle("");
    setBpm("");
    setSongKey("");
    setDuration("");
    setMood("");
    setInstruments("");
    setNegativeTags("");
    setVocalGender("");
    setLanguage("English");
    // Style + DNA
    setSelectedTags(new Set());
    setActiveHit(null);
    // Hits search
    setHitSearch("");
    setHitGenre("all");
    // Arrangement
    setArrangement([]);
    // AI coach
    setCoachResult(null);
    setCoachError("");
    setCoachFocus("all");
    // Lab
    setLabResult(null);
    setLabEmotion("longing");
    // Variants
    setActiveVariant(null);
    setVariantToast("");
    // Track Timeline
    setTrackBlocks([]);
    setEditingBlock(null);
    // Audio
    if (audioFile) URL.revokeObjectURL(audioFile);
    if (audioRef.current) audioRef.current.pause();
    setAudioFile(null);
    setAudioFileName("");
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setCurrentRMS(0);
    setPeakRMS(0);
    setCoachAnalysis("");
    // Section emotion
    setSectionEmotion("neutral");
    setConfirmClearAll(false);
  };

  // ===== AI HELP — answers questions about the app =====
  const APP_CONTEXT = `You are the help assistant for "Suno Prompt Builder" — a mobile-first React app that helps musicians craft optimized prompts for Suno AI music generation. Answer questions about the app's features clearly and concisely (under 150 words usually).

THE APP HAS THESE PANELS (top to bottom):

1. **Sticky Header** — Master Clear All button (red, two-tap confirm) and Copy button.

2. **UltraSongLab/ Architecture** — Visual file tree mirroring the Swift project structure. Tap any file to jump to its panel.

3. **Hit Rationalization Core** — Live 5-star rating using 4 audit phases:
   - Velocity: Hook must land before 30s
   - Spatial Clarity: Max 5 instruments to avoid 250Hz-2kHz mid clutter
   - Human Error: Must include analog/tape/warm/lo-fi DNA tags (anti-AI sterility)
   - Honesty: Lyrics scanned for clichés (heart, soul, ghosts, forever) vs concrete details (coffee, denim, neon, asphalt)
   Verdicts: HONEST_HIT (4.5+★, green), CONTENDER (3+, yellow), DEMO (1.5+, orange), STERILE (<1.5, red). One-click AI honesty rewriter at top.

4. **Executive Producer · Label Verdict** — Composite score (0-100%) blending Hit audit (35%), Radio Safety (25%), Hook Strength (30%), Completeness (10%). Verdicts: GREENLIGHT (>90%, ready to ship), REVISE (>75%, needs hook polish), REJECTED (<75%, lacks identity).

5. **Radio Safety + Likability** — 6 weighted checks (FCC indecency, Hook Velocity, Format Length, Audience Comfort, Stickiness, International compatibility). Format Fit Matrix shows Top 40 / Country / Urban / AC fit.

6. **Lyrics box** — Paste lyrics with [Verse], [Chorus], [Bridge] tags. Has Clear button.

7. **AI Lyric Coach** — Powered by Claude. Pick focus (All/Structure/Rhythm/Rhyme), tap Analyze. Returns scores and one-tap line replacement suggestions.

8. **Ultra Engine · Per-Section Hit Analysis** — Offline. Picks an Emotion (Excited/Sad/Rage/Longing/Lust/Triumph etc) and shows per-section Hook Score /10 and Hit %. Producer Brain auto-generates arrangement notes per section. 6 rule-based rewrite buttons per section: Hook+, Tighten, Emotion, Rhythm, Radio, Vary.

9. **Song Variants** — 12 one-tap performance treatments: Stripped Down, Live Version, Club Remix, Lo-Fi Chill, Orchestral, Trap Remix, Slow Ballad, Punk Rock, Country Cover, Afrobeats, R&B Slow Jam, Reset. They STACK on existing tags.

10. **Ultra Song Lab** — Hit Factory + Producer + Executive + Suno Export pipeline. Three buttons: Generate Hit Blueprint (emotion-driven), Roll HitFactory.generate() (returns Swift dict), Execute Line (full UltraSongLab.shared.generateSong pipeline).

11. **Audio Engine + Mix** — Upload audio file (Suno exports, references). Play/pause, scrub, 6-speed playback. Mix Engine with master/vocal/music gain sliders. Vocal Coach analyzes RMS in real-time (under 0.15 = too quiet, over 0.85 = clipping).

12. **Track Timeline** — Visual DAW-style block arrangement. Drag blocks to move, drag right edge to resize, snap to 0.5s grid. Import from Song Structure with one tap. Live playhead syncs with audio playback.

13. **Song Structure** — Build arrangement (Intro → Verse → Chorus → Bridge → Outro etc) with section types and durations. 5 quick templates: Pop Standard, EDM Drop, Hip-Hop, Rock Anthem, Ballad.

14. **Hit Library** — 80+ curated hits across pop/hip-hop/rock/r&b/edm/country/alt with full DNA blueprints. Tap a song → auto-loads BPM, Key, Length, Mood, Vocal type, Instruments, Arrangement template, Style DNA tags. Includes boy bands, girl groups, K-pop, classic rock.

15. **Suno Metadata** — Title, Length, BPM, Key, Mood pills, Vocal type, Instruments, Exclude (with 24 quick-add chips), Language. All have inline clear buttons.

16. **Style DNA** — 6 categories: Genre, Producer (Max Martin, Dr. Luke, etc), Engineer (Serban Ghenea, CLA, etc), Vocal style, Sonic character, Feel. Tap chips to toggle.

17. **Pro Tips** — 6 hitmaking tips collapsed by default.

18. **3 Output Cards (bottom)** — Style, Lyrics, Exclude. Each has its own Copy and Trash button. Maps directly to Suno's 3 input fields.

KEY PRO TIPS:
- 3-5 DNA tags max (more dilutes signal)
- Pair a producer + a mix engineer for realism
- Always add an era ("2011-era" beats generic genre)
- Producer names pass Suno filters better than artist names
- Add analog DNA to avoid AI sterility
- Hook must land under 30 seconds
- Use Exclude to block unwanted sounds (autotune, flute, etc)

Answer the user's question about the app. Be specific, mention exact panel names, and give actionable steps. Use short paragraphs, not lists, unless the user explicitly asks for a list.`;

  // ===== TITLE GENERATOR =====
  const generateTitles = async () => {
    if (!rawLyrics.trim()) {
      setTitleError("Add some lyrics first.");
      setTimeout(() => setTitleError(""), 3000);
      return;
    }
    setTitleLoading(true);
    setTitleError("");
    setTitleResults([]);

    const styleContext = selectedTags.size > 0
      ? `Production style: ${[...selectedTags].slice(0, 3).join(", ")}.`
      : "";

    const titleStyleHints = {
      modern: "Modern streaming-era titles: short (1-4 words), evocative, unexpected. Examples: 'Espresso', 'Anti-Hero', 'Kill Bill', 'Flowers', 'Vampire'.",
      classic: "Classic-feel titles: emotional core word or short phrase. Examples: 'Yesterday', 'Hallelujah', 'Wonderwall', 'Hurt'.",
      cryptic: "Cryptic/mysterious titles: oblique, abstract, not from the chorus. Examples: 'Pyramids', 'XO Tour Llif3', 'idontwannabeyouanymore'.",
      direct: "Direct/hook-based titles: pulled straight from the chorus or hook line.",
      poetic: "Poetic titles: imagery-heavy, slightly literary. Examples: 'Cellophane', 'Lakehouse', 'Cardigan'.",
    };

    const prompt = `You are a hit-songwriter naming a song. Generate 8 distinct title options based on these lyrics.

${styleContext}
Title style preference: ${titleStyleHints[titleStyle] || titleStyleHints.modern}

LYRICS:
${rawLyrics}

Each title must be:
- 1-5 words
- Distinct from each other (vary the angle: literal, metaphorical, oblique, hook-based, mood-based)
- NOT generic (avoid "Love Song", "Goodbye", "Forever")
- Searchable on streaming platforms (not too common)

Respond ONLY with valid JSON (no markdown):
{
  "titles": [
    { "title": "Title Here", "type": "hook-based|metaphor|mood|oblique|imagery", "reason": "1 short sentence why this works" }
  ]
}`;

    try {
      const text = await callClaude(prompt, 1500);
      const parsed = parseJSON(text);
      setTitleResults(parsed.titles || []);
      if (!parsed.titles || parsed.titles.length === 0) {
        setTitleError("AI returned no titles. Try different lyrics or style.");
        setTimeout(() => setTitleError(""), 8000);
      } else {
        haptic([10, 30, 10]);
      }
    } catch (err) {
      console.error("Title gen error:", err);
      setTitleError(err.message || "Title generation failed");
      setTimeout(() => setTitleError(""), 10000);
    } finally {
      setTitleLoading(false);
    }
  };

  const [titleAppliedToast, setTitleAppliedToast] = useState("");
  const useTitle = (t) => {
    haptic([10, 20, 10]);
    setTitle(t);
    setTitleAppliedToast(t);
    setTimeout(() => setTitleAppliedToast(""), 3000);
  };

  // ===== TRANSCRIPTION via OpenAI Whisper =====
  // Restore key from localStorage on mount
  useEffect(() => {
    const k = localStorage.getItem("openai_key");
    if (k) setOpenaiKey(k);
    const ak = localStorage.getItem("anthropic_key");
    if (ak) setAnthropicKey(ak);
  }, []);

  const transcribeAudio = async () => {
    if (!audioFile || !audioFileName) {
      setTranscribeError("Upload an audio file first.");
      setTimeout(() => setTranscribeError(""), 3000);
      return;
    }
    setTranscribeLoading(true);
    setTranscribeError("");
    setTranscript("");

    try {
      // Save key for next time
      
      // Fetch the blob from the object URL
      const blobResponse = await fetch(audioFile);
      const blob = await blobResponse.blob();
      const file = new File([blob], audioFileName, { type: blob.type || "audio/mpeg" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "whisper-1");
      formData.append("response_format", "text");

      const resp = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || `HTTP ${resp.status}`);
      }
      const text = await resp.text();
      setTranscript(text.trim());
      haptic([15, 30, 15]);
    } catch (err) {
      console.error(err);
      setTranscribeError("Transcription failed. Check your API key and audio file.");
      setTimeout(() => setTranscribeError(""), 5000);
    } finally {
      setTranscribeLoading(false);
    }
  };

  const useTranscriptAsLyrics = () => {
    if (!transcript) return;
    haptic([10, 20, 10]);
    setRawLyrics(transcript);
    setActiveTab("write");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===== PITCH ADJUSTMENT helpers =====
  const KEY_SCALES = {
    "none": null,
    "C major": [0, 2, 4, 5, 7, 9, 11],
    "G major": [7, 9, 11, 0, 2, 4, 6],
    "D major": [2, 4, 6, 7, 9, 11, 1],
    "A major": [9, 11, 1, 2, 4, 6, 8],
    "E major": [4, 6, 8, 9, 11, 1, 3],
    "F major": [5, 7, 9, 10, 0, 2, 4],
    "Bb major": [10, 0, 2, 3, 5, 7, 9],
    "Eb major": [3, 5, 7, 8, 10, 0, 2],
    "A minor": [9, 11, 0, 2, 4, 5, 7],
    "E minor": [4, 6, 7, 9, 11, 0, 2],
    "B minor": [11, 1, 2, 4, 6, 7, 9],
    "F# minor": [6, 8, 9, 11, 1, 2, 4],
    "D minor": [2, 4, 5, 7, 9, 10, 0],
    "G minor": [7, 9, 10, 0, 2, 3, 5],
    "C minor": [0, 2, 3, 5, 7, 8, 10],
  };

  const snapMidiToScale = (midi, scaleNotes) => {
    if (!scaleNotes) return midi;
    const noteIdx = ((midi % 12) + 12) % 12;
    let closest = noteIdx;
    let minDist = 12;
    for (const s of scaleNotes) {
      const d = Math.min(Math.abs(s - noteIdx), 12 - Math.abs(s - noteIdx));
      if (d < minDist) { minDist = d; closest = s; }
    }
    const diff = closest - noteIdx;
    let adjusted = diff;
    if (Math.abs(diff) > 6) adjusted = diff > 0 ? diff - 12 : diff + 12;
    return midi + adjusted;
  };

  const adjustedPitchData = useMemo(() => {
    if (pitchData.length === 0) return [];
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const scale = KEY_SCALES[pitchSnapToKey];

    // Step 1: convert to midi + transpose
    let processed = pitchData.map((p) => {
      if (p.pitch === 0) return { ...p, adjustedPitch: 0, adjustedNote: "—", adjustedMidi: 0 };
      let midi = 69 + 12 * Math.log2(p.pitch / 440);
      midi += pitchTranspose;
      return { ...p, adjustedMidi: midi };
    });

    // Step 2: smoothing (median filter on midi values)
    if (pitchSmoothing > 0) {
      const window = pitchSmoothing;
      processed = processed.map((p, i) => {
        if (p.adjustedMidi === 0) return p;
        const slice = processed.slice(Math.max(0, i - window), Math.min(processed.length, i + window + 1))
          .map((x) => x.adjustedMidi).filter((m) => m > 0);
        if (slice.length === 0) return p;
        slice.sort((a, b) => a - b);
        const med = slice[Math.floor(slice.length / 2)];
        return { ...p, adjustedMidi: med };
      });
    }

    // Step 3: snap to key
    if (scale) {
      processed = processed.map((p) => {
        if (p.adjustedMidi === 0) return p;
        return { ...p, adjustedMidi: snapMidiToScale(Math.round(p.adjustedMidi), scale) };
      });
    }

    // Step 4: octave lock — clamp to a 1-octave range around the median
    if (pitchOctaveLock) {
      const validMidis = processed.map((p) => p.adjustedMidi).filter((m) => m > 0);
      if (validMidis.length > 0) {
        validMidis.sort((a, b) => a - b);
        const median = validMidis[Math.floor(validMidis.length / 2)];
        const center = Math.round(median);
        processed = processed.map((p) => {
          if (p.adjustedMidi === 0) return p;
          let m = p.adjustedMidi;
          while (m > center + 6) m -= 12;
          while (m < center - 6) m += 12;
          return { ...p, adjustedMidi: m };
        });
      }
    }

    // Final: convert midi back to Hz + note name
    return processed.map((p) => {
      if (p.adjustedMidi === 0) return { ...p, adjustedPitch: 0, adjustedNote: "—" };
      const midiInt = Math.round(p.adjustedMidi);
      const adjustedPitch = 440 * Math.pow(2, (p.adjustedMidi - 69) / 12);
      const octave = Math.floor(midiInt / 12) - 1;
      const noteIdx = ((midiInt % 12) + 12) % 12;
      const adjustedNote = `${noteNames[noteIdx]}${octave}`;
      return { ...p, adjustedPitch, adjustedNote };
    });
  }, [pitchData, pitchTranspose, pitchSmoothing, pitchSnapToKey, pitchOctaveLock]);

  const resetPitchAdjustments = () => {
    haptic(8);
    setPitchTranspose(0);
    setPitchSmoothing(0);
    setPitchSnapToKey("none");
    setPitchOctaveLock(false);
  };

  // ===== PITCH CONTOUR via Web Audio API =====
  // Uses autocorrelation to detect fundamental frequency over time
  const analyzePitchContour = async () => {
    if (!audioFile) {
      setTranscribeError("Upload audio first.");
      setTimeout(() => setTranscribeError(""), 3000);
      return;
    }
    setPitchAnalyzing(true);
    setPitchData([]);

    try {
      const blobResp = await fetch(audioFile);
      const arrayBuffer = await blobResp.arrayBuffer();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      // Sample every 100ms, autocorrelation window of 2048 samples
      const windowSize = 2048;
      const hopSize = Math.floor(sampleRate * 0.1);
      const minPitch = 80;  // Hz (low male voice)
      const maxPitch = 1000; // Hz
      const minLag = Math.floor(sampleRate / maxPitch);
      const maxLag = Math.floor(sampleRate / minPitch);

      const pitches = [];
      for (let offset = 0; offset + windowSize < channelData.length; offset += hopSize) {
        // Calculate energy
        let energy = 0;
        for (let i = 0; i < windowSize; i++) energy += channelData[offset + i] ** 2;
        const rms = Math.sqrt(energy / windowSize);
        if (rms < 0.01) {
          pitches.push({ time: offset / sampleRate, pitch: 0, note: "—", rms });
          continue;
        }

        // Autocorrelation
        let bestLag = 0;
        let bestCorr = 0;
        for (let lag = minLag; lag < maxLag; lag++) {
          let corr = 0;
          for (let i = 0; i < windowSize - lag; i++) {
            corr += channelData[offset + i] * channelData[offset + i + lag];
          }
          if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
        }
        const freq = bestLag > 0 ? sampleRate / bestLag : 0;

        // Convert to note name
        const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        let noteName = "—";
        if (freq > 0) {
          const midi = Math.round(69 + 12 * Math.log2(freq / 440));
          const octave = Math.floor(midi / 12) - 1;
          const noteIdx = midi % 12;
          noteName = `${noteNames[noteIdx]}${octave}`;
        }

        pitches.push({ time: offset / sampleRate, pitch: freq, note: noteName, rms });
      }
      setPitchData(pitches);
      ctx.close();
      haptic([15, 30, 15]);
    } catch (err) {
      console.error(err);
      setTranscribeError("Pitch analysis failed.");
      setTimeout(() => setTranscribeError(""), 3000);
    } finally {
      setPitchAnalyzing(false);
    }
  };

  // ===== HOOK MAKER — generates 5 hook options =====
  const generateHooks = async () => {
    setHookLoading(true);
    setHookError("");
    setHookResults([]);

    const styleContext = hookStyle.trim() ||
      (selectedTags.size > 0 ? [...selectedTags].slice(0, 3).join(", ") : "modern pop");

    const prompt = `You are a hit-song hook writer. Generate 5 distinct hook ideas for a song with this emotion and style.

Emotion: ${hookEmotion}
Style: ${styleContext}

Each hook must be:
- 4-9 words (singable, memorable)
- Written in modern conversational English
- Specific and concrete (avoid clichés like "heart", "soul", "forever", "ghosts")
- Different from each other (vary the angle, rhythm, and image)

Respond ONLY with valid JSON in this exact shape (no markdown, no preamble):
{
  "hooks": [
    { "hook": "the hook line", "vibe": "2-4 word description", "syllables": <number> },
    ...
  ]
}`;

    try {
      const text = await callClaude(prompt, 800);
      const parsed = parseJSON(text);
      setHookResults(parsed.hooks || []);
      if (!parsed.hooks || parsed.hooks.length === 0) {
        setHookError("AI returned no hooks. Try a different emotion or style.");
        setTimeout(() => setHookError(""), 8000);
      } else {
        haptic([10, 30, 10]);
      }
    } catch (err) {
      console.error("Hook gen error:", err);
      setHookError(err.message || "Hook generation failed");
      setTimeout(() => setHookError(""), 10000);
    } finally {
      setHookLoading(false);
    }
  };

  const insertHookIntoLyrics = (hook) => {
    haptic(15);
    // Insert as a [Chorus] section if no chorus, otherwise append at top
    const hasChorus = /\[chorus\]/i.test(rawLyrics);
    if (!hasChorus) {
      const insertion = `[Chorus]\n${hook}\n${hook}\n\n`;
      setRawLyrics(insertion + rawLyrics);
    } else {
      setRawLyrics(rawLyrics + `\n\n[Chorus 2]\n${hook}\n${hook}`);
    }
  };

  // ===== AI IMPROVE SELECTION — rewrites highlighted text =====
  const handleLyricsSelection = () => {
    const ta = lyricsTextareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setSelectionStart(start);
    setSelectionEnd(end);
    if (start !== end) {
      setSelectedLyricText(rawLyrics.substring(start, end));
    } else {
      setSelectedLyricText("");
      setImproveResult(null);
    }
  };

  const improveSelection = async (mode = "rewrite") => {
    if (!selectedLyricText.trim()) {
      setImproveError("Highlight some lyric text first.");
      setTimeout(() => setImproveError(""), 3000);
      return;
    }
    setImproveLoading(true);
    setImproveError("");
    setImproveResult(null);

    const styleContext = selectedTags.size > 0
      ? `Style: ${[...selectedTags].slice(0, 3).join(", ")}.`
      : "";

    const modeInstructions = {
      rewrite: "Rewrite for stronger emotion and concrete imagery. Keep the same syllable count and rhyme scheme.",
      tighten: "Tighten and shorten. Cut filler words. Keep meaning, drop fat.",
      punchier: "Make it punchier — sharper consonants, more aggressive cadence, fewer abstractions.",
      smoother: "Make it smoother and more singable — better vowel flow, easier melodic shape.",
      concrete: "Replace any abstractions or clichés with concrete sensory details (objects, places, body, light, sound).",
      rhyme: "Improve the internal rhyme and end rhyme. Use near-rhyme if needed for naturalness.",
    };

    const prompt = `You are a lyric editor. Rewrite this selected text from a song.

${styleContext}

Mode: ${modeInstructions[mode] || modeInstructions.rewrite}

ORIGINAL TEXT:
${selectedLyricText}

Respond ONLY with valid JSON (no markdown):
{
  "rewrite": "the improved version",
  "explanation": "1 short sentence on what you changed"
}`;

    try {
      const text = await callClaude(prompt, 800);
      const parsed = parseJSON(text);
      setImproveResult({ ...parsed, mode });
      haptic(12);
    } catch (err) {
      console.error("Improve error:", err);
      setImproveError(err.message || "Rewrite failed");
      setTimeout(() => setImproveError(""), 10000);
    } finally {
      setImproveLoading(false);
    }
  };

  const applyImprovement = () => {
    if (!improveResult) return;
    haptic([10, 20, 10]);
    const newLyrics = rawLyrics.substring(0, selectionStart) + improveResult.rewrite + rawLyrics.substring(selectionEnd);
    setRawLyrics(newLyrics);
    setImproveResult(null);
    setSelectedLyricText("");
  };

  // ===== 6 SUNO POWER TOOLS — implementations =====

  const callClaude = async (prompt, maxTokens = 1500) => {
    let response;
    try {
      response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          messages: [{ role: "user", content: prompt }],
        }),
      });
    } catch (networkErr) {
      throw new Error(`Network error: ${networkErr.message}. Check your connection or that the API key is valid.`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      const text = await response.text().catch(() => "(no body)");
      throw new Error(`Bad API response (HTTP ${response.status}): ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      const apiMsg = data?.error?.message || data?.message || JSON.stringify(data).slice(0, 200);
      throw new Error(`API error (HTTP ${response.status}): ${apiMsg}`);
    }

    if (!data.content || !Array.isArray(data.content)) {
      throw new Error(`Unexpected API response shape: ${JSON.stringify(data).slice(0, 200)}`);
    }

    return data.content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
  };

  const parseJSON = (text) => {
    if (!text || !text.trim()) throw new Error("Empty response from AI");
    let cleaned = text.replace(/```json|```/g, "").trim();
    // Try to extract JSON if there's wrapper text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      throw new Error(`Couldn't parse AI response as JSON. Got: ${cleaned.slice(0, 150)}...`);
    }
  };

  // Tool 1: Reference Track Analyzer
  const analyzeReferenceTrack = async () => {
    setRefAnalyzerLoading(true);
    setRefAnalyzerError("");
    setRefAnalyzerResult(null);
    try {
      const text = await callClaude(`Analyze this reference track for Suno AI music generation: "${refTrackInput}"

Extract its production DNA. Be specific and accurate based on what you actually know about the song. If you don't know it, say so.

Respond ONLY with JSON (no markdown):
{
  "dna": ["6-10 specific style tags suitable for Suno, comma-separable phrases like 'synthwave', 'gated reverb snare', 'Max Martin pop polish'"],
  "bpm": "estimated BPM number as string",
  "key": "key like 'F minor'",
  "mood": "1-2 word mood",
  "notes": "1-2 sentences on what makes this track sonically distinctive — production techniques, vocal style, signature elements"
}`);
      setRefAnalyzerResult(parseJSON(text));
      haptic([10, 30, 10]);
    } catch (err) {
      console.error(err);
      setRefAnalyzerError(err.message || "Couldn't analyze");
      setTimeout(() => setRefAnalyzerError(""), 8000);
    } finally {
      setRefAnalyzerLoading(false);
    }
  };

  const applyReferenceTrack = () => {
    if (!refAnalyzerResult) return;
    if (refAnalyzerResult.dna) setSelectedTags(new Set([...selectedTags, ...refAnalyzerResult.dna]));
    if (refAnalyzerResult.bpm) setBpm(refAnalyzerResult.bpm.toString().match(/\d+/)?.[0] || "");
    if (refAnalyzerResult.key) setSongKey(refAnalyzerResult.key);
    if (refAnalyzerResult.mood) setMood(refAnalyzerResult.mood);
  };

  // Tool 2: Concept Expander
  const expandConcept = async () => {
    setConceptLoading(true);
    setConceptError("");
    setConceptResult(null);
    try {
      const text = await callClaude(`A songwriter has this 1-line concept: "${conceptInput}"

Build a complete song structure around it. Use concrete sensory details, avoid clichés, keep it singable.

Respond ONLY with JSON (no markdown):
{
  "title": "1-4 word song title",
  "verse1": "what the first verse establishes — 2 sentences max",
  "chorus": "the central hook concept — what it says emotionally",
  "verse2": "how the second verse deepens or shifts the story",
  "bridge": "the twist or emotional pivot in the bridge"
}`);
      setConceptResult(parseJSON(text));
      haptic([10, 30, 10]);
    } catch (err) {
      console.error(err);
      setConceptError(err.message || "Couldn't expand concept");
      setTimeout(() => setConceptError(""), 8000);
    } finally {
      setConceptLoading(false);
    }
  };

  const applyConceptAsLyrics = () => {
    if (!conceptResult) return;
    const outline = `[Verse 1]
${conceptResult.verse1}

[Chorus]
${conceptResult.chorus}

[Verse 2]
${conceptResult.verse2}

[Chorus]
${conceptResult.chorus}

[Bridge]
${conceptResult.bridge}

[Chorus]
${conceptResult.chorus}`;
    setRawLyrics(outline);
    if (conceptResult.title) setTitle(conceptResult.title);
    setActiveTab("write");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tool 3: Tag Optimizer
  const optimizeTags = async () => {
    setTagOptLoading(true);
    setTagOptError("");
    setTagOptResult(null);
    try {
      const tagList = [...selectedTags].join(", ");
      const text = await callClaude(`These are the current Suno style tags: ${tagList}

Optimize them for Suno AI music generation:
- Remove redundant tags (e.g. "warm" + "warm analog" + "vintage warmth" → just "warm analog")
- Combine related concepts efficiently
- Use Suno's preferred phrasing (short, comma-separated, descriptive)
- Keep 6-10 tags max for clarity
- Order by importance: genre → era → production → mood

Respond ONLY with JSON (no markdown):
{
  "optimized": "comma-separated optimized tag string",
  "removed": ["redundant tag", "another redundant tag"],
  "reason": "1 sentence explanation"
}`);
      setTagOptResult(parseJSON(text));
      haptic([10, 30, 10]);
    } catch (err) {
      console.error(err);
      setTagOptError(err.message || "Couldn't optimize");
      setTimeout(() => setTagOptError(""), 8000);
    } finally {
      setTagOptLoading(false);
    }
  };

  const applyOptimizedTags = () => {
    if (!tagOptResult?.optimized) return;
    const newTags = tagOptResult.optimized.split(",").map(t => t.trim()).filter(Boolean);
    setSelectedTags(new Set(newTags));
  };

  // Tool 4: Cover Reimaginer
  const reimagineCover = async () => {
    setCoverLoading(true);
    setCoverError("");
    setCoverResult("");
    try {
      const text = await callClaude(`Rewrite these lyrics as if performed in a "${coverGenre}" style.

KEEP: emotional core, story arc, song structure tags ([Verse], [Chorus] etc).
CHANGE: cadence, vocabulary, imagery, references — adapted to the genre's voice.

Respond with the rewritten lyrics ONLY (no preamble, no markdown). Keep section tags like [Verse 1], [Chorus].

ORIGINAL LYRICS:
${rawLyrics}`);
      setCoverResult(text.trim());
      haptic([10, 30, 10]);
    } catch (err) {
      console.error(err);
      setCoverError(err.message || "Couldn't reimagine");
      setTimeout(() => setCoverError(""), 8000);
    } finally {
      setCoverLoading(false);
    }
  };

  // Tool 5: Translator
  const translateLyrics = async () => {
    setTranslateLoading(true);
    setTranslateError("");
    setTranslateResult("");
    try {
      const text = await callClaude(`Translate these lyrics into ${translateLang}.

CRITICAL: This is for SINGING, not reading. Preserve:
- Syllable count per line (very important for melody)
- Rhyme scheme (use near-rhymes if needed)
- Emotional intensity
- Section tags ([Verse], [Chorus] etc.)

Use natural, native-speaker phrasing — not literal translation.

Respond with the translated lyrics ONLY (no preamble, no romanization unless writing system is non-Latin).

ORIGINAL:
${rawLyrics}`);
      setTranslateResult(text.trim());
      haptic([10, 30, 10]);
    } catch (err) {
      console.error(err);
      setTranslateError(err.message || "Couldn't translate");
      setTimeout(() => setTranslateError(""), 8000);
    } finally {
      setTranslateLoading(false);
    }
  };

  // Tool 6: Suno Prompt Critic
  const critiquePrompt = async () => {
    setCriticLoading(true);
    setCriticError("");
    setCriticResult(null);
    try {
      const promptSummary = `STYLE: ${[...selectedTags].join(", ") || "(none)"}
BPM: ${bpm || "?"} | Key: ${songKey || "?"} | Length: ${duration || "?"}
Mood: ${mood || "?"} | Vocal: ${vocalGender || "?"}
Instruments: ${instruments || "(none)"}
Exclude: ${negativeTags || "(none)"}

LYRICS:
${rawLyrics || "(none)"}`;

      const text = await callClaude(`You are an experienced Suno AI prompt engineer. Honestly critique this Suno prompt setup. Be specific. No fluff. No fake compliments.

${promptSummary}

Respond ONLY with JSON (no markdown):
{
  "strengths": ["2-4 specific things that genuinely work well"],
  "weaknesses": ["2-4 specific issues — vague tags, contradictions, missing essentials, lyric problems"],
  "suggestions": ["2-4 concrete, actionable changes — exact tags to add/remove, exact lyric tweaks"]
}`, 2000);
      setCriticResult(parseJSON(text));
      haptic([10, 30, 10]);
    } catch (err) {
      console.error(err);
      setCriticError(err.message || "Couldn't critique");
      setTimeout(() => setCriticError(""), 8000);
    } finally {
      setCriticLoading(false);
    }
  };

  const askHelp = async () => {
    if (!helpQuestion.trim()) {
      setHelpError("Type a question first.");
      setTimeout(() => setHelpError(""), 3000);
      return;
    }
    setHelpLoading(true);
    setHelpError("");
    setHelpAnswer("");

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          system: APP_CONTEXT,
          messages: [{ role: "user", content: helpQuestion }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiMsg = data?.error?.message || data?.message || JSON.stringify(data).slice(0, 200);
        throw new Error(`HTTP ${response.status}: ${apiMsg}`);
      }

      if (!data.content || !Array.isArray(data.content)) {
        throw new Error(`Unexpected response: ${JSON.stringify(data).slice(0, 200)}`);
      }

      const text = data.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n")
        .trim();

      if (text) {
        setHelpAnswer(text);
        setHelpHistory((h) => [{ q: helpQuestion, a: text, ts: Date.now() }, ...h.slice(0, 4)]);
      } else {
        setHelpError("Got empty response. Try rephrasing.");
        setTimeout(() => setHelpError(""), 8000);
      }
    } catch (err) {
      console.error("Help error:", err);
      setHelpError(err.message || "AI help failed");
      setTimeout(() => setHelpError(""), 10000);
    } finally {
      setHelpLoading(false);
    }
  };

  const runLyricCoach = async () => {
    if (!rawLyrics.trim()) {
      setCoachError("Add some lyrics first.");
      return;
    }
    setCoachLoading(true);
    setCoachError("");
    setCoachResult(null);

    const focusInstruction = coachFocus === "all"
      ? "Analyze structure, rhythm, and rhyme together."
      : coachFocus === "structure" ? "Focus only on structure: section flow, hook placement, repetition logic."
      : coachFocus === "rhythm" ? "Focus only on rhythm: syllable count, stress patterns, meter, singability, line length."
      : "Focus only on rhyme: rhyme schemes, internal rhymes, near-rhymes, lazy/forced rhymes.";

    const styleContext = selectedTags.size > 0
      ? `Style/genre context: ${[...selectedTags].slice(0, 5).join(", ")}.`
      : "";

    const prompt = `You are an expert lyric coach analyzing lyrics for a song. ${focusInstruction} ${styleContext}

LYRICS TO ANALYZE:
${rawLyrics}

Respond ONLY with valid JSON in this exact shape (no markdown, no preamble):
{
  "overall": "1-2 sentence diagnosis of the lyrics' biggest opportunity",
  "scores": {
    "structure": <1-10>,
    "rhythm": <1-10>,
    "rhyme": <1-10>
  },
  "suggestions": [
    {
      "category": "structure" | "rhythm" | "rhyme",
      "issue": "short description of the problem (max 80 chars)",
      "original": "the exact original line/phrase from lyrics that has the issue",
      "suggested": "your improved replacement line",
      "why": "1 sentence explaining the improvement"
    }
  ]
}

Provide 3-6 specific suggestions. Each "original" MUST be a verbatim string from the lyrics so it can be find-and-replaced. Keep suggestions practical and singable.`;

    try {
      const text = await callClaude(prompt, 2000);
      const parsed = parseJSON(text);
      setCoachResult(parsed);
    } catch (err) {
      console.error("Coach error:", err);
      setCoachError(err.message || "Coach ran into an error");
    } finally {
      setCoachLoading(false);
    }
  };

  const applySuggestion = (original, suggested) => {
    if (rawLyrics.includes(original)) {
      setRawLyrics(rawLyrics.replace(original, suggested));
      // mark suggestion as applied
      if (coachResult) {
        setCoachResult({
          ...coachResult,
          suggestions: coachResult.suggestions.map((s) =>
            s.original === original ? { ...s, applied: true } : s
          ),
        });
      }
    } else {
      setCoachError(`Couldn't find that line in lyrics — it may have been edited.`);
      setTimeout(() => setCoachError(""), 3000);
    }
  };

  // ONE-CLICK AI HONESTY REWRITER
  const fixHonestyWithAI = async () => {
    if (!rawLyrics.trim()) {
      setHonestyError("Add lyrics first.");
      setTimeout(() => setHonestyError(""), 3000);
      return;
    }
    setHonestyLoading(true);
    setHonestyError("");

    const styleContext = selectedTags.size > 0
      ? `Genre/style: ${[...selectedTags].slice(0, 4).join(", ")}.`
      : "";

    const prompt = `You are a lyric doctor specializing in HONESTY — the technique of replacing abstract clichés with concrete, sensory, specific details that make lyrics feel lived-in and human.

${styleContext}

REWRITE THESE LYRICS to maximize lyrical honesty by:

1. KILL CLICHÉS: Replace abstract metaphors (heart, soul, ghosts, shadows, forever, broken, fire, dreams, etc.) with concrete physical details.

2. ADD DIRTY DETAILS: Inject specific nouns — coffee stains, denim, asphalt, neon signs, cigarette ash, kitchen tile, porch wood, rust, gravel, kerosene, wool, kitchen counter, sweat on a glass, etc.

3. KEEP STRUCTURE: Preserve all section tags ([Verse 1], [Chorus], [Bridge], etc.) and keep the same general line count + rhythm so it stays singable.

4. KEEP THE STORY: Don't change the emotional core or theme — just make it MORE specific, MORE physical, MORE real.

5. KEEP RHYMES: Maintain the rhyme scheme where it exists.

ORIGINAL LYRICS:
${rawLyrics}

Respond ONLY with the rewritten lyrics. No preamble, no explanation, no markdown — just the raw rewritten lyrics with section tags preserved.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n")
        .replace(/```[\w]*\n?|```/g, "")
        .trim();

      if (text) {
        setRawLyrics(text);
      } else {
        setHonestyError("Got empty response. Try again.");
        setTimeout(() => setHonestyError(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setHonestyError("AI rewrite failed. Try again.");
      setTimeout(() => setHonestyError(""), 3000);
    } finally {
      setHonestyLoading(false);
    }
  };



  const proTips = [
    { title: "Run the audit first", detail: "Fix issues → unlock 5 stars → then generate." },
    { title: "Hook < 30 seconds", detail: "Listeners skip if the chorus doesn't land fast." },
    { title: "Concrete nouns beat clichés", detail: "'Coffee stain on the porch' beats 'broken heart forever'." },
    { title: "Add analog DNA", detail: "Tape, warmth, room drums kill the AI sterile sound." },
    { title: "3–5 instruments max", detail: "More clutters the 250Hz–2kHz mid range." },
    { title: "Producer > artist names", detail: "Suno filters artist names; producers pass clean." },
  ];

  const currentCat = categories[activeCategory];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= Math.floor(rating);
      const half = !filled && i - 0.5 <= rating;
      stars.push(
        <div key={i} className="relative w-6 h-6">
          <Star className="w-6 h-6 text-slate-200 fill-slate-200 absolute" />
          {(filled || half) && (
            <div className="absolute overflow-hidden" style={{ width: half ? "50%" : "100%" }}>
              <Star className="w-6 h-6 text-green-500 fill-green-500" />
            </div>
          )}
        </div>
      );
    }
    return stars;
  };

  const verdictBg = {
    green: "from-green-50 to-emerald-50 border-green-300",
    yellow: "from-yellow-50 to-amber-50 border-yellow-300",
    amber: "from-amber-50 to-orange-50 border-amber-300",
    orange: "from-orange-50 to-red-50 border-orange-300",
    red: "from-red-50 to-rose-50 border-red-300",
  };
  const verdictText = {
    green: "text-green-800", yellow: "text-yellow-800", amber: "text-amber-800", orange: "text-orange-800", red: "text-red-800",
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"} transition-colors`}>
      <div className="max-w-md mx-auto px-4 py-3 pb-24">
        <div className={`flex items-center gap-2 mb-3 sticky top-0 ${darkMode ? "bg-slate-950/95 border-slate-800" : "bg-white/95 border-slate-100"} backdrop-blur z-20 py-2 -mx-4 px-4 border-b transition-colors`}>
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex-shrink-0">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">Suno Prompt Builder</h1>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Mobile-optimized · iOS-aware</p>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg flex-shrink-0 active:scale-95 transition ${
              darkMode ? "bg-slate-800 text-yellow-300" : "bg-slate-100 text-slate-700"
            }`}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirmClearAll) { haptic([20, 50, 20]); clearAllFields(); }
              else {
                haptic(15);
                setConfirmClearAll(true);
                setTimeout(() => setConfirmClearAll(false), 3000);
              }
            }}
            className={`px-2.5 py-2 rounded-lg text-sm font-bold flex items-center gap-1 active:scale-95 transition flex-shrink-0 ${
              confirmClearAll ? "bg-red-600 text-white animate-pulse" : (darkMode ? "bg-red-500/20 text-red-300 active:bg-red-500/30" : "bg-red-500/10 text-red-600 active:bg-red-500/20")
            }`}>
            <Trash2 className="w-3.5 h-3.5" />
            {confirmClearAll ? "Confirm" : "Clear"}
          </button>
          <button onClick={copyPrompt}
            className={`px-3 py-2 rounded-lg text-base font-semibold flex items-center gap-1 transition active:scale-95 flex-shrink-0 ${
              copied ? "bg-green-500 text-white" : "bg-purple-600 text-white"
            }`}>
            {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>

        {/* TAB TITLE — shows user where they are */}
        {(() => {
          const tabInfo = {
            write: { label: "Write Lyrics", desc: "Lyrics + Coach + Structure", color: "from-blue-500 to-cyan-500" },
            score: { label: "Score & Audit", desc: "Hit rating + Radio safety + Hook analysis", color: "from-purple-500 to-pink-500" },
            sound: { label: "Sound", desc: "Audio playback + Mix + Timeline", color: "from-cyan-500 to-blue-500" },
            hits: { label: "Hits & Style", desc: "Library + Variants + DNA + Lab", color: "from-emerald-500 to-teal-500" },
            output: { label: "Suno Output", desc: "Copy to Suno's 3 fields", color: "from-orange-500 to-red-500" },
            help: { label: "Help & Tips", desc: "Ask AI · Architecture · Pro tips", color: "from-sky-500 to-indigo-500" },
          };
          const info = tabInfo[activeTab];
          return (
            <div className={`bg-gradient-to-r ${info.color} rounded-xl px-3 py-2 mb-3 shadow-sm`}>
              <div className="text-white font-bold text-base">{info.label}</div>
              <div className="text-white/80 text-sm">{info.desc}</div>
            </div>
          );
        })()}

        {/* Welcome card on Write tab when empty */}
        {activeTab === "write" && !rawLyrics.trim() && selectedTags.size === 0 && (
          <div className={`rounded-2xl p-4 mb-3 ${
            darkMode ? "bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-700" : "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200"
          }`}>
            <div className="text-2xl mb-1">👋</div>
            <h2 className={`text-xl font-bold mb-1 ${darkMode ? "text-purple-200" : "text-purple-900"}`}>Welcome to Suno Builder</h2>
            <p className={`text-base leading-relaxed ${darkMode ? "text-purple-100" : "text-purple-800"}`}>
              Build pro-grade Suno prompts in 4 quick steps:
            </p>
            <div className="mt-2 space-y-1">
              {[
                { n: 1, text: "Paste lyrics below — or skip to Hits tab to start from a hit blueprint" },
                { n: 2, text: "Tap Score tab to audit & boost your song" },
                { n: 3, text: "Tap Hits tab to add Style DNA + arrangement" },
                { n: 4, text: "Tap Output tab to copy into Suno's 3 fields" },
              ].map((step) => (
                <div key={step.n} className={`flex gap-2 text-base ${darkMode ? "text-purple-100" : "text-purple-800"}`}>
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full text-sm font-bold flex items-center justify-center ${
                    darkMode ? "bg-purple-700 text-white" : "bg-purple-500 text-white"
                  }`}>{step.n}</span>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
            <p className={`text-sm italic mt-3 ${darkMode ? "text-purple-300" : "text-purple-600"}`}>
              💾 Your work auto-saves locally. Tap Help for any question.
            </p>
          </div>
        )}

        {activeTab === "help" && (<>
        {/* 🔬 NETWORK DIAGNOSTIC */}
        <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 mb-3 overflow-hidden">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔬</span>
              <div className="text-base font-black text-white">Network Diagnostic</div>
            </div>
            <p className="text-sm text-slate-300 mb-2">
              Tests if your browser can reach the Anthropic API. If this fails, no AI feature in the app will work — and it's not something I can fix in code.
            </p>
            <button
              onClick={async () => {
                setDiagResult("Testing...");
                if (!anthropicKey) { setDiagResult("❌ Add an API key first."); return; }
                try {
                  const r = await fetch("/api/claude", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      model: "claude-sonnet-4-20250514",
                      max_tokens: 20,
                      messages: [{ role: "user", content: "Reply with only the word: ok" }],
                    }),
                  });
                  const txt = await r.text();
                  setDiagResult(`Status: ${r.status} ${r.statusText}\n\nBody:\n${txt.slice(0, 800)}`);
                } catch (e) {
                  setDiagResult(`❌ Browser blocked the request (CORS or network): ${e.message}\n\nThis usually means the artifact runtime isn't allowed to reach api.anthropic.com from this iframe. There is no fix from inside the app — see options below.`);
                }
              }}
              className="w-full py-2 bg-cyan-600 text-white rounded-lg font-bold text-base active:scale-95">
              Test Connection to Anthropic API
            </button>
            {diagResult && (
              <pre className="mt-2 bg-black text-green-300 text-sm p-2 rounded overflow-x-auto max-h-60 whitespace-pre-wrap">{diagResult}</pre>
            )}
          </div>
        </div>

        {/* 🔐 DEPLOYMENT INFO — keys are server-side now */}
        <div className="rounded-2xl border-2 mb-3 overflow-hidden border-emerald-400 bg-emerald-50">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔐</span>
              <div>
                <div className="text-base font-black text-slate-900">Server Configuration</div>
                <div className="text-sm text-slate-700">API keys are stored securely on Vercel as environment variables.</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-emerald-200 text-sm text-slate-700 leading-relaxed">
              <strong>Required Vercel env vars:</strong><br/>
              • <code className="bg-slate-100 px-1 rounded">ANTHROPIC_API_KEY</code> — for all AI tools<br/>
              • <code className="bg-slate-100 px-1 rounded">OPENAI_API_KEY</code> — for Whisper transcription<br/>
              <br/>
              Set these in your Vercel project: <strong>Settings → Environment Variables</strong>
            </div>
          </div>
        </div>

        {/* ARCHITECTURE MAP — UltraSongLab project tree */}
        <div className="bg-slate-950 rounded-2xl border-2 border-slate-800 mb-3 overflow-hidden">
          <button onClick={() => setArchOpen(!archOpen)} className="w-full flex items-center justify-between p-3 active:bg-slate-900">
            <span className="flex items-center gap-1.5 text-sm font-bold text-cyan-300">
              <Layers className="w-3.5 h-3.5" /> UltraSongLab/ Architecture
              <span className="text-[13px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">9 / 9 LIVE</span>
            </span>
            {archOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
          </button>

          {archOpen && (
            <div className="p-3 pt-0">
              <pre className="text-sm font-mono text-slate-300 leading-relaxed">
{`UltraSongLab/`}
              </pre>

              {(() => {
                const tree = [
                  { folder: "Core/", file: "UltraSongLab.swift", panel: "Ultra Song Lab", target: "labOpen", color: "emerald", desc: "Shared instance · pipeline orchestrator" },
                  { folder: "Audio/", file: "AudioPlaybackEngine.swift", panel: "Audio Engine + Mix", target: "audioOpen", color: "cyan", desc: "AVAudioEngine port · play/pause/scrub" },
                  { folder: "Mix/", file: "MixEngine.swift", panel: "Audio Engine + Mix", target: "audioOpen", color: "fuchsia", desc: "Vocal/Music gain sliders · master volume" },
                  { folder: "DAW/", file: "DAWEngine.swift", panel: "Track Timeline", target: "timelineOpen", color: "blue", desc: "moveTrack drag · resize handles · snap grid" },
                  { folder: "DAW/", file: "TrackBlock.swift", panel: "Track Timeline", target: "timelineOpen", color: "blue", desc: "Block model · id/name/start/duration" },
                  { folder: "AI/", file: "ProducerBrain.swift", panel: "Ultra Engine · Producer Brain", target: "ultraOpen", color: "orange", desc: "Per-section emotion-driven arrangement notes" },
                  { folder: "AI/", file: "ExecutiveProducer.swift", panel: "Executive Producer · Label", target: "executiveOpen", color: "yellow", desc: "Composite verdict · GREENLIGHT/REVISE/REJECTED" },
                  { folder: "AI/", file: "HitFactory.swift", panel: "Ultra Song Lab", target: "labOpen", color: "emerald", desc: "Random hit dict · hook/bpm/structure/score" },
                  { folder: "Vocal/", file: "VocalCoach.swift", panel: "Audio Engine · Vocal Coach", target: "audioOpen", color: "yellow", desc: "Live RMS analyser · 0.15/0.85 thresholds" },
                  { folder: "Export/", file: "SunoExport.swift", panel: "Ultra Song Lab", target: "labOpen", color: "emerald", desc: "Multi-line prompt formatter" },
                ];

                // Group by folder
                const grouped = {};
                tree.forEach((item) => {
                  if (!grouped[item.folder]) grouped[item.folder] = [];
                  grouped[item.folder].push(item);
                });

                const colorClass = (c) => ({
                  emerald: "text-emerald-400",
                  cyan: "text-cyan-400",
                  fuchsia: "text-fuchsia-400",
                  blue: "text-blue-400",
                  orange: "text-orange-400",
                  yellow: "text-yellow-400",
                }[c] || "text-slate-400");

                const setterMap = {
                  labOpen: setLabOpen,
                  audioOpen: setAudioOpen,
                  timelineOpen: setTimelineOpen,
                  ultraOpen: setUltraOpen,
                  executiveOpen: setExecutiveOpen,
                };

                const folders = Object.keys(grouped);

                return (
                  <div className="font-mono text-sm text-slate-300 leading-snug space-y-0">
                    {folders.map((folder, fIdx) => {
                      const items = grouped[folder];
                      const isLastFolder = fIdx === folders.length - 1;
                      return (
                        <div key={folder}>
                          <div className="flex items-center">
                            <span className="text-slate-600">{isLastFolder ? " └── " : " ├── "}</span>
                            <span className="text-slate-500">📁 {folder}</span>
                          </div>
                          {items.map((item, iIdx) => {
                            const isLastItem = iIdx === items.length - 1;
                            const setter = setterMap[item.target];
                            return (
                              <div key={item.file} className="flex flex-col">
                                <button
                                  onClick={() => {
                                    if (setter) setter(true);
                                    // Smooth scroll briefly
                                    setTimeout(() => {
                                      const els = document.querySelectorAll("button");
                                      els.forEach((el) => {
                                        if (el.textContent && item.panel.split("·")[0].trim() && el.textContent.includes(item.panel.split("·")[0].trim())) {
                                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                                        }
                                      });
                                    }, 100);
                                  }}
                                  className="text-left active:bg-slate-800 rounded -mx-1 px-1 py-0.5 transition">
                                  <div className="flex items-center">
                                    <span className="text-slate-700">{isLastFolder ? "      " : " │    "}</span>
                                    <span className="text-slate-600">{isLastItem ? "└── " : "├── "}</span>
                                    <span className={`font-semibold ${colorClass(item.color)}`}>{item.file}</span>
                                    <span className="text-emerald-500 ml-1.5">●</span>
                                  </div>
                                  <div className="flex items-start ml-[1px]">
                                    <span className="text-slate-700">{isLastFolder ? "          " : " │        "}</span>
                                    <span className="text-slate-500 italic text-[13px]">→ {item.panel}</span>
                                  </div>
                                  <div className="flex items-start ml-[1px]">
                                    <span className="text-slate-700">{isLastFolder ? "          " : " │        "}</span>
                                    <span className="text-slate-600 text-[13px]">{item.desc}</span>
                                  </div>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Status footer */}
              <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-3 gap-2">
                <div className="bg-slate-900 rounded p-2 text-center">
                  <div className="text-[13px] uppercase tracking-wider text-slate-500 font-bold">Modules</div>
                  <div className="text-lg font-black text-emerald-400">9</div>
                </div>
                <div className="bg-slate-900 rounded p-2 text-center">
                  <div className="text-[13px] uppercase tracking-wider text-slate-500 font-bold">Folders</div>
                  <div className="text-lg font-black text-cyan-400">7</div>
                </div>
                <div className="bg-slate-900 rounded p-2 text-center">
                  <div className="text-[13px] uppercase tracking-wider text-slate-500 font-bold">Status</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">● ALL LIVE</div>
                </div>
              </div>

              <div className="text-[13px] text-slate-500 italic mt-2 leading-relaxed">
                Tap any file to jump to its panel. Green dot = wired and live in this app. Architecture matches your Swift project structure 1:1.
              </div>
            </div>
          )}
        </div>

        {/* HELP — AI assistant for app questions */}
        <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl border-2 border-sky-300 mb-3 overflow-hidden shadow-sm">
          <button onClick={() => setHelpOpen(!helpOpen)} className="w-full flex items-center justify-between p-3 active:bg-sky-100">
            <span className="flex items-center gap-1.5 text-sm font-bold text-sky-900">
              <HelpCircle className="w-3.5 h-3.5" /> Help · Ask About This App
              <span className="text-[13px] bg-sky-200 text-sky-800 px-1.5 py-0.5 rounded-full font-bold">AI</span>
            </span>
            {helpOpen ? <ChevronUp className="w-4 h-4 text-sky-700" /> : <ChevronDown className="w-4 h-4 text-sky-700" />}
          </button>

          {helpOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-sky-800 bg-white/70 rounded-lg p-2 border border-sky-200 leading-relaxed">
                Ask anything: <em>"how do I use the hit library"</em>, <em>"what does radio safety score mean"</em>, <em>"how do I get a 5-star rating"</em>, <em>"explain the producer brain"</em>, etc.
              </div>

              {/* Suggested questions */}
              <div>
                <div className="text-[13px] font-bold text-sky-700 uppercase tracking-wider mb-1">Quick Questions</div>
                <div className="flex flex-wrap gap-1">
                  {[
                    "How do I make a hit song?",
                    "What's the difference between Hit Audit and Executive Producer?",
                    "How do I avoid AI sterility?",
                    "Best workflow for first-time users?",
                    "What do I copy into Suno?",
                    "How does the Ultra Engine work?",
                  ].map((q) => (
                    <button key={q} onClick={() => setHelpQuestion(q)}
                      className="px-2 py-1 rounded-full text-sm bg-white border border-sky-200 text-sky-700 active:bg-sky-100 active:scale-95">
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question input */}
              <div className="relative">
                <textarea
                  value={helpQuestion}
                  onChange={(e) => setHelpQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      askHelp();
                    }
                  }}
                  placeholder="Type your question..."
                  rows={2}
                  className="w-full bg-white rounded-lg p-2.5 text-base border border-sky-200 focus:border-sky-500 focus:outline-none resize-none pr-10"
                />
                {helpQuestion && (
                  <button onClick={() => setHelpQuestion("")}
                    className="absolute top-2 right-2 p-0.5 text-slate-400 active:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Ask button */}
              <button
                type="button"
                onClick={askHelp}
                disabled={helpLoading || !helpQuestion.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
                {helpLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</>
                ) : (
                  <><Send className="w-3.5 h-3.5" /> Ask</>
                )}
              </button>

              {helpError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-[13px] text-red-700">
                  {helpError}
                </div>
              )}

              {/* Current answer */}
              {helpAnswer && (
                <div className="bg-white rounded-lg p-3 border-l-4 border-sky-500 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <HelpCircle className="w-3 h-3 text-sky-600" />
                    <span className="text-[13px] font-black uppercase tracking-wider text-sky-700">Answer</span>
                  </div>
                  <div className="text-[12px] text-slate-800 leading-relaxed whitespace-pre-wrap">{helpAnswer}</div>
                </div>
              )}

              {/* Recent question history */}
              {helpHistory.length > 1 && (
                <div className="space-y-1.5">
                  <div className="text-[13px] font-bold text-sky-700 uppercase tracking-wider">Recent</div>
                  {helpHistory.slice(1).map((entry, i) => (
                    <details key={entry.ts} className="bg-white rounded-lg border border-sky-200 overflow-hidden">
                      <summary className="cursor-pointer px-2.5 py-1.5 text-[13px] font-semibold text-sky-800 active:bg-sky-50">
                        {entry.q}
                      </summary>
                      <div className="px-2.5 pb-2 text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap border-t border-sky-100 pt-2">
                        {entry.a}
                      </div>
                    </details>
                  ))}
                </div>
              )}

              {helpHistory.length === 0 && !helpAnswer && !helpLoading && (
                <div className="text-sm text-sky-700 italic text-center py-2 bg-white/50 rounded-lg border border-sky-100">
                  Tap a quick question above or type your own.
                </div>
              )}
            </div>
          )}
        </div>

        </>)}

        {activeTab === "score" && (<>
        {/* SUNO POWER TOOLS — Real AI tools that actually work */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-300 mb-3 overflow-hidden p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-base font-black text-purple-900 uppercase tracking-wider">Suno Power Tools</span>
          </div>
          <p className="text-sm text-purple-800 leading-relaxed">
            Six AI tools that genuinely help you build better Suno prompts. All powered by Claude — real outputs, no fake scoring.
          </p>
        </div>

        {/* TOOL 1: Reference Track Analyzer */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-300 mb-3 overflow-hidden">
          <button onClick={() => setRefAnalyzerOpen(!refAnalyzerOpen)} className="w-full flex items-center justify-between p-3 active:bg-blue-100">
            <span className="flex items-center gap-1.5 text-base font-bold text-blue-900">
              <Disc className="w-4 h-4" /> Reference Track Analyzer
              <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full font-bold ml-1">AI</span>
            </span>
            {refAnalyzerOpen ? <ChevronUp className="w-4 h-4 text-blue-700" /> : <ChevronDown className="w-4 h-4 text-blue-700" />}
          </button>
          {refAnalyzerOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-blue-800 bg-white/70 rounded-lg p-2 border border-blue-200 leading-relaxed">
                Name a song you want yours to sound like. AI extracts production DNA you can copy into your Suno style.
              </div>
              <input
                type="text" value={refTrackInput}
                onChange={(e) => setRefTrackInput(e.target.value)}
                placeholder="e.g. 'Blinding Lights' by The Weeknd"
                className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-blue-200 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => { haptic(10); analyzeReferenceTrack(); }}
                disabled={refAnalyzerLoading || !refTrackInput.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition shadow-md">
                {refAnalyzerLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Wand2 className="w-4 h-4" /> Extract DNA</>}
              </button>
              {refAnalyzerError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{refAnalyzerError}</div>}
              {refAnalyzerResult && (
                <div className="bg-white rounded-lg p-3 border border-blue-300 space-y-2">
                  {refAnalyzerResult.dna && (
                    <div>
                      <div className="text-xs font-black uppercase text-blue-700 mb-1">Production DNA Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {refAnalyzerResult.dna.map((tag, i) => (
                          <button key={i} onClick={() => { haptic(6); setSelectedTags(new Set([...selectedTags, tag])); }}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold active:scale-95">
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {refAnalyzerResult.bpm && (
                    <div className="flex items-center gap-3 text-sm">
                      <span><strong>BPM:</strong> {refAnalyzerResult.bpm}</span>
                      <span><strong>Key:</strong> {refAnalyzerResult.key}</span>
                      <span><strong>Mood:</strong> {refAnalyzerResult.mood}</span>
                    </div>
                  )}
                  {refAnalyzerResult.notes && (
                    <div className="text-sm text-slate-700 italic leading-snug">{refAnalyzerResult.notes}</div>
                  )}
                  <button
                    onClick={() => { haptic([10, 20, 10]); applyReferenceTrack(); }}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm active:scale-95">
                    Apply All to Song →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TOOL 2: Concept Expander */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-300 mb-3 overflow-hidden">
          <button onClick={() => setConceptOpen(!conceptOpen)} className="w-full flex items-center justify-between p-3 active:bg-violet-100">
            <span className="flex items-center gap-1.5 text-base font-bold text-violet-900">
              <Brain className="w-4 h-4" /> Concept Expander
              <span className="text-xs bg-violet-200 text-violet-800 px-1.5 py-0.5 rounded-full font-bold ml-1">AI</span>
            </span>
            {conceptOpen ? <ChevronUp className="w-4 h-4 text-violet-700" /> : <ChevronDown className="w-4 h-4 text-violet-700" />}
          </button>
          {conceptOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-violet-800 bg-white/70 rounded-lg p-2 border border-violet-200 leading-relaxed">
                Type a 1-line song idea. AI builds full structure: verse themes, chorus concept, bridge twist.
              </div>
              <textarea
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                placeholder="e.g. 'breaking up over text in a parking lot at 2am'"
                rows={2}
                className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-violet-200 focus:border-violet-500 focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={() => { haptic(10); expandConcept(); }}
                disabled={conceptLoading || !conceptInput.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition shadow-md">
                {conceptLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Expanding...</> : <><Wand2 className="w-4 h-4" /> Build Concept</>}
              </button>
              {conceptError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{conceptError}</div>}
              {conceptResult && (
                <div className="bg-white rounded-lg p-3 border border-violet-300 space-y-2 text-sm">
                  {conceptResult.title && <div><strong className="text-violet-700">Working Title:</strong> {conceptResult.title}</div>}
                  {conceptResult.verse1 && <div><strong className="text-violet-700">Verse 1:</strong> {conceptResult.verse1}</div>}
                  {conceptResult.chorus && <div><strong className="text-violet-700">Chorus:</strong> {conceptResult.chorus}</div>}
                  {conceptResult.verse2 && <div><strong className="text-violet-700">Verse 2:</strong> {conceptResult.verse2}</div>}
                  {conceptResult.bridge && <div><strong className="text-violet-700">Bridge:</strong> {conceptResult.bridge}</div>}
                  <button
                    onClick={() => { haptic([10, 20, 10]); applyConceptAsLyrics(); }}
                    className="w-full py-2 bg-violet-600 text-white rounded-lg font-bold text-sm active:scale-95">
                    Use as Lyric Outline →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TOOL 3: Suno Tag Optimizer */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-300 mb-3 overflow-hidden">
          <button onClick={() => setTagOptOpen(!tagOptOpen)} className="w-full flex items-center justify-between p-3 active:bg-emerald-100">
            <span className="flex items-center gap-1.5 text-base font-bold text-emerald-900">
              <Target className="w-4 h-4" /> Suno Tag Optimizer
              <span className="text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold ml-1">AI</span>
            </span>
            {tagOptOpen ? <ChevronUp className="w-4 h-4 text-emerald-700" /> : <ChevronDown className="w-4 h-4 text-emerald-700" />}
          </button>
          {tagOptOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-emerald-800 bg-white/70 rounded-lg p-2 border border-emerald-200 leading-relaxed">
                Takes your current Style DNA and rewrites it in Suno's preferred phrasing — concise, comma-separated, no redundancy.
              </div>
              <button
                type="button"
                onClick={() => { haptic(10); optimizeTags(); }}
                disabled={tagOptLoading || selectedTags.size === 0}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition shadow-md">
                {tagOptLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing...</> : <><Wand2 className="w-4 h-4" /> Optimize My Tags</>}
              </button>
              {tagOptError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{tagOptError}</div>}
              {tagOptResult && (
                <div className="bg-white rounded-lg p-3 border border-emerald-300 space-y-2">
                  <div>
                    <div className="text-xs font-black uppercase text-red-600 mb-1">Before ({selectedTags.size} tags)</div>
                    <div className="text-sm text-slate-600 line-through">{[...selectedTags].join(", ")}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-emerald-700 mb-1">After (optimized)</div>
                    <div className="text-sm text-slate-900 font-semibold">{tagOptResult.optimized}</div>
                  </div>
                  {tagOptResult.removed && tagOptResult.removed.length > 0 && (
                    <div className="text-xs text-slate-500 italic">Removed redundant: {tagOptResult.removed.join(", ")}</div>
                  )}
                  <button
                    onClick={() => { haptic([10, 20, 10]); applyOptimizedTags(); }}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm active:scale-95">
                    Replace My Tags →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TOOL 4: Cover Song Reimaginer */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-300 mb-3 overflow-hidden">
          <button onClick={() => setCoverOpen(!coverOpen)} className="w-full flex items-center justify-between p-3 active:bg-orange-100">
            <span className="flex items-center gap-1.5 text-base font-bold text-orange-900">
              <Shuffle className="w-4 h-4" /> Cover Song Reimaginer
              <span className="text-xs bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full font-bold ml-1">AI</span>
            </span>
            {coverOpen ? <ChevronUp className="w-4 h-4 text-orange-700" /> : <ChevronDown className="w-4 h-4 text-orange-700" />}
          </button>
          {coverOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-orange-800 bg-white/70 rounded-lg p-2 border border-orange-200 leading-relaxed">
                Take your existing lyrics and rewrite them in a new genre's voice — keeping meaning, changing cadence + imagery.
              </div>
              <div>
                <label className="text-sm font-bold text-orange-700 uppercase block mb-1">New Genre</label>
                <input
                  type="text" value={coverGenre}
                  onChange={(e) => setCoverGenre(e.target.value)}
                  placeholder="e.g. country ballad, trap, indie folk, gospel"
                  className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-orange-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => { haptic(10); reimagineCover(); }}
                disabled={coverLoading || !rawLyrics.trim() || !coverGenre.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition shadow-md">
                {coverLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Reimagining...</> : <><Wand2 className="w-4 h-4" /> Cover It</>}
              </button>
              {coverError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{coverError}</div>}
              {coverResult && (
                <div className="bg-white rounded-lg p-3 border border-orange-300">
                  <div className="text-xs font-black uppercase text-orange-700 mb-1">{coverGenre} version</div>
                  <pre className="text-sm whitespace-pre-wrap font-mono text-slate-800 leading-relaxed max-h-60 overflow-y-auto">{coverResult}</pre>
                  <button
                    onClick={() => { haptic([10, 20, 10]); setRawLyrics(coverResult); setActiveTab("write"); }}
                    className="w-full mt-2 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm active:scale-95">
                    Replace My Lyrics →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TOOL 5: Multi-Language Translator */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-300 mb-3 overflow-hidden">
          <button onClick={() => setTranslateOpen(!translateOpen)} className="w-full flex items-center justify-between p-3 active:bg-pink-100">
            <span className="flex items-center gap-1.5 text-base font-bold text-pink-900">
              <Globe className="w-4 h-4" /> Lyric Translator
              <span className="text-xs bg-pink-200 text-pink-800 px-1.5 py-0.5 rounded-full font-bold ml-1">AI</span>
            </span>
            {translateOpen ? <ChevronUp className="w-4 h-4 text-pink-700" /> : <ChevronDown className="w-4 h-4 text-pink-700" />}
          </button>
          {translateOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-pink-800 bg-white/70 rounded-lg p-2 border border-pink-200 leading-relaxed">
                Translate your lyrics into another language while preserving syllable count and rhyme structure for singability.
              </div>
              <select value={translateLang} onChange={(e) => setTranslateLang(e.target.value)}
                className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-pink-200 focus:border-pink-500 focus:outline-none">
                {["Spanish", "Portuguese", "French", "German", "Italian", "Japanese", "Korean", "Mandarin", "Hindi", "Arabic"].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => { haptic(10); translateLyrics(); }}
                disabled={translateLoading || !rawLyrics.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition shadow-md">
                {translateLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</> : <><Wand2 className="w-4 h-4" /> Translate</>}
              </button>
              {translateError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{translateError}</div>}
              {translateResult && (
                <div className="bg-white rounded-lg p-3 border border-pink-300">
                  <div className="text-xs font-black uppercase text-pink-700 mb-1">{translateLang}</div>
                  <pre className="text-sm whitespace-pre-wrap font-mono text-slate-800 leading-relaxed max-h-60 overflow-y-auto">{translateResult}</pre>
                  <button
                    onClick={() => { haptic([10, 20, 10]); setRawLyrics(translateResult); setLanguage(translateLang); setActiveTab("write"); }}
                    className="w-full mt-2 py-2 bg-pink-600 text-white rounded-lg font-bold text-sm active:scale-95">
                    Replace My Lyrics →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TOOL 6: Suno Prompt Critic */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-300 mb-3 overflow-hidden">
          <button onClick={() => setCriticOpen(!criticOpen)} className="w-full flex items-center justify-between p-3 active:bg-amber-100">
            <span className="flex items-center gap-1.5 text-base font-bold text-amber-900">
              <CheckCircle2 className="w-4 h-4" /> Suno Prompt Critic
              <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold ml-1">AI</span>
            </span>
            {criticOpen ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4 text-amber-700" />}
          </button>
          {criticOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-amber-800 bg-white/70 rounded-lg p-2 border border-amber-200 leading-relaxed">
                AI reviews your full Suno prompt (style + lyrics + exclude) and gives honest, specific feedback before you generate.
              </div>
              <button
                type="button"
                onClick={() => { haptic(10); critiquePrompt(); }}
                disabled={criticLoading || (selectedTags.size === 0 && !rawLyrics.trim())}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition shadow-md">
                {criticLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing...</> : <><Wand2 className="w-4 h-4" /> Critique My Prompt</>}
              </button>
              {criticError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{criticError}</div>}
              {criticResult && (
                <div className="bg-white rounded-lg p-3 border border-amber-300 space-y-2 text-sm">
                  {criticResult.strengths && criticResult.strengths.length > 0 && (
                    <div>
                      <div className="text-xs font-black uppercase text-emerald-700 mb-1">✓ Strengths</div>
                      <ul className="space-y-0.5 text-slate-700">{criticResult.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                    </div>
                  )}
                  {criticResult.weaknesses && criticResult.weaknesses.length > 0 && (
                    <div>
                      <div className="text-xs font-black uppercase text-orange-700 mb-1">⚠ Issues</div>
                      <ul className="space-y-0.5 text-slate-700">{criticResult.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}</ul>
                    </div>
                  )}
                  {criticResult.suggestions && criticResult.suggestions.length > 0 && (
                    <div>
                      <div className="text-xs font-black uppercase text-blue-700 mb-1">💡 Suggestions</div>
                      <ul className="space-y-0.5 text-slate-700">{criticResult.suggestions.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        </>)}


        {activeTab === "hits" && (<>
        {/* SONG VARIANTS — one-tap performance treatments */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 mb-3 overflow-hidden">
          <button onClick={() => setVariantsOpen(!variantsOpen)} className="w-full flex items-center justify-between p-3 active:bg-teal-100">
            <span className="flex items-center gap-1.5 text-sm font-bold text-teal-900">
              <Shuffle className="w-3.5 h-3.5" /> Song Variants
              {activeVariant && <span className="text-sm bg-teal-200 text-teal-800 px-1.5 py-0.5 rounded-full ml-1">{activeVariant}</span>}
            </span>
            {variantsOpen ? <ChevronUp className="w-4 h-4 text-teal-700" /> : <ChevronDown className="w-4 h-4 text-teal-700" />}
          </button>

          {variantsOpen && (
            <div className="p-3 pt-0 space-y-2">
              {variantToast && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-[13px] text-green-800 font-semibold text-center">
                  ✓ {variantToast}
                </div>
              )}

              <div className="text-sm text-teal-700 bg-white/60 rounded-lg p-2 border border-teal-100">
                One-tap treatments inject style tags + adjust BPM/structure for different performance versions.
              </div>

              {(() => {
                const variants = [
                  {
                    key: "stripped",
                    name: "Stripped Down",
                    icon: "🎸",
                    desc: "Acoustic, intimate, vocal-forward",
                    color: "from-amber-500 to-orange-500",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("acoustic guitar");
                      newTags.add("intimate close-mic");
                      newTags.add("sparse arrangement");
                      newTags.add("dry upfront vocal");
                      setSelectedTags(newTags);
                      setInstruments("acoustic guitar, light percussion, soft piano");
                      setNegativeTags("synth, electronic drums, autotune, big drop, EDM");
                      if (bpm) setBpm(String(Math.max(60, Math.round(parseInt(bpm) * 0.85))));
                    }
                  },
                  {
                    key: "live",
                    name: "Live Version",
                    icon: "🎤",
                    desc: "Crowd noise, live-room sound, energy",
                    color: "from-red-500 to-rose-500",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("live performance");
                      newTags.add("crowd noise");
                      newTags.add("live-room production");
                      newTags.add("ambient hall reverb");
                      newTags.add("call-and-response chant");
                      setSelectedTags(newTags);
                      setNegativeTags("studio polish, autotune, perfect quantization");
                    }
                  },
                  {
                    key: "remix",
                    name: "Club Remix",
                    icon: "🪩",
                    desc: "EDM drop, sidechained, festival-ready",
                    color: "from-fuchsia-500 to-purple-500",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("festival EDM drop");
                      newTags.add("sidechained synth pads");
                      newTags.add("white-noise risers");
                      newTags.add("filter sweep transitions");
                      newTags.add("club banger");
                      setSelectedTags(newTags);
                      setInstruments("synth lead, kick drum, sub-bass, percussion");
                      setBpm("128");
                    }
                  },
                  {
                    key: "lofi",
                    name: "Lo-Fi Chill",
                    icon: "☕",
                    desc: "Slow, dusty, vinyl warmth",
                    color: "from-violet-500 to-indigo-500",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("lo-fi room drums");
                      newTags.add("vinyl crackle");
                      newTags.add("tape saturation");
                      newTags.add("analog warmth");
                      newTags.add("dreamy indie-rock");
                      setSelectedTags(newTags);
                      setInstruments("electric piano, jazz drums, upright bass, vinyl crackle");
                      if (bpm) setBpm(String(Math.max(70, Math.round(parseInt(bpm) * 0.7))));
                    }
                  },
                  {
                    key: "orchestral",
                    name: "Orchestral",
                    icon: "🎻",
                    desc: "Strings, cinematic build, epic",
                    color: "from-blue-500 to-indigo-500",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("cinematic depth");
                      newTags.add("Spike Stent cinematic depth");
                      newTags.add("build + release dynamics");
                      newTags.add("ambient hall reverb");
                      setSelectedTags(newTags);
                      setInstruments("strings, french horn, timpani, harp, choir");
                      setNegativeTags("synth, electronic drums, autotune, trap drums");
                    }
                  },
                  {
                    key: "trap",
                    name: "Trap Remix",
                    icon: "🥁",
                    desc: "808s, hi-hat rolls, dark atmosphere",
                    color: "from-slate-700 to-slate-900",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("trap-rock hybrid");
                      newTags.add("Mike Dean low-end focus");
                      newTags.add("Metro Boomin dark trap");
                      newTags.add("sub-bass pulse");
                      newTags.add("dark trap atmosphere");
                      setSelectedTags(newTags);
                      setInstruments("808s, trap drums, hi-hat rolls, dark synth pads");
                      setBpm("140");
                    }
                  },
                  {
                    key: "ballad",
                    name: "Slow Ballad",
                    icon: "🕯️",
                    desc: "Piano-driven, emotional, slow burn",
                    color: "from-pink-500 to-rose-500",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("intimate close-mic");
                      newTags.add("plate reverb tail");
                      newTags.add("build + release dynamics");
                      newTags.add("belted anthemic chorus");
                      setSelectedTags(newTags);
                      setInstruments("grand piano, strings, light drums, bass");
                      setBpm("72");
                      setMood("melancholy");
                      // Load Ballad arrangement
                      let id = nextId;
                      const newArr = arrangementTemplates["Ballad"].map((s) => ({ ...s, id: id++ }));
                      setArrangement(newArr);
                      setNextId(id);
                    }
                  },
                  {
                    key: "punk",
                    name: "Punk Rock",
                    icon: "⚡",
                    desc: "Fast, aggressive, distorted",
                    color: "from-yellow-500 to-red-600",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("2000s pop-punk");
                      newTags.add("crunchy bus compression");
                      newTags.add("tape saturation");
                      newTags.add("aggressive delivery");
                      newTags.add("garage rock energy");
                      setSelectedTags(newTags);
                      setInstruments("distorted electric guitar, bass, fast drums, gang vocals");
                      setBpm("180");
                      setMood("aggressive");
                    }
                  },
                  {
                    key: "country",
                    name: "Country Cover",
                    icon: "🤠",
                    desc: "Twang, fiddle, Nashville polish",
                    color: "from-orange-500 to-amber-600",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("country-pop crossover");
                      newTags.add("slick Nashville mix");
                      newTags.add("storytelling country ballad");
                      setSelectedTags(newTags);
                      setInstruments("acoustic guitar, fiddle, pedal steel, drums, banjo");
                      setBpm("100");
                    }
                  },
                  {
                    key: "afrobeats",
                    name: "Afrobeats Remix",
                    icon: "🌍",
                    desc: "Polyrhythmic, Lagos pop groove",
                    color: "from-emerald-500 to-teal-500",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("afrobeats");
                      newTags.add("call-and-response chant");
                      newTags.add("polyrhythmic percussion");
                      newTags.add("warm analog");
                      setSelectedTags(newTags);
                      setInstruments("talking drum, congas, electric guitar, bass, log drum");
                      setBpm("110");
                    }
                  },
                  {
                    key: "rnb_slow_jam",
                    name: "R&B Slow Jam",
                    icon: "🌹",
                    desc: "Sensual, smooth, late-night",
                    color: "from-purple-500 to-pink-500",
                    apply: () => {
                      const newTags = new Set(selectedTags);
                      newTags.add("neo-soul");
                      newTags.add("intimate close-mic");
                      newTags.add("falsetto hook");
                      newTags.add("warm analog");
                      newTags.add("plate reverb tail");
                      setSelectedTags(newTags);
                      setInstruments("electric piano, bass, light drums, soft horn pad");
                      setBpm("72");
                      setMood("romantic");
                    }
                  },
                  {
                    key: "reset",
                    name: "Reset Variant",
                    icon: "↺",
                    desc: "Clear all variant additions",
                    color: "from-slate-400 to-slate-500",
                    apply: () => {
                      // No-op — just clear active variant. User uses other clear buttons for full reset.
                    }
                  },
                ];

                const applyVariant = (variant) => {
                  variant.apply();
                  setActiveVariant(variant.key === "reset" ? null : variant.name);
                  setVariantToast(`${variant.name} applied`);
                  setTimeout(() => setVariantToast(""), 2000);
                };

                return (
                  <div className="grid grid-cols-2 gap-1.5">
                    {variants.map((v) => {
                      const isActive = activeVariant === v.name;
                      return (
                        <button
                          key={v.key}
                          onClick={() => applyVariant(v)}
                          className={`text-left p-2 rounded-lg border-2 transition active:scale-[0.97] ${
                            isActive
                              ? `bg-gradient-to-br ${v.color} text-white border-transparent shadow-md`
                              : "bg-white border-slate-200 active:border-teal-400"
                          }`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-lg leading-none">{v.icon}</span>
                            <span className={`text-[13px] font-black ${isActive ? "text-white" : "text-slate-900"}`}>{v.name}</span>
                          </div>
                          <div className={`text-[13px] leading-tight ${isActive ? "text-white/90" : "text-slate-500"}`}>
                            {v.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="text-[13px] text-slate-500 italic text-center pt-1">
                Variants stack on top of your current style — they ADD tags, not replace.
              </div>
            </div>
          )}
        </div>

        </>)}

        {activeTab === "sound" && (<>
        {/* AUDIO PLAYBACK ENGINE + MIX ENGINE */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-700 mb-3 overflow-hidden shadow-md">
          <button onClick={() => setAudioOpen(!audioOpen)} className="w-full flex items-center justify-between p-3 active:bg-slate-700">
            <span className="flex items-center gap-1.5 text-sm font-bold text-cyan-300">
              <Headphones className="w-3.5 h-3.5" /> Audio Engine + Mix
              {audioFileName && <span className="text-[13px] bg-cyan-500/20 text-cyan-200 px-1.5 py-0.5 rounded-full ml-1 truncate max-w-[120px]">{audioFileName}</span>}
            </span>
            {audioOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
          </button>

          {audioOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              {/* Hidden audio element */}
              <audio ref={audioRef} src={audioFile || undefined} preload="metadata" />

              {/* Upload area */}
              {!audioFile && (
                <label className="block bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-xl p-4 text-center cursor-pointer active:bg-slate-700">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                  <div className="text-sm font-bold text-cyan-200">Upload Audio</div>
                  <div className="text-sm text-slate-400 mt-0.5">MP3, WAV, M4A — Suno exports, references, demos</div>
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                </label>
              )}

              {/* Player */}
              {audioFile && (
                <>
                  {/* File header */}
                  <div className="flex items-center justify-between gap-2 bg-slate-700/40 rounded-lg px-2.5 py-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-cyan-200 truncate">{audioFileName}</div>
                      <div className="text-sm text-slate-400 font-mono">{fmtTime(audioCurrentTime)} / {fmtTime(audioDuration)}</div>
                    </div>
                    <button onClick={clearAudio} className="p-1.5 active:bg-red-900/40 rounded text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div onClick={seekTo} className="relative h-2 bg-slate-700 rounded-full overflow-hidden cursor-pointer">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${audioDuration ? (audioCurrentTime / audioDuration) * 100 : 0}%` }} />
                  </div>

                  {/* Transport controls */}
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => skip(-10)}
                      className="p-2 bg-slate-700 active:bg-slate-600 rounded-full text-cyan-300 active:scale-95">
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button onClick={togglePlay}
                      className="p-3 bg-cyan-500 active:bg-cyan-600 rounded-full text-white active:scale-95 shadow-lg">
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button onClick={() => skip(10)}
                      className="p-2 bg-slate-700 active:bg-slate-600 rounded-full text-cyan-300 active:scale-95">
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Playback speed */}
                  <div>
                    <div className="text-[13px] uppercase tracking-wider text-slate-400 font-bold mb-1">Playback Speed</div>
                    <div className="flex gap-1">
                      {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                        <button key={rate} onClick={() => setAudioRate(rate)}
                          className={`flex-1 py-1 rounded text-sm font-bold active:scale-95 ${
                            audioRate === rate ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-300"
                          }`}>{rate}x</button>
                      ))}
                    </div>
                  </div>

                  {/* MIX ENGINE — Vocal / Music gain controls */}
                  <div className="bg-slate-700/30 rounded-lg p-2.5 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-[13px] font-black uppercase tracking-wider text-fuchsia-300">
                        <Activity className="w-2.5 h-2.5" /> Mix Engine
                      </div>
                      <button
                        onClick={() => { setAudioVolume(0.8); setAudioRate(1.0); }}
                        className="text-[13px] text-slate-400 active:text-white">
                        Reset
                      </button>
                    </div>

                    {/* Master Volume (true browser audio gain) */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[13px] font-bold text-slate-300 uppercase flex items-center gap-1">
                          <Volume2 className="w-2.5 h-2.5" /> Master
                        </label>
                        <span className="text-sm font-mono text-cyan-300">{Math.round(audioVolume * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.01"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 accent-cyan-500"
                      />
                    </div>

                    {/* REAL EQ — biquad filters that actually modify playback */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[13px] font-bold text-pink-300 uppercase">🎤 Vocal Presence (2.5kHz)</label>
                        <span className="text-sm font-mono text-pink-300">{vocalGain > 0 ? "+" : ""}{vocalGain} dB</span>
                      </div>
                      <input
                        type="range" min="-12" max="12" step="0.5"
                        value={vocalGain}
                        onChange={(e) => setVocalGain(parseFloat(e.target.value))}
                        className="w-full h-1.5 accent-pink-500"
                      />
                      <div className="text-xs text-slate-500 mt-0.5">Boost = clearer vocal · Cut = more instrumental feel</div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[13px] font-bold text-purple-300 uppercase">🎹 Bass / Warmth (200Hz)</label>
                        <span className="text-sm font-mono text-purple-300">{bassGain > 0 ? "+" : ""}{bassGain} dB</span>
                      </div>
                      <input
                        type="range" min="-12" max="12" step="0.5"
                        value={bassGain}
                        onChange={(e) => setBassGain(parseFloat(e.target.value))}
                        className="w-full h-1.5 accent-purple-500"
                      />
                      <div className="text-xs text-slate-500 mt-0.5">Boost = warmer low-end · Cut = brighter / thinner</div>
                    </div>

                    <div className="text-[13px] text-slate-500 italic mt-2 leading-tight">
                      ✓ Real biquad filters in the audio chain. Hit Play and adjust — you'll hear the EQ change live.
                    </div>
                  </div>

                  {/* VOCAL COACH — Real-time RMS analysis */}
                  <div className="bg-slate-700/30 rounded-lg p-2.5 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-[13px] font-black uppercase tracking-wider text-yellow-300">
                        <Activity className="w-2.5 h-2.5" /> Vocal Coach · Live RMS
                      </div>
                      <span className="text-[13px] text-slate-400">
                        {isPlaying ? "🟢 Sampling" : "⏸ Paused"}
                      </span>
                    </div>

                    {/* Live RMS meter */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[13px] font-bold text-slate-300 uppercase">Current Level</label>
                        <span className="text-sm font-mono text-slate-300">{(currentRMS * 100).toFixed(1)}%</span>
                      </div>
                      <div className="relative h-3 bg-slate-900 rounded overflow-hidden">
                        {/* Threshold zones */}
                        <div className="absolute inset-y-0 left-0 w-[15%] bg-yellow-900/40" title="Too quiet zone" />
                        <div className="absolute inset-y-0 right-0 w-[15%] bg-red-900/40" title="Too loud zone" />
                        {/* Threshold lines */}
                        <div className="absolute inset-y-0 w-px bg-yellow-500/60" style={{ left: "15%" }} />
                        <div className="absolute inset-y-0 w-px bg-red-500/60" style={{ left: "85%" }} />
                        {/* Live level fill */}
                        <div className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                          currentRMS < 0.15 ? "bg-yellow-500" : currentRMS > 0.85 ? "bg-red-500" : "bg-green-500"
                        }`} style={{ width: `${Math.min(100, currentRMS * 100)}%` }} />
                        {/* Peak indicator */}
                        <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${Math.min(100, peakRMS * 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-0.5">
                        <span>0%</span>
                        <span className="text-yellow-500">15% Quiet</span>
                        <span className="text-red-500">85% Clip</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Peak readout */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-slate-900/60 rounded px-2 py-1">
                        <div className="text-[8px] uppercase font-bold text-slate-400">Live</div>
                        <div className="text-[12px] font-mono font-black text-cyan-300">{(currentRMS * 100).toFixed(1)}</div>
                      </div>
                      <div className="bg-slate-900/60 rounded px-2 py-1">
                        <div className="text-[8px] uppercase font-bold text-slate-400">Peak Hold</div>
                        <div className="text-[12px] font-mono font-black text-white">{(peakRMS * 100).toFixed(1)}</div>
                      </div>
                    </div>

                    {/* Coach verdict */}
                    {coachAnalysis && (
                      <div className={`rounded-lg p-2 border-l-4 ${
                        coachAnalysis.color === "green" ? "border-green-500 bg-green-900/20" :
                        coachAnalysis.color === "yellow" ? "border-yellow-500 bg-yellow-900/20" :
                        "border-red-500 bg-red-900/20"
                      }`}>
                        <div className="flex items-center gap-1.5">
                          {coachAnalysis.color === "green" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> :
                           <AlertTriangle className={`w-3.5 h-3.5 ${coachAnalysis.color === "yellow" ? "text-yellow-400" : "text-red-400"}`} />}
                          <span className={`text-[13px] font-bold ${
                            coachAnalysis.color === "green" ? "text-green-300" :
                            coachAnalysis.color === "yellow" ? "text-yellow-300" :
                            "text-red-300"
                          }`}>{coachAnalysis.msg}</span>
                        </div>
                      </div>
                    )}

                    {!coachAnalysis && (
                      <div className="text-sm text-slate-500 italic text-center py-1">
                        Hit play above to start RMS analysis.
                      </div>
                    )}

                    <div className="text-[8px] text-slate-500 italic mt-2 leading-tight">
                      RMS = Root Mean Square loudness. Peak hold uses 5% decay per frame for stable readings.
                    </div>
                  </div>

                  {/* AUDIO TO LYRICS — Whisper transcription */}
                  <div className="bg-slate-700/30 rounded-lg p-2.5 border border-slate-700 mt-2">
                    <button
                      type="button"
                      onClick={() => setTranscribeOpen(!transcribeOpen)}
                      className="w-full flex items-center justify-between text-violet-300 active:opacity-80">
                      <span className="flex items-center gap-1 text-sm font-black uppercase tracking-wider">
                        <FileText className="w-3 h-3" /> Audio → Lyrics + Pitch
                      </span>
                      {transcribeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {transcribeOpen && (
                      <div className="mt-2 space-y-2">
                        <div className="text-sm text-slate-400 leading-relaxed">
                          Transcribe lyrics with OpenAI Whisper, or extract a melody pitch contour offline.
                        </div>

                        {/* OpenAI key */}
                        <div>
                          <label className="text-sm text-violet-300 font-bold uppercase block mb-1">OpenAI Key (saved locally)</label>
                          <input
                            type="password"
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full bg-slate-900 rounded px-2 py-1.5 text-sm font-mono text-violet-200 border border-slate-700 focus:border-violet-500 focus:outline-none"
                          />
                          <div className="text-sm text-slate-500 mt-0.5">Get one at platform.openai.com/api-keys</div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => { haptic(10); transcribeAudio(); }}
                            disabled={transcribeLoading || !audioFile}
                            className="py-2 bg-violet-600 active:bg-violet-700 text-white rounded font-bold text-sm flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40">
                            {transcribeLoading ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Transcribing...</>
                            ) : (
                              <><FileText className="w-3 h-3" /> Transcribe</>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => { haptic(10); analyzePitchContour(); }}
                            disabled={pitchAnalyzing || !audioFile}
                            className="py-2 bg-cyan-600 active:bg-cyan-700 text-white rounded font-bold text-sm flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40">
                            {pitchAnalyzing ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                            ) : (
                              <><Activity className="w-3 h-3" /> Pitch Map</>
                            )}
                          </button>
                        </div>

                        {transcribeError && (
                          <div className="bg-red-900/40 border border-red-700 rounded p-2 text-sm text-red-300">{transcribeError}</div>
                        )}

                        {/* Transcript result */}
                        {transcript && (
                          <div className="bg-slate-900 rounded p-2 border border-violet-700">
                            <div className="text-sm font-bold uppercase text-violet-300 mb-1">Transcript</div>
                            <div className="text-sm text-slate-200 max-h-40 overflow-y-auto whitespace-pre-wrap leading-snug">{transcript}</div>
                            <button
                              type="button"
                              onClick={useTranscriptAsLyrics}
                              className="mt-2 w-full py-1.5 bg-violet-600 active:bg-violet-700 text-white rounded text-sm font-bold active:scale-95">
                              Use as Lyrics →
                            </button>
                          </div>
                        )}

                        {/* Pitch contour display + adjustment controls */}
                        {pitchData.length > 0 && (
                          <div className="bg-slate-900 rounded p-2 border border-cyan-700">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm font-bold uppercase text-cyan-300">Pitch Contour</div>
                              <button
                                type="button"
                                onClick={resetPitchAdjustments}
                                className="text-sm text-slate-400 active:text-white flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Reset
                              </button>
                            </div>

                            {(() => {
                              const validOriginal = pitchData.filter((p) => p.pitch > 0);
                              if (validOriginal.length === 0) return <div className="text-sm text-slate-500">No pitched content detected.</div>;

                              const validAdjusted = adjustedPitchData.filter((p) => p.adjustedPitch > 0);
                              const allPitches = [...validOriginal.map(p => p.pitch), ...validAdjusted.map(p => p.adjustedPitch)];
                              const minP = Math.min(...allPitches);
                              const maxP = Math.max(...allPitches);
                              const range = maxP - minP || 1;

                              return (
                                <>
                                  {/* Dual overlay: original (faded) + adjusted (bright) */}
                                  <svg viewBox={`0 0 ${pitchData.length} 60`} preserveAspectRatio="none" className="w-full h-20 bg-slate-950 rounded">
                                    {/* Octave grid lines */}
                                    {[0.25, 0.5, 0.75].map((y) => (
                                      <line key={y} x1="0" y1={y * 60} x2={pitchData.length} y2={y * 60} stroke="#1e293b" strokeWidth="0.3" />
                                    ))}
                                    {/* Original pitches (faded) */}
                                    {pitchData.map((p, i) => {
                                      if (p.pitch === 0) return null;
                                      const y = 60 - ((p.pitch - minP) / range) * 55 - 2;
                                      return <circle key={`o-${i}`} cx={i} cy={y} r={0.5} fill="#475569" opacity="0.6" />;
                                    })}
                                    {/* Adjusted pitches (bright) */}
                                    {adjustedPitchData.map((p, i) => {
                                      if (p.adjustedPitch === 0) return null;
                                      const y = 60 - ((p.adjustedPitch - minP) / range) * 55 - 2;
                                      return <circle key={`a-${i}`} cx={i} cy={y} r={0.7} fill="#22d3ee" />;
                                    })}
                                  </svg>
                                  <div className="flex items-center justify-between text-sm font-mono mt-1">
                                    <span className="text-slate-500">●&nbsp;original</span>
                                    <span className="text-cyan-400">●&nbsp;adjusted</span>
                                  </div>

                                  {/* ADJUSTMENT CONTROLS */}
                                  <div className="mt-2 space-y-2 bg-slate-950/50 rounded p-2 border border-slate-800">
                                    <div className="text-sm font-black uppercase text-cyan-300 tracking-wider">Adjust</div>

                                    {/* Transpose */}
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="text-sm font-bold text-slate-300 uppercase">Transpose</label>
                                        <span className="text-sm font-mono text-cyan-300">{pitchTranspose > 0 ? "+" : ""}{pitchTranspose} st</span>
                                      </div>
                                      <input
                                        type="range" min="-12" max="12" step="1"
                                        value={pitchTranspose}
                                        onChange={(e) => setPitchTranspose(parseInt(e.target.value))}
                                        className="w-full h-2 accent-cyan-500"
                                      />
                                      <div className="flex justify-between text-sm text-slate-500 font-mono">
                                        <span>-12</span><span>0</span><span>+12</span>
                                      </div>
                                    </div>

                                    {/* Smoothing */}
                                    <div>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <label className="text-sm font-bold text-slate-300 uppercase">Smooth</label>
                                        <span className="text-sm font-mono text-cyan-300">{pitchSmoothing === 0 ? "off" : pitchSmoothing}</span>
                                      </div>
                                      <input
                                        type="range" min="0" max="10" step="1"
                                        value={pitchSmoothing}
                                        onChange={(e) => setPitchSmoothing(parseInt(e.target.value))}
                                        className="w-full h-2 accent-cyan-500"
                                      />
                                      <div className="text-sm text-slate-500">Median filter window — removes pitch jitter</div>
                                    </div>

                                    {/* Snap to key */}
                                    <div>
                                      <label className="text-sm font-bold text-slate-300 uppercase block mb-1">Snap to Key</label>
                                      <select
                                        value={pitchSnapToKey}
                                        onChange={(e) => setPitchSnapToKey(e.target.value)}
                                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-cyan-500 focus:outline-none">
                                        {Object.keys(KEY_SCALES).map((k) => (
                                          <option key={k} value={k}>{k === "none" ? "— off (chromatic) —" : k}</option>
                                        ))}
                                      </select>
                                      <div className="text-sm text-slate-500 mt-0.5">Snaps each note to the nearest scale tone</div>
                                    </div>

                                    {/* Octave lock */}
                                    <button
                                      type="button"
                                      onClick={() => { haptic(8); setPitchOctaveLock(!pitchOctaveLock); }}
                                      className={`w-full py-1.5 rounded text-sm font-bold active:scale-95 ${
                                        pitchOctaveLock ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"
                                      }`}>
                                      {pitchOctaveLock ? "✓ Octave Lock ON" : "Octave Lock — clamp to 1 octave"}
                                    </button>
                                  </div>

                                  {/* Range readout */}
                                  <div className="text-sm text-slate-400 mt-1 font-mono leading-tight">
                                    Original: {Math.min(...validOriginal.map(p => p.pitch)).toFixed(0)}–{Math.max(...validOriginal.map(p => p.pitch)).toFixed(0)} Hz<br/>
                                    {validAdjusted.length > 0 && (
                                      <span className="text-cyan-400">Adjusted: {Math.min(...validAdjusted.map(p => p.adjustedPitch)).toFixed(0)}–{Math.max(...validAdjusted.map(p => p.adjustedPitch)).toFixed(0)} Hz</span>
                                    )}
                                  </div>

                                  {/* Adjusted note sequence */}
                                  <div className="mt-2 max-h-32 overflow-y-auto">
                                    <div className="text-sm font-bold text-cyan-300 mb-0.5">Adjusted melody:</div>
                                    <div className="text-sm font-mono text-slate-300 leading-snug flex flex-wrap gap-x-2">
                                      {(() => {
                                        const compressed = [];
                                        for (const p of adjustedPitchData) {
                                          if (p.adjustedNote === "—") continue;
                                          if (compressed.length === 0 || compressed[compressed.length - 1].note !== p.adjustedNote) {
                                            compressed.push({ note: p.adjustedNote, time: p.time });
                                          }
                                        }
                                        return compressed.slice(0, 80).map((n, i) => (
                                          <span key={i}><span className="text-cyan-400">{n.note}</span><span className="text-slate-600">@{n.time.toFixed(1)}s</span></span>
                                        ));
                                      })()}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                            <div className="text-sm text-slate-500 mt-2 italic leading-tight">
                              Note: This is a fundamental-frequency contour (single-voice estimation), not full sheet music. Polyphonic-to-score from arbitrary audio isn't reliably possible in-browser.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Replace file */}
                  <label className="block text-center text-sm text-cyan-400 active:text-cyan-300 cursor-pointer py-1">
                    <Upload className="w-3 h-3 inline mr-1" /> Replace audio
                    <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                  </label>
                </>
              )}
            </div>
          )}
        </div>

        {/* TRACK TIMELINE — Visual block arrangement */}
        <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 mb-3 overflow-hidden shadow-md">
          <button onClick={() => setTimelineOpen(!timelineOpen)} className="w-full flex items-center justify-between p-3 active:bg-slate-800">
            <span className="flex items-center gap-1.5 text-sm font-bold text-cyan-300">
              <Activity className="w-3.5 h-3.5" /> Track Timeline
              <span className="text-[13px] text-slate-400 font-normal">{trackBlocks.length} blocks · {fmtTime(timelineDuration)}</span>
            </span>
            {timelineOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
          </button>

          {timelineOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-2 border border-slate-700 leading-relaxed">
                Visual arrangement view. Each block = a song section with name + start time + duration. Syncs with audio playhead if a file is loaded.
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => addTrackBlock("Section", trackBlocks.length > 0 ? Math.max(...trackBlocks.map(b => b.startTime + b.duration)) : 0, 16)}
                  className="px-2.5 py-1 bg-cyan-600 active:bg-cyan-700 text-white rounded-md text-sm font-bold flex items-center gap-1 active:scale-95">
                  <Plus className="w-3 h-3" /> Add Block
                </button>
                <button
                  onClick={importFromArrangement}
                  disabled={arrangement.length === 0}
                  className="px-2.5 py-1 bg-purple-600 active:bg-purple-700 text-white rounded-md text-sm font-bold flex items-center gap-1 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Layers className="w-3 h-3" /> Import Arrangement
                </button>
                <button
                  onClick={() => setTrackBlocks([])}
                  disabled={trackBlocks.length === 0}
                  className="px-2.5 py-1 bg-red-600 active:bg-red-700 text-white rounded-md text-sm font-bold flex items-center gap-1 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ml-auto">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              {/* Visual timeline */}
              <div className="bg-slate-950 rounded-lg p-2 border border-slate-700">
                {/* Time markers */}
                <div className="relative h-4 mb-1">
                  {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                    <div key={pct} className="absolute top-0 -translate-x-1/2" style={{ left: `${pct * 100}%` }}>
                      <div className="w-px h-2 bg-slate-600 mx-auto" />
                      <div className="text-[8px] text-slate-500 font-mono">{fmtTime(timelineDuration * pct)}</div>
                    </div>
                  ))}
                </div>

                {/* Track lane */}
                <div ref={timelineRef} className="relative h-14 bg-slate-800 rounded overflow-hidden touch-none select-none">
                  {/* Snap grid lines */}
                  {snapEnabled && [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map((pct) => (
                    <div key={pct} className="absolute top-0 bottom-0 w-px bg-slate-700/50" style={{ left: `${pct * 100}%` }} />
                  ))}

                  {/* Block layers */}
                  {trackBlocks.map((block) => {
                    const leftPct = (block.startTime / timelineDuration) * 100;
                    const widthPct = (block.duration / timelineDuration) * 100;
                    const isDragging = dragState?.blockId === block.id;
                    return (
                      <div
                        key={block.id}
                        onPointerDown={(e) => handleBlockPointerDown(e, block, "move")}
                        className={`absolute top-1 bottom-1 ${blockColor(block.name)} rounded ${
                          editingBlock === block.id ? "ring-2 ring-white" : ""
                        } ${isDragging ? "opacity-80 z-20 shadow-lg cursor-grabbing" : "cursor-grab"} overflow-hidden text-left transition-shadow`}
                        style={{ left: `${leftPct}%`, width: `${Math.max(2, widthPct)}%` }}>
                        <div className="px-1 pt-0.5 pointer-events-none">
                          <div className="text-[13px] font-bold text-white truncate leading-tight">{block.name}</div>
                          <div className="text-[8px] text-white/80 font-mono leading-tight">{fmtTime(block.startTime)} · {fmtTime(block.duration)}</div>
                        </div>
                        {/* Resize handle (right edge) */}
                        <div
                          onPointerDown={(e) => handleBlockPointerDown(e, block, "resize")}
                          className="absolute top-0 right-0 bottom-0 w-2 bg-white/20 active:bg-white/40 cursor-ew-resize"
                          title="Drag to resize"
                        />
                      </div>
                    );
                  })}

                  {/* Playhead */}
                  {audioFile && audioDuration > 0 && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-30"
                      style={{ left: `${(audioCurrentTime / Math.max(timelineDuration, audioDuration)) * 100}%` }}>
                      <div className="w-2 h-2 bg-red-500 rounded-full -translate-x-3/4 -translate-y-1/2 absolute top-1/2"></div>
                    </div>
                  )}

                  {trackBlocks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm text-slate-500 italic">No blocks yet — tap Add Block</span>
                    </div>
                  )}
                </div>

                {/* Snap toggle */}
                <div className="flex items-center justify-between mt-1.5">
                  <button
                    onClick={() => setSnapEnabled(!snapEnabled)}
                    className={`px-2 py-0.5 rounded text-[13px] font-bold uppercase tracking-wider ${
                      snapEnabled ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-slate-700 text-slate-400 border border-slate-600"
                    }`}>
                    {snapEnabled ? "✓ Snap 0.5s" : "Free Move"}
                  </button>
                  {dragState && (
                    <span className="text-[13px] text-cyan-300 font-mono animate-pulse">
                      {dragState.mode === "move" ? "↔ Moving" : "↔ Resizing"}
                    </span>
                  )}
                  <span className="text-[13px] text-slate-500">Drag blocks · Drag right edge to resize</span>
                </div>
              </div>

              {/* Block list (editable) */}
              <div className="space-y-1">
                {trackBlocks.map((block) => (
                  <div key={block.id} className={`bg-slate-800 rounded-lg p-2 border ${
                    editingBlock === block.id ? "border-cyan-500" : "border-slate-700"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${blockColor(block.name)} flex-shrink-0`}></div>
                      <input
                        type="text" value={block.name}
                        onChange={(e) => updateTrackBlock(block.id, "name", e.target.value)}
                        onFocus={() => setEditingBlock(block.id)}
                        className="flex-1 bg-slate-900 rounded px-2 py-1 text-[13px] font-semibold text-white border border-slate-700 focus:border-cyan-500 focus:outline-none min-w-0"
                      />
                      <button onClick={() => removeTrackBlock(block.id)} className="p-1 text-red-400 active:bg-red-900/40 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                      <div>
                        <label className="text-[8px] text-slate-400 uppercase font-bold block mb-0.5">Start (s)</label>
                        <input
                          type="number" min="0" step="0.5" value={block.startTime}
                          onChange={(e) => updateTrackBlock(block.id, "startTime", parseFloat(e.target.value) || 0)}
                          onFocus={() => setEditingBlock(block.id)}
                          className="w-full bg-slate-900 rounded px-1.5 py-1 text-sm font-mono text-cyan-300 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-slate-400 uppercase font-bold block mb-0.5">Duration (s)</label>
                        <input
                          type="number" min="0.5" step="0.5" value={block.duration}
                          onChange={(e) => updateTrackBlock(block.id, "duration", parseFloat(e.target.value) || 0.5)}
                          onFocus={() => setEditingBlock(block.id)}
                          className="w-full bg-slate-900 rounded px-1.5 py-1 text-sm font-mono text-cyan-300 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="text-[13px] text-slate-500 font-mono mt-1">
                      {fmtTime(block.startTime)} → {fmtTime(block.startTime + block.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        </>)}

        {activeTab === "write" && (<>
        {/* Lyrics */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm uppercase tracking-wider text-slate-500 font-bold">Lyrics</label>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRawLyrics("");
                setTitle("");
                setCoachResult(null);
              }}
              className="text-[13px] text-white bg-red-600 px-2.5 py-1 rounded-md flex items-center gap-1 active:scale-95 active:bg-red-700 font-semibold shadow-sm"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          <textarea
            ref={lyricsTextareaRef}
            value={rawLyrics}
            onChange={(e) => setRawLyrics(e.target.value)}
            onSelect={handleLyricsSelection}
            onMouseUp={handleLyricsSelection}
            onKeyUp={handleLyricsSelection}
            onTouchEnd={handleLyricsSelection}
            placeholder="Paste lyrics. Use [Verse], [Chorus], [Bridge]."
            className="w-full h-44 bg-white text-black rounded-xl p-2.5 text-base font-mono resize-none border border-slate-200 focus:border-purple-500 focus:outline-none leading-snug" />

          {/* AI IMPROVE SELECTION — appears when text is highlighted */}
          {selectedLyricText && (
            <div className="mt-2 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl p-2.5 border-2 border-violet-300">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-sm font-black uppercase tracking-wider text-violet-700">Selected</span>
                <span className="text-sm text-violet-600 font-mono">"{selectedLyricText.substring(0, 40)}{selectedLyricText.length > 40 ? "…" : ""}"</span>
              </div>

              {!improveResult && !improveLoading && (
                <>
                  <div className="text-sm text-violet-700 font-bold uppercase mb-1">Improve with AI</div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { mode: "rewrite", label: "Rewrite", color: "bg-violet-600" },
                      { mode: "tighten", label: "Tighten", color: "bg-blue-600" },
                      { mode: "punchier", label: "Punchier", color: "bg-red-600" },
                      { mode: "smoother", label: "Smoother", color: "bg-green-600" },
                      { mode: "concrete", label: "Concrete", color: "bg-amber-600" },
                      { mode: "rhyme", label: "Rhyme", color: "bg-pink-600" },
                    ].map((m) => (
                      <button
                        key={m.mode}
                        type="button"
                        onClick={() => { haptic(8); improveSelection(m.mode); }}
                        className={`${m.color} text-white text-sm font-bold py-1.5 rounded active:scale-95`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {improveLoading && (
                <div className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-violet-700">
                  <Loader2 className="w-4 h-4 animate-spin" /> Rewriting selection...
                </div>
              )}

              {improveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 mt-1">
                  {improveError}
                </div>
              )}

              {improveResult && (
                <div className="space-y-2">
                  <div className="bg-red-50 rounded-lg p-2 border-l-2 border-red-300">
                    <div className="text-sm font-bold text-red-700 uppercase mb-0.5">Original</div>
                    <div className="text-sm font-mono text-slate-700 leading-snug">{selectedLyricText}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 border-l-2 border-green-400">
                    <div className="text-sm font-bold text-green-700 uppercase mb-0.5">{improveResult.mode}</div>
                    <div className="text-sm font-mono text-slate-800 leading-snug">{improveResult.rewrite}</div>
                  </div>
                  <div className="text-sm text-slate-500 italic">{improveResult.explanation}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={applyImprovement}
                      className="py-2 bg-green-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-1 active:scale-95">
                      <Check className="w-3.5 h-3.5" /> Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImproveResult(null); haptic(6); }}
                      className="py-2 bg-slate-300 text-slate-700 rounded-lg font-bold text-sm flex items-center justify-center gap-1 active:scale-95">
                      <X className="w-3.5 h-3.5" /> Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedLyricText && rawLyrics.trim() && (
            <div className="text-sm text-slate-400 italic mt-1.5 text-center">
              💡 Highlight any line to get AI improvement options
            </div>
          )}
        </div>

        {/* TITLE GENERATOR */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-300 mb-3 overflow-hidden">
          <button onClick={() => setTitleOpen(!titleOpen)} className="w-full flex items-center justify-between p-3 active:bg-amber-100">
            <span className="flex items-center gap-1.5 text-base font-bold text-amber-900">
              <Sparkles className="w-4 h-4" /> Title Generator
              <span className="text-sm bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold ml-1">AI</span>
            </span>
            {titleOpen ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4 text-amber-700" />}
          </button>

          {titleOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-amber-800 bg-white/70 rounded-lg p-2 border border-amber-200 leading-relaxed">
                Generates 8 title options based on your lyrics + style. Tap any title to set it.
              </div>

              <div>
                <label className="text-sm font-bold text-amber-700 uppercase block mb-1">Title Style</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "modern", label: "Modern", icon: "📱" },
                    { key: "classic", label: "Classic", icon: "🎼" },
                    { key: "cryptic", label: "Cryptic", icon: "🌀" },
                    { key: "direct", label: "Hook-based", icon: "🎯" },
                    { key: "poetic", label: "Poetic", icon: "🌙" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => { haptic(6); setTitleStyle(s.key); }}
                      className={`px-2.5 py-1 rounded-full text-base font-semibold active:scale-95 ${
                        titleStyle === s.key ? "bg-amber-600 text-white" : "bg-white border border-amber-200 text-amber-700"
                      }`}>{s.icon} {s.label}</button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => { haptic(10); generateTitles(); }}
                disabled={titleLoading || !rawLyrics.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition shadow-md">
                {titleLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Brainstorming titles...</>
                ) : (
                  <><Wand2 className="w-4 h-4" /> Generate 8 Titles</>
                )}
              </button>

              {titleError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{titleError}</div>
              )}

              {titleAppliedToast && (
                <div className="bg-green-100 border-2 border-green-400 rounded-lg p-2.5 text-sm text-green-800 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Title set: "{titleAppliedToast}"</span>
                </div>
              )}

              {titleResults.length > 0 && (
                <div className="space-y-1.5">
                  {titleResults.map((t, i) => (
                    <div key={i} className={`bg-white rounded-lg p-2.5 border ${title === t.title ? "border-amber-500 ring-2 ring-amber-300" : "border-amber-200"}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-base font-black text-slate-900 leading-tight flex-1">"{t.title}"</div>
                        <button
                          type="button"
                          onClick={() => useTitle(t.title)}
                          className={`px-2.5 py-1 rounded-md text-sm font-bold flex items-center gap-1 active:scale-95 flex-shrink-0 ${
                            title === t.title ? "bg-green-600 text-white" : "bg-amber-600 text-white"
                          }`}>
                          {title === t.title ? <><Check className="w-3 h-3" /> Set</> : "Use"}
                        </button>
                      </div>
                      {t.type && <span className="text-sm text-amber-700 font-bold uppercase">{t.type}</span>}
                      {t.reason && <div className="text-sm text-slate-500 italic mt-0.5 leading-tight">{t.reason}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* HOOK MAKER */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-300 mb-3 overflow-hidden">
          <button onClick={() => setHookOpen(!hookOpen)} className="w-full flex items-center justify-between p-3 active:bg-rose-100">
            <span className="flex items-center gap-1.5 text-base font-bold text-rose-900">
              <Target className="w-4 h-4" /> Hook Maker
              <span className="text-sm bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded-full font-bold ml-1">AI</span>
            </span>
            {hookOpen ? <ChevronUp className="w-4 h-4 text-rose-700" /> : <ChevronDown className="w-4 h-4 text-rose-700" />}
          </button>

          {hookOpen && (
            <div className="p-3 pt-0 space-y-2.5">
              <div className="text-sm text-rose-800 bg-white/70 rounded-lg p-2 border border-rose-200 leading-relaxed">
                Generate 5 hook options based on emotion + style. Tap any hook to insert it as a chorus.
              </div>

              {/* Emotion picker */}
              <div>
                <label className="text-sm font-bold text-rose-700 uppercase block mb-1">Emotion</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "longing", label: "Longing", icon: "💭" },
                    { key: "euphoria", label: "Euphoria", icon: "✨" },
                    { key: "heartbreak", label: "Heartbreak", icon: "💔" },
                    { key: "rage", label: "Rage", icon: "🔥" },
                    { key: "triumph", label: "Triumph", icon: "🏆" },
                    { key: "lust", label: "Lust", icon: "🌶️" },
                    { key: "rebellion", label: "Rebellion", icon: "⚡" },
                    { key: "celebration", label: "Celebration", icon: "🎉" },
                  ].map((e) => (
                    <button
                      key={e.key}
                      onClick={() => { haptic(6); setHookEmotion(e.key); }}
                      className={`px-2.5 py-1 rounded-full text-base font-semibold active:scale-95 ${
                        hookEmotion === e.key ? "bg-rose-600 text-white shadow-sm" : "bg-white border border-rose-200 text-rose-700"
                      }`}>{e.icon} {e.label}</button>
                  ))}
                </div>
              </div>

              {/* Style override */}
              <div>
                <label className="text-sm font-bold text-rose-700 uppercase block mb-1">Style (optional)</label>
                <input
                  type="text"
                  value={hookStyle}
                  onChange={(e) => setHookStyle(e.target.value)}
                  placeholder="defaults to your selected DNA tags"
                  className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-rose-200 focus:border-rose-500 focus:outline-none" />
              </div>

              {/* Generate button */}
              <button
                type="button"
                onClick={() => { haptic(10); generateHooks(); }}
                disabled={hookLoading}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition shadow-md">
                {hookLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Writing hooks...</>
                ) : (
                  <><Wand2 className="w-4 h-4" /> Generate 5 Hooks</>
                )}
              </button>

              {hookError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{hookError}</div>
              )}

              {/* Results */}
              {hookResults.length > 0 && (
                <div className="space-y-1.5">
                  {hookResults.map((h, i) => (
                    <div key={i} className="bg-white rounded-lg p-2.5 border border-rose-200">
                      <div className="text-base font-bold text-slate-900 leading-tight mb-1">"{h.hook}"</div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {h.vibe && <span className="text-sm text-rose-600 font-semibold uppercase">{h.vibe}</span>}
                          {h.syllables && <span className="text-sm text-slate-500 font-mono">{h.syllables} syl</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => insertHookIntoLyrics(h.hook)}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded-md text-sm font-bold flex items-center gap-1 active:scale-95">
                          <Plus className="w-3 h-3" /> Insert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI LYRIC COACH */}
        <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-2xl border border-fuchsia-200 mb-3 overflow-hidden">
          <button onClick={() => setCoachOpen(!coachOpen)} className="w-full flex items-center justify-between p-3 active:bg-fuchsia-100">
            <span className="flex items-center gap-1.5 text-sm font-bold text-fuchsia-900">
              <Brain className="w-3.5 h-3.5" /> AI Lyric Coach
              {coachResult && <span className="text-sm bg-fuchsia-200 text-fuchsia-800 px-1.5 py-0.5 rounded-full ml-1">{coachResult.suggestions.length} ideas</span>}
            </span>
            {coachOpen ? <ChevronUp className="w-4 h-4 text-fuchsia-700" /> : <ChevronDown className="w-4 h-4 text-fuchsia-700" />}
          </button>

          {coachOpen && (
            <div className="p-3 pt-0 space-y-3">
              {/* Focus selector */}
              <div>
                <label className="text-sm font-semibold text-fuchsia-700 uppercase block mb-1.5">Analyze</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "all", label: "All" },
                    { key: "structure", label: "Structure" },
                    { key: "rhythm", label: "Rhythm" },
                    { key: "rhyme", label: "Rhyme" },
                  ].map((opt) => (
                    <button key={opt.key} onClick={() => setCoachFocus(opt.key)}
                      className={`px-2.5 py-1 rounded-full text-[13px] font-semibold active:scale-95 ${
                        coachFocus === opt.key ? "bg-fuchsia-600 text-white" : "bg-white border border-fuchsia-200 text-fuchsia-700"
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Run button */}
              <button onClick={runLyricCoach} disabled={coachLoading || !rawLyrics.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition">
                {coachLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing lyrics...</>
                ) : (
                  <><Brain className="w-4 h-4" /> {coachResult ? "Re-analyze" : "Analyze My Lyrics"}</>
                )}
              </button>

              {coachError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-[13px] text-red-700">
                  {coachError}
                </div>
              )}

              {/* Results */}
              {coachResult && (
                <div className="space-y-2">
                  {/* Overall + scores */}
                  <div className="bg-white rounded-lg p-3 border border-fuchsia-200">
                    <div className="text-[13px] text-slate-700 leading-relaxed mb-2 italic">{coachResult.overall}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(coachResult.scores).map(([cat, score]) => (
                        <div key={cat} className="text-center bg-fuchsia-50 rounded-lg py-2">
                          <div className="text-[13px] uppercase font-bold text-fuchsia-700 tracking-wider">{cat}</div>
                          <div className={`text-lg font-black ${
                            score >= 8 ? "text-green-600" : score >= 5 ? "text-yellow-600" : "text-red-600"
                          }`}>{score}<span className="text-sm text-slate-400">/10</span></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-1.5">
                    {coachResult.suggestions.map((s, i) => (
                      <div key={i} className={`bg-white rounded-lg p-2.5 border ${s.applied ? "border-green-300 bg-green-50/50" : "border-slate-200"}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`text-[13px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            s.category === "structure" ? "bg-blue-100 text-blue-800" :
                            s.category === "rhythm" ? "bg-orange-100 text-orange-800" :
                            "bg-purple-100 text-purple-800"
                          }`}>{s.category}</span>
                          <span className="text-sm text-slate-600 font-semibold flex-1 truncate">{s.issue}</span>
                          {s.applied && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />}
                        </div>

                        <div className="space-y-1 mb-2">
                          <div className="bg-red-50 rounded px-2 py-1 border-l-2 border-red-300">
                            <div className="text-[13px] font-bold text-red-700 uppercase mb-0.5">Original</div>
                            <div className="text-[13px] font-mono text-slate-700 leading-snug">{s.original}</div>
                          </div>
                          <div className="bg-green-50 rounded px-2 py-1 border-l-2 border-green-400">
                            <div className="text-[13px] font-bold text-green-700 uppercase mb-0.5">Suggested</div>
                            <div className="text-[13px] font-mono text-slate-800 leading-snug">{s.suggested}</div>
                          </div>
                        </div>

                        <div className="text-sm text-slate-500 italic mb-2">{s.why}</div>

                        {!s.applied && (
                          <button onClick={() => applySuggestion(s.original, s.suggested)}
                            className="w-full px-2.5 py-1.5 bg-fuchsia-600 text-white rounded-md text-[13px] font-bold flex items-center justify-center gap-1 active:scale-95 active:bg-fuchsia-700">
                            <Check className="w-3 h-3" /> Apply to Lyrics
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!coachResult && !coachLoading && !coachError && (
                <div className="text-sm text-fuchsia-700 bg-white/60 rounded-lg p-2 border border-fuchsia-100 leading-relaxed">
                  Tap <strong>Analyze</strong> — Claude will score your lyrics on structure, rhythm, and rhyme, then offer specific line-by-line improvements you can apply with one tap.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Song Structure */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 mb-3 overflow-hidden">
          <button onClick={() => setStructureOpen(!structureOpen)} className="w-full flex items-center justify-between p-3 active:bg-indigo-100">
            <span className="flex items-center gap-1.5 text-sm font-bold text-indigo-900">
              <Layers className="w-3.5 h-3.5" /> Structure ({arrangement.length}) · {totalDuration}
            </span>
            {structureOpen ? <ChevronUp className="w-4 h-4 text-indigo-700" /> : <ChevronDown className="w-4 h-4 text-indigo-700" />}
          </button>

          {structureOpen && (
            <div className="p-3 pt-0 space-y-3">
              <div>
                <label className="text-sm font-semibold text-indigo-700 uppercase block mb-1.5">Templates</label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(arrangementTemplates).map((name) => (
                    <button key={name} onClick={() => loadTemplate(name)}
                      className="px-2.5 py-1 rounded-full text-[13px] font-semibold bg-white border border-indigo-200 text-indigo-700 active:scale-95">{name}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                {arrangement.map((section, idx) => (
                  <div key={section.id} className={`rounded-lg p-2 border flex items-center gap-1.5 ${sectionColor(section.type)}`}>
                    <span className="text-sm font-mono font-bold w-5 text-center opacity-60">{idx + 1}</span>
                    <select value={section.type} onChange={(e) => updateSection(section.id, "type", e.target.value)}
                      className="flex-1 bg-white/70 rounded px-1.5 py-1 text-sm font-semibold border-0 focus:outline-none min-w-0">
                      {sectionTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="text" value={section.duration} onChange={(e) => updateSection(section.id, "duration", e.target.value)}
                      className="w-14 bg-white/70 rounded px-1.5 py-1 text-sm font-mono text-center border-0 focus:outline-none" />
                    <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="p-1 active:bg-white/50 rounded disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveSection(idx, 1)} disabled={idx === arrangement.length - 1} className="p-1 active:bg-white/50 rounded disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                    <button onClick={() => removeSection(section.id)} className="p-1 active:bg-red-100 rounded text-red-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-semibold text-indigo-700 uppercase block mb-1.5">Add Section</label>
                <div className="flex flex-wrap gap-1">
                  {["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Build", "Drop", "Breakdown", "Solo", "Hook", "Outro"].map((t) => (
                    <button key={t} onClick={() => addSection(t)}
                      className="px-2 py-1 rounded text-sm font-semibold bg-white border border-indigo-200 text-indigo-700 active:scale-95 flex items-center gap-0.5">
                      <Plus className="w-2.5 h-2.5" />{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        </>)}

        {activeTab === "hits" && (<>
        {/* Hits Library */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 mb-3 overflow-hidden">
          <button onClick={() => setHitsOpen(!hitsOpen)} className="w-full flex items-center justify-between p-3 active:bg-purple-100">
            <span className="flex items-center gap-1.5 text-sm font-bold text-purple-900">
              <Disc className="w-3.5 h-3.5" /> Hit Library ({filteredHits.length})
            </span>
            {hitsOpen ? <ChevronUp className="w-4 h-4 text-purple-700" /> : <ChevronDown className="w-4 h-4 text-purple-700" />}
          </button>

          {hitsOpen && (
            <div className="p-3 pt-0 space-y-2">
              {activeHit && (
                <div className="bg-white rounded-lg p-2.5 border border-purple-300">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-purple-900 truncate">✓ {activeHit.title}</div>
                      <div className="text-sm text-slate-600 truncate">{activeHit.artist} · {activeHit.year}</div>
                    </div>
                    <button onClick={clearHit} className="p-1 active:bg-slate-100 rounded"><X className="w-3.5 h-3.5 text-slate-500" /></button>
                  </div>
                  <div className="text-[13px] text-purple-700 leading-snug border-t border-purple-100 pt-1.5">
                    <strong>Auto-loaded:</strong> {activeHit.bpm} BPM · {activeHit.key}
                    {activeHit.duration && ` · ${activeHit.duration}`}
                    {activeHit.mood && ` · ${activeHit.mood}`}
                    {activeHit.vocal && ` · ${activeHit.vocal}`}
                    {activeHit.dna && ` · ${activeHit.dna.length} DNA tags`}
                    {activeHit.structure && ` · ${activeHit.structure} structure`}
                  </div>
                </div>
              )}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={hitSearch} onChange={(e) => setHitSearch(e.target.value)} placeholder="Search song or artist..."
                  className="w-full bg-white rounded-lg pl-8 pr-8 py-2 text-sm border border-slate-200 focus:border-purple-500 focus:outline-none" />
                {hitSearch && (
                  <button onClick={() => setHitSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 active:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" style={{scrollbarWidth: "none"}}>
                {hitGenres.map((g) => (
                  <button key={g} onClick={() => setHitGenre(g)}
                    className={`px-2.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap active:scale-95 ${
                      hitGenre === g ? "bg-purple-600 text-white" : "bg-white border border-slate-200 text-slate-600"
                    }`}>{g === "all" ? "All" : g.toUpperCase()}</button>
                ))}
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1.5 bg-white/60 rounded-lg p-1.5 border border-purple-100">
                {filteredHits.map((hit) => {
                  const isActive = activeHit?.title === hit.title;
                  return (
                    <button key={`${hit.title}-${hit.artist}`} onClick={() => loadHit(hit)}
                      className={`w-full text-left p-2 rounded-lg border active:scale-[0.98] ${
                        isActive ? "bg-purple-100 border-purple-400" : "bg-white border-slate-200"
                      }`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-slate-900 truncate">{hit.title}</div>
                          <div className="text-sm text-slate-500 truncate">{hit.artist}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-semibold text-purple-600">{hit.year}</div>
                          <div className="text-[13px] text-slate-400 uppercase">{hit.genre}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 mb-3 overflow-hidden">
          <button onClick={() => setMetaOpen(!metaOpen)} className="w-full flex items-center justify-between p-3 active:bg-slate-100">
            <span className="text-sm uppercase tracking-wider text-slate-700 font-bold">Suno Metadata</span>
            {metaOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {metaOpen && (
            <div className="p-3 pt-0 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-500 uppercase">Title</label>
                  {title && <button onClick={() => setTitle("")} className="text-sm text-red-500 active:text-red-700 flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> clear</button>}
                </div>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song title"
                  className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-slate-200 focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-500 uppercase">Length</label>
                  {duration && <button onClick={() => setDuration("")} className="text-sm text-red-500 active:text-red-700 flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> clear</button>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {durations.map((d) => (
                    <button key={d} onClick={() => setDuration(duration === d ? "" : d)}
                      className={`px-2.5 py-1 rounded-full text-sm font-medium active:scale-95 ${
                        duration === d ? "bg-purple-600 text-white" : "bg-white border border-slate-200 text-slate-700"
                      }`}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-500 uppercase">BPM</label>
                  {bpm && <button onClick={() => setBpm("")} className="text-sm text-red-500 active:text-red-700 flex items-center gap-0.5"><X className="w-2.5 h-2.5" /></button>}
                </div>
                  <input type="text" value={bpm} onChange={(e) => setBpm(e.target.value)}
                    className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-slate-200 focus:border-purple-500 focus:outline-none" /></div>
                <div><div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-500 uppercase">Key</label>
                  {songKey && <button onClick={() => setSongKey("")} className="text-sm text-red-500 active:text-red-700 flex items-center gap-0.5"><X className="w-2.5 h-2.5" /></button>}
                </div>
                  <input type="text" value={songKey} onChange={(e) => setSongKey(e.target.value)}
                    className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-slate-200 focus:border-purple-500 focus:outline-none" /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-500 uppercase">Mood</label>
                  {mood && <button onClick={() => setMood("")} className="text-sm text-red-500 active:text-red-700 flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> clear</button>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {moods.map((m) => (
                    <button key={m} onClick={() => setMood(mood === m ? "" : m)}
                      className={`px-2.5 py-1 rounded-full text-sm font-medium active:scale-95 ${
                        mood === m ? "bg-pink-500 text-white" : "bg-white border border-slate-200 text-slate-700"
                      }`}>{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-500 uppercase">Vocal</label>
                  {vocalGender && <button onClick={() => setVocalGender("")} className="text-sm text-red-500 active:text-red-700 flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> clear</button>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {vocalOptions.map((v) => (
                    <button key={v} onClick={() => setVocalGender(vocalGender === v ? "" : v)}
                      className={`px-2.5 py-1 rounded-full text-sm font-medium active:scale-95 ${
                        vocalGender === v ? "bg-orange-500 text-white" : "bg-white border border-slate-200 text-slate-700"
                      }`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-500 uppercase">Instruments</label>
                  {instruments && <button onClick={() => setInstruments("")} className="text-sm text-red-500 active:text-red-700 flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> clear</button>}
                </div>
                <input type="text" value={instruments} onChange={(e) => setInstruments(e.target.value)} placeholder="electric guitar, 808s, strings"
                  className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-slate-200 focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-500 uppercase">Exclude (Negative Prompt)</label>
                  {negativeTags && <button onClick={() => setNegativeTags("")} className="text-sm text-red-500 active:text-red-700 flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> clear</button>}
                </div>
                <input type="text" value={negativeTags} onChange={(e) => setNegativeTags(e.target.value)} placeholder="flute, banjo, slow, female vocal"
                  className="w-full bg-white rounded-lg px-2.5 py-2 text-base border border-slate-200 focus:border-purple-500 focus:outline-none mb-1.5" />
                <div className="text-[13px] text-slate-500 mb-1.5">Quick-add common exclusions:</div>
                <div className="flex flex-wrap gap-1">
                  {[
                    "autotune", "vocoder", "robotic vocal", "AI sizzle", "mumble",
                    "flute", "banjo", "accordion", "harmonica", "bagpipes",
                    "lo-fi", "muffled", "distorted", "8-bit", "chiptune",
                    "slow", "ballad", "acoustic", "country twang", "yodeling",
                    "jazz", "blues", "metal", "screaming", "growl",
                    "children choir", "kids voice", "anime",
                  ].map((neg) => {
                    const isAdded = negativeTags.toLowerCase().split(",").map(t => t.trim()).includes(neg.toLowerCase());
                    return (
                      <button
                        key={neg}
                        onClick={() => {
                          const current = negativeTags.split(",").map(t => t.trim()).filter(Boolean);
                          if (isAdded) {
                            setNegativeTags(current.filter(t => t.toLowerCase() !== neg.toLowerCase()).join(", "));
                          } else {
                            setNegativeTags([...current, neg].join(", "));
                          }
                        }}
                        className={`px-2 py-0.5 rounded-full text-sm font-medium border active:scale-95 ${
                          isAdded
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}>
                        {isAdded && "✓ "}{neg}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Style DNA */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm uppercase tracking-wider text-slate-700 font-bold">Style DNA</label>
            <button onClick={clearAll} className="text-[13px] text-slate-500 flex items-center gap-1 active:text-slate-900">
              <RotateCcw className="w-3 h-3" /> Clear ({selectedTags.size})
            </button>
          </div>
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1" style={{scrollbarWidth: "none"}}>
            {Object.entries(categories).map(([key, cat]) => (
              <button key={key} onClick={() => setActiveCategory(key)}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap active:scale-95 ${
                  activeCategory === key ? `bg-gradient-to-r ${cat.color} text-white shadow-sm` : "bg-white text-slate-600 border border-slate-200"
                }`}>
                <span className="mr-1">{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentCat.tags.map((tag) => {
              const active = selectedTags.has(tag);
              return (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1.5 rounded-full text-[13px] font-medium border text-left leading-tight active:scale-95 ${
                    active ? `bg-gradient-to-r ${currentCat.color} text-white border-transparent shadow-sm` : "bg-white text-slate-700 border-slate-200"
                  }`}>{active && "✓ "}{tag}</button>
              );
            })}
          </div>
        </div>

        </>)}

        {activeTab === "help" && (<>
        {/* TRANSPARENCY — what's real vs heuristic */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 mb-3 overflow-hidden">
          <button onClick={() => setTransparencyOpen(!transparencyOpen)} className="w-full flex items-center justify-between p-3 active:bg-emerald-100">
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-900">
              <CheckCircle2 className="w-3.5 h-3.5" /> Transparency · What Actually Works
            </span>
            {transparencyOpen ? <ChevronUp className="w-4 h-4 text-emerald-700" /> : <ChevronDown className="w-4 h-4 text-emerald-700" />}
          </button>
          {transparencyOpen && (
            <div className="p-3 pt-0 space-y-2 text-sm">
              <div className="bg-white/70 rounded-lg p-2.5 border border-emerald-200">
                <div className="font-black text-emerald-700 uppercase mb-1">✅ Everything Works (Honest)</div>
                <ul className="space-y-1 text-slate-700 leading-relaxed">
                  <li>• <strong>6 AI Power Tools</strong> (Score tab) — all real Claude API calls, all return useful output</li>
                  <li>• <strong>Title Generator, Hook Maker, AI Coach, Improve Selection</strong> — real Claude API</li>
                  <li>• <strong>Audio playback + EQ</strong> — real Web Audio biquad filters, you hear changes</li>
                  <li>• <strong>RMS Vocal Coach</strong> — real autocorrelation math on the audio buffer</li>
                  <li>• <strong>Whisper transcription</strong> — real OpenAI API (needs your API key)</li>
                  <li>• <strong>Pitch contour + adjustments</strong> — real autocorrelation, transpose/snap-to-key all work</li>
                  <li>• <strong>Track Timeline drag/resize</strong> — real pointer events</li>
                  <li>• <strong>Auto-save</strong> — every change saved to localStorage automatically</li>
                  <li>• <strong>3 Output cards</strong> — these ARE Suno's actual fields (Style/Lyrics/Exclude)</li>
                  <li>• <strong>Native iOS Share</strong> (Output tab) — opens iPhone share sheet</li>
                </ul>
              </div>

              <div className="bg-white/70 rounded-lg p-2.5 border border-orange-300">
                <div className="font-black text-orange-700 uppercase mb-1">🗑️ What I Removed (Was Fake)</div>
                <ul className="space-y-1 text-slate-700 leading-relaxed">
                  <li>• Hit Probability % — was pattern-matching pretending to be science</li>
                  <li>• Hit Rationalization 5-star rating — same heuristic problem</li>
                  <li>• Radio Safety scoring — guessing dressed as data</li>
                  <li>• Executive Producer verdict — built on the above heuristics</li>
                  <li>• Format Fit Matrix — fake genre scoring</li>
                  <li>• Ultra Song Lab "HitFactory rolls" — random outputs aren't useful</li>
                  <li className="font-semibold pt-1">→ Replaced with 6 real AI tools that actually help</li>
                </ul>
              </div>

              <div className="bg-white/70 rounded-lg p-2.5 border border-yellow-300">
                <div className="font-black text-yellow-700 uppercase mb-1">⚠️ Real Limitations</div>
                <ul className="space-y-1 text-slate-700 leading-relaxed">
                  <li>• <strong>Pitch detection</strong> works best on isolated vocals — full mixes are noisy</li>
                  <li>• <strong>No sheet music</strong> — polyphonic-to-notation isn't possible in browser</li>
                  <li>• <strong>No stem separation</strong> — can't split vocals from music in arbitrary audio</li>
                  <li>• <strong>Hit Library DNA tags</strong> are educated guesses, not official credits</li>
                  <li>• <strong>AI tools</strong> can occasionally fail or return malformed output — just retry</li>
                </ul>
              </div>

              <div className="bg-emerald-100 rounded-lg p-2.5 border border-emerald-400">
                <div className="font-black text-emerald-800 uppercase mb-1">💡 Best Workflow</div>
                <div className="text-slate-700 leading-relaxed">
                  <strong>1.</strong> Score tab → <em>Reference Track Analyzer</em> to extract DNA from a song you love<br/>
                  <strong>2.</strong> Score tab → <em>Concept Expander</em> to build a song outline from one line<br/>
                  <strong>3.</strong> Write tab → flesh out lyrics, use <em>Improve Selection</em> on weak lines<br/>
                  <strong>4.</strong> Score tab → <em>Tag Optimizer</em> to clean up your style tags<br/>
                  <strong>5.</strong> Score tab → <em>Critic</em> for honest review before generating<br/>
                  <strong>6.</strong> Output tab → copy 3 fields to Suno (or use Share button)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pro tips */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 mb-3 overflow-hidden">
          <button onClick={() => setTipsOpen(!tipsOpen)} className="w-full flex items-center justify-between p-3 active:bg-amber-100">
            <span className="flex items-center gap-1.5 text-sm font-bold text-amber-900">
              <Sparkles className="w-3.5 h-3.5" /> Pro Tips ({proTips.length})
            </span>
            {tipsOpen ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4 text-amber-700" />}
          </button>
          {tipsOpen && (
            <div className="p-3 pt-0 space-y-2">
              {proTips.map((tip, i) => (
                <div key={i} className="text-[13px] border-l-2 border-amber-400 pl-2">
                  <div className="font-semibold text-amber-900">{tip.title}</div>
                  <div className="text-slate-600">{tip.detail}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        </>)}

        {activeTab === "output" && (<>
        {/* NATIVE SHARE — uses iOS share sheet */}
        {typeof navigator !== "undefined" && navigator.share && (
          <button
            type="button"
            onClick={async () => {
              haptic([10, 30, 10]);
              const shareText = `🎵 SUNO PROMPT — ${title || "Untitled"}\n\n=== STYLE ===\n${styleOutput}\n\n=== LYRICS ===\n${rawLyrics}\n\n=== EXCLUDE ===\n${negativeOutput}`;
              try {
                await navigator.share({
                  title: title || "Suno Prompt",
                  text: shareText,
                });
              } catch (err) {
                if (err.name !== "AbortError") console.error(err);
              }
            }}
            className="w-full mb-3 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] shadow-md">
            <Send className="w-4 h-4" /> Share to Notes / Mail / Messages
          </button>
        )}

        {/* SEPARATED OUTPUTS — Title / Style / Lyrics / Negative */}
        <div className="space-y-2">
          {/* TITLE block */}
          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2 gap-1.5">
              <label className="text-sm uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1 flex-1 min-w-0">
                <Sparkles className="w-3 h-3 flex-shrink-0" /> Title
                <span className="text-[13px] text-slate-500 font-normal normal-case truncate">→ Suno title field</span>
              </label>
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!title.trim()) return;
                  haptic([10, 30, 10]);
                  try {
                    await navigator.clipboard.writeText(title);
                    setCopiedBlock("title");
                    setTimeout(() => setCopiedBlock(""), 1500);
                  } catch (err) { console.error(err); }
                }}
                disabled={!title.trim()}
                className={`px-2.5 py-1.5 rounded-md text-sm font-bold flex items-center gap-1 active:scale-95 disabled:opacity-40 ${
                  copiedBlock === "title" ? "bg-green-500 text-white" : "bg-amber-600 text-white"
                }`}>
                {copiedBlock === "title" ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); haptic(8); setTitle(""); }}
                disabled={!title.trim()}
                className="p-1.5 active:bg-red-900/40 rounded text-red-400 disabled:opacity-30">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="bg-black rounded-lg p-2 text-amber-100 text-base font-bold min-h-[40px] break-words">
              {title || <span className="text-slate-600 italic font-normal">No title yet. Use Title Generator on Write tab, or set in Hits → Metadata.</span>}
            </div>
            {title && <div className="text-[13px] text-slate-500 mt-1">{title.length} chars</div>}
          </div>

          {/* STYLE block */}
          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2 gap-1.5">
              <label className="text-sm uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1 flex-1 min-w-0">
                <Sparkles className="w-3 h-3 flex-shrink-0" /> Style
                <span className="text-[13px] text-slate-500 font-normal normal-case truncate">→ Suno style</span>
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedTags(new Set());
                  setMood("");
                  setInstruments("");
                  setVocalGender("");
                  setBpm("");
                  setSongKey("");
                  setActiveHit(null);
                }}
                className="px-2.5 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1 active:scale-95 bg-red-600 text-white active:bg-red-700 shadow-sm">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => copyBlock(styleOutput, "style")}
                disabled={!styleOutput.trim()}
                className={`px-2.5 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                  copiedBlock === "style" ? "bg-green-500 text-white" : "bg-purple-600 text-white"
                }`}>
                {copiedBlock === "style" ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <pre className="bg-slate-950 rounded-xl p-2.5 text-[13px] font-mono whitespace-pre-wrap break-words max-h-32 overflow-y-auto border border-slate-800 leading-relaxed text-slate-200 min-h-[3rem]">
              {styleOutput || <span className="text-slate-600 italic">No style tags selected. Tap chips above to build.</span>}
            </pre>
            <div className="text-[13px] text-slate-500 mt-1">{styleOutput.length} chars · {selectedTags.size} tags</div>
          </div>

          {/* LYRICS block */}
          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2 gap-1.5">
              <label className="text-sm uppercase tracking-wider text-pink-300 font-bold flex items-center gap-1 flex-1 min-w-0">
                <Music className="w-3 h-3 flex-shrink-0" /> Lyrics
                <span className="text-[13px] text-slate-500 font-normal normal-case truncate">→ Suno lyrics</span>
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRawLyrics("");
                  setTitle("");
                  setArrangement([]);
                  setDuration("");
                  setLanguage("English");
                  setCoachResult(null);
                }}
                className="px-2.5 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1 active:scale-95 bg-red-600 text-white active:bg-red-700 shadow-sm">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => copyBlock(lyricsOutput, "lyrics")}
                disabled={!lyricsOutput.trim()}
                className={`px-2.5 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                  copiedBlock === "lyrics" ? "bg-green-500 text-white" : "bg-pink-600 text-white"
                }`}>
                {copiedBlock === "lyrics" ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <pre className="bg-slate-950 rounded-xl p-2.5 text-[13px] font-mono whitespace-pre-wrap break-words max-h-72 overflow-y-auto border border-slate-800 leading-relaxed text-slate-200 min-h-[3rem]">
              {lyricsOutput || <span className="text-slate-600 italic">No lyrics yet. Add some above.</span>}
            </pre>
            <div className="text-[13px] text-slate-500 mt-1">{lyricsOutput.length} chars · {rawLyrics.split("\n").filter(l => l.trim() && !l.startsWith("[")).length} lyric lines</div>
          </div>

          {/* NEGATIVE block */}
          <div className="bg-slate-900 rounded-2xl p-3 border border-red-900/40">
            <div className="flex items-center justify-between mb-2 gap-1.5">
              <label className="text-sm uppercase tracking-wider text-red-300 font-bold flex items-center gap-1 flex-1 min-w-0">
                <X className="w-3 h-3 flex-shrink-0" /> Exclude
                <span className="text-[13px] text-slate-500 font-normal normal-case truncate">→ Suno exclude</span>
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNegativeTags("");
                }}
                className="px-2.5 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1 active:scale-95 bg-red-600 text-white active:bg-red-700 shadow-sm">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => copyBlock(negativeOutput, "negative")}
                disabled={!negativeOutput.trim()}
                className={`px-2.5 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                  copiedBlock === "negative" ? "bg-green-500 text-white" : "bg-red-600 text-white"
                }`}>
                {copiedBlock === "negative" ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <pre className="bg-slate-950 rounded-xl p-2.5 text-[13px] font-mono whitespace-pre-wrap break-words max-h-32 overflow-y-auto border border-red-900/30 leading-relaxed text-slate-200 min-h-[3rem]">
              {negativeOutput || <span className="text-slate-600 italic">No exclusions. Add comma-separated terms in Metadata → Exclude.</span>}
            </pre>
            <div className="text-[13px] text-slate-500 mt-1">{negativeOutput.length} chars · {negativeOutput ? negativeOutput.split(",").filter(t => t.trim()).length : 0} exclusions</div>
          </div>
        </div>

        <div className={`text-center text-sm mt-4 leading-relaxed ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          Suno Custom Mode has 4 fields:<br/>
          <strong className="text-amber-500">Title</strong> · <strong className="text-purple-500">Style</strong> · <strong className="text-pink-500">Lyrics</strong> · <strong className="text-red-500">Exclude</strong> — copy each separately above.
        </div>
        </>)}
      </div>

      {/* iOS-STYLE BOTTOM TAB BAR */}
      <div className={`fixed bottom-0 left-0 right-0 z-30 ${
        darkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"
      } backdrop-blur-lg border-t safe-area-bottom`}>
        <div className="max-w-md mx-auto px-1 py-1 grid grid-cols-6 gap-0.5">
          {[
            { key: "write", label: "Write", icon: FileText },
            { key: "score", label: "Score", icon: BarChart3 },
            { key: "sound", label: "Sound", icon: Headphones },
            { key: "hits", label: "Hits", icon: Disc },
            { key: "output", label: "Output", icon: Send },
            { key: "help", label: "Help", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  haptic(8);
                  setActiveTab(tab.key);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex flex-col items-center justify-center py-2 rounded-lg active:scale-95 transition ${
                  isActive
                    ? (darkMode ? "bg-purple-500/20" : "bg-purple-100")
                    : "active:bg-slate-200/40"
                }`}>
                <Icon className={`w-5 h-5 ${
                  isActive ? "text-purple-500" : (darkMode ? "text-slate-400" : "text-slate-500")
                }`} />
                <span className={`text-sm mt-0.5 font-semibold ${
                  isActive ? "text-purple-500" : (darkMode ? "text-slate-400" : "text-slate-500")
                }`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
