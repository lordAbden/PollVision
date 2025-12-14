import { motion, AnimatePresence } from "framer-motion";
import { X, User, Calendar, CheckCircle2, History } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfileModal({ user, token, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/user/votes", {
                    headers: { Authorization: token },
                });
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data.history);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [token]);

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
                    className="relative w-full max-w-lg bg-white/60 backdrop-blur-3xl border border-white/40 rounded-[2.5rem] shadow-2xl ring-1 ring-white/50 overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header with User Info */}
                    <div className="p-8 border-b border-white/30 bg-gradient-to-br from-primary/10 via-white/20 to-purple-500/10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/30">
                                    {(user.fullName || user.nomUtilisateur || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-text-main">{user.fullName}</h2>
                                    <p className="text-primary font-medium">@{user.nomUtilisateur}</p>
                                    <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-text-muted capitalize">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-black/5 transition-colors"
                            >
                                <X className="w-6 h-6 text-text-muted" />
                            </button>
                        </div>
                    </div>

                    {/* Content - History */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            Historique de mes votes
                        </h3>

                        {loading ? (
                            <div className="py-10 text-center text-text-muted">Chargement...</div>
                        ) : history.length === 0 ? (
                            <div className="py-10 text-center text-text-muted bg-white/30 rounded-2xl border border-white/40">
                                Vous n'avez pas encore voté.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.slice(0, 4).map((item) => (
                                    <div key={item._id} className="p-4 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-text-main text-sm line-clamp-1 flex-1 mr-4">
                                                {item.pollQuestion}
                                            </h4>
                                            {item.status === 'closed' && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">Fermé</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                <CheckCircle2 className="w-3 h-3" />
                                                {item.choiceLabel}
                                            </span>
                                            <span className="text-xs text-text-muted">
                                                {new Date(item.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
