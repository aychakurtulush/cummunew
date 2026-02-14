import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                stone: {
                    50: "#fafaf9",
                    100: "#f5f5f4",
                    200: "#e7e5e4",
                },
                moss: {
                    50: "#f2f7f2",
                    100: "#e3ebe3",
                    200: "#c5d6c5",
                    300: "#9ebf9e",
                    400: "#74a074",
                    500: "#548254",
                    600: "#4a6c4c", // Primary
                    700: "#3d573d",
                    800: "#324532",
                    900: "#2a392a",
                },
                terracotta: {
                    50: "#fbf6f4",
                    100: "#f7ebe8",
                    200: "#ebd4cd",
                    300: "#dcb2a5",
                    400: "#ca8a78",
                    500: "#b96b56",
                    600: "#c87961", // Primary Accent
                    700: "#8a4f3f",
                    800: "#734438",
                    900: "#603b32",
                }
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
                serif: ["var(--font-serif)", "serif"],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(45, 43, 35, 0.08)',
            }
        },
    },
    plugins: [],
};
export default config;
