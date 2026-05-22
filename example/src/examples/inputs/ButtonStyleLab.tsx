import './ButtonStyleLab.css';
import { CSSProperties } from 'react';

type CSSVars = CSSProperties & { [key: `--${string}`]: string };

const intents: { key: string; label: string; vars: CSSVars }[] = [
  {
    key: 'primary', label: 'Primary',
    vars: { '--c': 'var(--rk-accent)', '--ch': 'var(--rk-accent-hover)', '--onfill': 'var(--rk-text-on-accent)' },
  },
  {
    key: 'secondary', label: 'Secondary',
    vars: { '--c': 'var(--rk-cool-fill)', '--ch': 'var(--rk-cool-fill-hover)', '--onfill': '#ffffff' },
  },
  {
    key: 'warning', label: 'Warning',
    vars: { '--c': 'var(--rk-warning-fill)', '--ch': 'var(--rk-warning-fill-hover)', '--onfill': '#16161e' },
  },
  {
    key: 'danger', label: 'Danger',
    vars: { '--c': 'var(--rk-danger-fill)', '--ch': 'var(--rk-danger-fill-hover)', '--onfill': '#ffffff' },
  },
];

const styles: { cls: string; name: string; desc: string }[] = [
  { cls: 'blSolid', name: '1 · Solid', desc: 'semibold, borderless flat fill — the kratt look' },
  { cls: 'blRaised', name: '2 · Raised', desc: 'soft drop shadow + lift on hover' },
  { cls: 'blSoft', name: '3 · Soft tint', desc: 'translucent tinted fill, colored text' },
  { cls: 'blOutline', name: '4 · Outline', desc: 'bordered, fills in on hover' },
  { cls: 'blGradient', name: '5 · Gradient', desc: 'glossy vertical gradient + top highlight' },
  { cls: 'blPill', name: '6 · Glow pill', desc: 'fully rounded with a colored glow ring' },
];

function Grid() {
  return (
    <>
      {styles.map(s => (
        <div className="blRow" key={s.cls}>
          <div className="blRowHead">
            <span className="blName">{s.name}</span>
            <span className="blDesc">{s.desc}</span>
          </div>
          <div className="blButtons">
            {intents.map(it => (
              <button key={it.key} className={`blBtn ${s.cls}`} style={it.vars}>{it.label}</button>
            ))}
            <button className={`blBtn ${s.cls}`} style={intents[0].vars} disabled>Disabled</button>
          </div>
        </div>
      ))}
    </>
  );
}

export default function ButtonStyleLab() {
  return (
    <div className="blThemes">
      <div className="blPanel buttonLab rk-dark">
        <div className="blPanelHead">Dark</div>
        <Grid />
      </div>
      <div className="blPanel buttonLab">
        <div className="blPanelHead">Light</div>
        <Grid />
      </div>
    </div>
  );
}
