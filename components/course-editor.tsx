'use client';
import dynamic from 'next/dynamic';
const Editor=dynamic(()=>import('./ckeditor-inner'),{ssr:false,loading:()=> <div className="h-48 animate-pulse rounded-xl bg-slate-100"/>});
export function CourseEditor(props:{value:string;onChange:(value:string)=>void}){return <div className="course-editor overflow-hidden rounded-xl border bg-white"><Editor {...props}/><style jsx global>{`.course-editor .ck-editor__editable_inline{min-height:220px}.course-editor .ck.ck-toolbar{border:0;border-bottom:1px solid #e2e8f0}.course-editor .ck.ck-editor__main>.ck-editor__editable{border:0}`}</style></div>}
