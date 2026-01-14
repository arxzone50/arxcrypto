import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ARXCRYPTO - Crypto Prices & Market Data",
	description: "Track real-time cryptocurrency prices, market trends, and insights powered by CoinGecko. ARXCRYPTO by ARXZONE delivers fast, reliable crypto data.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${inter.variable} antialiased`}
				style={{ fontFamily: "var(--font-inter)" }}
			>
				<Header />
				{children}
				<Footer />
			</body>
		</html>
	);
}
