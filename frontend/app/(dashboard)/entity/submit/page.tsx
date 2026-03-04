"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EntitySubmitRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/submissions")
  }, [router])
  return null
}