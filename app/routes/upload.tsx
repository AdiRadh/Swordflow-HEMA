import type {
    ActionFunction,
    LoaderFunctionArgs,
    MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { getUserId } from "~/session.server";
import { createVideo } from "~/models/video.server";
import * as React from "react";
import { Loader } from "./components/upload/loader";
import { createPortal } from 'react-dom';

export const meta: MetaFunction = () => {
    return [{
        title: "Upload Video",
    }];
};

interface ActionData {
    errors: {
        video?: string;
        title?: string;
        description?: string;
    };
}

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await getUserId(request);
    return json({});
}

  
export const action: ActionFunction = async ({ request }) => {

    const formData = await request.formData();
    const userId = await getUserId(request);
    const video = formData.get("video");
    const title = formData.get("title");
    const description = formData.get("description");
    if (typeof title !== "string" || title.length === 0) {
        return json<ActionData>(
            { errors: { title: "Title is required." } },
            { status: 400 }
        );
    }

    if (typeof description !== "string" || description.length === 0) {
        return json<ActionData>(
            { errors: { description: "Description is required." } },
            { status: 400 }
        );
    }

    if (!(video instanceof File)) {
        return json<ActionData>(
            { errors: { video: "Video file is required." } },
            { status: 400 }
        );
    }

    try {
        const uploadResult = await createVideo({title, description, userId, videoFile: video});
        return json({ success: true, uploadResult });
    } catch (error) {
        return json<ActionData>(
            { errors: { video: "Failed to upload video." } },
            { status: 500 }
        );
    }
};
export default function Upload() {
    const actionData = useActionData() as ActionData;
    const videoRef = React.useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (actionData?.errors?.video) {
            videoRef?.current?.focus();
        }
    }, [actionData]);

    const handleSubmit = () => {
        setIsSubmitting(true);
    };

    return (
        <div className="flex min-h-full flex-col justify-center">
            <div className="mx-auto w-full max-w-md px-8">
                <Form className="space-y-6" method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium" htmlFor="title">
                            <span className="block text-mustard">Title</span>
                            {actionData?.errors?.title && (
                                <span className="block pt-1 text-red" id="title-error">
                                    {actionData?.errors?.title}
                                </span>
                            )}
                        </label>
                        <input
                            className="w-full rounded border border-mustard px-2 py-1 text-lg"
                            type="text"
                            name="title"
                            id="title"
                            required
                            aria-invalid={actionData?.errors?.title ? true : undefined}
                            aria-describedby="title-error"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium" htmlFor="description">
                            <span className="block text-mustard">Description</span>
                            {actionData?.errors?.description && (
                                <span className="block pt-1 text-red" id="description-error">
                                    {actionData?.errors?.description}
                                </span>
                            )}
                        </label>
                        <textarea
                            className="w-full rounded border border-mustard px-2 py-1 text-lg"
                            name="description"
                            id="description"
                            required
                            aria-invalid={actionData?.errors?.description ? true : undefined}
                            aria-describedby="description-error"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium" htmlFor="video">
                            <span className="block text-mustard">Video File (Not larger than 200MB)</span>
                            {actionData?.errors?.video && (
                                <span className="block pt-1 text-red" id="video-error">
                                    {actionData?.errors?.video}
                                </span>
                            )}
                        </label>
                        <input
                            className="w-full rounded border border-mustard px-2 py-1 text-lg"
                            type="file"
                            name="video"
                            id="video"
                            required
                            aria-invalid={actionData?.errors?.video ? true : undefined}
                            aria-describedby="video-error"
                            ref={videoRef}
                        />
                    </div>
                    <button
                        className="w-full rounded bg-amber py-2 px-4 text-white hover:bg-mustard focus:bg-amber"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Uploading... This can take several minutes" : "Upload Video"}
                    </button>
                    </Form>
                    {isSubmitting  ? createPortal(<Loader show={true}/>, document.body): null}
            </div>
        </div>
    );
}
