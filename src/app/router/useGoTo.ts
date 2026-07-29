import { useNavigate } from "react-router";
import { ROUTES } from "@/app/router/pageRoutes";

/**
 * Returns a function with the same shape as the original prototype's
 * setPage(pageName: string) callback, so every existing page/sidebar/button
 * that calls setPage("quiz") etc. keeps working — it now performs a real
 * client-side navigation instead of a state flip.
 */
export function useGoTo() {
  const navigate = useNavigate();
  return (page: string) => {
    // If it's a known page name, use its mapped route. Otherwise treat it as a
    // real path — either an app-relative one like "courses/<id>" (which lives
    // under /app/) or an absolute one starting with "/".
    let path: string;
    if (ROUTES[page]) {
      path = ROUTES[page];
    } else if (page.startsWith("/")) {
      path = page;
    } else {
      path = `/app/${page}`;
    }
    navigate(path);
  };
}
