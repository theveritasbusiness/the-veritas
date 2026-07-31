import React, { useMemo } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";

export function BrowserRouter({ children }) {
  return <>{children}</>;
}

export const HashRouter = BrowserRouter;

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route() {
  return null;
}

export function Outlet() {
  return null;
}

export function Link({ to = "", href, children, ...props }) {
  const destination = href || to || "/";
  const isExternal = /^https?:\/\//i.test(destination);

  if (isExternal) {
    return (
      <a href={destination} {...props}>
        {children}
      </a>
    );
  }

  return (
    <NextLink href={destination} {...props}>
      {children}
    </NextLink>
  );
}

export function Navigate({ to = "/", replace = false }) {
  const router = useRouter();

  React.useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [replace, router, to]);

  return null;
}

export function useNavigate() {
  const router = useRouter();

  return (to, options = {}) => {
    if (options.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useParams() {
  const router = useRouter();
  return router.query || {};
}

export function useLocation() {
  const router = useRouter();
  const asPath = router.asPath || router.pathname || "/";
  const [pathnameAndSearch, hash = ""] = asPath.split("#");
  const [pathname = "/", search = ""] = pathnameAndSearch.split("?");

  return {
    pathname,
    search: search ? `?${search}` : "",
    hash: hash ? `#${hash}` : ""
  };
}

export function useSearchParams() {
  const router = useRouter();

  const params = useMemo(() => {
    const asPath = router.asPath || "";
    const [, search = ""] = asPath.split("?");
    const cleanSearch = search.split("#")[0];
    return new URLSearchParams(cleanSearch);
  }, [router.asPath]);

  return [params];
}
