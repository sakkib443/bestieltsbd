"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaBook,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaArrowRight,
    FaArrowLeft,
    FaTrophy,
    FaRedo,
    FaHome,
    FaPlay,
    FaFlag,
} from "react-icons/fa";
import Logo from "@/components/Logo";

// ============ DEMO EXAM DATA ============
const DEMO_PASSAGE = {
    title: "The History of the London Underground",
    content: `The world's first underground railway opened in London in January 1863. The Metropolitan Railway, as it was called, was the vision of Charles Pearson, a city solicitor who first proposed the idea in 1845. He believed that an underground railway would help relieve the city's growing traffic congestion and allow workers to live in the suburbs while still being able to commute to the city centre.

The construction of the railway was a massive engineering feat. The chosen route ran beneath existing main roads to minimise the expense of demolishing buildings. A technique known as 'cut and cover' was used: a trench about ten metres wide and six metres deep was dug along the road, the sides were temporarily supported with timber beams, brick walls were constructed, and finally a brick arch was added to create a tunnel. A layer of soil was then placed on top and the road rebuilt.

Despite the difficult working conditions and the disruption to London's streets, the line was completed in three years. On the opening day, 10 January 1863, around 38,000 passengers used the railway. By the end of the first year, 9.5 million journeys had been made on what was initially a six-kilometre stretch of track between Paddington and Farringdon.

The success of the Metropolitan Railway led to rapid expansion. Other companies began building their own underground lines across London. By 1884, the Inner Circle line (now the Circle line) was completed, connecting most of the major railway terminals in central London.

However, these early lines were built close to the surface, and the steam locomotives that powered the trains produced smoke and fumes that made travelling underground an unpleasant experience. The breakthrough came in 1890 with the opening of the City and South London Railway — the world's first deep-level electric underground railway. This used smaller tunnels bored deep beneath the city, which did not require the demolition of buildings above ground.

The early twentieth century saw continued expansion and improvement. In 1908, the name 'Underground' was first used on station signs and maps. The iconic London Underground map, designed by Harry Beck in 1931, simplified the complex network into a clear, easy-to-understand diagram that is still used as the basis for today's map.

During World War II, many Underground stations served as air-raid shelters, providing protection for thousands of Londoners during the Blitz. After the war, the system continued to grow, with new lines and extensions being added throughout the twentieth and twenty-first centuries.

Today, the London Underground network consists of 11 lines, serving 272 stations across Greater London. It carries over 5 million passenger journeys per day, making it one of the busiest metro systems in the world. The system continues to evolve, with the Elizabeth line — the newest addition — opening in 2022.`,
};

const DEMO_QUESTIONS = [
    {
        id: 1,
        type: "mcq",
        question: "Who first proposed the idea of an underground railway in London?",
        options: ["A) The Metropolitan Railway Company", "B) Charles Pearson", "C) Harry Beck", "D) Queen Victoria"],
        correctAnswer: "B) Charles Pearson",
    },
    {
        id: 2,
        type: "mcq",
        question: "What was the main reason for building the underground railway?",
        options: [
            "A) To create jobs for workers",
            "B) To connect London with other cities",
            "C) To relieve traffic congestion and enable suburban commuting",
            "D) To compete with other European capitals",
        ],
        correctAnswer: "C) To relieve traffic congestion and enable suburban commuting",
    },
    {
        id: 3,
        type: "mcq",
        question: "What construction technique was used for the first underground line?",
        options: ["A) Tunnel boring machine", "B) Cut and cover", "C) Deep-level drilling", "D) Open excavation"],
        correctAnswer: "B) Cut and cover",
    },
    {
        id: 4,
        type: "fill",
        question: "The first underground line was completed in _______ years.",
        correctAnswer: "three",
        acceptableAnswers: ["three", "3"],
    },
    {
        id: 5,
        type: "fill",
        question: "On the opening day, approximately _______ passengers used the railway.",
        correctAnswer: "38,000",
        acceptableAnswers: ["38,000", "38000", "38 000"],
    },
    {
        id: 6,
        type: "mcq",
        question: "What was the main problem with the early underground trains?",
        options: [
            "A) They were too slow",
            "B) They were too expensive",
            "C) They produced smoke and fumes",
            "D) They were unreliable",
        ],
        correctAnswer: "C) They produced smoke and fumes",
    },
    {
        id: 7,
        type: "mcq",
        question: "The City and South London Railway was significant because it was the first to:",
        options: [
            "A) Cross the River Thames",
            "B) Use deep-level electric power",
            "C) Carry over a million passengers",
            "D) Connect to mainline stations",
        ],
        correctAnswer: "B) Use deep-level electric power",
    },
    {
        id: 8,
        type: "fill",
        question: "The famous Underground map was designed by _______ in 1931.",
        correctAnswer: "Harry Beck",
        acceptableAnswers: ["Harry Beck", "harry beck", "Beck"],
    },
    {
        id: 9,
        type: "mcq",
        question: "During World War II, Underground stations were used as:",
        options: ["A) Military bases", "B) Hospitals", "C) Air-raid shelters", "D) Food storage"],
        correctAnswer: "C) Air-raid shelters",
    },
    {
        id: 10,
        type: "fill",
        question: "Today, the London Underground carries over _______ million passenger journeys per day.",
        correctAnswer: "5",
        acceptableAnswers: ["5", "five"],
    },
    {
        id: 11,
        type: "mcq",
        question: "How many stations does the current London Underground network serve?",
        options: ["A) 200", "B) 250", "C) 272", "D) 300"],
        correctAnswer: "C) 272",
    },
    {
        id: 12,
        type: "fill",
        question: "The newest line added to the London Underground, the _______ line, opened in 2022.",
        correctAnswer: "Elizabeth",
        acceptableAnswers: ["Elizabeth", "elizabeth"],
    },
    {
        id: 13,
        type: "tf",
        question: "Charles Pearson was an engineer who designed the first underground line.",
        correctAnswer: "FALSE",
    },
    {
        id: 14,
        type: "tf",
        question: "The first underground railway ran between Paddington and Farringdon.",
        correctAnswer: "TRUE",
    },
    {
        id: 15,
        type: "tf",
        question: "The Inner Circle line was completed before 1880.",
        correctAnswer: "FALSE",
    },
];

const EXAM_DURATION = 20 * 60; // 20 minutes in seconds

// ============ COMPONENTS ============

// Timer Component
const Timer = ({ timeLeft }) => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const isLow = timeLeft < 120;

    return (
        <div className={`flex items-center gap-1.5 font-mono text-sm font-bold ${isLow ? "text-red-600 animate-pulse" : "text-slate-700"}`}>
            <FaClock className={`text-xs ${isLow ? "text-red-500" : "text-slate-400"}`} />
            <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
        </div>
    );
};

// Question Number Grid
const QuestionGrid = ({ questions, answers, currentQ, onSelect, flagged }) => (
    <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, i) => {
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "";
            const isCurrent = currentQ === i;
            const isFlagged = flagged.has(q.id);

            return (
                <button
                    key={q.id}
                    onClick={() => onSelect(i)}
                    className={`w-8 h-8 rounded-md text-xs font-bold transition-all cursor-pointer relative
                        ${isCurrent
                            ? "bg-[#C4122F] text-white shadow-md"
                            : isAnswered
                                ? "bg-[#C4122F]/10 text-[#C4122F] border border-[#C4122F]/20"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                >
                    {q.id}
                    {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white"></span>
                    )}
                </button>
            );
        })}
    </div>
);

// ============ MAIN PAGE ============
export default function DemoExamPage() {
    const router = useRouter();
    const [stage, setStage] = useState("intro"); // intro, exam, result
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
    const [flagged, setFlagged] = useState(new Set());
    const [results, setResults] = useState(null);
    const [showPassage, setShowPassage] = useState(true);

    // Timer
    useEffect(() => {
        if (stage !== "exam") return;
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [stage, timeLeft]);

    const handleAnswer = (questionId, answer) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const toggleFlag = (questionId) => {
        setFlagged((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) newSet.delete(questionId);
            else newSet.add(questionId);
            return newSet;
        });
    };

    const handleSubmit = useCallback(() => {
        let correct = 0;
        const questionResults = DEMO_QUESTIONS.map((q) => {
            const userAnswer = answers[q.id] || "";
            let isCorrect = false;

            if (q.type === "mcq" || q.type === "tf") {
                isCorrect = userAnswer === q.correctAnswer;
            } else if (q.type === "fill") {
                isCorrect = q.acceptableAnswers.some(
                    (a) => a.toLowerCase().trim() === userAnswer.toLowerCase().trim()
                );
            }

            if (isCorrect) correct++;
            return { ...q, userAnswer, isCorrect };
        });

        const total = DEMO_QUESTIONS.length;
        const percentage = (correct / total) * 100;

        // Approximate IELTS band score based on percentage
        let bandScore;
        if (percentage >= 93) bandScore = 9.0;
        else if (percentage >= 87) bandScore = 8.5;
        else if (percentage >= 80) bandScore = 8.0;
        else if (percentage >= 73) bandScore = 7.5;
        else if (percentage >= 67) bandScore = 7.0;
        else if (percentage >= 60) bandScore = 6.5;
        else if (percentage >= 53) bandScore = 6.0;
        else if (percentage >= 47) bandScore = 5.5;
        else if (percentage >= 40) bandScore = 5.0;
        else if (percentage >= 33) bandScore = 4.5;
        else if (percentage >= 27) bandScore = 4.0;
        else bandScore = 3.5;

        setResults({ correct, total, percentage, bandScore, questionResults });
        setStage("result");
    }, [answers]);

    const handleRestart = () => {
        setStage("intro");
        setCurrentQ(0);
        setAnswers({});
        setTimeLeft(EXAM_DURATION);
        setFlagged(new Set());
        setResults(null);
    };

    const currentQuestion = DEMO_QUESTIONS[currentQ];

    // ===== INTRO SCREEN =====
    if (stage === "intro") {
        return (
            <div className="min-h-screen bg-[#fdfbf9] flex items-center justify-center p-6" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg"
                >
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#C4122F] to-[#E8354F] rounded-xl flex items-center justify-center shadow-lg shadow-[#C4122F]/20">
                                <FaBook className="text-white text-xl" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Free Demo Exam</h1>
                            <p className="text-slate-500 text-sm">IELTS Reading — Practice Test</p>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                <p className="text-xl font-bold text-[#C4122F]">15</p>
                                <p className="text-slate-500 text-[10px] font-medium">Questions</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                <p className="text-xl font-bold text-[#C4122F]">20</p>
                                <p className="text-slate-500 text-[10px] font-medium">Minutes</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                <p className="text-xl font-bold text-[#C4122F]">Free</p>
                                <p className="text-slate-500 text-[10px] font-medium">No Sign-up</p>
                            </div>
                        </div>

                        {/* Question Types */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Question Types</p>
                            <div className="space-y-2 text-sm text-slate-600">
                                <p>✓ Multiple Choice Questions (MCQ)</p>
                                <p>✓ Fill in the Blanks</p>
                                <p>✓ True / False / Not Given</p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <button
                            onClick={() => setStage("exam")}
                            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C4122F] to-[#E8354F] text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-[#C4122F]/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
                        >
                            <FaPlay className="text-xs" />
                            Start Demo Exam
                            <FaArrowRight className="text-xs" />
                        </button>

                        <button
                            onClick={() => router.push("/")}
                            className="w-full flex items-center justify-center gap-2 text-slate-500 py-2.5 mt-3 font-medium text-sm hover:text-slate-700 transition-colors cursor-pointer"
                        >
                            <FaHome className="text-xs" />
                            Back to Home
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ===== RESULT SCREEN =====
    if (stage === "result" && results) {
        return (
            <div className="min-h-screen bg-[#fdfbf9]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                {/* Header */}
                <header className="bg-white border-b border-slate-200 py-3 px-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Logo size="small" />
                        <span className="text-slate-400 text-xs font-medium">Demo Exam — Results</span>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto px-4 py-8">
                    {/* Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 mb-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#C4122F] to-[#E8354F] rounded-2xl flex items-center justify-center shadow-lg shadow-[#C4122F]/20">
                                <FaTrophy className="text-white text-2xl" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Exam Complete!</h1>
                            <p className="text-slate-500 text-sm">Here are your demo exam results</p>
                        </div>

                        {/* Band Score */}
                        <div className="bg-gradient-to-br from-[#C4122F] to-[#E8354F] rounded-2xl p-6 text-center mb-6 shadow-lg shadow-[#C4122F]/15">
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">Estimated Band Score</p>
                            <p className="text-6xl font-extrabold text-white mb-1">{results.bandScore.toFixed(1)}</p>
                            <p className="text-white/60 text-sm font-medium">out of 9.0</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                                <p className="text-2xl font-bold text-emerald-600">{results.correct}</p>
                                <p className="text-emerald-600 text-xs font-medium">Correct</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                                <p className="text-2xl font-bold text-red-500">{results.total - results.correct}</p>
                                <p className="text-red-500 text-xs font-medium">Incorrect</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                                <p className="text-2xl font-bold text-blue-600">{results.percentage.toFixed(0)}%</p>
                                <p className="text-blue-600 text-xs font-medium">Accuracy</p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleRestart}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#C4122F] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#a50f27] transition-all cursor-pointer"
                            >
                                <FaRedo className="text-xs" />
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all cursor-pointer border border-slate-200"
                            >
                                <FaHome className="text-xs" />
                                Home
                            </button>
                        </div>
                    </motion.div>

                    {/* Answer Review */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Answer Review</h2>
                        <div className="space-y-4">
                            {results.questionResults.map((q, i) => (
                                <div
                                    key={q.id}
                                    className={`p-4 rounded-xl border ${q.isCorrect
                                        ? "bg-emerald-50/50 border-emerald-200"
                                        : "bg-red-50/50 border-red-200"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${q.isCorrect ? "bg-emerald-500" : "bg-red-500"
                                            }`}>
                                            {q.isCorrect ? (
                                                <FaCheckCircle className="text-white text-xs" />
                                            ) : (
                                                <FaTimesCircle className="text-white text-xs" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 mb-1">
                                                Q{q.id}. {q.question}
                                            </p>
                                            {!q.isCorrect && (
                                                <p className="text-xs text-red-600 mb-1">
                                                    Your answer: <span className="font-semibold">{q.userAnswer || "(No answer)"}</span>
                                                </p>
                                            )}
                                            <p className="text-xs text-emerald-700">
                                                Correct answer: <span className="font-semibold">{q.correctAnswer}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ===== EXAM SCREEN =====
    return (
        <div className="min-h-screen bg-[#f5f5f5] flex flex-col" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            {/* Exam Header */}
            <header className="bg-white border-b border-slate-200 py-2.5 px-4 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo size="small" />
                        <span className="text-xs text-slate-400 font-medium hidden sm:inline">Demo Reading Test</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Timer timeLeft={timeLeft} />
                        <span className="text-xs text-slate-400">
                            {Object.keys(answers).filter(k => answers[k] !== "").length}/{DEMO_QUESTIONS.length} answered
                        </span>
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you want to submit your exam?")) {
                                    handleSubmit();
                                }
                            }}
                            className="px-4 py-1.5 bg-[#C4122F] text-white rounded-lg text-xs font-bold hover:bg-[#a50f27] transition-colors cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </header>

            {/* Exam Body */}
            <div className="flex-1 flex">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1">
                    {/* Passage Panel */}
                    <div className={`${showPassage ? 'lg:col-span-5' : 'hidden lg:hidden'} bg-white border-r border-slate-200 overflow-y-auto`}
                        style={{ maxHeight: 'calc(100vh - 52px)' }}>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Reading Passage</h2>
                                <button
                                    onClick={() => setShowPassage(false)}
                                    className="lg:hidden text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    Hide
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4">{DEMO_PASSAGE.title}</h3>
                            <div className="text-sm text-slate-700 leading-[1.85] space-y-4">
                                {DEMO_PASSAGE.content.split("\n\n").map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Questions Panel */}
                    <div className={`${showPassage ? 'lg:col-span-7' : 'lg:col-span-12'} overflow-y-auto bg-[#fafafa]`}
                        style={{ maxHeight: 'calc(100vh - 52px)' }}>
                        <div className="p-5 max-w-2xl mx-auto">
                            {/* Mobile: Toggle passage */}
                            {!showPassage && (
                                <button
                                    onClick={() => setShowPassage(true)}
                                    className="mb-3 text-xs text-[#C4122F] font-medium hover:underline cursor-pointer lg:hidden"
                                >
                                    Show Passage
                                </button>
                            )}

                            {/* Question Card */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQ}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-5"
                                >
                                    {/* Question Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-7 h-7 bg-[#C4122F] text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                                {currentQuestion.id}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium uppercase px-2 py-0.5 bg-slate-100 rounded">
                                                {currentQuestion.type === "mcq" ? "Multiple Choice" :
                                                    currentQuestion.type === "fill" ? "Fill in the Blank" :
                                                        "True / False"}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => toggleFlag(currentQuestion.id)}
                                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${flagged.has(currentQuestion.id)
                                                ? "bg-amber-100 text-amber-600"
                                                : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                                                }`}
                                        >
                                            <FaFlag className="text-sm" />
                                        </button>
                                    </div>

                                    {/* Question Text */}
                                    <p className="text-base font-semibold text-slate-800 mb-5 leading-relaxed">
                                        {currentQuestion.question}
                                    </p>

                                    {/* Answer Options */}
                                    {currentQuestion.type === "mcq" && (
                                        <div className="space-y-2.5">
                                            {currentQuestion.options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleAnswer(currentQuestion.id, opt)}
                                                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer text-sm font-medium
                                                        ${answers[currentQuestion.id] === opt
                                                            ? "border-[#C4122F] bg-[#C4122F]/5 text-[#C4122F]"
                                                            : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {currentQuestion.type === "fill" && (
                                        <input
                                            type="text"
                                            value={answers[currentQuestion.id] || ""}
                                            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-300 focus:border-[#C4122F] focus:ring-2 focus:ring-[#C4122F]/10 outline-none transition-all text-sm font-medium"
                                        />
                                    )}

                                    {currentQuestion.type === "tf" && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleAnswer(currentQuestion.id, opt)}
                                                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer text-center
                                                        ${answers[currentQuestion.id] === opt
                                                            ? "border-[#C4122F] bg-[#C4122F]/5 text-[#C4122F]"
                                                            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                                    disabled={currentQ === 0}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <FaArrowLeft className="text-xs" /> Previous
                                </button>

                                <span className="text-xs text-slate-400 font-medium">
                                    {currentQ + 1} of {DEMO_QUESTIONS.length}
                                </span>

                                {currentQ < DEMO_QUESTIONS.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentQ(currentQ + 1)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-[#C4122F] text-white rounded-lg text-sm font-bold hover:bg-[#a50f27] transition-colors cursor-pointer"
                                    >
                                        Next <FaArrowRight className="text-xs" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (confirm("Submit your exam and see results?")) handleSubmit();
                                        }}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                                    >
                                        Submit <FaCheckCircle className="text-xs" />
                                    </button>
                                )}
                            </div>

                            {/* Question Grid Panel */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Question Navigator</p>
                                <QuestionGrid
                                    questions={DEMO_QUESTIONS}
                                    answers={answers}
                                    currentQ={currentQ}
                                    onSelect={setCurrentQ}
                                    flagged={flagged}
                                />
                                <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400">
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#C4122F] rounded-sm"></span> Current</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#C4122F]/10 border border-[#C4122F]/20 rounded-sm"></span> Answered</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-100 border border-slate-200 rounded-sm"></span> Unanswered</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span> Flagged</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
