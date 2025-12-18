import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, Sparkles } from "lucide-react";

export default function CreatePollModal({ onClose, onCreate }) {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [closingDate, setClosingDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [moderationStatus, setModerationStatus] = useState(null); // 'reviewing', 'approved', 'rejected'

    const handleAddOption = () => {
        setOptions([...options, ""]);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleRemoveOption = (index) => {
        if (options.length <= 2) return;
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!question.trim()) {
            setError("Veuillez entrer une question.");
            return;
        }
        if (options.some(opt => !opt.trim())) {
            setError("Toutes les options doivent être remplies.");
            return;
        }

        setIsSubmitting(true);
        setModerationStatus('reviewing');
        setError("");

        try {
            await onCreate({ question, options, closingDate });

            // Show success state
            setModerationStatus('approved');

            // Close modal after brief success message
            setTimeout(() => {
                onClose();
                // Reset states
                setQuestion("");
                setOptions(["", ""]);
                setClosingDate("");
                setModerationStatus(null);
                setError("");
            }, 1500);
        } catch (err) {
            setModerationStatus('rejected');
            setError(err.message || "Échec de création. Réessayez.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl ring-1 ring-white/30 overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 pt-8 mb-6">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Nouveau Sondage</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-slate-100/50 hover:bg-slate-200/50 text-text-muted hover:text-text-main transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-8 pb-8">
                        <h2 className="text-3xl font-bold text-text-main mb-2">Créer un sondage</h2>
                        <p className="text-text-muted mb-8">Définissez votre question et vos options.</p>

                        {/* AI Moderation Status Feedback */}
                        {moderationStatus === 'reviewing' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-2xl flex items-center gap-3"
                            >
                                <div className="text-2xl animate-spin">🤖</div>
                                <div>
                                    <p className="font-semibold text-blue-300">L'IA analyse votre sondage...</p>
                                    <p className="text-sm text-blue-200">Vérification du contenu en cours</p>
                                </div>
                            </motion.div>
                        )}

                        {moderationStatus === 'approved' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl flex items-center gap-3"
                            >
                                <span className="text-2xl">✅</span>
                                <div>
                                    <p className="font-semibold text-green-300">Sondage approuvé !</p>
                                    <p className="text-sm text-green-200">Création en cours...</p>
                                </div>
                            </motion.div>
                        )}

                        {moderationStatus === 'rejected' && error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl"
                            >
                                <p className="font-semibold text-red-300 mb-1 flex items-center gap-2">
                                    <span>❌</span> Sondage rejeté
                                </p>
                                <p className="text-sm text-red-200">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Question Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text-muted ml-1">Question</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="ex: Quel est votre framework préféré ?"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="w-full bg-white/40 border border-white/40 focus:bg-white/60 focus:border-primary/50 text-text-main placeholder-text-muted/70 text-lg rounded-2xl px-5 py-4 outline-none transition-all shadow-sm"
                                />
                            </div>

                            {/* Options List */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-text-muted ml-1">Options</label>
                                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                    {options.map((option, idx) => (
                                        <div key={idx} className="flex gap-2 group">
                                            <input
                                                type="text"
                                                placeholder={`Option ${idx + 1}`}
                                                value={option}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                className="flex-1 bg-white/30 border border-white/30 focus:bg-white/50 focus:border-primary/30 text-text-main rounded-xl px-4 py-3 outline-none transition-all"
                                            />
                                            {options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOption(idx)}
                                                    className="px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 ml-1"
                                >
                                    <Plus className="w-4 h-4" /> Ajouter une option
                                </button>
                            </div>

                            {/* Closing Date Picker */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text-muted ml-1">Date de fin (Optionnel)</label>
                                <input
                                    type="datetime-local"
                                    value={closingDate}
                                    onChange={(e) => setClosingDate(e.target.value)}
                                    className="w-full bg-white/40 border border-white/40 focus:bg-white/60 focus:border-primary/50 text-text-main rounded-2xl px-5 py-3 outline-none transition-all shadow-sm"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Création en cours...</span>
                                    </>
                                ) : (
                                    "Publier"
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
