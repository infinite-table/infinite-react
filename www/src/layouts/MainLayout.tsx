// import { appClassName } from "./_app.css";

import { light } from "@www/styles/utils.css";
import { appClassName } from "./_app.css";

export function MainLayout({ children, className }) {
  return (
    <div className={`${className || ""} ${appClassName} ${light}`}>
      {children}
    </div>
  );
}
