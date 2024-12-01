import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { createTraining } from "~/models/training.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  const type = formData.get("type");
  if (typeof name !== "string" || name.length === 0) {
    return json({ errors: { name: "Title is required" } }, { status: 400 });
  }

  if (typeof description !== "string" || description.length === 0) {
    return json({ errors: { description: "Body is required" } }, { status: 400 });
  }

  if (typeof type !== "string" || type.length === 0) {
    return json({ errors: { type: "Body is required" } }, { status: 400 });
  }
  const training = await createTraining({ name: name, description: description, userId, type: type });
  return redirect(`/trainings/${training.id}`);
};

export default function NewTrainingPage() {
  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Name: </span>
          <input
            name="name"
            className="flex-1 rounded-md border-2 border-amber px-3 text-lg leading-loose"
          />
        </label>
      </div>
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Description: </span>
          <textarea
            name="description"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-amber py-2 px-3 text-lg leading-6"
          ></textarea>
        </label>
      </div>
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Type: </span>
          <select
        name="type"
        className="flex-1 rounded-md border-2 border-amber px-3 text-lg leading-loose"
          >
        <option value="default">Default</option>
        <option value="advanced">Advanced</option>
        <option value="beginner">Beginner</option>
          </select>
        </label>
      </div>
      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-amber  py-2 px-4 text-white hover:bg-mustard focus:bg-amber"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
