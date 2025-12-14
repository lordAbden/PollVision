import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function AnimatedBackground() {
    // Mouse coordinates
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring physics for smooth movement
    // Higher damping = less oscillation, stiffness controls speed
    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Second orb follows with slightly different physics for "fluid" separation
    const springX2 = useSpring(mouseX, { damping: 40, stiffness: 100 });
    const springY2 = useSpring(mouseY, { damping: 40, stiffness: 100 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Center the coordinate system relative to the window
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Set values relative to center for parallax feel
            mouseX.set(clientX - centerX);
            mouseY.set(clientY - centerY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Base gradient background - subtle */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50" />

            {/* Orb 1: Primary Violet */}
            <motion.div
                className="absolute left-1/2 top-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] mix-blend-multiply"
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />

            {/* Orb 2: Secondary Cyan/Blue for contrast */}
            <motion.div
                className="absolute left-1/2 top-1/2 w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[90px] mix-blend-multiply"
                style={{
                    x: springX2,
                    y: springY2,
                    translateX: "-20%", // Offset slightly
                    translateY: "-20%",
                }}
            />

            {/* Orb 3: Accent Pink/Purple - Static or slow moving for depth */}
            <motion.div
                className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-400/20 blur-[80px] mix-blend-multiply"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
}
