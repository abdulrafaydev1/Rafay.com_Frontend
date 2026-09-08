import { useEffect, useRef, useState } from 'react';
import Icon from './icons';

export function Button({ children, primary = false, icon, className = '', ...props }) {
  return <button type="button" className={`ad-button ${primary ? 'ad-primary' : ''} ${className}`} {...props}>{icon && <Icon name={icon} size={15} />}{children}</button>;
}
export function Badge({ children, tone = 'neutral', dot = false }) {
  return <span className={`ad-badge ad-badge-${tone}`}>{dot && <span className="ad-dot" />}{children}</span>;
}
export function Card({ title, subtitle, action, children, className = '' }) {
  return <section className={`ad-card ${className}`}>{title && <div className="ad-card-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>}{children}</section>;
}
export function StatCard({ label, value, detail, footer, icon = 'chart', badge }) {
  return <Card className="ad-stat"><div className="ad-stat-label"><span>{label}</span>{badge && <Badge tone="success">{badge}</Badge>}</div><div className="ad-stat-value">{value}<Icon name={icon} size={34} /></div><p>{detail}</p><div className="ad-stat-footer">{footer}</div></Card>;
}
export function EmptyState({ title = 'No data available', description, icon = 'box', action, compact = false }) {
  return <div className={`ad-empty ${compact ? 'ad-empty-compact' : ''}`}><span className="ad-empty-icon"><Icon name={icon} size={22} /></span><h3>{title}</h3>{description && <p>{description}</p>}{action}</div>;
}
export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search', inputRef, ...props }) {
  return <label className="ad-search"><Icon name="search" size={16} /><input ref={inputRef} type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} {...props} /></label>;
}
export function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="ad-pagination"><span>{total ? <>Showing <strong>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</strong> of <strong>{total.toLocaleString()}</strong></> : '0 results'}</span><div className="ad-pagination-controls">{onPageSizeChange && <label>Rows per page: <select aria-label="Rows per page" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}><option>10</option><option>25</option><option>50</option></select></label>}<Button aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</Button><span className="ad-current-page">{page}</span><span>of {pages}</span><Button aria-label="Next page" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>›</Button></div></div>;
}
export function DataTable({ columns, rows, rowKey = 'id', emptyTitle, emptyDescription, onRowClick, caption }) {
  return <><div className="ad-table-scroll"><table className="ad-table">{caption && <caption className="ad-sr-only">{caption}</caption>}<thead><tr>{columns.map((column) => <th key={column.key} scope="col" className={column.numeric ? 'ad-numeric' : ''}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[rowKey]}>{columns.map((column, index) => <td key={column.key} className={column.numeric ? 'ad-numeric' : ''}>{index === 0 && onRowClick ? <button className="ad-text-button" onClick={() => onRowClick(row)}>{column.render ? column.render(row) : row[column.key]}</button> : column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody></table></div>{!rows.length && <EmptyState title={emptyTitle || 'No results found'} description={emptyDescription} />}</>;
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = oldOverflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`ad-modal ${wide ? 'ad-modal-wide' : ''}`} aria-labelledby="ad-modal-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === ref.current) { const rect = ref.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}><div className="ad-modal-heading"><h2 id="ad-modal-title">{title}</h2><Button icon="close" aria-label="Close dialog" onClick={onClose} /></div>{children}</dialog>;
}
export function Menu({ label, trigger, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div className={`ad-menu ${className}`} ref={ref}><button ref={triggerRef} type="button" className="ad-menu-trigger" aria-label={label} aria-expanded={open} onClick={() => setOpen(!open)}>{trigger}</button>{open && <div className="ad-popover" onClick={(event) => { if (event.target.closest('a, button')) setOpen(false); }}>{children}</div>}</div>;
}
export function LoadingSkeleton({ full = false }) {
  return <div className={`ad-loading ${full ? 'ad-loading-full' : ''}`} role="status" aria-label="Loading admin portal"><span className="ad-sr-only">Loading admin portal…</span><div className="ad-skeleton ad-skeleton-title" /><div className="ad-stat-grid">{[0, 1, 2, 3].map((key) => <div className="ad-skeleton ad-skeleton-card" key={key} />)}</div><div className="ad-skeleton ad-skeleton-chart" /></div>;
}
export function ErrorState({ message, onRetry }) {
  return <div className="ad-error" role="alert"><Icon name="alert" /><span>{message}</span>{onRetry && <Button onClick={onRetry} icon="refresh">Try again</Button>}</div>;
}
