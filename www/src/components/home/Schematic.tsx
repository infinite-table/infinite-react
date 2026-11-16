/**
 * An exploded view of the grid: all the rows (the dashed data plane), the
 * cells that exist (the viewport) and the header above them. Drawn in the
 * site's tokens; the lines draw in once, then it holds still.
 */
export function Schematic() {
  return (
    <div className="home-schema" aria-hidden="true">
      <svg viewBox="0 0 552 236">
        <g transform="matrix(0.9 0.32 -0.9 0.32 232 76)">
          <rect
            className="s-far s-dash fade"
            x="0"
            y="0"
            width="250"
            height="230"
          />
          <path
            className="s-far fade"
            opacity="0.55"
            d="M0 23h250M0 46h250M0 69h250M0 92h250M0 115h250M0 138h250M0 161h250M0 184h250M0 207h250M50 0v230M100 0v230M150 0v230M200 0v230"
          />
        </g>
        <path
          className="s-acc-soft s-dash fade"
          d="M169.900 58.080v36M349.900 122.080v36M267.100 151.520v36M87.100 87.520v36M169.900 24.080v34M349.900 88.080v34"
        />
        <g transform="matrix(0.9 0.32 -0.9 0.32 232 40)">
          <rect className="s-fill fade" x="50" y="92" width="50" height="23" />
          <rect
            className="s-fill fade"
            x="150"
            y="115"
            width="50"
            height="23"
          />
          <rect
            className="s-fill-hot fade"
            x="100"
            y="69"
            width="50"
            height="23"
          />
          <path
            className="s-acc-soft fade"
            d="M0 92h200M0 115h200M0 138h200M50 69v92M100 69v92M150 69v92"
          />
          <rect
            className="s-acc draw d2"
            pathLength="1"
            x="0"
            y="69"
            width="200"
            height="92"
          />
        </g>
        <g transform="matrix(0.9 0.32 -0.9 0.32 232 6)">
          <path className="s-acc-soft fade" d="M50 46v23M100 46v23M150 46v23" />
          <rect
            className="s-acc draw"
            pathLength="1"
            x="0"
            y="46"
            width="200"
            height="23"
          />
        </g>

        <path className="s-lead fade" d="M360 88 384 52h10" />
        <circle className="s-dot fade" cx="360" cy="88" r="2" />
        <text className="hi fade" x="398" y="50">
          Header
        </text>
        <text className="fade" x="398" y="63">
          virtual, in lockstep
        </text>

        <path className="s-lead fade" d="M312 138 372 138 384 126h10" />
        <circle className="s-dot fade" cx="312" cy="138" r="2" />
        <text className="hi fade" x="398" y="124">
          Viewport
        </text>
        <text className="fade" x="398" y="137">
          only these cells exist
        </text>

        <path className="s-lead fade" d="M128 113 92 76H80" />
        <circle className="s-dot fade" cx="128" cy="113" r="2" />
        <text className="hi fade" x="2" y="72">
          1,000,000
        </text>
        <text className="fade" x="2" y="85">
          rows, virtual
        </text>

        <path className="s-lead fade" d="M138 189 112 216H100" />
        <circle className="s-dot fade" cx="138" cy="189" r="2" />
        <text className="hi fade" x="2" y="212">
          16 columns
        </text>
        <text className="fade" x="2" y="225">
          virtual too
        </text>

        <path className="s-lead fade" d="M430 172 456 198" />
        <text className="fade" x="398" y="214">
          scroll plane
        </text>
      </svg>
    </div>
  );
}
