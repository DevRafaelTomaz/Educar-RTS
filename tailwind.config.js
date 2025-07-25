/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Essencial para o Tailwind escanear seus arquivos React
    "./public/index.html", // Inclui o arquivo HTML principal
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Adiciona a fonte Inter, se não estiver já no tema padrão
      },
    },
  },
  plugins: [],
}