import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, Award, Users } from "lucide-react";

export default function VoteModal({ poll, hasVoted, onClose, onVote }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state ONLY when poll ID changes
    useEffect(() => {
        if (poll) {
            setSelectedOption(null);
            setIsSubmitting(false);
        }
    }, [poll?._id]);

    const handleVote = async () => {
        if (selectedOption === null) return;

        setIsSubmitting(true);
        try {
            await onVote(poll._id, selectedOption);
            // setHasVoted(true); // Handled by prop now

        } catch (error) {
            console.error("Vote error", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalVotes = poll ? poll.options.reduce((acc, opt) => acc + opt.votes, 0) + (hasVoted ? 1 : 0) : 0;
    // Note: totalVotes calculation here is optimistic. Ideally backend response returns fresh data.
    // We'll rely on the parent to pass updated poll data or handle the +1 logic visually if parent doesn't update immediately.

    return (
        <AnimatePresence>
            {poll && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.4 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-bg-base/30 flex items-center justify-center p-4"
                    />

                    {/* Modal Card */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                        <motion.div
                            layoutId={`modal-${poll._id}`}
                            // layoutId helps if we were animating from the card, but here we just want a nice entry
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl ring-1 ring-white/30 overflow-hidden pointer-events-auto relative"
                        >
                            {/* Header Row: Votes Tag & Close Button */}
                            <div className="flex items-center justify-between px-8 pt-8">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-md text-primary text-sm font-bold shadow-sm">
                                    <Users className="w-4 h-4" />
                                    <span>{hasVoted ? totalVotes : totalVotes} votes</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full bg-white/50 hover:bg-white/80 text-slate-500 transition-colors backdrop-blur-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-8 pb-10 pt-4">
                                {/* Title Section */}
                                <motion.div layout className="mb-8 text-left">
                                    <h2 className="text-3xl font-extrabold text-text-main mb-2 leading-tight">
                                        {poll.question}
                                    </h2>
                                    <div className="text-base text-text-muted font-medium">
                                        par {poll.createdBy || "Admin"}
                                    </div>
                                </motion.div>

                                <div className="space-y-4">
                                    {poll.options.map((opt, idx) => {
                                        // Calculate percentage with optimistic update
                                        const isSelected = selectedOption === idx;
                                        // If this is the option we just voted for, add 1 to its count
                                        const currentOptionVotes = opt.votes + (hasVoted && isSelected ? 1 : 0);
                                        const percent = totalVotes > 0 ? Math.round((currentOptionVotes / totalVotes) * 100) : 0;

                                        // Determine winner based on OPTIMISTIC counts
                                        const allVotes = poll.options.map((o, i) => o.votes + (hasVoted && selectedOption === i ? 1 : 0));
                                        const maxVotes = Math.max(...allVotes);
                                        const isWinner = hasVoted && currentOptionVotes === maxVotes && currentOptionVotes > 0;

                                        return (
                                            <motion.button
                                                key={idx}
                                                layout
                                                onClick={() => !hasVoted && setSelectedOption(idx)}
                                                disabled={hasVoted}
                                                whileHover={!hasVoted ? { scale: 1.01 } : {}}
                                                whileTap={!hasVoted ? { scale: 0.99 } : {}}
                                                className={`relative w-full group overflow-hidden rounded-2xl transition-all duration-300 ${isSelected && !hasVoted
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-white' // Selected: Solid Primary
                                                    : hasVoted
                                                        ? 'bg-slate-100' // Result state
                                                        : 'bg-slate-100 hover:bg-slate-200 text-text-main' // Unselected: Light Grey Pill
                                                    }`}
                                                style={{ minHeight: '64px' }}
                                            >
                                                {/* Progress Bar (Only visible after vote) */}
                                                {hasVoted && (
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percent}%` }}
                                                        transition={{ duration: 1, ease: "circOut" }}
                                                        className={`absolute inset-0 z-0 opacity-20 ${isWinner ? 'bg-primary' : 'bg-slate-400'}`}
                                                    />
                                                )}

                                                <div className="relative z-10 px-6 py-4 flex justify-between items-center">
                                                    <div className="flex items-center gap-4 text-left w-full">
                                                        {/* Icon Logic */}
                                                        {hasVoted ? (
                                                            isWinner ? <Award className="w-6 h-6 text-primary flex-shrink-0" /> : null
                                                        ) : (
                                                            // Checkmark only when selected
                                                            isSelected && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="flex-shrink-0 text-white"
                                                                >
                                                                    <CheckCircle2 className="w-6 h-6 fill-white text-primary" />
                                                                </motion.div>
                                                            )
                                                        )}

                                                        <span className={`text-lg font-bold transition-colors flex-grow ${isSelected && !hasVoted ? 'text-white' : 'text-text-main'
                                                            }`}>
                                                            {opt.label}
                                                        </span>

                                                        {/* Percentage for results */}
                                                        {hasVoted && (
                                                            <motion.span
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="text-lg font-bold text-text-main"
                                                            >
                                                                {percent}%
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Footer Action */}
                                <motion.div layout className="mt-8">
                                    {!hasVoted ? (
                                        <button
                                            onClick={handleVote}
                                            disabled={selectedOption === null || isSubmitting}
                                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white text-xl font-bold shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    <span>Envoi du vote...</span>
                                                </div>
                                            ) : (
                                                "Confirmer le vote"
                                            )}
                                        </button>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100"
                                        >
                                            <p className="text-primary font-bold text-lg mb-1">Merci pour votre vote !</p>
                                            <p className="text-text-muted text-sm">Votre avis nous aide à nous améliorer.</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>


                </>
            )
            }
        </AnimatePresence >
    );
}


