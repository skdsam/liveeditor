const adjectives = [
    'Happy', 'Swift', 'Clever', 'Brave', 'Calm',
    'Eager', 'Gentle', 'Keen', 'Noble', 'Proud',
    'Quick', 'Wise', 'Bold', 'Kind', 'Wild',
];

const animals = [
    'Fox', 'Bear', 'Wolf', 'Eagle', 'Hawk',
    'Lion', 'Tiger', 'Owl', 'Raven', 'Falcon',
    'Panda', 'Koala', 'Otter', 'Deer', 'Lynx',
];

const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#ffeb3b', '#ff9800',
    '#ff5722', '#795548', '#607d8b', '#f06292',
];

export function generateUsername(): string {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adj}${animal}`;
}

export function generateColor(): string {
    return colors[Math.floor(Math.random() * colors.length)];
}

export function getInitials(name: string | undefined | null): string {
    if (!name) return '?';
    return name
        .match(/[A-Z]/g)
        ?.slice(0, 2)
        .join('') || name.slice(0, 2).toUpperCase();
}
