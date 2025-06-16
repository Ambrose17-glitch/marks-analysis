import Image from "next/image"

interface SchoolHeaderProps {
  title?: string
  subtitle?: string
  className?: string
}

export function SchoolHeader({ title, subtitle, className = "" }: SchoolHeaderProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Header Content */}
      <div className="relative z-10 text-center border-b-2 border-gray-800 pb-4 mb-4">
        <div className="flex flex-col items-center space-y-3">
          <Image
            src="/images/school-logo.jpg"
            alt="Bright Generation Learning Centre Logo"
            width={80}
            height={80}
            className="object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-wide uppercase">
              BRIGHT GENERATION LEARNING CENTRE
            </h1>
            <div className="mt-2 space-y-1">
              <p className="text-sm font-semibold text-gray-700 uppercase">KALISIZO</p>
              <p className="text-xs text-gray-600 uppercase">P.O BOX 29, KALISIZO</p>
              <p className="text-xs text-gray-600">TEL: 0741972226 | 0700706752 | 0704631527</p>
              <p className="text-xs text-gray-500 italic font-medium uppercase">"WITH GOD WE EXCEL"</p>
            </div>
            {title && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
                {subtitle && <p className="text-gray-600 mt-1 uppercase">{subtitle}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
