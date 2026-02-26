export default function UtilsOverview() {
  return (
    <div>
      <div className="utilsSection">
        <h3>Hooks</h3>
        <ul>
          <li><code>useAsyncState(initial, opts?)</code> — State that loads via an async function. Returns <code>[data, setData, state]</code> where state tracks INIT/LOADING/OK/ERROR.</li>
          <li><code>useAsyncEffect(fn, deps)</code> — Like <code>useEffect</code> but the callback can be async. Handles cleanup automatically.</li>
          <li><code>useAsyncForm(props, deps)</code> — Full form lifecycle: async init, change tracking, validation errors, async submit with loading state. Returns <code>[FormObject, data]</code>.</li>
          <li><code>useOnlyLatestResult()</code> — Returns a wrapper that ensures only the latest async call resolves, discarding stale results.</li>
          <li><code>useOutsideClick(refs, callback, opts?)</code> — Fires callback when clicking outside the referenced elements. Used by ActionMenu, AutoComplete, etc.</li>
          <li><code>useDropDownPositioning(inputRef)</code> — Calculates dropdown position (top/left/maxHeight) relative to an input element, used by AutoComplete.</li>
          <li><code>useResponsive()</code> / <code>useIsMobile()</code> — Responsive breakpoint hooks. <code>useIsMobile()</code> returns true when viewport is narrow.</li>
          <li><code>useInlineEdit()</code> — Low-level hook for building custom inline-edit components.</li>
        </ul>
      </div>

      <div className="utilsSection">
        <h3>ArrayUtils</h3>
        <p>Static helpers for array manipulation:</p>
        <ul>
          <li><code>removeElement(arr, el)</code> — Remove first occurrence of element in-place</li>
          <li><code>moveUp(arr, index)</code> / <code>moveDown(arr, index)</code> — Swap element with neighbor</li>
          <li><code>groupBy(arr, keyFn)</code> — Group into a Map by key function</li>
          <li><code>unique(arr)</code> — Deduplicate an array</li>
        </ul>
      </div>

      <div className="utilsSection">
        <h3>DateUtils</h3>
        <p>Date formatting and arithmetic:</p>
        <ul>
          <li><code>dateNow()</code> — Today as <code>YYYY-MM-DD</code></li>
          <li><code>date(d)</code> — Format a Date to <code>YYYY-MM-DD</code></li>
          <li><code>dateTime(d)</code> — Format a Date to <code>YYYY-MM-DD HH:MM:SS</code></li>
          <li><code>yearMonth(d)</code> — Format a Date to <code>YYYY-MM</code></li>
          <li><code>daysBetween(d1, d2)</code> — Signed day difference between two date strings</li>
          <li><code>prevMonthLastDay()</code>, <code>getCurrentYearMonth()</code>, <code>getPrevYearMonth()</code>, <code>getNextYearMonth()</code></li>
          <li><code>utcToLocalDate(utcStr)</code> — Convert UTC datetime string to local date</li>
          <li>Constants: <code>MAX_DATE</code>, <code>ZERO_DATE</code></li>
        </ul>
      </div>

      <div className="utilsSection">
        <h3>StringUtils</h3>
        <p>String manipulation helpers.</p>
      </div>

      <div className="utilsSection">
        <h3>Other Utilities</h3>
        <ul>
          <li><code>deepClone(obj)</code> — Deep clone any serializable object</li>
          <li><code>download(blob, fileName)</code> — Trigger a browser file download</li>
          <li><code>isPromise(val)</code> — Type guard for Promise-like values</li>
          <li><code>part(obj, keys)</code> — Pick specific keys from an object (like Lodash pick)</li>
          <li><code>selectTargetElementText(el)</code> — Select all text in a DOM element</li>
          <li><code>viewTransition(fn)</code> — Wrap a state update in the View Transitions API (with fallback)</li>
          <li><code>EnumHelper</code> — Helpers for working with TypeScript enums as select options</li>
          <li><code>ImageUtil</code> — Image resizing/compression utilities</li>
          <li><code>AddToBody</code> — Render children via a React portal appended to document.body</li>
          <li><code>Decimal2</code> — Utility for 2-decimal fixed-point arithmetic</li>
          <li><code>ApiError</code> — Error type and helpers for API error handling</li>
          <li><code>ErrorTrackerProvider</code> / <code>useErrorTracker()</code> — Global error tracking context</li>
        </ul>
      </div>
    </div>
  );
}
