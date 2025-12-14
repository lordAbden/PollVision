import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";

export default function AuthForm({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const toggleMode = (mode) => {
        setIsLogin(mode === "login");
        setError("");
        setFormData({ username: "", fullName: "", email: "", password: "", confirmPassword: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const payload = isLogin
            ? { nomUtilisateur: formData.username, motDePasse: formData.password }
            : {
                nomUtilisateur: formData.username,
                email: formData.email,
                motDePasse: formData.password,
                fullName: formData.fullName
            };

        const endpoint = isLogin ? "/api/login" : "/api/register";

        try {
            // Validation for register
            if (!isLogin && formData.password !== formData.confirmPassword) {
                throw new Error("Les mots de passe ne correspondent pas");
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Une erreur est survenue");

            if (isLogin) {
                onLogin(data);
            } else {
                setIsLogin(true); // Switch to login after register
                setFormData({ username: "", fullName: "", email: "", password: "", confirmPassword: "" });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-slate-50">
            <AnimatedBackground />
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="w-full max-w-[400px] overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl shadow-2xl ring-1 ring-white/50 relative z-10"
            >
                <div className="p-8 flex flex-col items-center">

                    {/* Logo Area */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30 text-white">
                            <Sparkles className="h-7 w-7" />
                        </div>
                        <h1 className="mb-1 text-3xl font-bold tracking-tight text-text-main">
                            Bienvenue
                        </h1>
                        <p className="text-text-muted text-sm font-medium">
                            Donnez votre avis, façonnez l'avenir
                        </p>
                    </div>

                    {/* Toggle Switch */}
                    <div className="mb-8 w-fit bg-slate-100 p-1 rounded-full relative">
                        <div className="flex relative z-10">
                            <button
                                onClick={() => toggleMode("login")}
                                className={`relative px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${isLogin ? "text-white" : "text-text-muted hover:text-text-main"
                                    }`}
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => toggleMode("register")}
                                className={`relative px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${!isLogin ? "text-white" : "text-text-muted hover:text-text-main"
                                    }`}
                            >
                                S'inscrire
                            </button>
                        </div>

                        {/* Sliding Background for Toggle */}
                        <motion.div
                            className="absolute top-1 bottom-1 bg-primary rounded-full shadow-md"
                            initial={false}
                            animate={{
                                left: isLogin ? "4px" : "50%",
                                width: isLogin ? "calc(50% - 4px)" : "calc(50% - 4px)",
                                x: isLogin ? 0 : 0
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <AnimatePresence initial={false} mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    key="fullname"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="relative group mb-4">
                                        <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" />
                                        <input
                                            type="text"
                                            placeholder="Nom Complet"
                                            required={!isLogin}
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            autoComplete="name"
                                            className="w-full rounded-2xl border border-border-light bg-bg-base/50 py-3.5 pl-12 pr-4 text-[15px] text-text-main placeholder-text-muted transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Username Field */}
                            <motion.div layout key="username-field" className="relative group">
                                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" />
                                <input
                                    type="text"
                                    placeholder="Nom d'utilisateur"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    autoComplete="username"
                                    className="w-full rounded-2xl border border-border-light bg-bg-base/50 py-3.5 pl-12 pr-4 text-[15px] text-text-main placeholder-text-muted transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                                />
                            </motion.div>

                            {/* Email Field */}
                            {!isLogin && (
                                <motion.div
                                    key="email-field"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="relative group overflow-hidden mt-4"
                                >
                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input
                                        type="email"
                                        placeholder="Adresse Email"
                                        required={!isLogin}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        autoComplete="email"
                                        className="w-full rounded-2xl border border-border-light bg-bg-base/50 py-3.5 pl-12 pr-4 text-[15px] text-text-main placeholder-text-muted transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                                    />
                                </motion.div>
                            )}

                            <motion.div layout key="password-field" className="relative group">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" />
                                <input
                                    type="password"
                                    placeholder="Mot de passe"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    className="w-full rounded-2xl border border-border-light bg-bg-base/50 py-3.5 pl-12 pr-4 text-[15px] text-text-main placeholder-text-muted transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                                />
                            </motion.div>

                            {!isLogin && (
                                <motion.div
                                    key="confirmPassword"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="relative group mt-4">
                                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" />
                                        <input
                                            type="password"
                                            placeholder="Confirmer le mot de passe"
                                            required={!isLogin}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            autoComplete="new-password"
                                            className="w-full rounded-2xl border border-border-light bg-bg-base/50 py-3.5 pl-12 pr-4 text-[15px] text-text-main placeholder-text-muted transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100 text-center">
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            layout
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-purple-600 py-3.5 text-[16px] font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "Se connecter" : "Créer un compte"}
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </motion.button>

                        <div className="pt-2 text-center">
                            <p className="text-sm text-text-muted">
                                {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
                                <button
                                    type="button"
                                    onClick={() => toggleMode(isLogin ? "register" : "login")}
                                    className="font-semibold text-primary hover:text-primary-hover transition-colors"
                                >
                                    {isLogin ? "S'inscrire" : "Se connecter"}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
