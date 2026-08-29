export const SOCIALS = [
  {
    label: 'Instagram',
    href: 'http://instagram.com/niconoal',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@niconoal',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.4v9.9a4.9 4.9 0 1 1-4.9-4.9c.16 0 .32.01.48.03v2.5a2.4 2.4 0 1 0 1.9 2.35V2h2.53a4.28 4.28 0 0 0 4.13 4.1v2.5c-.35.02-.7.02-1-.03z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/nicolasmachadoblog?sub_confirmation=1',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.6 7.6a2.9 2.9 0 0 0-2.05-2.06C17.8 5 12 5 12 5s-5.8 0-7.55.54A2.9 2.9 0 0 0 2.4 7.6 30.2 30.2 0 0 0 1.9 12a30.2 30.2 0 0 0 .5 4.4 2.9 2.9 0 0 0 2.05 2.06C6.2 19 12 19 12 19s5.8 0 7.55-.54a2.9 2.9 0 0 0 2.05-2.06 30.2 30.2 0 0 0 .5-4.4 30.2 30.2 0 0 0-.5-4.4ZM9.9 15.1V8.9l5.4 3.1-5.4 3.1Z" />
      </svg>
    ),
  },
]

export function WhatsAppIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-8.63 15.02L2 22l5.12-1.34A10 10 0 1 0 12 2Zm0 18.1a8.09 8.09 0 0 1-4.13-1.13l-.3-.18-3.05.8.81-2.97-.19-.31A8.1 8.1 0 1 1 12 20.1Zm4.44-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  )
}

export function MailIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=5551981494510&text=Oi%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20para%20uma%20parceria%20com%20o%20Nico'
export const EMAIL_URL = 'mailto:oi@niconoal.com.br'
export const NICO_PHOTO = 'https://rciywgiuktjipcjtmrzw.supabase.co/storage/v1/object/public/avatars/nico.jpg'
