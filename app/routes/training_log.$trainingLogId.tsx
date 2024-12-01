import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import type { Training } from "~/models/training.server";
import { deleteTraining, getTraining } from "~/models/training.server";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";

type LoaderData = {
  training: Training;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  invariant(params.trainingId, "trainingId not found");
  const trainingId = parseInt(params.trainingId, 10);
  const training = await getTraining({ id: trainingId, userId });
  if (!training) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ training });
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.trainingId, "trainingId not found");
  const trainingId = parseInt(params.trainingId, 10);

  await deleteTraining({ userId, id: trainingId });

  return redirect("/trainings");
};

export default function TrainingDetailsPage() {
  const data = useLoaderData<typeof loader>() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.training.name}</h3>
      <p className="py-6">{data.training.type}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-amber py-2 px-4 text-white hover:bg-mustard focus:bg-amber"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}
