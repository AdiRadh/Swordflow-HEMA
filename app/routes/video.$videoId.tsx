import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
//import { Player } from './components/vidstack/player';
import { Player } from './components/cloudflare/cloudflarePlayer';
import { getVideo, Video } from "~/models/video.server";
import invariant from "tiny-invariant";
import VideoComments from "./videocomments.$videoId";

type LoaderData = {
    current: Video;
  };
  
  export async function loader ({ request, params }: LoaderFunctionArgs) {
    const userId = await requireUserId(request);
    invariant(params.videoId, "videoId not found");
    console.log("video id" + params.videoId);
    const video = await getVideo({ userId, id: params.videoId });
    if (!video) {
      console.log("video not found");
      throw new Response("Not Found", { status: 404 });
    }
    console.log(video);
    return json({ current: video });
    
  }
  

export default function VideosPage() {
    const data = useLoaderData<LoaderData>();
  
    return (
      <div className="flex h-full min-h-screen flex-col">
            <Player source={data.current.cloudflare_id} />
            <VideoComments key={data.current.id} />
      </div>
    );
  }
  
  