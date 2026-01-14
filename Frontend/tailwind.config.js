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
                    DEFAULT: '#4F46E5', // Indigo 600
                    hover: '#4338CA', // Indigo 700
                },
                secondary: '#10B981', // Emerald 500
                background: '#F8FAFC', // Slate 50
                surface: '#FFFFFF',
                text: {
                    main: '#0F172A', // Slate 900
                    muted: '#64748B', // Slate 500
                },
                border: '#E2E8F0', // Slate 200
                danger: '#EF4444', // Red 500
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                lg: '0.75rem',
            },
            boxShadow: {
                DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                details: '0 12px 24px -6px rgb(0 0 0 / 0.15)',
            },
        },
    },
    plugins: [],
}
