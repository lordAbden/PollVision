import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Plus, Trash2, Power, BarChart3, Archive, Layers, Loader2, Search, Filter, Settings } from "lucide-react";
import CreatePollModal from "./CreatePollModal";
import PollDetailsModal from "./PollDetailsModal";
import ProfileModal from "./ProfileModal";

import { socket } from "../socket";

export default function AdminDashboard({ user, token, onLogout }) {
    const [sondages, setSondages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPollId, setSelectedPollId] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pollsPerPage = 5;

    // Stats
    const totalPolls = sondages.length;
    const activePolls = sondages.filter(s => s.status !== "closed").length;
    const closedPolls = sondages.filter(s => s.status === "closed").length;
    const reopenedPolls = sondages.filter(s => s.status === "open" && s.wasReopened).length;
    const totalVotes = sondages.reduce((acc, s) => acc + s.options.reduce((sum, o) => sum + o.votes, 0), 0);

    // Pagination Logic
    const indexOfLastPoll = currentPage * pollsPerPage;
    const indexOfFirstPoll = indexOfLastPoll - pollsPerPage;

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Filter Logic
    const filteredPolls = sondages.filter(poll => {
        const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase());
        const currentStatus = poll.status || "open";
        const matchesStatus = filterStatus === "all" || currentStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Reset pagination
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    // Sort by status (active first) then by date (newest first)
    const sortedPolls = [...filteredPolls].sort((a, b) => {
        // If status differs, prioritize open/reopened over closed
        const aClosed = a.status === "closed";
        const bClosed = b.status === "closed";
        if (aClosed && !bClosed) return 1;
        if (!aClosed && bClosed) return -1;

        // If status is same, sort by date descending
        return new Date(b.dateCreation) - new Date(a.dateCreation);
    });
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
            // Ensure compatibility with old polls missing status
            const normalizedPolls = data.sondages.map(p => ({ ...p, status: p.status || "open" }));
            setSondages(normalizedPolls);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();

        // Socket Listeners
        socket.on("pollListUpdated", fetchPolls);
        socket.on("pollUpdated", fetchPolls);

        return () => {
            socket.off("pollListUpdated", fetchPolls);
            socket.off("pollUpdated", fetchPolls);
        };
    }, []);

    const handleCreatePoll = async (pollData) => {
        const res = await fetch("/api/sondages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            body: JSON.stringify(pollData),
        });

        const data = await res.json();

        if (res.ok) {
            fetchPolls();
        } else {
            // Throw error with server message for modal to display
            throw new Error(data.error || "Échec de création du sondage");
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
                setSondages(sondages.map(s => s._id === poll._id ? { ...s, status: newStatus, wasReopened: newStatus === 'open' ? true : s.wasReopened } : s));
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
                    <div>
                        <h1 className="text-3xl font-bold text-text-main">
                            Bienvenue, <span className="text-primary">{user.fullName || user.nomUtilisateur}</span>
                        </h1>
                        <p className="text-text-muted text-sm font-medium mt-1 ml-1">Tableau de bord Admin</p>
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
                        >
                            <LogOut className="w-5 h-5 text-primary group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <StatCard
                        icon={Layers}
                        value={totalPolls}
                        label="Total Sondages"
                        color="bg-blue-500"
                        iconBg="bg-blue-500/10"
                        iconColor="text-blue-500"
                    />
                    <StatCard
                        icon={BarChart3}
                        value={activePolls}
                        label="Sondages Actifs"
                        color="bg-emerald-500"
                        iconBg="bg-emerald-500/10"
                        iconColor="text-emerald-500"
                    />
                    <StatCard
                        icon={Archive}
                        value={closedPolls}
                        label="Sondages Fermés"
                        color="bg-slate-500"
                        iconBg="bg-slate-500/10"
                        iconColor="text-slate-500"
                    />
                    <StatCard
                        icon={Power}
                        value={reopenedPolls}
                        label="Réouverts"
                        color="bg-orange-500"
                        iconBg="bg-orange-500/10"
                        iconColor="text-orange-500"
                    />
                    <StatCard
                        icon={Layers}
                        value={totalVotes}
                        label="Total des Votes"
                        color="bg-purple-500"
                        iconBg="bg-purple-500/10"
                        iconColor="text-purple-500"
                    />
                </div>

                {/* Polls Section */}
                <section>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                        <h2 className="text-2xl font-bold text-text-main">Gérer les sondages</h2>

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="relative flex-grow sm:flex-grow-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-full sm:w-64 backdrop-blur-sm transition-all"
                                />
                            </div>

                            <div className="relative flex-grow sm:flex-grow-0">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="pl-10 pr-8 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-full sm:w-auto appearance-none cursor-pointer backdrop-blur-sm transition-all"
                                >
                                    <option value="all">Tous</option>
                                    <option value="open">Actifs</option>
                                    <option value="closed">Fermés</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
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
                        <div className="grid gap-6">
                            <AnimatePresence mode="popLayout">
                                {currentPolls.map((poll) => (
                                    <AdminPollCard
                                        key={poll._id}
                                        poll={poll}
                                        onClick={() => setSelectedPollId(poll._id)}
                                        onDelete={() => handleDeletePoll(poll._id)}
                                        onToggleStatus={() => handleToggleStatus(poll)}
                                    />
                                ))}
                            </AnimatePresence>

                            {sondages.length === 0 && (
                                <div className="text-center py-20 text-text-muted bg-white/30 rounded-[2rem] border border-white/40">
                                    Aucun sondage. Créez-en un !
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-8">
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

            {isCreateModalOpen && (
                <CreatePollModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreatePoll}
                />
            )}

            {selectedPollId && (
                <PollDetailsModal
                    pollId={selectedPollId}
                    token={token}
                    onClose={() => setSelectedPollId(null)}
                />
            )}

            {isProfileOpen && (
                <ProfileModal
                    user={user}
                    token={token}
                    onClose={() => setIsProfileOpen(false)}
                />
            )}
        </div>
    );
}

function StatCard({ icon: Icon, value, label, iconBg, iconColor }) {
    return (
        <motion.div
            layout
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

function AdminPollCard({ poll, onClick, onDelete, onToggleStatus }) {
    const isClosed = poll.status === "closed";
    const totalVotes = poll.options.reduce((acc, o) => acc + o.votes, 0);

    return (
        <motion.div
            layout
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
            className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-white/40 cursor-pointer ${isClosed ? "bg-slate-100/50 border-white/40" : "bg-card/60 border-white/60"}`}
        >
            <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isClosed
                        ? "bg-slate-200 text-slate-500 border-slate-300"
                        : "bg-emerald-100 text-emerald-600 border-emerald-200"
                        }`}>
                        {isClosed ? "Fermé" : "Actif"}
                    </span>
                    <span className="text-xs text-text-muted font-medium">
                        {new Date(poll.dateCreation).toLocaleDateString()} • par {poll.createdBy || "Admin"}
                    </span>
                </div>
                <h3 className={`text-xl font-bold text-text-main mb-1 ${isClosed ? "text-text-muted" : ""}`}>
                    {poll.question}
                </h3>
                <p className="text-sm text-text-muted">
                    {poll.options.length} options • <span className="font-semibold text-primary">{totalVotes} votes</span>
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${isClosed
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                >
                    <Power className="w-4 h-4" />
                    {isClosed ? "Réouvrir" : "Fermer"}
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-3 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100/80 hover:border-red-200 transition-all"
                    title="Supprimer le sondage"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
