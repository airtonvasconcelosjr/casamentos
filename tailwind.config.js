/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            colors: {
                'olive': '#838c6d',
                'olive-dark': '#6f7a58',
                'olive-light': '#c9d1b2',
            },
        },
    },
    plugins: [],
}