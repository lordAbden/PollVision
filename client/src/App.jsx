import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("vote_token");
    const savedUser = localStorage.getItem("vote_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem("vote_token", data.token);
    localStorage.setItem("vote_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("vote_token");
    localStorage.removeItem("vote_user");
    setToken(null);
    setUser(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-bg-base overflow-hidden text-text-main font-sans selection:bg-primary selection:text-white">
      {/* Animated Background Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-300/30 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -40, 0],
          y: [0, 60, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-pink-300/20 rounded-full blur-[90px] pointer-events-none mix-blend-multiply"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {user && token ? (
          user.role === 'admin' ? (
            <AdminDashboard user={user} token={token} onLogout={handleLogout} />
          ) : (
            <Dashboard user={user} token={token} onLogout={handleLogout} />
          )
        ) : (
          <AuthForm onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}

export default App;
