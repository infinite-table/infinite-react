/**
 * The shadcn/ui CSS variables the shadcn theme reads, with the values of the
 * neutral base color. A page gets them from its shadcn/ui setup: light values
 * on :root and dark values under the `dark` className.
 */
export const shadcnVarsCSS = `
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.556 0 0);
}
`;

const INFINITE_DARK_MODE_CLASS = 'infinite-theme-mode--dark';

/**
 * The React examples app puts the Infinite Table dark mode className on the
 * body. The shadcn theme pages need a page without it, as an app that uses
 * shadcn/ui only has the `dark` className. Returns a function that puts the
 * className back.
 */
export function removeInfiniteDarkModeFromBody() {
  const { classList } = document.body;
  const hadClass = classList.contains(INFINITE_DARK_MODE_CLASS);

  classList.remove(INFINITE_DARK_MODE_CLASS);

  return () => {
    if (hadClass) {
      classList.add(INFINITE_DARK_MODE_CLASS);
    }
  };
}
