"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter((item) => item !== "")

  // Filter out 'app' and 'branch' from display if desired, or map them
  const displaySegments = segments.filter(s => s !== 'app')

  return (
    <Breadcrumb className="mb-4 hidden md:flex">
      <BreadcrumbList>
        {displaySegments.map((segment, index) => {
          const isLast = index === displaySegments.length - 1
          const href = `/app/${displaySegments.slice(0, index + 1).join("/")}`.replace('//', '/')
          
          // Heuristic to skip GUIDs in display or show generic name?
          // For simplicity, just showing segment. 
          // Ideally, we'd look up branch name for UUIDs, but that requires server fetching.
          // For now, let's format it.
          const isUuid = /^[0-9a-f]{8}-/i.test(segment)
          const name = isUuid ? "Details" : segment.charAt(0).toUpperCase() + segment.slice(1)

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}



