import { Stream } from "@cloudflare/stream-react";

export function Player({ source }: { source: string }){
  return (
    <div>
      <Stream controls src={source} />
    </div>
  );
};