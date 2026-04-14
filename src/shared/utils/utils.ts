/**
 *
 * @param date
 * @returns @example 2025. 03. 17
 */
export function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul',
    })
    .replace(/\.$/, '');
}

/**
 * API에 넘기는 날짜 포맷팅 (ISO 8601)
 * @param date
 * @returns 2026-03-06T00:00:00.000Z
 */
export const formatDateForAPI = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
};

