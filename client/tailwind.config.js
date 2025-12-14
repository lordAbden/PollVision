/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                apple: {
                    blue: "#0071e3",
                    gray: "#f5f5f7",
                    text: "#1d1d1f",
                    secondary: "#86868b",
                }
            },
            fontFamily: {
                sans: [
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "Helvetica",
                    "Arial",
                    "sans-serif",
                ],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
