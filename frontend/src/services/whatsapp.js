export const BUSINESS_WHATSAPP = '6281289903664'

export function whatsappLink(number, message) {
  let digits = String(number || BUSINESS_WHATSAPP).replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
