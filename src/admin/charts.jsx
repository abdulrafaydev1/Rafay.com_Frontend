import { useId, useState } from 'react';
import { Badge, Card } from './components';

export function CatalogChart({ products }) {
  const [metric, setMetric] = useState('count');
  const [hovered, setHovered] = useState(null);
  const id = useId().replaceAll(':', '');
  const grouped = products.reduce((acc, product) => {
    const date = new Date(product.createdAt);
    if (!Number.isFinite(date.getTime())) return acc;
    const month = date.toISOString().slice(0, 7);
    if (!acc[month]) acc[month] = { count: 0, value: 0 };
    acc[month].count++; acc[month].value += product.price;
    return acc;
  }, {});
  const entries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(1, ...entries.map(([, values]) => values[metric]));
  const points = entries.map(([month, values], index) => ({
    x: 24 + index * (592 / Math.max(1, entries.length - 1)), y: 218 - values[metric] / max * 175, month, value: values[metric],
  }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
  const active = hovered == null ? null : points[hovered];
  return <div className="ad-chart"><div className="ad-chart-toolbar"><Badge>Catalog history</Badge><div className="ad-segmented"><button aria-pressed={metric === 'count'} className={metric === 'count' ? 'ad-selected' : ''} onClick={() => setMetric('count')}>Products</button><button aria-pressed={metric === 'value'} className={metric === 'value' ? 'ad-selected' : ''} onClick={() => setMetric('value')}>List price value</button></div></div>
    <div className="ad-chart-plot"><svg viewBox="0 0 640 270" role="img" aria-label={`Catalog ${metric === 'count' ? 'product count' : 'list price value'} by creation month`}><defs><linearGradient id={`fill-${id}`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#4f46e5" stopOpacity=".25" /><stop offset="1" stopColor="#4f46e5" stopOpacity=".01" /></linearGradient></defs>{[43, 87, 131, 175, 219].map((y) => <line key={y} x1="24" x2="616" y1={y} y2={y} stroke="#dce5fa" strokeDasharray="2 4" />)}{points.length > 0 && <><path d={`${line} L${points.at(-1).x},220 L24,220 Z`} fill={`url(#fill-${id})`} /><path d={line} stroke="#4f46e5" strokeWidth="2.5" fill="none" strokeLinejoin="round" /></>}{points.map((point, index) => <g key={point.month}><circle cx={point.x} cy={point.y} r="4" fill="white" stroke="#4f46e5" strokeWidth="2" /><circle cx={point.x} cy={point.y} r="13" fill="transparent" onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}><title>{point.month}: {point.value.toLocaleString()}</title></circle>{index % Math.max(1, Math.ceil(points.length / 8)) === 0 && <text x={point.x} y="254" textAnchor="middle" fill="#777587" fontSize="11">{new Date(point.month + '-01T00:00:00Z').toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' })}</text>}</g>)}</svg>{active && <div className="ad-chart-tooltip"><small>{active.month}</small><strong>{metric === 'value' ? '$' : ''}{active.value.toLocaleString()}</strong><span>{metric === 'count' ? 'products created' : 'combined list price'}</span></div>}</div><div className="ad-chart-footnote"><span><i className="ad-legend-dot" />{metric === 'count' ? 'Products added by month' : 'Sum of product list prices by creation month'}</span><span>All catalog history · not sales revenue</span></div><details className="ad-chart-data"><summary>View chart data</summary><table><thead><tr><th>Month</th><th>Products</th><th>List price value</th></tr></thead><tbody>{entries.map(([month, values]) => <tr key={month}><td>{month}</td><td>{values.count}</td><td>${values.value.toFixed(2)}</td></tr>)}</tbody></table></details>
  </div>;
}
export function CategoryDistribution({ products }) {
  const groups = Object.entries(products.reduce((acc, product) => { acc[product.category] = (acc[product.category] || 0) + 1; return acc; }, {})).sort(([, a], [, b]) => b - a);
  const colors = ['#4f46e5', '#006e4c', '#7b6cee', '#a0aed0', '#526882', '#8996b5'];
  const total = products.length || 1;
  const stops = groups.map(([, count], index) => {
    const start = groups.slice(0, index).reduce((sum, [, n]) => sum + n, 0) / total * 360;
    return `${colors[index % colors.length]} ${start}deg ${start + count / total * 360}deg`;
  });
  return <Card title="Catalog by Category" action={<span className="ad-eyebrow">ALL PRODUCTS</span>} className="ad-distribution"><div className="ad-distribution-bars">{groups.slice(0, 5).map(([category, count], index) => <div className="ad-progress-row" key={category}><div><span className="ad-capitalize">{category}</span><strong>{count} <small>({(count / total * 100).toFixed(1)}%)</small></strong></div><span className="ad-progress-track"><span style={{ width: `${count / total * 100}%`, background: colors[index] }} /></span></div>)}</div><div className="ad-device-card"><div className="ad-donut" style={{ background: stops.length ? `conic-gradient(${stops.join(',')})` : '#dce9ff' }} role="img" aria-label={`${products.length} products across ${groups.length} categories`}><span>{products.length}<small>ITEMS</small></span></div><div><h3>Catalog distribution</h3><p>{groups.length} product categories</p><p>One connected storefront</p><Badge tone="success" dot>Catalog available</Badge></div></div></Card>;
}
