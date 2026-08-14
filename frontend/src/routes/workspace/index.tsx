import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useActiveVenture } from "@/lib/founderos/store";
import { getFounderJourney, getStageRoute } from "@/lib/founderos/journey";

export const Route = createFileRoute("/workspace/")({
  component: WorkspaceIndexRoute,
});

function WorkspaceIndexRoute() {
  const { venture } = useActiveVenture();
  const navigate = useNavigate();

  useEffect(() => {
    const journey = getFounderJourney(venture);
    const target = getStageRoute(journey.currentStage);
    navigate({ to: target as any, replace: true });
  }, [venture, navigate]);

  return null;
}