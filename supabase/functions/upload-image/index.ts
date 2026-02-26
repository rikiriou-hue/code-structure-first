import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const ext = file.name.split(".").pop() || "png";
    const fileName = `uploads/${userId}/${Date.now()}_${file.name}`;

    // S3-compatible upload
    const endpoint = "https://s3.nevaobjects.id";
    const bucket = Deno.env.get("AWS_BUCKET_NAME") || "berita";
    const accessKey = Deno.env.get("AWS_ACCESS_KEY_ID")!;
    const secretKey = Deno.env.get("AWS_SECRET_ACCESS_KEY")!;
    const region = Deno.env.get("AWS_REGION") || "jkt-2";

    // Use simple PUT with path-style
    const url = `${endpoint}/${bucket}/${fileName}`;
    const dateStr = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
    const dateShort = dateStr.slice(0, 8);

    // AWS Signature V4
    const encoder = new TextEncoder();

    async function hmac(key: Uint8Array | ArrayBuffer, data: string): Promise<ArrayBuffer> {
      const keyData = key instanceof Uint8Array ? new Uint8Array(key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength)) : new Uint8Array(key);
      const cryptoKey = await crypto.subtle.importKey(
        "raw", keyData as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
      );
      return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
    }

    async function sha256(data: Uint8Array): Promise<string> {
      const hash = await crypto.subtle.digest("SHA-256", data as BufferSource);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    const payloadHash = await sha256(uint8);
    const host = `s3.nevaobjects.id`;

    const canonicalHeaders = `content-type:${file.type}\nhost:${host}\nx-amz-acl:public-read\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${dateStr}\n`;
    const signedHeaders = "content-type;host;x-amz-acl;x-amz-content-sha256;x-amz-date";

    const canonicalRequest = `PUT\n/${bucket}/${fileName}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const canonicalRequestHash = await sha256(encoder.encode(canonicalRequest));

    const scope = `${dateShort}/${region}/s3/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${dateStr}\n${scope}\n${canonicalRequestHash}`;

    const kDate = await hmac(encoder.encode(`AWS4${secretKey}`), dateShort);
    const kRegion = await hmac(kDate, region);
    const kService = await hmac(kRegion, "s3");
    const kSigning = await hmac(kService, "aws4_request");

    const signatureBuffer = await hmac(kSigning, stringToSign);
    const signature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const s3Response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Host": host,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": dateStr,
        "x-amz-acl": "public-read",
        Authorization: authorization,
      },
      body: uint8,
    });

    if (!s3Response.ok) {
      const errText = await s3Response.text();
      console.error("S3 upload error:", errText);
      return new Response(JSON.stringify({ error: "Failed to upload to S3", details: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publicUrl = `${endpoint}/${bucket}/${fileName}`;

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
