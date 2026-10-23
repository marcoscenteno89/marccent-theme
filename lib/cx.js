// Joins class names, skipping falsy ones, so a class can be switched by a condition:
// cx('btn', active && 'active', className). Styles need no helper: { ...style, position: 'relative' }.
export const cx = (...classes) => classes.filter(Boolean).join(' ');
