import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/calculators")({
  beforeLoad: () => {
    throw redirect({ to: "/calculator" });
  },
});
