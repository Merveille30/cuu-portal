import Image from 'next/image'

interface CUULogoProps {
  size?: number
  className?: string
}

export default function CUULogo({ size = 40, className = '' }: CUULogoProps) {
  return (
    <div
      className={`rounded-full overflow-hidden flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <Image
        src="/cuu-logo.svg"
        alt="Cavendish University Uganda"
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        priority
      />
    </div>
  )
}
