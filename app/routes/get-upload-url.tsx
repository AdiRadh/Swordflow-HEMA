// app/routes/api/get-upload-url.ts
import type { ActionFunction } from '@remix-run/node';

export const action: ActionFunction = async ({ request }) => {
  
  // Replace these with your actual Cloudflare account details
  const CLOUDFLARE_ACCOUNT_ID = '6b2ca3a1aa39cca40019745e10b755ce';
  const CLOUDFLARE_API_TOKEN = 'JI_3lcUEqNtbU359I__4OujetYt9DA-MRggPZ59h';
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`;
  console.log("getting data");
  const formData = await request.formData();
  const filename = formData.get('filename') as string;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `bearer ${CLOUDFLARE_API_TOKEN}`,
      "Tus-Resumable": "1.0.0",
      "Upload-Length": '1',
      "Upload-Metadata": 'maxDurationSeconds NjAwMA==,requiresignedurls,expiry MjAyNS0wMi0yN1QwNzoyMDo1MFo==, name '+btoa(filename)+'',
    },
  });

  const destination = response.headers.get("Location");
  console.log(response);
  if (!response.ok) {
    throw new Error('Failed to get upload URL');
  }


  return new Response(null, {
    headers: {
      "Access-Control-Expose-Headers": "Location",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      Location: destination || '',
    },
  });
};