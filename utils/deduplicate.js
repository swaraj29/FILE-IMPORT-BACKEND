// export default function deduplicate(data) {
//   const seen = new Set();
//   return data.filter(item => {
//     if (!item || typeof item !== 'object') return false;
//     const key = (item.email || '').toLowerCase().trim();
//     if (!key || seen.has(key)) return false;
//     seen.add(key);
//     return true;
//   });
// }
