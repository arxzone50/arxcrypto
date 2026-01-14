"use client"

import Link from "next/link"

const Footer = () => {
      return (
            <footer className="border-t border-border">
                  <div className="main-container inner flex flex-col gap-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        {/* Brand */}
                        <div>
                              <p className="text-base font-semibold text-foreground hover:opacity-80 transition">
                                    ARXCRYPTO
                              </p>
                              <p className="text-xs">
                                    by{" "}
                                    <span className="font-medium text-foreground">
                                          ARXZONE
                                    </span>
                              </p>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-col gap-2 sm:items-end">
                              <p>
                                    Data powered by{" "}
                                    <a
                                          href="https://www.coingecko.com"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="font-medium text-foreground hover:underline"
                                    >
                                          CoinGecko
                                    </a>{" "}
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                    <span>© 2026-{new Date().getFullYear()} arxzone</span>
                              </div>
                        </div>
                  </div>
            </footer>
      )
}

export default Footer
