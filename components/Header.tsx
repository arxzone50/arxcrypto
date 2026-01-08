'use client'
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const Header = () => {
    const pathname = usePathname()
    return (
        <header>
            <div className="main-container inner">
                <Link href="/">
                    <Image
                        src="/arxcrypto.svg"
                        alt="arxcrypto logo"
                        width={512}
                        height={512}
                        style={{
                            width: 'auto',
                            height: '70px'
                        }}
                    />
                </Link>

                <nav>
                    <Link href="/" className={cn('nav-link', {
                        'active': pathname === '/',
                        'home': true
                    })}>Home</Link>

                    <p>Search Modal</p>

                    <Link href="/coins" className={cn('nav-link', {
                        'active': pathname === '/coins'
                    })}>All coins</Link>
                </nav>
            </div>
        </header>
    )
}

export default Header