export function formatMinutesHuman(value?: number | null): string {
  if (value === null || value === undefined || value <= 0) {
    return '—';
  }
  const weeks = Math.floor(value / (60 * 24 * 7));
  const days = Math.floor((value % (60 * 24 * 7)) / (60 * 24));
  const hours = Math.floor((value % (60 * 24)) / 60);
  const minutes = value % 60;
  const result: string[] = [];

  if (weeks) {
    result.push(`${weeks}н`);
  }
  if (days) {
    result.push(`${days}д`);
  }
  if (hours) {
    result.push(`${hours}ч`);
  }
  if (minutes) {
    result.push(`${minutes}м`);
  }
  return result.length ? result.join(' ') : '—';
}

export function minutesToDuration(value?: number | null): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const totalMinutes = Math.max(0, Math.floor(value));
  const days = Math.floor(totalMinutes / (60 * 24));
  const remainingMinutes = totalMinutes % (60 * 24);
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  if (days > 0) {
    return `${days} ${time}`;
  }

  return time;
}

export function durationToMinutes(value?: string | null): number | null {
  if (!value) {
    return null;
  }
  value = value.trim();
  let days = 0;
  let timePart = value;

  if (value.includes(' ')) {
    const split = value.split(' ');
    if (split.length !== 2) {
      return null;
    }
    days = Number(split[0]);
    if (isNaN(days)) {
      return null;
    }
    timePart = split[1];
  }
  const parts = timePart.split(':').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return null;
  }
  const [hours, minutes, seconds] = parts;
  return Math.floor(days * 24 * 60 + hours * 60 + minutes + seconds / 60);
}
