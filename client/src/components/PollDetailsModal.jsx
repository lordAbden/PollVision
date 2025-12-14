import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function PollDetailsModal({ pollId, onClose, token }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/sondages/${pollId}/details`, {
                    headers: { Authorization: token },
                });
                if (res.ok) {
                    const data = await res.json();
                    setDetails(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();

        // Listen for updates specifically for this poll
        const handleUpdate = (data) => {
            if (data.sondageId === pollId) {
                fetchDetails();
            }
        };

        socket.on("pollUpdated", handleUpdate);

        return () => {
            socket.off("pollUpdated", handleUpdate);
        };
    }, [pollId, token]);

    if (!details && !loading) return null;

    const { poll, votes } = details || {};

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-2xl bg-white/60 backdrop-blur-3xl border border-white/40 rounded-[2.5rem] shadow-2xl ring-1 ring-white/50 overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-white/30 bg-white/20">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border mb-3 ${poll?.status === "closed"
                                    ? "bg-slate-200/80 text-slate-500 border-slate-300"
                                    : "bg-emerald-100/80 text-emerald-600 border-emerald-200"
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${poll?.status === "closed" ? "bg-slate-400" : "bg-emerald-500 animate-pulse"}`} />
                                    {poll?.status === "closed" ? "Fermé" : "Actif"}
                                </span>
                                <h2 className="text-2xl font-bold text-text-main leading-tight">{poll?.question}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-black/5 transition-colors"
                            >
                                <X className="w-6 h-6 text-text-muted" />
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-muted font-medium">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                Créé le {new Date(poll?.dateCreation).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                Par {poll?.createdBy}
                            </span>
                        </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {loading ? (
                            <div className="h-40 flex items-center justify-center text-primary font-medium">
                                Chargement des détails...
                            </div>
                        ) : (
                            <>
                                {/* Results Stats */}
                                <div>
                                    <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                        Résultats des votes
                                    </h3>
                                    <div className="space-y-4">
                                        {poll.options.map((option, idx) => {
                                            const totalVotes = poll.options.reduce((a, b) => a + b.votes, 0);
                                            const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

                                            return (
                                                <div key={idx} className="relative">
                                                    <div className="flex justify-between text-sm font-semibold mb-1 text-text-main">
                                                        <span>{option.label}</span>
                                                        <span>{option.votes} votes ({percentage}%)</span>
                                                    </div>
                                                    <div className="h-3 bg-white/40 rounded-full overflow-hidden border border-white/30">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Voter History */}
                                <div>
                                    <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        Historique des votes ({votes.length})
                                    </h3>

                                    <div className="bg-white/30 rounded-[1.5rem] border border-white/40 overflow-hidden">
                                        {votes.length === 0 ? (
                                            <div className="p-8 text-center text-text-muted font-medium">
                                                Aucun vote enregistré pour le moment.
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/40">
                                                {votes.map((vote) => (
                                                    <div key={vote._id} className="p-4 flex items-center justify-between hover:bg-white/20 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary flex items-center justify-center font-bold text-lg border border-white/50">
                                                                {vote.user.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-text-main text-sm">{vote.user}</p>
                                                                <p className="text-xs text-text-muted">{new Date(vote.date).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/50 border border-white/60 text-primary shadow-sm">
                                                            {vote.optionLabel}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
