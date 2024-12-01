import { Link } from "@remix-run/react";

export default function TrainingIndexPage() {
  return (
    <p>
      No training selected. Select a training on the left, or{" "}
      <Link to="new" className="text-amber underline">
        create a new training.
      </Link>
    </p>
  );
}
