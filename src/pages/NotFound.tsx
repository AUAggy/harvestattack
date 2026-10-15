import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[72ch] text-center">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          There is no page at this address. The site has six main routes: the lesson, concepts, the
          worksheet, actions, the briefing, and sources.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to the home page
        </Link>
      </div>
    </div>
  );
}
