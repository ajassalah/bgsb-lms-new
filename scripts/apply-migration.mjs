import fs from 'node:fs';import postgres from 'postgres';
for(const line of fs.readFileSync('.env','utf8').split(/\r?\n/)){const m=line.match(/^([^#][^=]*)=(.*)$/);if(m)process.env[m[1].trim()]=m[2].trim().replace(/^['"]|['"]$/g,'')}
const file=process.argv[2];if(!file||!process.env.DATABASE_URL)throw new Error('Migration file or DATABASE_URL missing');
const sql=postgres(process.env.DATABASE_URL,{ssl:'require',max:1});
try{await sql.unsafe(fs.readFileSync(file,'utf8'));console.log(`MIGRATION_APPLIED=${file}`)}finally{await sql.end()}
