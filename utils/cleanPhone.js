export default function cleanPhone(phone) {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '').replace(/^(\+91|91)?/, '');
}
