export default function Logo({ className = "", size = "default" }) {
    const textSizeClass = size === "small" ? "text-lg" : size === "large" ? "text-3xl" : "text-2xl";

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <span className={`${textSizeClass} font-extrabold tracking-tight`}>
                <span className="text-[#C4122F]">Best</span>
                <span className="text-slate-800"> IELTS </span>
                <span className="text-[#C4122F]">BD</span>
            </span>
        </div>
    );
}
