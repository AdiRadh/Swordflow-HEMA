import React from 'react';
import { useEffect, useState } from 'react';
import { getProfileById, User} from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { getImage, getImageData, Image } from '~/models/image.server';

type LoaderData = {
    profile: User;
    image: Image;
  };
  
export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const profile = await getProfileById(userId);
    const image = await getImageData(userId, 'profile');
    return {profile, image};
};

const Profile = () => {
    const data = useLoaderData<LoaderData>();

    return (
        <div>
            <h1>{data.profile.username}</h1>
            <img src={data.image.name} alt={`${data.image.description}'s profile`} />
            <p>Instructor: {data.profile.instructor}</p>
        </div>
    );
};

export default Profile;