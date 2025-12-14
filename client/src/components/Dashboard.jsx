import { socket } from "../socket";
import { LogOut, BarChart3, Users, Clock, User, CheckCircle2, ChevronRight, Loader2, Search, Filter, Settings, Plus, Power, Trash2 } from "lucide-react";
import VoteModal from "./VoteModal";
import CreatePollModal from "./CreatePollModal";
import ProfileModal from "./ProfileModal";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Dashboard({ user, token, onLogout }) {
    const [sondages, setSondages] = useState([]);
    const [votedIds, setVotedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Pagination & Sorting State
    const [currentPage, setCurrentPage] = useState(1);
    const pollsPerPage = 6;

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'open', 'closed'

    // Computed Stats
    const activePollsCount = sondages.filter(s => s.status !== "closed").length;
    const totalVotes = votedIds.length;

    // Filter Logic

    const filteredPolls = sondages.filter(poll => {
        const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase());
        const currentStatus = poll.status || "open"; // Default to "open" for legacy data
        const matchesStatus = filterStatus === "all" || currentStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Sorting & Pagination Logic
    const sortedPolls = [...filteredPolls].sort((a, b) => {
        // Closed polls go to the bottom
        const aClosed = a.status === "closed";
        const bClosed = b.status === "closed";
        if (aClosed && !bClosed) return 1;
        if (!aClosed && bClosed) return -1;
        // Then sort by date descending (newest first)
        return new Date(b.dateCreation) - new Date(a.dateCreation);
    });

    // Reset page if search results shrink
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    const indexOfLastPoll = currentPage * pollsPerPage;
    const indexOfFirstPoll = indexOfLastPoll - pollsPerPage;
    const currentPolls = sortedPolls.slice(indexOfFirstPoll, indexOfLastPoll);
    const totalPages = Math.ceil(sortedPolls.length / pollsPerPage);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const fetchPolls = async () => {
        try {
            const res = await fetch("/api/sondages", {
                headers: { Authorization: token },
            });
            if (res.status === 401 || res.status === 403) {
                onLogout();
                return;
            }
            const data = await res.json();
            if (data.sondages) {
                setSondages(data.sondages);
                setVotedIds(data.votedSondageIds || []);
            }

            // Update selected poll if open
            if (selectedPoll && data.sondages) {
                const updated = data.sondages.find(p => p._id === selectedPoll._id);
                if (updated) {
                    setSelectedPoll(current => {
                        // Only update if the modal is still open and showing the same poll
                        if (current && current._id === updated._id) {
                            return updated;
                        }
                        return current; // If closed (null), keep it closed
                    });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();

        // Socket Listeners
        socket.on("connect", () => console.log("🟢 Socket Connected:", socket.id));
        socket.on("connect_error", (err) => console.error("🔴 Socket Error:", err));

        socket.on("pollListUpdated", fetchPolls);
        socket.on("pollUpdated", fetchPolls);

        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("pollListUpdated", fetchPolls);
            socket.off("pollUpdated", fetchPolls);
        };
    }, [selectedPoll]); // Add dependency to update modal content

    const handleVote = async (sondageId, optionIndex) => {
        // Optimistic Update
        const previousVotedIds = [...votedIds];
        if (!votedIds.includes(sondageId)) {
            setVotedIds([...votedIds, sondageId]);
        }

        try {
            const res = await fetch("/api/vote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ sondageId, optionIndex }),
            });

            if (res.ok) {
                fetchPolls(); // Fallback for immediate update
            } else {
                throw new Error("Vote Failed");
            }
        } catch (error) {
            console.error(error);
            // Rollback on error
            setVotedIds(previousVotedIds);
            alert("Erreur lors du vote. Veuillez réessayer.");
        }
    };

    const handleCreatePoll = async (pollData) => {
        const res = await fetch("/api/sondages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            body: JSON.stringify(pollData),
        });

        if (res.ok) {
            fetchPolls();
        } else {
            throw new Error("Creation failed");
        }
    };

    const handleDeletePoll = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce sondage ? Cette action est irréversible.")) return;
        try {
            const res = await fetch(`/api/sondages/${id}`, {
                method: "DELETE",
                headers: { Authorization: token },
            });
            if (res.ok) {
                setSondages(sondages.filter(s => s._id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleStatus = async (poll) => {
        const newStatus = poll.status === "closed" ? "open" : "closed";
        try {
            const res = await fetch(`/api/sondages/${poll._id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setSondages(sondages.map(s => s._id === poll._id ? { ...s, status: newStatus } : s));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-text-main">Bienvenue, <span className="text-primary">{user.fullName || user.nomUtilisateur}</span></h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="group flex items-center justify-center w-12 h-12 rounded-[18px] bg-white/50 backdrop-blur-xl border border-white/60 text-text-main hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                            title="Mon Profil"
                        >
                            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
                        </button>
                        <button
                            onClick={onLogout}
                            className="group flex items-center justify-center w-12 h-12 rounded-[18px] bg-white/50 backdrop-blur-xl border border-white/60 text-primary hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                            title="Déconnexion"
                        >
                            <LogOut className="w-5 h-5 text-text-main group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard
                        icon={BarChart3}
                        value={activePollsCount}
                        label="Sondages Actifs"
                        color="bg-emerald-500"
                        iconBg="bg-emerald-500/20"
                        iconColor="text-emerald-500"
                    />
                    <StatCard
                        icon={Users}
                        value={totalVotes}
                        label="Total des Votes"
                        color="bg-purple-500"
                        iconBg="bg-purple-500/20"
                        iconColor="text-purple-500"
                    />
                </div>

                {/* Active Polls Section */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h2 className="text-2xl font-bold text-text-main">Sondages Actifs</h2>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un sondage..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-full sm:w-64 backdrop-blur-sm transition-all"
                                />
                            </div>

                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="pl-10 pr-8 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none cursor-pointer backdrop-blur-sm transition-all"
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="open">Ouverts</option>
                                    <option value="closed">Fermés</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" />
                                Créer
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {currentPolls.map((sondage, index) => (
                                    <PollCard
                                        key={sondage._id}
                                        sondage={sondage}
                                        currentUserId={user ? (user.userId || user.id || user._id) : null} // Pass User ID to Check Ownership
                                        hasVoted={votedIds.includes(sondage._id)}
                                        onGenericVoteClick={() => setSelectedPoll(sondage)} // Open Modal
                                        onDelete={() => handleDeletePoll(sondage._id)}
                                        onToggleStatus={() => handleToggleStatus(sondage)}
                                        index={index}
                                    />
                                ))}
                            </AnimatePresence>

                            {sondages.length === 0 && (
                                <div className="col-span-full text-center py-20 text-text-muted">
                                    Aucun sondage actif pour le moment.
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="col-span-full flex justify-center items-center gap-4 mt-8">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 disabled:opacity-50 disabled:hover:bg-white/50 transition-all font-medium text-text-main shadow-sm"
                                    >
                                        Précédent
                                    </button>
                                    <span className="text-text-muted font-medium">
                                        Page {currentPage} sur {totalPages}
                                    </span>
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 disabled:opacity-50 disabled:hover:bg-white/50 transition-all font-medium text-text-main shadow-sm"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {/* Voting Modal */}
            <VoteModal
                poll={selectedPoll}
                isOpen={!!selectedPoll}
                onClose={() => setSelectedPoll(null)}
                hasVoted={selectedPoll && votedIds.includes(selectedPoll._id)}
                token={token}
                onVote={handleVote}
            />

            {isProfileOpen && (
                <ProfileModal
                    user={user}
                    token={token}
                    onClose={() => setIsProfileOpen(false)}
                />
            )}

            {isCreateModalOpen && (
                <CreatePollModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreatePoll}
                />
            )}
        </div>
    );
}

function StatCard({ icon: Icon, value, label, iconBg, iconColor }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="flex items-center p-6 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-white/50 shadow-xl ring-1 ring-white/40 transition-shadow hover:shadow-2xl"
        >
            <div className={`p-4 rounded-2xl ${iconBg} ${iconColor} mr-5`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <h3 className="text-4xl font-bold text-text-main mb-1">{value}</h3>
                <p className="text-text-muted font-medium">{label}</p>
            </div>
        </motion.div>
    );
}

function PollCard({ sondage, hasVoted, onGenericVoteClick, onDelete, onToggleStatus, currentUserId, index }) {
    const totalVotes = sondage.options.reduce((acc, opt) => acc + opt.votes, 0);
    const isOwner = sondage.createdById && currentUserId && sondage.createdById === currentUserId;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="flex flex-col h-full bg-card/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 ring-1 ring-white/40"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                {sondage.status === "closed" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-500 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Fermé
                    </span>
                ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-600 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Ouvert
                    </span>
                )}
                <span className="text-xs text-text-muted font-medium">
                    {new Date(sondage.dateCreation).toLocaleDateString()}
                </span>
            </div>

            <h3 className="text-xl font-bold text-text-main mb-2 line-clamp-2 min-h-[3.5rem]">
                {sondage.question}
            </h3>

            <div className="flex items-center gap-4 mb-6 text-sm text-text-muted">
                <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>{totalVotes} votes</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{sondage.options.length} options</span>
                </div>
            </div>

            {/* Options Preview (Simplified for Card View) */}
            <div className="space-y-2 flex-1 mb-6">
                {sondage.options.slice(0, 3).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-text-muted/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-text-muted/40" />
                        <span className="truncate">{opt.label}</span>
                    </div>
                ))}
                {sondage.options.length > 3 && (
                    <div className="text-xs text-text-muted/60 pl-3.5">+ {sondage.options.length - 3} autres options</div>
                )}
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-white/20 flex gap-3">
                {!hasVoted ? (
                    <button
                        onClick={onGenericVoteClick}
                        disabled={sondage.status === "closed"}
                        className={`flex-grow py-3.5 rounded-xl text-white font-bold text-shadow shadow-lg transition-all ${sondage.status === "closed"
                            ? "bg-slate-300 cursor-not-allowed shadow-none"
                            : "bg-gradient-to-r from-primary to-purple-600 shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
                            }`}
                    >
                        {sondage.status === "closed" ? "Vote Clos" : "Voter"}
                    </button>
                ) : (
                    <div className="flex-grow py-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Voté
                    </div>
                )}

                {isOwner && (
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
                            title={sondage.status === "closed" ? "Réouvrir" : "Fermer"}
                            className={`p-3.5 rounded-xl border transition-all ${sondage.status === "closed"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                }`}
                        >
                            <Power className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Supprimer"
                            className="p-3.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100/80 hover:border-red-200 transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
