import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
export const metadata:Metadata={title:{default:'BGSB Learning',template:'%s | BGSB Learning'},description:'British Graduates School of Business learning platform',icons:{icon:'https://bgsb.lk/bgs-logo.png',shortcut:'https://bgsb.lk/bgs-logo.png',apple:'https://bgsb.lk/bgs-logo.png'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<Toaster richColors/></body></html>}
