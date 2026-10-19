import { RouterProvider } from "react-router"
import { router } from "./routes"
import "./dashboard.css"

export default function App() {
  return <RouterProvider router={router} />
}
