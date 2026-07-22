import type { Config } from 'tailwindcss';
export default { content:['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],theme:{extend:{colors:{navy:'#0A2647',red:'#C62828',cream:'#F7F8FA'},boxShadow:{soft:'0 16px 40px rgba(10,38,71,.09)'}}},plugins:[]} satisfies Config;
