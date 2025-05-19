/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff7700',
          hover: '#ff8c00',
          dark: '#e66c00',
          light: '#ff9933',
        },
        accent: {
          DEFAULT: '#00ccff',
          hover: '#0099ff',
          dark: '#0088cc',
          light: '#66e0ff',
        },
        tech: {
          background: '#161b22',
          card: '#1c2128',
          input: '#21262d',
          secondary: '#30363d',
          border: '#30363d',
          foreground: '#f0f6fc',
          "foreground-muted": "#8b949e",
          "elevation-1": "#1c2128",
          "elevation-2": "#21262d"
        },
        status: {
          success: '#2ea043',
          warning: '#f0883e',
          danger: '#e74c3c',
          info: '#3498db',
        },
        dark: {
          DEFAULT: '#121212',
          lighter: '#1a1a1a',
          light: '#292929',
          border: '#333333',
          input: '#1e1e1e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient': 'linear-gradient(135deg, #ff7700 0%, #ff4d00 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00ccff 0%, #0088ff 100%)',
      },
      boxShadow: {
        'tech': '0 4px 20px 0 rgba(0, 0, 0, 0.25)',
        'tech-hover': '0 8px 30px 0 rgba(0, 0, 0, 0.3)',
        'accent': '0 0 15px rgba(0, 204, 255, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}; 