import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import type { Note } from "~/models/note.server";
import { getNoteListItems } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import Navbar from "./header";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Player } from './components/vidstack/player';
import { getVideo, getVideoListItems, Video } from "~/models/video.server";

type LoaderData = {
    videos: Video[];
  };
  
  export async function loader ({ request }: LoaderFunctionArgs) {
    const userId = await requireUserId(request);
    const url = new URL(request.url);
  

    const video = await getVideoListItems({ userId });
    return json({ videos: video });
    
  }
  
  export default function VideosPage() {
    const data = useLoaderData<typeof loader>() as LoaderData;
  
    return (
      <div className="flex h-full min-h-screen flex-col">
        <Navbar />
        <main className="flex h-full bg-white">
          <div className="h-full w-80 border-r bg-white">
            <Link to="/upload" className="block p-4 text-xl text-mustard">
              + New Video
            </Link>
  
            <hr />
  
            {data.videos.length === 0 ? (
              <p className="p-4">No Videos yet</p>
            ) : (
              <ol>
                {data.videos.map((vid) => (
                  <li key={vid.id}>
                    <NavLink
                      className={({ isActive }) =>
                        `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                      }
                      to={vid.id}
                    >
                      📝 {vid.title}
                    </NavLink>
                  </li>
                ))}
              </ol>
            )}
          </div>
  
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }
  
  