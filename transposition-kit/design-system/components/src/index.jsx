// BL Demo — composants façon shadcn, stylés par tokens (voir ../bundle.css).
// Source du bundle : une IIFE qui lit window.React et expose window.BLDemo.
import ICONS from './icons.json';

const React = window.React;
const { useState, useRef, useEffect, useId, forwardRef, cloneElement, isValidElement } = React;

const cx = (...parts) => parts.filter(Boolean).join(' ');
const renderIcon = (icon, size) => (typeof icon === 'string' ? <Icon name={icon} size={size} /> : icon);
const useControlled = (controlled, initial, onChange) => {
  const [inner, setInner] = useState(initial);
  const value = controlled !== undefined ? controlled : inner;
  const set = (next) => {
    if (controlled === undefined) setInner(next);
    if (onChange) onChange(next);
  };
  return [value, set];
};

/* ───────────── Icon ───────────── */

/** Icône Lucide (trait 2 px, currentColor). `name` parmi Icon.names. */
export function Icon({ name, size = 16, strokeWidth = 2, label, className, ...rest }) {
  const body = ICONS[name];
  if (!body) return null;
  return (
    <svg
      className={cx('bl-icon', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: body }}
      {...rest}
    />
  );
}
Icon.names = Object.keys(ICONS);

/* ───────────── Actions ───────────── */

/** Bouton en pilule. `default` (indigo) une seule fois par zone d'action. */
export const Button = forwardRef(function Button(
  { variant = 'default', size = 'md', icon, iconRight, className, children, type = 'button', ...rest },
  ref
) {
  const hasLabel = children !== undefined && children !== null && children !== false;
  const iconSize = size === 'sm' ? 14 : 16;
  return (
    <button
      ref={ref}
      type={type}
      className={cx('bl-btn', 'bl-btn-' + variant, 'bl-btn-' + size, !hasLabel && 'bl-btn-icon', className)}
      {...rest}
    >
      {icon && renderIcon(icon, iconSize)}
      {hasLabel && children}
      {iconRight && renderIcon(iconRight, iconSize)}
    </button>
  );
});

/* ───────────── Statuts ───────────── */

const TONE_ICON = { success: 'check', warning: 'triangle-alert', destructive: 'ban', info: 'info' };

/** Statut en un à quatre mots, teinte douce. `icon` = true prend l'icône du ton. */
export function Badge({ tone = 'neutral', variant = 'soft', icon, className, children, ...rest }) {
  const resolved = icon === true ? TONE_ICON[tone] : icon;
  return (
    <span className={cx('bl-badge', 'bl-badge-' + tone, variant === 'outline' && 'bl-badge-outline', className)} {...rest}>
      {resolved && renderIcon(resolved, 14)}
      {children}
    </span>
  );
}

/** Point de couleur + mot court, pour les colonnes d'état denses. */
export function StatusDot({ tone = 'neutral', className, children, ...rest }) {
  return (
    <span className={cx('bl-dot', 'bl-dot-' + tone, className)} {...rest}>
      {children}
    </span>
  );
}

/* ───────────── Formulaires ───────────── */

/** Champ texte. `icon` place une icône en tête (recherche). */
export const Input = forwardRef(function Input(
  { icon, size = 'md', pill, invalid, className, style, ...rest },
  ref
) {
  return (
    <span className={cx('bl-input-wrap', className)} style={style}>
      {icon && renderIcon(icon, 16)}
      <input
        ref={ref}
        className={cx('bl-input', 'bl-input-' + size, icon && 'bl-input-has-icon', pill && 'bl-input-pill')}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    </span>
  );
});

/** Liste déroulante native, habillée. `pill` pour les filtres de barre d'outils. */
export const Select = forwardRef(function Select(
  { options, placeholder, size = 'md', pill, invalid, className, style, children, ...rest },
  ref
) {
  return (
    <span className={cx('bl-select', 'bl-select-' + size, pill && 'bl-select-pill', className)} style={style}>
      <select ref={ref} aria-invalid={invalid || undefined} {...rest}>
        {placeholder != null && <option value="">{placeholder}</option>}
        {options
          ? options.map((o) =>
              typeof o === 'string' ? (
                <option key={o} value={o}>
                  {o}
                </option>
              ) : (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              )
            )
          : children}
      </select>
      <Icon name="chevron-down" size={16} />
    </span>
  );
});

/** Libellé + contrôle + aide ou erreur. Passe id et aria-* au contrôle enfant. */
export function Field({ label, hint, error, required, htmlFor, className, children }) {
  const auto = useId();
  const id = htmlFor || auto;
  const noteId = id + '-note';
  const control =
    isValidElement(children) && !htmlFor
      ? cloneElement(children, {
          id,
          'aria-describedby': hint || error ? noteId : undefined,
          invalid: error ? true : children.props.invalid,
        })
      : children;
  return (
    <div className={cx('bl-field', className)}>
      {label && (
        <label className="bl-label" htmlFor={id}>
          {label}
          {required && (
            <span className="bl-label-req" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {control}
      {error ? (
        <p className="bl-field-note bl-field-error" id={noteId}>
          <Icon name="circle-alert" size={14} />
          {error}
        </p>
      ) : hint ? (
        <p className="bl-field-note" id={noteId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Case à cocher. `children` = le libellé cliquable. */
export const Checkbox = forwardRef(function Checkbox({ indeterminate, className, children, ...rest }, ref) {
  const inner = useRef(null);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  const setRef = (node) => {
    inner.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  return (
    <label className={cx('bl-check', className)}>
      <input type="checkbox" ref={setRef} {...rest} />
      <span className="bl-check-box" aria-hidden="true">
        <Icon name={indeterminate ? 'minus' : 'check'} size={12} strokeWidth={3} />
      </span>
      {children != null && <span className="bl-check-label">{children}</span>}
    </label>
  );
});

/** Interrupteur à effet immédiat (ajout volontaire, absent des captures). */
export const Switch = forwardRef(function Switch({ className, children, ...rest }, ref) {
  return (
    <label className={cx('bl-switch', className)}>
      <input type="checkbox" role="switch" ref={ref} {...rest} />
      <span className="bl-switch-track" aria-hidden="true">
        <span className="bl-switch-thumb" />
      </span>
      {children != null && <span className="bl-check-label">{children}</span>}
    </label>
  );
});

/* ───────────── Affichage de données ───────────── */

/** Pastille ronde : photo si `src`, sinon initiales tirées de `name`. */
export function Avatar({ name = '', src, size = 32, className, style, ...rest }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();
  return (
    <span
      className={cx('bl-avatar', className)}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.375)), ...style }}
      role="img"
      aria-label={name || undefined}
      {...rest}
    >
      {src ? <img src={src} alt="" /> : initials}
    </span>
  );
}

/** Surface blanche à coins doux. `tone` la teinte en mémo ; `collapsible` la replie. */
export function Card({
  title,
  description,
  action,
  footer,
  tone,
  flush,
  raised,
  collapsible,
  defaultOpen = true,
  className,
  children,
  ...rest
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const hasHeader = title || description || action || collapsible;
  const shown = !collapsible || open;
  return (
    <section className={cx('bl-card', tone && 'bl-card-' + tone, flush && 'bl-card-flush', raised && 'bl-card-raised', className)} {...rest}>
      {hasHeader && (
        <header className={cx('bl-card-header', collapsible && 'bl-card-header-toggle', !shown && 'bl-card-header-closed')}>
          <div className="bl-card-titles">
            {title && <h3 className="bl-card-title">{title}</h3>}
            {description && <p className="bl-card-desc">{description}</p>}
          </div>
          {action && <div className="bl-card-action">{action}</div>}
          {collapsible && (
            <button
              type="button"
              className="bl-card-chevron"
              aria-expanded={open}
              aria-controls={bodyId}
              aria-label={open ? 'Replier' : 'Déplier'}
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
            </button>
          )}
        </header>
      )}
      {shown && children != null && (
        <div className="bl-card-content" id={bodyId}>
          {children}
        </div>
      )}
      {shown && footer && <footer className="bl-card-footer">{footer}</footer>}
    </section>
  );
}

/** Chiffre clé + libellé. `inline` (bandeau de KPI) ou `stacked` (tuile). */
export function Stat({ value, label, tone, layout = 'inline', className, ...rest }) {
  return (
    <div className={cx('bl-stat', 'bl-stat-' + layout, tone && 'bl-stat-' + tone, className)} {...rest}>
      <span className="bl-stat-value">{value}</span>
      <span className="bl-stat-label">{label}</span>
    </div>
  );
}

/** Barre d'avancement. `label` décrit ce qui avance ; la valeur s'affiche à droite. */
export function Progress({ value = 0, max = 100, tone = 'primary', label, valueLabel, className, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cx('bl-progress', 'bl-progress-' + tone, className)} {...rest}>
      {(label || valueLabel) && (
        <div className="bl-progress-head">
          <span>{label}</span>
          {valueLabel && <span className="bl-progress-value">{valueLabel}</span>}
        </div>
      )}
      <div
        className="bl-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={typeof label === 'string' ? label : undefined}
      >
        <div className="bl-progress-bar" style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}

/** Tableau piloté par les données : tri, sélection, cellules personnalisées. */
export function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  selectable,
  selected,
  defaultSelected,
  onSelectedChange,
  sort,
  defaultSort,
  onSortChange,
  onRowClick,
  dense,
  empty = 'Aucun résultat',
  caption,
  className,
  ...rest
}) {
  const [sel, setSel] = useControlled(selected, defaultSelected || [], onSelectedChange);
  const [s, setSort] = useControlled(sort, defaultSort || null, onSortChange);
  const keyOf = (row, i) => (typeof rowKey === 'function' ? rowKey(row, i) : row[rowKey] != null ? row[rowKey] : i);

  let data = rows;
  if (s) {
    const col = columns.find((c) => c.key === s.key);
    const get = (r) => (col && col.sortValue ? col.sortValue(r) : r[s.key]);
    data = rows.slice().sort((a, b) => {
      const x = get(a);
      const y = get(b);
      const r =
        typeof x === 'number' && typeof y === 'number'
          ? x - y
          : String(x == null ? '' : x).localeCompare(String(y == null ? '' : y), 'fr', { numeric: true });
      return s.dir === 'desc' ? -r : r;
    });
  }

  const keys = data.map(keyOf);
  const allOn = keys.length > 0 && keys.every((k) => sel.includes(k));
  const someOn = keys.some((k) => sel.includes(k));
  const toggleAll = () => setSel(allOn ? sel.filter((k) => !keys.includes(k)) : Array.from(new Set(sel.concat(keys))));
  const toggleOne = (k) => setSel(sel.includes(k) ? sel.filter((x) => x !== k) : sel.concat([k]));
  const cycle = (key) => {
    if (!s || s.key !== key) setSort({ key, dir: 'asc' });
    else if (s.dir === 'asc') setSort({ key, dir: 'desc' });
    else setSort(null);
  };
  const cell = (col, row, i) => {
    const v = col.render ? col.render(row, i) : row[col.key];
    if (v != null && v !== '') return v;
    return col.header ? <span className="bl-table-nil">—</span> : null;
  };

  return (
    <div className={cx('bl-table-wrap', className)} {...rest}>
      <table className={cx('bl-table', dense && 'bl-table-dense', onRowClick && 'bl-table-clickable')}>
        {caption && <caption className="bl-sr">{caption}</caption>}
        <thead>
          <tr>
            {selectable && (
              <th className="bl-table-check" scope="col">
                <Checkbox
                  checked={allOn}
                  indeterminate={!allOn && someOn}
                  onChange={toggleAll}
                  aria-label="Tout sélectionner"
                />
              </th>
            )}
            {columns.map((col) => {
              const dir = s && s.key === col.key ? s.dir : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cx(col.align === 'right' && 'bl-num', col.align === 'center' && 'bl-center')}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.sortable ? (
                    <button type="button" className="bl-th-sort" data-sort={dir || 'none'} onClick={() => cycle(col.key)}>
                      {col.header}
                      <Icon name={dir === 'asc' ? 'chevron-up' : dir === 'desc' ? 'chevron-down' : 'chevrons-up-down'} size={14} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr className="bl-table-empty-row">
              <td className="bl-table-empty" colSpan={columns.length + (selectable ? 1 : 0)}>
                {empty}
              </td>
            </tr>
          )}
          {data.map((row, i) => {
            const k = keyOf(row, i);
            const on = sel.includes(k);
            return (
              <tr key={k} aria-selected={selectable ? on : undefined} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {selectable && (
                  <td className="bl-table-check" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={on} onChange={() => toggleOne(k)} aria-label="Sélectionner la ligne" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cx(col.align === 'right' && 'bl-num', col.align === 'center' && 'bl-center', col.strong && 'bl-strong', col.muted && 'bl-muted', col.wrap && 'bl-wrap')}>
                    {cell(col, row, i)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────── Navigation ───────────── */

/** Onglets. `underline` pour les vues d'une liste, `segmented` pour basculer entre deux ou trois modes. */
export function Tabs({ items = [], value, defaultValue, onValueChange, variant = 'underline', className, ...rest }) {
  const first = items.find((it) => !it.disabled);
  const [v, setV] = useControlled(value, defaultValue !== undefined ? defaultValue : first && first.value, onValueChange);
  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const enabled = items.filter((it) => !it.disabled);
    const idx = enabled.findIndex((it) => it.value === v);
    const next = enabled[(idx + (e.key === 'ArrowRight' ? 1 : enabled.length - 1)) % enabled.length];
    if (!next) return;
    setV(next.value);
    const btn = e.currentTarget.querySelector('[data-value="' + String(next.value).replace(/"/g, '\\"') + '"]');
    if (btn) btn.focus();
  };
  return (
    <div className={cx('bl-tabs', variant === 'segmented' && 'bl-tabs-segmented', className)} role="tablist" onKeyDown={onKey} {...rest}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          className="bl-tab"
          data-value={it.value}
          aria-selected={it.value === v}
          tabIndex={it.value === v ? 0 : -1}
          disabled={it.disabled}
          onClick={() => setV(it.value)}
        >
          {it.icon && renderIcon(it.icon, 16)}
          {it.label}
          {it.count != null && <span className="bl-tab-count">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Fil d'Ariane ; le dernier élément est la page courante. */
export function Breadcrumb({ items = [], className, ...rest }) {
  return (
    <nav className={cx('bl-breadcrumb', className)} aria-label="Fil d'Ariane" {...rest}>
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i}>
              <Icon name="chevron-right" size={14} />
              {last ? (
                <span aria-current="page">{it.label}</span>
              ) : it.href ? (
                <a href={it.href} onClick={it.onClick}>
                  {it.label}
                </a>
              ) : (
                <button type="button" onClick={it.onClick}>
                  {it.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Pied de tableau : plage affichée, lignes par page, navigation. */
export function Pagination({
  page = 1,
  pageCount = 1,
  onPageChange,
  total,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className,
  ...rest
}) {
  const go = (p) => onPageChange && onPageChange(Math.max(1, Math.min(pageCount, p)));
  const from = total != null && pageSize ? Math.min(total, (page - 1) * pageSize + 1) : null;
  const to = total != null && pageSize ? Math.min(total, page * pageSize) : null;
  return (
    <div className={cx('bl-pagination', className)} {...rest}>
      {pageSizeOptions && (
        <label className="bl-pagination-size">
          Lignes par page
          <Select
            size="sm"
            pill
            value={pageSize}
            onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            options={pageSizeOptions.map((n) => ({ value: n, label: String(n) }))}
          />
        </label>
      )}
      {from != null && (
        <span>
          {from}-{to} sur {total}
        </span>
      )}
      <span className="bl-pagination-spacer" />
      <span>
        Page {page} sur {pageCount}
      </span>
      <span className="bl-pagination-btns">
        <Button variant="secondary" size="sm" icon="chevrons-left" aria-label="Première page" disabled={page <= 1} onClick={() => go(1)} />
        <Button variant="secondary" size="sm" icon="chevron-left" aria-label="Page précédente" disabled={page <= 1} onClick={() => go(page - 1)} />
        <Button variant="secondary" size="sm" icon="chevron-right" aria-label="Page suivante" disabled={page >= pageCount} onClick={() => go(page + 1)} />
        <Button variant="secondary" size="sm" icon="chevrons-right" aria-label="Dernière page" disabled={page >= pageCount} onClick={() => go(pageCount)} />
      </span>
    </div>
  );
}

/* ───────────── Structure ───────────── */

/** Barre latérale indigo. Entrée active = pilule blanche. Repliable en rail d'icônes. */
export function Sidebar({
  items = [],
  value,
  defaultValue,
  onValueChange,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  title,
  footer,
  collapsible = true,
  className,
  ...rest
}) {
  const [v, setV] = useControlled(value, defaultValue, onValueChange);
  const [isCollapsed, setCollapsed] = useControlled(collapsed, defaultCollapsed, onCollapsedChange);
  const [openGroups, setOpenGroups] = useState(() =>
    items.filter((it) => it.items && it.items.some((sub) => sub.value === v)).map((it) => it.value)
  );
  const toggleGroup = (val) => {
    if (isCollapsed) {
      setCollapsed(false);
      if (!openGroups.includes(val)) setOpenGroups(openGroups.concat([val]));
      return;
    }
    setOpenGroups(openGroups.includes(val) ? openGroups.filter((x) => x !== val) : openGroups.concat([val]));
  };
  const renderItem = (it, sub, i) => {
    if (it.section) {
      return (
        <li key={'section-' + i} className="bl-sidebar-section" aria-hidden={isCollapsed || undefined}>
          {it.section}
        </li>
      );
    }
    const hasSub = !sub && it.items && it.items.length > 0;
    const open = hasSub && openGroups.includes(it.value);
    const childActive = hasSub && it.items.some((x) => x.value === v);
    const active = it.value === v || (childActive && (isCollapsed || !open));
    return (
      <li key={it.value}>
        <button
          type="button"
          className="bl-sidebar-item"
          aria-current={active ? 'page' : undefined}
          aria-expanded={hasSub ? !!open : undefined}
          data-parent-active={childActive || undefined}
          title={isCollapsed ? it.label : undefined}
          onClick={() => (hasSub ? toggleGroup(it.value) : setV(it.value))}
        >
          {it.icon && renderIcon(it.icon, 20)}
          <span className="bl-sidebar-label">{it.label}</span>
          {it.badge != null && <span className="bl-sidebar-badge">{it.badge}</span>}
          {hasSub && <Icon className="bl-sidebar-caret" name={open ? 'minus' : 'plus'} size={16} />}
        </button>
        {hasSub && open && !isCollapsed && <ul className="bl-sidebar-sub">{it.items.map((x, j) => renderItem(x, true, j))}</ul>}
      </li>
    );
  };
  return (
    <aside className={cx('bl-sidebar', className)} data-collapsed={isCollapsed ? 'true' : 'false'} {...rest}>
      <div className="bl-sidebar-head">
        {collapsible && (
          <button
            type="button"
            className="bl-sidebar-toggle"
            aria-label={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
            aria-expanded={!isCollapsed}
            onClick={() => setCollapsed(!isCollapsed)}
          >
            <Icon name="panel-left" size={20} />
          </button>
        )}
        {title && <span className="bl-sidebar-title">{title}</span>}
      </div>
      <nav aria-label="Navigation principale">
        <ul className="bl-sidebar-nav">{items.map((it, i) => renderItem(it, false, i))}</ul>
      </nav>
      {footer && <div className="bl-sidebar-foot">{footer}</div>}
    </aside>
  );
}

/** Bandeau haut : titre de page en Poppins indigo, contexte, actions à droite. */
export function Topbar({ title, meta, leading, className, children, ...rest }) {
  return (
    <header className={cx('bl-topbar', className)} {...rest}>
      {leading}
      <div className="bl-topbar-titles">
        {title && <h1 className="bl-topbar-title">{title}</h1>}
        {meta && <span className="bl-topbar-meta">{meta}</span>}
      </div>
      {children && <div className="bl-topbar-actions">{children}</div>}
    </header>
  );
}

/** Cadre d'écran : barre latérale à gauche, Topbar puis contenu défilant à droite. */
export function AppShell({ sidebar, topbar, footer, className, children, ...rest }) {
  return (
    <div className={cx('bl-shell', className)} {...rest}>
      {sidebar}
      <div className="bl-shell-main">
        {topbar}
        <main className="bl-shell-content">{children}</main>
        {footer && <div className="bl-shell-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ───────────── Superpositions ───────────── */

const useDismiss = (ref, isOpen, close) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);
};

/** Panneau flottant ancré à son déclencheur (réglages d'affichage, filtres). */
export function Popover({
  trigger,
  title,
  footer,
  align = 'start',
  open,
  defaultOpen = false,
  onOpenChange,
  width,
  className,
  children,
}) {
  const [isOpen, setOpen] = useControlled(open, defaultOpen, onOpenChange);
  const ref = useRef(null);
  useDismiss(ref, isOpen, () => setOpen(false));
  const trig = cloneElement(trigger, {
    'aria-expanded': isOpen,
    'aria-haspopup': 'dialog',
    onClick: (e) => {
      if (trigger.props.onClick) trigger.props.onClick(e);
      setOpen(!isOpen);
    },
  });
  return (
    <span className={cx('bl-popover', className)} ref={ref}>
      {trig}
      {isOpen && (
        <div
          className="bl-popover-panel"
          data-align={align}
          role="dialog"
          aria-label={typeof title === 'string' ? title : undefined}
          style={width ? { width } : undefined}
        >
          {title && <div className="bl-popover-title">{title}</div>}
          <div className="bl-popover-body">
            {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
          </div>
          {footer && <div className="bl-popover-footer">{footer}</div>}
        </div>
      )}
    </span>
  );
}

/** Menu d'actions sous un bouton (⋮ d'une ligne, « Plus d'actions »). */
export function DropdownMenu({ trigger, items = [], align = 'end', open, defaultOpen = false, onOpenChange, className }) {
  const [isOpen, setOpen] = useControlled(open, defaultOpen, onOpenChange);
  const ref = useRef(null);
  useDismiss(ref, isOpen, () => setOpen(false));
  const trig = cloneElement(trigger, {
    'aria-expanded': isOpen,
    'aria-haspopup': 'menu',
    onClick: (e) => {
      if (trigger.props.onClick) trigger.props.onClick(e);
      setOpen(!isOpen);
    },
  });
  return (
    <span className={cx('bl-popover', className)} ref={ref}>
      {trig}
      {isOpen && (
        <div className="bl-popover-panel bl-menu" data-align={align} role="menu">
          {items.map((it, i) =>
            it.separator ? (
              <div key={i} className="bl-menu-sep" role="separator" />
            ) : it.heading ? (
              <div key={i} className="bl-menu-heading">
                {it.heading}
              </div>
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                className={cx('bl-menu-item', it.destructive && 'bl-menu-item-destructive')}
                disabled={it.disabled}
                onClick={() => {
                  setOpen(false);
                  if (it.onSelect) it.onSelect();
                }}
              >
                {it.icon && renderIcon(it.icon, 16)}
                {it.label}
              </button>
            )
          )}
        </div>
      )}
    </span>
  );
}

/** Fenêtre modale de confirmation ou de saisie courte (ajout volontaire). */
export function Dialog({ open, onOpenChange, title, description, footer, width, dismissible = true, className, children }) {
  const ref = useRef(null);
  const titleId = useId();
  const close = () => {
    if (dismissible && onOpenChange) onOpenChange(false);
  };
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    if (ref.current) ref.current.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  if (!open) return null;
  return (
    <div
      className="bl-dialog-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={ref}
        className={cx('bl-dialog', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        style={width ? { maxWidth: width } : undefined}
      >
        {dismissible && (
          <Button className="bl-dialog-close" variant="ghost" size="sm" icon="x" aria-label="Fermer" onClick={close} />
        )}
        {(title || description) && (
          <div className="bl-dialog-head">
            {title && (
              <h2 className="bl-dialog-title" id={titleId}>
                {title}
              </h2>
            )}
            {description && <p className="bl-dialog-desc">{description}</p>}
          </div>
        )}
        {children}
        {footer && <div className="bl-dialog-footer">{footer}</div>}
      </div>
    </div>
  );
}
