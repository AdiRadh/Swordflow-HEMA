import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getVideoCommentListItems, createVideoComment } from "~/models/video_comment.server";
import { getProfileById} from "~/models/user.server";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { get } from "cypress/types/lodash";

const supabaseUrl = "https://your-supabase-url.supabase.co";
const supabaseKey = "your-supabase-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function loader({ request, params }: LoaderFunctionArgs) {
    const userId = await requireUserId(request);
    invariant(params.videoId, "videoId not found");
    const videoId = parseInt(params.videoId, 10);
    const comments = await getVideoCommentListItems({ userId, videoId: Number(videoId) });

    return json({ comments });
};


export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const comment = formData.get("comment");
    if (typeof comment !== "string" || comment.length === 0) {
        return json({ error: "Comment is required." }, { status: 400 });
    }
    const userId = await requireUserId(request);
    const user = await getProfileById(userId);
    const videoId = parseInt(params.videoId!, 10);

    const data = await createVideoComment({ comment: comment, videoId: videoId, userId: userId , type: user?.instructor? "instructur" : "regular" , });

    return json({ data });
};

export default function VideoComments() {
    const { comments } = useLoaderData<{ comments: { id: string; comment: string }[] }>();
    const actionData = useActionData<{ error?: string }>();

    return (
        <div>
            <h1>Video Comments</h1>
            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>{comment.comment}</li>
                ))}
            </ul>
            <Form method="post">
                <textarea name="comment" required />
                <button type="submit">Submit Comment</button>
            </Form>
            {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
        </div>
    );
}
