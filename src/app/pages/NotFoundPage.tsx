import { Link } from "react-router"
import { PlatformLogo } from "../components/Icons"

export function NotFoundPage() {
  return (
    <div className="not-found">
      <PlatformLogo />
      <span>404</span>
      <h1>Page not found</h1>
      <p>
        The page you requested may have moved or is not available for your role.
      </p>
      <Link to="/app">Return to dashboard</Link>
    </div>
  )
}
