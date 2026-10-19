import { createHashRouter } from "react-router"

export const router = createHashRouter([
  {
    path: "/",
    lazy: async () => ({ Component: (await import("./pages/Home")).default }),
  },
  {
    path: "/signin",
    lazy: async () => ({
      Component: (await import("./pages/AuthPage")).AuthPage,
    }),
  },
  {
    path: "/app",
    lazy: async () => ({
      Component: (await import("./components/DashboardLayout")).DashboardLayout,
    }),
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("./pages/OverviewPage")).OverviewPage,
        }),
      },
      {
        path: ":module",
        lazy: async () => ({
          Component: (await import("./pages/ModulePage")).ModulePage,
        }),
      },
    ],
  },
  {
    path: "*",
    lazy: async () => ({
      Component: (await import("./pages/NotFoundPage")).NotFoundPage,
    }),
  },
])
