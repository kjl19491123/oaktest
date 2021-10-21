import { listenAndServe } from "https://deno.land/std@0.111.0/http/server.ts";

async function handleRequest(request: Request): Promise<Response> {

    const file = await Deno.readFile("./enteric.html");
    
  return new Response(
    file,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
}

console.log("Listening on http://localhost:8080");
await listenAndServe(":8080", handleRequest);