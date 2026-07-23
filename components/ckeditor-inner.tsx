'use client';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
export default function Editor({value,onChange}:{value:string;onChange:(value:string)=>void}){return <CKEditor editor={ClassicEditor} data={value} onChange={(_:unknown,editor:any)=>onChange(editor.getData())} config={{toolbar:['heading','|','bold','italic','link','bulletedList','numberedList','blockQuote','undo','redo']}}/>}
