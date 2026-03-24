/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    purple: "#7C3AED",
                    blue: "#4F46E5",
                    cyan: "#06B6D4",
                },
                secondary: {
                    green: "#22C55E",
                    orange: "#F59E0B",
                    red: "#EF4444",
                },
                dark: "#0F172A",
                light: "#F8FAFC",
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
