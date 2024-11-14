import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { cssBundleHref } from "@remix-run/css-bundle";

export const meta: MetaFunction = () => {
  return [{ title: "Swordflow HEMA" }];
};

export const links: LinksFunction = () => {
  const links = [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
  if(cssBundleHref)
  {
    links.push({ rel: "stylesheet", href: cssBundleHref });
  }
  return links;
};

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
