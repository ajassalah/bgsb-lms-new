import {PublicNav} from '@/components/public-nav';
import {BgsbFooter} from '@/components/bgsb-footer';
export default function PublicLayout({children}:{children:React.ReactNode}){return <><PublicNav/>{children}<BgsbFooter/></>}
